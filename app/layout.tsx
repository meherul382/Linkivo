import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Linkivo — Personal URL Shortener",
  description: "Your private workspace for short links and click analytics.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
