import { readJSON, writeJSON } from "./storage";
import type { ContactInput } from "@/lib/validation";

export const ENQUIRIES_KEY = "zj.enquiries.v1";

export interface Enquiry extends ContactInput {
  id: string;
  createdAt: string;
  bookingRef?: string;
}

/** Stores a contact-form message. Replace with a POST to your CRM / inbox API in production. */
export async function createEnquiry(input: ContactInput & { bookingRef?: string }): Promise<Enquiry> {
  const all = readJSON<Enquiry[]>(ENQUIRIES_KEY, []);
  const enquiry: Enquiry = { ...input, id: `ENQ-${Date.now().toString(36).toUpperCase()}`, createdAt: new Date().toISOString() };
  if (!writeJSON(ENQUIRIES_KEY, [enquiry, ...all])) throw new Error("Could not save your message in this browser. Please message us on WhatsApp instead.");
  return enquiry;
}
