import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CanvaLives — Personal URL Shortener",
  description: "Fast, private and simple URL shortener by CanvaLives.",
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}