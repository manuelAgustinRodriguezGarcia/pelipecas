import { createPwaIcon } from "@/helpers/pwaIconImage";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return createPwaIcon(180);
}
