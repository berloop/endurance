
// export default YuriModal;

"use client";

import { useState, useEffect } from "react";
import {
  XCircleIcon,
  SparklesIcon,
  MicIcon,
  Loader,
  AlertCircle,
  HeartCrackIcon,
  RefreshCcwIcon,
  BrainCircuitIcon,
  CircleCheckBigIcon,
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamically import YuriInterface with SSR disabled
const YuriInterface = dynamic(() => import("./YuriInterface"), {
  ssr: false,
  loading: () => <YuriInterfaceLoading />,
});

const YuriModal = ({ isOpen, onClose }) => {
  const [showInterface, setShowInterface] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [error, setError] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (isOpen && showInterface && !accessToken) {
      // Fetch the token when we need it
      const fetchToken = async () => {
        try {
          const response = await fetch("/api/hume/token");
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || "Failed to fetch token");
          }
          setAccessToken(data.accessToken);
        } catch (err) {
          console.error("Error fetching token:", err);
          setError(err.message);
        }
      };

      fetchToken();
    }
  }, [isOpen, showInterface, accessToken]);

  if (!isOpen) return null;

  // If interface is active, render the interface
  if (showInterface) {
    if (error) {
      return <YuriInterfaceError error={error} onClose={onClose} />;
    }

    if (!accessToken) {
      return <YuriInterfaceLoading />;
    }

    return <YuriInterface accessToken={accessToken} onClose={onClose} />;
  }

  return (
    <div
      className="
        fixed 
        top-1/2 
        left-32 
        transform 
        -translate-y-1/2 
        z-50 
        transition-all 
        duration-300
      "
    >
      <div
        className="
          bg-neutral-900 
          text-neutral-400 
          rounded-3xl 
          w-96 
          shadow-2xl 
          border 
          border-neutral-800
        "
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2
              className="
                text-zinc-300
                text-xl 
                font-medium
                flex 
                items-center 
                gap-2
              "
            >
              <SparklesIcon
                size={24}
                strokeWidth={1.5}
                className="text-yellow-500"
              />
              Meet Yuri (Beta)
            </h2>
            {onClose && (
              <button
                onClick={onClose}
                className="
                  text-zinc-400 
                  hover:text-white 
                  transition-colors
                "
              >
                <XCircleIcon size={18} strokeWidth={1.5} />
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Cosmic Animation/Image with Skeleton */}
            <div className="w-full my-4 relative h-64">
              {!imageLoaded && (
                <Skeleton className="w-full h-64 rounded-3xl absolute inset-0" />
              )}
              <Image
                src="/images/yuri_02.jpg"
                alt="Yuri AI Assistant"
                width={400}
                height={300}
                className={`w-full h-64 rounded-3xl object-cover ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                } transition-opacity duration-300`}
                onLoad={() => setImageLoaded(true)}
              />
              <Skeleton className="w-full h-64 bg-black/65 rounded-3xl absolute inset-0" />
            </div>

            {/* Intro Text */}
            <p className="text-zinc-300 text-center">
              I am Yuri, your cosmic guide on a journey through the stars of
              creativity and tranquility.
            </p>

            <p className="text-zinc-400 text-sm text-center mt-2">
              With the power of celestial wisdom and advanced voice
              intelligence, I can lead you through relaxation, spark your
              imagination, or simply talk about everything in the universe.
            </p>

            {/* Feature Points */}
            <div className="mt-4 bg-neutral-800 rounded-xl p-6">
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <span className="text-zinc-400">
                    <CircleCheckBigIcon size={10} />
                  </span>
                  <span className="">Your cosmic best friend(s) forever.</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-zinc-400">
                    <CircleCheckBigIcon size={10} />
                  </span>
                  <span className="">Responds to interruption naturally.</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-zinc-400">
                    <CircleCheckBigIcon size={10} />
                  </span>
                  <span className="">Knows everything about universe.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <button
              onClick={() => setShowInterface(true)}
              className="
                bg-gradient-to-r 
                from-teal-500 
                via-yellow-600 
                to-rose-600 
                text-black 
                rounded-xl 
                px-12 
                py-3 
                flex 
                items-center 
                gap-2 
                font-semibold
                transition-all
                hover:shadow-lg
                hover:shadow-yellow-500/20
              "
            >
              <MicIcon className="animate-pulse" size={15} strokeWidth={1.8} />
              Try Yuri Now
            </button>
           
          </div>
          <div className="text-center mt-2 text-xs text-zinc-600">Powered by Claude 3.7 Sonnet.</div>
        </div>
      </div>
    </div>
  );
};

// Loading state component
const YuriInterfaceLoading = () => {
  return (
    <div className="fixed top-1/2 left-32 transform -translate-y-1/2 z-50">
      <div className="bg-neutral-900 rounded-3xl w-96 shadow-2xl border border-neutral-800 flex flex-col overflow-hidden">
        <div className="p-4 flex justify-between items-center border-b border-neutral-800">
          <h2
            className="
                text-zinc-300
                text-xl 
                font-medium
                flex 
                items-center 
                gap-2
              "
          >
            <BrainCircuitIcon
              size={15}
              strokeWidth={1.5}
              className="text-yellow-500"
            />
            Yuri (Beta)
          </h2>
        </div>
        <div className="flex items-center justify-center p-8">
          <div className="flex flex-col items-center">
            <Loader size={25} className="text-yellow-500 animate-spin" />
            <code>
              <p className="mt-4 text-neutral-300 text-sm">
                Connecting to Cosmic..
              </p>
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

// Error state component
const YuriInterfaceError = ({ error, onClose }) => {
  return (
    <div className="fixed top-1/2 left-32 transform -translate-y-1/2 z-50">
      <div className="bg-neutral-900 rounded-3xl w-96 shadow-2xl border border-neutral-800 flex flex-col overflow-hidden">
        <div className="p-4 flex justify-between items-center border-b border-neutral-800">
          <h2 className="text-zinc-300 text-xl font-medium flex items-center gap-2">
            <AlertCircle size={15} className="text-red-500" />
            Connection Artifact
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <XCircleIcon size={18} strokeWidth={1.5} />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-transparent flex items-center justify-center mb-2">
            <HeartCrackIcon
              size={32}
              strokeWidth={1.2}
              className="text-neutral-300"
            />
          </div>
          <p className="text-zinc-300 text-lg mb-2">
            Unable to connect to Cosmic
          </p>
          <p className="text-zinc-400 text-sm mb-6">
            <code> {error || "Failed to fetch token"}</code>
          </p>

          <button
            onClick={() => window.location.reload()}
            className="bg-neutral-800  hover:bg-neutral-700 text-white rounded-xl px-6 py-2 transition-colors w-full flex items-center justify-center gap-2"
          >
            <RefreshCcwIcon size={12} />
            Restart
          </button>
        </div>
      </div>
    </div>
  );
};

export default YuriModal;