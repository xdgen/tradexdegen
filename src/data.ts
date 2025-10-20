import come1 from '../public/images/com1.jpg'
import come2 from '../public/images/com2.jpg'
export type ClassStatus = "Ongoing" | "Upcoming" | "Ended";


export interface AcademyClass {
  id?: string;
  pda?: string;
  owner?: string;
  title: string;
  description: string; // markdown supported
  banner: string; // URL (IPFS or https)
  facilitator: string;
  isPaid: boolean;
  price?: number; // in SOL
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  status: ClassStatus;
  students: number;
  mentors: string[] | null;
}

export const placeholderBanner = 
  "https://ipfs.io/ipfs/bafkreihdwdce7qk7n2z5t2x5lq5p4tq5n2zzzzplaceholder";

export const classes: AcademyClass[] = [
  {
    id: "memecoin-101",
    title: "Memecoin Mastery 101",
    description:
      "Learn to spot the next 100x.\n\n- On-chain sleuthing\n- Liquidity traps\n- Entries & exits",
    banner:
      come1,
    facilitator: "King Manifest",
    isPaid: false,
    price: 0,
    startDate: "2025-10-05T16:00:00.000Z",
    endDate: "2025-11-05T16:00:00.000Z",
    status: "Upcoming",
    students: 1240,
    mentors: ["Degen Dan", "Alpha Wolf"],
  },
  {
    id: "solana-defi-pro",
    title: "Solana DeFi Pro",
    description:
      "Master Solana yield and perp strategies.\n\n> Risk first. Yield second.",
    banner: come2,
    facilitator: "0xCatalyst",
    isPaid: true,
    price: 1.25,
    startDate: "2025-09-20T15:00:00.000Z",
    endDate: "2025-10-20T15:00:00.000Z",
    status: "Ongoing",
    students: 512,
    mentors: ["Serum Shark"],
  },
  {
    id: "nft-analytics",
    title: "NFT Analytics & Flows",
    description:
      "Wallet clustering, mints, and flow analysis with open data tools.",
    banner: come2,
    facilitator: "FlowState",
    isPaid: false,
    price: 0,
    startDate: "2025-07-01T12:00:00.000Z",
    endDate: "2025-08-01T12:00:00.000Z",
    status: "Ended",
    students: 980,
    mentors: null,
  }
];

export function getClassById(id: string): AcademyClass | undefined {
  return classes.find((c) => c.id === id);
}


