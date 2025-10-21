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

export const classes: AcademyClass[] = [];

export function getClassById(id: string): AcademyClass | undefined {
  return classes.find((c) => c.id === id);
}


