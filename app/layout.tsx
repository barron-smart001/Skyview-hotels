import type { Metadata } from "next";
import "./globals.css";
import { HOTEL } from "@/lib/hotel-config";

export const metadata: Metadata = {
  title: `${HOTEL.name} Uyo | Hotel Website Demonstration`,
  description: `A configurable hotel website demonstration for ${HOTEL.name} in Uyo, Akwa Ibom State.`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900 antialiased selection:bg-amber-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
