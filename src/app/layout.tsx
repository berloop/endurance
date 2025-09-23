/* eslint-disable @typescript-eslint/no-unused-vars */


import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import CursorWrapper from "@/components/CursorWrapper";
import { Toaster } from 'react-hot-toast';
import { AlertCircle, CheckCircle } from "lucide-react";
import { Figtree } from 'next/font/google'; 

export const metadata: Metadata = {
  title: "Lazarus | By Egret",
  description: "Lazarus Missions",
  openGraph: {
    title: "Lazarus | By Egret",
    description: "Lazarus Missions",
    url: "https://endurance.space",
    type: "website",
    images: [
      {
        url: "#",
        width: 1200,
        height: 718,
        alt: "Endurance | By Egret"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Lazarus | By Egret",
    description: "Lazarus Missions",
    site: "@lazarus.space",
    images: ["#"],
  }
};

const figtree = Figtree({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-figtree',
});


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </head>
      <body className={figtree.variable}>
      {/* <CursorWrapper>  */}
        {children}
        {/* </CursorWrapper> */}
        <Toaster 
          toastOptions={{
            success: {
              icon: <CheckCircle size={15} />,
              style: {
                background: 'rgb(22 163 74 / 0.8)', // Tailwind green-600 with opacity
                color: 'white',
                padding: '3px',
                borderRadius: '8px',
              },
            },
            error: {
              icon: <AlertCircle size={15} />,
              style: {
                background: 'rgb(220 38 38 / 0.8)', // Tailwind red-600 with opacity
                color: 'white',
                padding: '3px',
                borderRadius: '8px',
              },
            },
          }}
          position="top-right"
          reverseOrder={false}
        />
        <Analytics />
      </body>
    </html>
  );
}