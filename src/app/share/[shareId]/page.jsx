// "use client";

// import { useEffect, useState } from "react";
// import ThreeScene from "@/components/ThreeScene";
// import Shaders from "@/components/Shaders";
// // import Footer from '@/components/landingPage/Footer';
// import useSharePageListener from "@/utils/sharePageListener";
// import { ChevronLeftCircleIcon, Loader, RabbitIcon } from "lucide-react";
// import Link from "next/link";

// const SharePage = ({ params }) => {
//   const [config, setConfig] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Use the share page listener to load the configuration
//   useSharePageListener();

//   useEffect(() => {
//     // Retrieve the configuration from localStorage
//     const shareId = params.shareId;
//     const storedConfig = localStorage.getItem(`particle-share-${shareId}`);

//     if (storedConfig) {
//       try {
//         const parsedConfig = JSON.parse(storedConfig);
//         setConfig(parsedConfig);
//       } catch (error) {
//         console.error("Error parsing configuration:", error);
//       }
//     }

//     setLoading(false);
//   }, [params.shareId]);

//   return (
//     <main className="relative">
//       {/* Back button */}
//       <button
//   onClick={() => {
//     window.location.href = '/';
//   }}
//   className="
//     fixed
//     top-6
//     left-6
//     z-50
//     bg-neutral-900/40
//     text-neutral-300
//     hover:text-yellow-500
//     p-4
//     rounded-full
//     transition-colors
//     backdrop-blur-sm
//     flex
//     items-center
//     gap-2
//   "
// >
//   <ChevronLeftCircleIcon size={20} strokeWidth={1.5} />
//   <span className="text-xl">Back to Main Editor</span>
// </button>

//       {/* Shared configuration info - with MUCH larger text */}
//       {config && (
//         <div
//           className="
//             fixed
//             top-6
//             right-12
//             z-50
//             bg-neutral-900/40
//             text-neutral-300
//             p-8
//             rounded-3xl
//             backdrop-blur-sm
//             w-[210px]
//             shadow-lg
//             shadow-black/20
//             border
//             border-neutral-800
//           "
//         >
//           <h3 className=" text-2xl font-medium mb-6 flex items-center gap-3">
//             <RabbitIcon size={28} strokeWidth={1.5} className="" />
//             Cosmic Rat Inbox
//           </h3>
//           <div className="space-y-6">
//             <div>
//               <p className="text-neutral-400 text-lg mb-1">
//                 A space message sent to you is,
//               </p>
//               <p className="text-2xl text-center">&quot;{config.text}&quot;</p>
//             </div>

//             <div>
//               <p className="text-neutral-400 text-lg mb-1">
//                 Transmission Method:
//               </p>
//               <p className="text-2xl capitalize">{config.transitionType}</p>
//             </div>

//             <div>
//               <p className="text-neutral-400 text-lg mb-1">Sent on:</p>
//               <p className="text-2xl">
//                 {config.createdAt
//                   ? new Date(config.createdAt).toLocaleDateString(undefined, {
//                       year: "numeric",
//                       month: "long",
//                       day: "numeric",
//                     })
//                   : new Date().toLocaleDateString(undefined, {
//                       year: "numeric",
//                       month: "long",
//                       day: "numeric",
//                     })}
//               </p>
//             </div>
//             <p className="text-neutral-400/50 text-lg text-center">
//                 Powered by Cosmic Mail
//               </p>
//           </div>
//         </div>
//       )}

//       {loading ? (
//         <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-white gap-3">
//           <Loader className="w-12 h-12 animate-spin" />
//           <p className="text-xl mt-2">Loading shared creation...</p>
//         </div>
//       ) : (
//         <>
//           <Shaders />
//           <ThreeScene />
//           <div className="absolute bottom-6 left-0 right-0 text-center">
//             <p className="text-white text-sm opacity-80">
//               View this shared creation or{" "}
//               <Link href="/" className="text-yellow-500 hover:underline">
//                 create your own
//               </Link>
//             </p>
//           </div>
//           {/* <Footer /> */}
//         </>
//       )}
//     </main>
//   );
// };

// export default SharePage;

"use client";

import { useEffect, useState } from "react";
import ThreeScene from "@/components/ThreeScene";
import Shaders from "@/components/Shaders";
import useSharePageListener from "@/utils/sharePageListener";
import { ChevronLeftCircleIcon, Loader, RabbitIcon } from "lucide-react";
import Link from "next/link";
import "animate.css";

