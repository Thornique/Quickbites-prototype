import type { Enquiry, Review, TableBooking } from "@/types";
import { createRandom } from "./random";

function daysFrom(now: Date, offset: number, hour = 11, minute = 20): string {
  const d = new Date(now);
  d.setDate(d.getDate() + offset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function dateKey(now: Date, offset: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export function buildSeedEnquiries(now: Date): Enquiry[] {
  const rows: Array<
    [string, string, string, Enquiry["subject"], string, Enquiry["status"], number]
  > = [
    [
      "Pooja Nagar",
      "9826011221",
      "pooja.nagar@example.in",
      "PARTY_ORDER",
      "Need 30 veg burgers and fries for a birthday on Saturday evening. Can you deliver to Anand Nagar?",
      "NEW",
      -1,
    ],
    [
      "Imran Shaikh",
      "9893044512",
      "imran.shaikh@example.in",
      "BULK_ORDER",
      "Price for 50 paneer kathi rolls for an office event?",
      "NEW",
      -2,
    ],
    [
      "Vikram Rathore",
      "9977112200",
      "vikram.r@example.in",
      "CORPORATE_LUNCH",
      "We are 12 people at a nearby office. Do you do daily lunch boxes on a monthly plan?",
      "IN_PROGRESS",
      -4,
    ],
    [
      "Anjali Jain",
      "9893778810",
      "anjali.jain@example.in",
      "CATERING",
      "Catering for an engagement function, around 80 guests. Share a menu and rates.",
      "IN_PROGRESS",
      -5,
    ],
    [
      "Suresh Chouhan",
      "9826554477",
      "suresh.c@example.in",
      "FEEDBACK",
      "The peri peri fries were excellent last night. Please keep them on the menu.",
      "CLOSED",
      -7,
    ],
    [
      "Neha Sharma",
      "9977889911",
      "neha.sharma@example.in",
      "OTHER",
      "Do you have a high chair for toddlers? Planning to come with a 2 year old.",
      "CLOSED",
      -9,
    ],
    [
      "Manish Soni",
      "9893221144",
      "manish.soni@example.in",
      "PARTY_ORDER",
      "Need 2 family feast combos packed for 7 PM on Sunday.",
      "NEW",
      -1,
    ],
    [
      "Divya Pawar",
      "9826778899",
      "divya.pawar@example.in",
      "BULK_ORDER",
      "Can we get 25 cold coffees for a college fest stall? Need them by 4 PM.",
      "IN_PROGRESS",
      -3,
    ],
    [
      "Ajay Dubey",
      "9977003322",
      "ajay.dubey@example.in",
      "FEEDBACK",
      "Order QB-1180 was packed badly and the shake spilled. Please look into it.",
      "CLOSED",
      -12,
    ],
    [
      "Ritu Mishra",
      "9893665544",
      "ritu.mishra@example.in",
      "CORPORATE_LUNCH",
      "Monthly billing possible for a 20-person team?",
      "NEW",
      0,
    ],
  ];

  return rows.map(([name, phone, email, subject, message, status, offset], i) => ({
    id: `enq-${String(i + 1).padStart(3, "0")}`,
    name,
    phone,
    email,
    subject,
    message,
    status,
    internalNotes:
      status === "IN_PROGRESS"
        ? "Quote shared on WhatsApp, awaiting confirmation."
        : undefined,
    handledByUserId: status === "NEW" ? undefined : "user-manager",
    createdAt: daysFrom(now, offset, 10 + (i % 8), (i * 7) % 60),
  }));
}

export function buildSeedBookings(now: Date): TableBooking[] {
  const rows: Array<
    [string, string, number, string, TableBooking["status"], number, string]
  > = [
    [
      "Rohit Verma",
      "9876500003",
      4,
      "19:30",
      "CONFIRMED",
      1,
      "Window table if possible",
    ],
    ["Asha Patel", "9826114477", 2, "13:00", "PENDING", 1, ""],
    [
      "Kavita Yadav",
      "9893551122",
      6,
      "20:00",
      "CONFIRMED",
      2,
      "Birthday — can you keep a cake aside?",
    ],
    ["Arjun Thakur", "9977442211", 3, "18:30", "PENDING", 3, ""],
    ["Meera Gupta", "9826993311", 8, "19:00", "CONFIRMED", 4, "Office team dinner"],
    ["Nikhil Jain", "9893887766", 2, "11:30", "SEATED", 0, ""],
    ["Sneha Agrawal", "9977665544", 5, "21:00", "CANCELLED", -1, "Plan changed"],
    ["Rahul Chouhan", "9826332211", 4, "20:30", "NO_SHOW", -2, ""],
  ];

  return rows.map(([name, phone, partySize, time, status, offset, request], i) => ({
    id: `bkg-${String(i + 1).padStart(3, "0")}`,
    customerId: i === 0 ? "user-demo" : undefined,
    name,
    phone,
    date: dateKey(now, offset),
    time,
    partySize,
    specialRequest: request || undefined,
    status,
    statusMessage:
      status === "CONFIRMED"
        ? "Table confirmed. Please arrive within 15 minutes of your slot."
        : status === "CANCELLED"
          ? "Cancelled at the guest's request."
          : undefined,
    createdAt: daysFrom(now, offset - 2, 9 + (i % 10), (i * 11) % 60),
  }));
}

export function buildSeedReviews(now: Date): Review[] {
  const random = createRandom(777);
  const rows: Array<[string, string, 1 | 2 | 3 | 4 | 5, string, boolean]> = [
    [
      "user-demo",
      "Rohit Verma",
      5,
      "Paneer tikka burger is genuinely the best in Khandwa. Ready in 10 minutes as promised.",
      true,
    ],
    [
      "user-c003",
      "Imran Shaikh",
      4,
      "Good food and quick service. Wish they had more seating in the evening.",
      true,
    ],
    [
      "user-c007",
      "Priya Sharma",
      5,
      "Ordered the family feast for a get-together. Everything was hot and well packed.",
      true,
    ],
    [
      "user-c011",
      "Vikram Yadav",
      3,
      "Fries were great but the shake was a bit thin that day.",
      true,
    ],
    [
      "user-c014",
      "Neha Jain",
      5,
      "Cold coffee here is a lifesaver in May. Staff are polite too.",
      true,
    ],
    [
      "user-c019",
      "Sandeep Chouhan",
      4,
      "Reasonable prices for the portion size. The student combo is good value.",
      true,
    ],
    [
      "user-c022",
      "Kavita Rathore",
      5,
      "Clean kitchen, you can see them making it. That matters to me.",
      true,
    ],
    [
      "user-c026",
      "Arjun Mishra",
      2,
      "Waited 25 minutes on a Saturday evening though the app said 12.",
      true,
    ],
    [
      "user-c030",
      "Meera Gupta",
      5,
      "Veg grilled sandwich and filter coffee is my regular breakfast now.",
      true,
    ],
    [
      "user-c033",
      "Rahul Thakur",
      4,
      "Farmhouse pizza was loaded. Cheese burst crust is worth the extra.",
      true,
    ],
    [
      "user-c036",
      "Sneha Soni",
      5,
      "Took a table booking for 8 people, they had it ready on time.",
      true,
    ],
    [
      "user-c005",
      "Ajay Agrawal",
      4,
      "Peri peri fries are properly spicy, not just red powder.",
      true,
    ],
    [
      "user-c009",
      "Pooja Pawar",
      1,
      "My order was cancelled after 20 minutes. Disappointing.",
      false,
    ],
    [
      "user-c017",
      "Manish Dubey",
      5,
      "Brownie sundae is excellent. Please never remove it.",
      false,
    ],
    [
      "user-c024",
      "Divya Nagar",
      4,
      "Hindi menu on the website is a nice touch for my parents.",
      false,
    ],
  ];

  return rows.map(([customerId, customerName, rating, comment, isApproved], i) => {
    const createdAt = daysFrom(now, -random.int(1, 55), 12 + (i % 9), (i * 13) % 60);
    return {
      id: `rev-${String(i + 1).padStart(3, "0")}`,
      customerId,
      customerName,
      rating,
      comment,
      isApproved,
      reply:
        rating <= 3 && isApproved
          ? "Sorry about that — we have spoken to the kitchen team. Please give us another try."
          : undefined,
      repliedAt: rating <= 3 && isApproved ? createdAt : undefined,
      createdAt,
    };
  });
}
