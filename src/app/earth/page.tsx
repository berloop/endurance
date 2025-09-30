/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

import MapboxEarth from "@/components/earth/mapbox-earth";
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
    <div className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center select-none">
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

export default function EarthPage() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <LoadingScreen onLoadComplete={() => setIsLoading(false)} />;
  }

  return (
    <main className="min-h-screen bg-none select-none">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="absolute inset-0 pt-20"
      >
        <MapboxEarth />
      </motion.div>

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="absolute bottom-12 md:bottom-8 right-4 md:right-4 left-4 md:left-auto z-10 text-xs text-neutral-500 text-center md:text-right"
      >
        <p>
          We&apos;re not meant to save the world. We&apos;re meant to leave it - Dr. Brand
        </p>
        
      </motion.div>
    </main>
  );
}