const SharePage = ({ params }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  // Use the share page listener to load the configuration
  useSharePageListener();

  useEffect(() => {
    // Fetch configuration from database
    const fetchConfig = async () => {
      try {
        const response = await fetch(`/api/share?shareId=${params.shareId}`);
        const result = await response.json();

        if (result.success) {
          setConfig(result.config);
        } else {
          console.error("Failed to fetch configuration");
        }
      } catch (error) {
        console.error("Error fetching configuration:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [params.shareId]);

  return (
    <main className="relative">
      {/* Back button */}
      <button
        onClick={() => {
          window.location.href = "/";
        }}
        className="
          fixed 
          top-6 
          left-6 
          z-50 
          bg-neutral-900/40
          text-neutral-300 
          hover:text-yellow-500 
          p-4
          rounded-full 
          hidden
          md:flex
          transition-colors
          backdrop-blur-sm
          items-center
          gap-2
        "
      >
        <ChevronLeftCircleIcon size={20} strokeWidth={1.5} />
        <span className="text-xl">Back to Main Editor</span>
      </button>

      {/* Shared configuration info */}
      {config && (
        // <div
        //   className="
        //     fixed
        //     top-6
        //     right-12
        //     z-50
        //     bg-neutral-900/40
        //     text-neutral-300
        //     p-8
        //     rounded-3xl
        //     backdrop-blur-sm
        //     w-[210px]
        //     shadow-lg
        //     shadow-black/20
        //     border
        //     border-neutral-800
        //   "
        // >
        //   <h3 className="text-2xl font-medium mb-6 flex items-center gap-3">
        //     <RabbitIcon size={28} strokeWidth={1.5} className="" />
        //     Cosmic Rat Inbox
        //   </h3>
        //   <div className="space-y-6">
        //     <div>
        //       <p className="text-neutral-400 text-lg mb-1">
        //         A space message sent to you is,
        //       </p>
        //       <p className="text-2xl text-center">&quot;{config.text}&quot;</p>
        //     </div>

        //     <div>
        //       <p className="text-neutral-400 text-lg mb-1">
        //         Transmission Method:
        //       </p>
        //       <p className="text-2xl capitalize">{config.transitionType}</p>
        //     </div>

        //     <div>
        //       <p className="text-neutral-400 text-lg mb-1">Sent on:</p>
        //       <p className="text-2xl">
        //         {new Date().toLocaleDateString(undefined, {
        //           year: "numeric",
        //           month: "long",
        //           day: "numeric",
        //         })}
        //       </p>
        //     </div>
        //     <p className="text-neutral-400/50 text-lg text-center">
        //       Powered by Cosmic Mail
        //     </p>
        //   </div>
        // </div>
        <div
          className="
    fixed 
    top-15
    md:top-6
    right-12 
    z-50 
    animate__animated animate__fadeInRight animate__faster
    bg-neutral-900/40
    text-neutral-300 
    p-8 
    rounded-3xl 
    backdrop-blur-sm 
    w-[210px] 
    h-[250px]
    shadow-lg 
    shadow-black/20 
    border 
    border-neutral-800
    max-md:fixed 
    max-md:bottom-6 
    max-md:left-1/2 
    max-md:-translate-x-1/2 
    max-md:w-[90%] 
    max-md:max-w-md
  "
        >
          <h3 className="text-2xl font-medium mb-6 flex items-center gap-3">
            <RabbitIcon size={28} strokeWidth={1.5} className="" />
            Cosmic Rat Inbox
          </h3>
          <div className="space-y-6">
            <div>
              <p className="text-neutral-400 text-lg mb-1">
                A space message sent to you is,
              </p>
              <p className="text-2xl text-left md:text-center">
                &quot;{config.text}&quot;
              </p>
            </div>

            <div>
              <p className="text-neutral-400 text-lg mb-1">
                Transmission Method:
              </p>
              <p className="text-2xl capitalize">{config.transitionType}</p>
            </div>

            <div>
              <p className="text-neutral-400 text-lg mb-1">Sent on:</p>
              <p className="text-2xl">
                {new Date().toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <p className="text-neutral-400/50 text-lg text-center">
              Powered by Cosmic Mail
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-white gap-3">
          <Loader className="w-12 h-12 animate-spin" />
          <p className="text-xl mt-2">Loading Cosmic Rat...</p>
        </div>
      ) : (
        <>
          <Shaders />
          <ThreeScene />
          <div className="absolute bottom-6 left-0 right-0 text-center">
            <p className="text-white text-sm opacity-80">
              View this shared creation or{" "}
              <Link href="/" className="text-yellow-500 hover:underline">
                create your own
              </Link>
            </p>
          </div>
        </>
      )}
    </main>
  );
};

export default SharePage;
