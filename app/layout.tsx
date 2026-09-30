import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "canvalives — Personal URL Shortener",
  description: "Fast, private and simple URL shortener by canvalives.",
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}