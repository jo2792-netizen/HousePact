import type { Metadata, Viewport } from "next";
import { Dancing_Script, Source_Serif_4 } from "next/font/google";
import "./globals.css";

// The app uses the system font. These two are only for the agreement document.
const serif = Source_Serif_4({ variable: "--font-source-serif", subsets: ["latin"] });
const script = Dancing_Script({ variable: "--font-dancing", subsets: ["latin"] }); // signatures

export const metadata: Metadata = {
  title: "Housepact",
  description: "No awkward conversations, just agree once.",
};

export const viewport: Viewport = {
  viewportFit: "cover", // lets the layout respect the notch and home indicator
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f2f7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${serif.variable} ${script.variable}`}>
      <body>
        {/* The app lives inside a phone frame; on an actual phone the frame fills the screen */}
        <div className="phone">
          <div id="screen" className="screen">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
