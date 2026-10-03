# Deploying the prototype to Render

Render is **demo hosting for this prototype only**. The real product goes on a VPS later, with
the client's own domain. Nothing here costs money — the free plan is enough.

The repository is already set up for it. Nothing in the app needs changing.

- `render.yaml` — the service definition Render reads
- `scripts/copy-standalone.mjs` — copies `public/` and `.next/static/` into the standalone
  build, which Next leaves out on purpose
- `npm run build:render` — `next build` followed by that copy
- `.nvmrc` and the `engines` field — pin Node 20

There are **no environment variables to set** and **no database to create**. The app has no
backend and no secrets.

---

## Step 1 — Put the code on GitHub

You need to run these yourself. Create the repository first:

1. Go to <https://github.com/new>
2. Name it `quickbites-prototype`
3. Choose **Private**
4. Do **not** tick "Add a README", "Add .gitignore" or "Choose a licence" — the repository
   already has them, and ticking these causes a conflict on the first push
5. Click **Create repository**

GitHub then shows you a URL. Copy it, and run these in the project folder:

```bash
cd D:\Quickbites-Prototype
git remote add origin https://github.com/<your-username>/quickbites-prototype.git
git push -u origin master
```

If GitHub asks you to sign in, use a **personal access token** as the password, not your
account password (GitHub stopped accepting passwords over HTTPS). Create one at
**Settings → Developer settings → Personal access tokens → Tokens (classic)** with the `repo`
scope ticked.

> If you already added a remote and got `remote origin already exists`, replace it:
> `git remote set-url origin <url>`

---

## Step 2 — Create the service on Render

1. Sign up or sign in at <https://render.com> (signing in with GitHub is easiest)
2. Click **New** → **Blueprint**
3. Connect your GitHub account and grant access to the `quickbites-prototype` repository
4. Pick that repository. Render finds `render.yaml` and shows a service called
   **quickbites-prototype**
5. Click **Apply**

That is it. Render installs the dependencies, runs `npm run build:render`, and starts the app
with `node .next/standalone/server.js`.

The first build takes roughly **4 to 8 minutes**. Watch the **Logs** tab. You are looking for:

```
▲ Next.js 15.5.27
✓ Starting...
```

Your link appears at the top of the service page and looks like
`https://quickbites-prototype.onrender.com`.

### If "Blueprint" is not offered

Use **New → Web Service** instead and fill in the same values by hand:

| Field | Value |
| --- | --- |
| Repository | `quickbites-prototype` |
| Branch | `master` |
| Runtime | Node |
| Build command | `npm ci && npm run build:render` |
| Start command | `node .next/standalone/server.js` |
| Plan | Free |
| Health check path | `/` |

Then add three environment variables under **Environment**:

| Key | Value |
| --- | --- |
| `NODE_VERSION` | `20.18.1` |
| `NODE_ENV` | `production` |
| `HOSTNAME` | `0.0.0.0` |

`HOSTNAME` matters. Without it the server only listens inside the container and every request
times out. Do **not** set `PORT` — Render sets that itself.

---

## Step 3 — Check it works

Open the link and click through:

- The home page has its photos and the cream background — if it looks like unstyled black text
  on white, the static files did not get copied, so check that the build command is
  `npm run build:render` and not plain `npm run build`
- `/menu` shows the food with veg and non-veg markers
- `/admin/login` accepts `owner@quickbites.in` / `Owner@123`
- `/styleguide` returns **404** (it is meant to be switched off in production)

---

## Redeploying after a change

Render redeploys by itself whenever you push:

```bash
git add -A
git commit -m "what changed"
git push
```

To redeploy without changing anything — **Manual Deploy** → **Deploy latest commit** on the
service page. **Clear build cache & deploy** is the one to use if a build behaves oddly.

---

## The free plan sleeps — read this before a demo

A free Render service **shuts down after about 15 minutes of inactivity**. The next visit wakes
it, and that cold start takes **roughly 30 to 60 seconds**, during which the page just hangs.

**Open the link 2 to 3 minutes before the client demo** and leave the tab open. Do not open it
for the first time in front of them.

The same applies if the demo pauses for a coffee break — click something to keep it awake.

Upgrading to the paid Starter plan removes the sleeping. For a prototype it is not worth it;
just remember to warm it up.

---

## Things worth knowing

- **Each visitor gets their own data.** The prototype stores everything in the browser, so the
  client, their colleague and you all see separate menus, orders and settings. Nobody can break
  anybody else's demo, and nothing anyone does on the live link reaches anyone else.
- **A deploy does not reset a visitor's data.** It lives in their browser. To start clean, use
  **Admin → Settings → Demo → Reset demo data**.
- **Keep the repository private.** It has the demo passwords in it.
- **The free plan has a monthly build-minute allowance.** Pushing dozens of times a day can use
  it up; it resets monthly.
