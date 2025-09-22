

import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import CursorWrapper from "@/components/CursorWrapper";
import { Toaster } from 'react-hot-toast';
import { AlertCircle, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Endurance | By Egret",
  description: "Lazarus Missions",
  openGraph: {
    title: "Endurance | By Egret",
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
    title: "Endurance | By Egret",
    description: "Lazarus Missions",
    site: "@endurance.space",
    images: ["#"],
  }
};

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
      <body>
      <CursorWrapper> {/* 👈 Wrap children inside CursorWrapper */}
        {children}
        </CursorWrapper>
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