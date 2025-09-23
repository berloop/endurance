/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import RayTracingWormhole from "@/components/endurance/ray-tracing-wormhole";
import DebugWormhole from "@/components/endurance/debug-wormhole";
import Link from "next/link";
import Header from "@/components/endurance/header";



// Loading Screen Component
interface LoadingScreenProps {
  onLoadComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        const nextProgress = prevProgress + 5;
        if (nextProgress >= 100) {
          clearInterval(interval);
          onLoadComplete();
          return 100;
        }
        return nextProgress;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onLoadComplete]);

  return (
    <div className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-2 mb-4"
      >
        <h1 className="text-4xl text-white">Endurance</h1>
      </motion.div>

      {/* Progress Bar */}
      <div className="w-80 bg-neutral-800 rounded-full h-1.5 mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.2, ease: "linear" }}
          className="bg-white h-1.5 rounded-full"
        />
      </div>

      {/* Percentage */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-white text-lg"
      >
        {progress}%
      </motion.div>
    </div>
  );
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <LoadingScreen onLoadComplete={() => setIsLoading(false)} />;
  }

  return (
    <main className="min-h-screen bg-none">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="absolute inset-0 pt-20"
      >
        {/* <RayTracingWormhole className="w-full h-full" /> */}
        <DebugWormhole className="w-full h-full" />

      </motion.div>

      {/* Footer Info */}
   <motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.8, delay: 0.5 }}
  className="absolute bottom-4 right-4 md:right-4 left-4 md:left-auto z-10 text-xs text-gray-500 text-center md:text-right"
>
  <Link 
    href="https://pubs.aip.org/aapt/ajp/article/83/6/486/1057802/Visualizing-Interstellar-s-Wormhole"
    target="_blank"
    rel="noopener noreferrer"
    className="underline-none hover:text-gray-400 transition-colors"
  >
    Based on a research paper &quot;Visualizing Interstellar&apos;s Wormhole&quot; by James, von Tunzelmann, Franklin & Thorne
  </Link>
</motion.div>
    </main>
  );
}