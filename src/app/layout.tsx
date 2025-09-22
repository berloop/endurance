// import type { Metadata } from "next";
// import "./globals.css";
// import { Analytics } from "@vercel/analytics/next";
// import CursorWrapper from "@/components/CursorWrapper";
// import { Toaster } from 'react-hot-toast';
// import { AlertCircle, CheckCircle } from "lucide-react";



// export const metadata: Metadata = {
//   title: "Break Me | By Egret",
//   description: "Break Me - Interactive 3D Experience",
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en">
//       <head>
//         <meta
//           name="viewport"
//           content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
//         />
//         {/* <script src='https://cdnjs.cloudflare.com/ajax/libs/three.js/r125/three.min.js' async></script> */}
//       </head>
//       <body>
//       <CursorWrapper> {/* 👈 Wrap children inside CursorWrapper */}
//         {children}
//         </CursorWrapper>
//         <Toaster 
//           toastOptions={{
//             success: {
//               icon: <CheckCircle size={15} />,
//               style: {
//                 background: 'rgb(22 163 74 / 0.8)', // Tailwind green-600 with opacity
//                 color: 'white',
//                 padding: '3px',
//                 borderRadius: '8px',
//               },
//             },
//             error: {
//               icon: <AlertCircle size={15} />,
//               style: {
//                 background: 'rgb(220 38 38 / 0.8)', // Tailwind red-600 with opacity
//                 color: 'white',
//                 padding: '3px',
//                 borderRadius: '8px',
//               },
//             },
//           }}
//           position="top-right"
//           reverseOrder={false}
//         />
//         <Analytics />
//       </body>
//     </html>
//   );
// }

import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import CursorWrapper from "@/components/CursorWrapper";
import { Toaster } from 'react-hot-toast';
import { AlertCircle, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Break Me | By Egret",
  description: "An Interactive website to relax and clear your mind.",
  openGraph: {
    title: "Break Me | By Egret",
    description: "An Interactive website to relax and clear your mind.",
    url: "https://breakme.now",
    type: "website",
    images: [
      {
        url: "https://opengraph.b-cdn.net/production/images/ee54cee1-4d8d-48be-aaad-6a8c2f3813b6.png?token=apGrL9DB7jPUWtyE8TEWxWVNpAHn3Zumk5VWQsiUrXo&height=718&width=1200&expires=33278814615",
        width: 1200,
        height: 718,
        alt: "Break Me | By Egret"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Break Me | By Egret",
    description: "An Interactive website to relax and clear your mind.",
    site: "@breakme.now",
    images: ["https://opengraph.b-cdn.net/production/images/ee54cee1-4d8d-48be-aaad-6a8c2f3813b6.png?token=apGrL9DB7jPUWtyE8TEWxWVNpAHn3Zumk5VWQsiUrXo&height=718&width=1200&expires=33278814615"],
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
        {/* <script src='https://cdnjs.cloudflare.com/ajax/libs/three.js/r125/three.min.js' async></script> */}
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