import { sha256Hex } from "@/lib/crypto";
import type { User } from "@/types";
import { createRandom } from "./random";

const CREATED_AT = "2026-08-01T04:30:00.000Z";

/** Demo credentials from CLAUDE.md. Surfaced on the login screens. */
export const DEMO_ACCOUNTS = {
  superAdmin: { email: "owner@quickbites.in", password: "Owner@123" },
  admin: { email: "manager@quickbites.in", password: "Manager@123" },
  customer: { email: "demo@quickbites.in", password: "Demo@123" },
} as const;

const FIRST_NAMES = [
  "Rohit",
  "Asha",
  "Imran",
  "Priya",
  "Vikram",
  "Neha",
  "Sandeep",
  "Kavita",
  "Arjun",
  "Meera",
  "Rahul",
  "Sneha",
  "Ajay",
  "Pooja",
  "Nikhil",
  "Divya",
  "Manish",
  "Anjali",
  "Suresh",
  "Ritu",
];

const LAST_NAMES = [
  "Verma",
  "Patel",
  "Shaikh",
  "Sharma",
  "Yadav",
  "Jain",
  "Chouhan",
  "Rathore",
  "Mishra",
  "Gupta",
  "Thakur",
  "Soni",
  "Agrawal",
  "Pawar",
  "Dubey",
  "Nagar",
];

/**
 * The three demo accounts plus 40 customers. Async because password hashing
 * goes through Web Crypto.
 */
export async function buildSeedUsers(): Promise<User[]> {
  const random = createRandom(4242);

  const [ownerHash, managerHash, demoHash, genericHash] = await Promise.all([
    sha256Hex(DEMO_ACCOUNTS.superAdmin.password),
    sha256Hex(DEMO_ACCOUNTS.admin.password),
    sha256Hex(DEMO_ACCOUNTS.customer.password),
    sha256Hex("Customer@123"),
  ]);

  const users: User[] = [
    {
      id: "user-owner",
      name: "Ramesh Agrawal",
      email: DEMO_ACCOUNTS.superAdmin.email,
      phone: "9876500001",
      passwordHash: ownerHash,
      role: "SUPER_ADMIN",
      permissions: [],
      status: "ACTIVE",
      createdAt: CREATED_AT,
    },
    {
      id: "user-manager",
      name: "Sunita Deshmukh",
      email: DEMO_ACCOUNTS.admin.email,
      phone: "9876500002",
      passwordHash: managerHash,
      role: "ADMIN",
      permissions: ["ORDERS", "MENU", "INVENTORY", "COUPONS", "ENQUIRIES", "BOOKINGS"],
      status: "ACTIVE",
      createdAt: CREATED_AT,
    },
    {
      id: "user-demo",
      name: "Rohit Verma",
      email: DEMO_ACCOUNTS.customer.email,
      phone: "9876500003",
      passwordHash: demoHash,
      role: "CUSTOMER",
      permissions: [],
      status: "ACTIVE",
      createdAt: CREATED_AT,
    },
  ];

  const seen = new Set<string>([
    DEMO_ACCOUNTS.superAdmin.email,
    DEMO_ACCOUNTS.admin.email,
    DEMO_ACCOUNTS.customer.email,
  ]);

  for (let i = 0; i < 40; i += 1) {
    const first = random.pick(FIRST_NAMES);
    const last = random.pick(LAST_NAMES);
    let email = `${first}.${last}${i + 1}`.toLowerCase() + "@example.in";
    while (seen.has(email)) email = `x${email}`;
    seen.add(email);

    users.push({
      id: `user-c${String(i + 1).padStart(3, "0")}`,
      name: `${first} ${last}`,
      email,
      phone: `9${random.int(100000000, 899999999)}`,
      passwordHash: genericHash,
      role: "CUSTOMER",
      permissions: [],
      // Spread sign-ups across the last ~8 months.
      createdAt: new Date(
        Date.parse("2026-02-01T00:00:00.000Z") + random.int(0, 240) * 86400000,
      ).toISOString(),
      // A couple of blocked accounts so the admin screen has something to show.
      status: i === 11 || i === 27 ? "BLOCKED" : "ACTIVE",
    });
  }

  return users;
}
