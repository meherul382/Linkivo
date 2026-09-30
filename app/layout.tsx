import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Linkivo — Personal URL Shortener",
  description: "Fast, private and simple personal URL shortener.",
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}