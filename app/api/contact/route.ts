import { handleContact } from "../../../lib/contact-config";

export const runtime = "nodejs";
export const maxDuration = 45;

export async function POST(request: Request) {
  return handleContact(request);
}
