import { Panel, Row } from "../_components/panel";

const BRAND = [
  { name: "cream", hex: "#F6F0E5", use: "Page background" },
  { name: "surface", hex: "#FFFFFF", use: "Cards, inputs" },
  { name: "ink", hex: "#241B16", use: "Primary text" },
  { name: "ink-muted", hex: "#6E6056", use: "Secondary text" },
  { name: "hairline", hex: "#E6DCCB", use: "Borders" },
  { name: "brand", hex: "#D62300", use: "Primary actions" },
  { name: "brand-hover", hex: "#AE1C00", use: "Primary hover" },
  { name: "cocoa", hex: "#50231A", use: "Dark fills, switches" },
  { name: "mustard", hex: "#F0B323", use: "Deal bands" },
];

const STATUS = [
  { name: "veg", hex: "#1E8E3E", use: "Veg mark" },
  { name: "nonveg", hex: "#8B2E16", use: "Non-veg mark" },
  { name: "success", hex: "#1E8E3E", use: "Confirmations" },
  { name: "warning", hex: "#C77700", use: "Running late" },
  { name: "danger", hex: "#C62828", use: "Cancel, delete" },
];

const SAND = [
  { name: "sand-50", hex: "#F2EADC", use: "Row hover" },
  { name: "sand-100", hex: "#ECE2D0", use: "Chips, fills" },
  { name: "sand-200", hex: "#E3D7C1", use: "Pressed fills" },
];

function Swatch({ name, hex, use }: { name: string; hex: string; use: string }) {
  return (
    <div className="overflow-hidden rounded-card border border-hairline bg-surface">
      <div className="h-16 w-full" style={{ backgroundColor: hex }} />
      <div className="px-3 py-2.5">
        <p className="text-sm font-semibold text-ink">{name}</p>
        <p className="nums text-xs text-ink-muted uppercase">{hex}</p>
        <p className="mt-1 text-xs text-ink-muted">{use}</p>
      </div>
    </div>
  );
}

const TYPE_SCALE = [
  { cls: "text-display text-5xl", label: "Display 48 · Baloo 2 800" },
  { cls: "text-display text-3xl", label: "Display 30 · Baloo 2 800" },
  { cls: "text-xl font-semibold", label: "Title 20 · Mukta 600" },
  { cls: "text-base", label: "Body 16 · Mukta 400" },
  { cls: "text-sm text-ink-muted", label: "Small 14 · Mukta 400 muted" },
  {
    cls: "text-xs font-bold uppercase tracking-[0.12em] text-brand",
    label: "Eyebrow 12 · Mukta 700",
  },
];

export function TokensSection() {
  return (
    <>
      <Panel
        id="colour"
        title="Colour"
        note="Warm cream and flame red carry the brand; mahogany fills the switches and dark bands, mustard the deal bands only. Admin screens use the same tokens with neutral surfaces."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {BRAND.map((c) => (
            <Swatch key={c.name} {...c} />
          ))}
        </div>
        <h3 className="mt-8 mb-3 text-sm font-semibold text-ink">
          Status & food markers
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {STATUS.map((c) => (
            <Swatch key={c.name} {...c} />
          ))}
        </div>
        <h3 className="mt-8 mb-3 text-sm font-semibold text-ink">Warm neutrals</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {SAND.map((c) => (
            <Swatch key={c.name} {...c} />
          ))}
        </div>
      </Panel>

      <Panel
        id="type"
        title="Typography"
        note="Baloo 2 at weight 800 for headings and Mukta for everything else. Both carry Devanagari, so an English and a Hindi screen are set in the same two faces."
      >
        <div className="space-y-4">
          {TYPE_SCALE.map((t) => (
            <div
              key={t.label}
              className="grid items-baseline gap-2 sm:grid-cols-[1fr_260px]"
            >
              <p className={t.cls}>Hot in 12 minutes</p>
              <p className="text-xs text-ink-muted">{t.label}</p>
            </div>
          ))}
        </div>

        <h3 className="mt-10 mb-3 text-sm font-semibold text-ink">
          Hindi rendering (Devanagari)
        </h3>
        <div
          lang="hi"
          className="space-y-3 rounded-card border border-hairline bg-surface p-5"
        >
          <p className="text-display text-3xl uppercase">१२ मिनट में तैयार</p>
          <p className="text-base">
            पनीर टिक्का बर्गर — कुरकुरा पनीर, पुदीना मेयो और ताज़ा सलाद।
          </p>
          <p className="text-sm text-ink-muted">
            बॉम्बे बाज़ार, खंडवा से टेकअवे लीजिए।
          </p>
        </div>

        <h3 className="mt-10 mb-3 text-sm font-semibold text-ink">Tabular figures</h3>
        <div className="rounded-card border border-hairline bg-surface p-5">
          <p className="nums text-sm">₹1,249 · ₹99 · ₹1,11,000 · 11:11</p>
          <p className="mt-1 text-sm">₹1,249 · ₹99 · ₹1,11,000 · 11:11</p>
          <p className="mt-2 text-xs text-ink-muted">
            First row uses <code>.nums</code>; prices and table figures must not jitter
            between values.
          </p>
        </div>
      </Panel>

      <Panel
        id="shape"
        title="Shape & elevation"
        note="6px on controls, 10px on cards, pill on chips only. One subtle shadow level; borders do the separating."
      >
        <Row label="Radius">
          <div className="grid size-20 place-items-center rounded-control border border-hairline bg-surface text-xs text-ink-muted">
            6px
          </div>
          <div className="grid size-20 place-items-center rounded-card border border-hairline bg-surface text-xs text-ink-muted">
            10px
          </div>
          <div className="grid h-8 place-items-center rounded-pill border border-hairline bg-surface px-4 text-xs text-ink-muted">
            pill
          </div>
        </Row>
        <Row label="Elevation">
          <div className="grid size-24 place-items-center rounded-card border border-hairline bg-surface text-xs text-ink-muted">
            border
          </div>
          <div className="grid size-24 place-items-center rounded-card bg-surface text-xs text-ink-muted shadow-card">
            shadow-card
          </div>
          <div className="grid size-24 place-items-center rounded-card bg-surface text-xs text-ink-muted shadow-pop">
            shadow-pop
          </div>
        </Row>
      </Panel>
    </>
  );
}
