import type { Metadata } from "next";
import { Bricolage_Grotesque, Dancing_Script, Figtree, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const heading = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"] });
const body = Figtree({ variable: "--font-figtree", subsets: ["latin"] });
const serif = Source_Serif_4({ variable: "--font-source-serif", subsets: ["latin"] }); // the agreement document
const script = Dancing_Script({ variable: "--font-dancing", subsets: ["latin"] }); // signatures

export const metadata: Metadata = {
  title: "Housepact",
  description: "No awkward conversations, just agree once.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable} ${serif.variable} ${script.variable}`}>
      <body>{children}</body>
    </html>
  );
}
