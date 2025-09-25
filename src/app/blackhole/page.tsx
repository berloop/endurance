/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Header from "@/components/endurance/header";
import MainBlackHole from "@/components/endurance/main-blackhole";
// import MainBlackHole from "@/components/endurance/main-blackhole";

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
        className="flex items-center gap-2 mb-2"
      >
        <h1 className="text-xl text-white">Endurance OS</h1>
      </motion.div>

      {/* Progress Bar */}
      <div className="w-60 bg-neutral-800 rounded-full h-1.5 mb-4">
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
        className="text-white text-xs"
      >
        {progress}%
      </motion.div>
    </div>
  );
};

export default function BlackHolePage() {
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
        <MainBlackHole className="w-full h-full" />
      </motion.div>

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="absolute bottom-4 right-4 md:right-4 left-4 md:left-auto z-10 text-xs text-gray-500 text-center md:text-right"
      >
        <Link 
          href="https://iopscience.iop.org/article/10.1088/0264-9381/32/6/065001"
          target="_blank"
          rel="noopener noreferrer"
          className="underline-none hover:text-gray-400 transition-colors"
        >
          Based on research paper &quot;Gravitational lensing by spinning black holes in astrophysics, and in the movie Interstellar&quot; by James et al.
        </Link>
      </motion.div>
    </main>
  );
}