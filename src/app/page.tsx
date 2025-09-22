"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import WormholeViewer from "@/components/endurance/wormhole-viewer";


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
    <main className="min-h-screen bg-black">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 p-6"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-light text-white">Lazarus Station</h1>
          <div className="text-sm text-gray-400">
            Interstellar Wormhole Simulation
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="absolute inset-0 pt-20"
      >
        <WormholeViewer className="w-full h-full" />
      </motion.div>

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="absolute bottom-4 right-4 z-10 text-xs text-gray-500"
      >
        Based on &rdquo;Visualizing Interstellar&apos;s Wormhole&ldquo; by James, von Tunzelmann, Franklin & Thorne
      </motion.div>
    </main>
  );
}