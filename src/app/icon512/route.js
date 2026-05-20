import { createPwaIcon } from "@/helpers/pwaIconImage";

export async function GET() {
  return createPwaIcon(512);
}
