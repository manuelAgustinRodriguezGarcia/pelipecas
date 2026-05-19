import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Pelipecas — Tu cartelera personal de películas",
  description:
    "Organizá tu cartelera personal, registrá películas vistas y dejá que Pelipecas elija tu próxima función.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className={geistSans.className}>
        {children}
      </body>
    </html>
  );
}
