import { Geist, Geist_Mono } from "next/font/google";
import PwaProvider from "@/components/PwaProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Pelipecas",
  description:
    "Organizá tu cartelera personal, registrá películas vistas y dejá que Pelipecas elija tu próxima función.",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: [{ url: "/favicon.png", type: "image/png" }],
  },
  applicationName: "Pelipecas",
  appleWebApp: {
    capable: true,
    title: "Pelipecas",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#080808",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className={geistSans.className}>
        <PwaProvider />
        {children}
      </body>
    </html>
  );
}
