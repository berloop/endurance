// "use client";

// import ThreeScene from '@/components/ThreeScene';
// import Shaders from '@/components/Shaders';
// import Footer from '@/components/landingPage/Footer';
// import Sidebar from '@/components/Sidebar';
// import useTextChangeListener from '@/utils/textChangeListener';
// import useColorChangeListener from '@/utils/colorChangeListener';
// import usePhysicsChangeListener from '@/utils/physicsChangeListener';
// import useTransitionChangeListener from '@/utils/transitionChangeListener';
// import useSharePageListener from '@/utils/sharePageListener';
// import useAudioReactiveListener from '@/utils/audioReactiveListener';
// // import useTextRainListener from '@/utils/textRainListener';
// import useStarsListener from '@/utils/starsListener';
// import useImmersiveModeListener from '@/utils/immersiveModeListener';


// export default function Home() {

//   // This will set up the event listener
//   useTextChangeListener();
//   useColorChangeListener();
//   usePhysicsChangeListener();
//   useTransitionChangeListener();
//   useSharePageListener();
//   useAudioReactiveListener();
//   useStarsListener();
//   useImmersiveModeListener();
//   // useTextRainListener();

//   return (
//     <main>
//       <Sidebar />
//       <Shaders />
//       <ThreeScene />
//       <Footer />
//     </main>
//   );
// }

"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ThreeScene from '@/components/ThreeScene';
import Shaders from '@/components/Shaders';
import Footer from '@/components/landingPage/Footer';
import Sidebar from '@/components/Sidebar';
import useTextChangeListener from '@/utils/textChangeListener';
import useColorChangeListener from '@/utils/colorChangeListener';
import usePhysicsChangeListener from '@/utils/physicsChangeListener';
import useTransitionChangeListener from '@/utils/transitionChangeListener';
import useSharePageListener from '@/utils/sharePageListener';
import useAudioReactiveListener from '@/utils/audioReactiveListener';
import useStarsListener from '@/utils/starsListener';
import useImmersiveModeListener from '@/utils/immersiveModeListener';

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
      {/* Break Me Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-2 mb-4"
      >
        {/* <HeartCrackIcon
          size={25} 
          strokeWidth={1.5} 
          className="text-white" 
        /> */}
        <h1 className="text-4xl  text-white">Break Me</h1>
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

  // This will set up the event listeners
  useTextChangeListener();
  useColorChangeListener();
  usePhysicsChangeListener();
  useTransitionChangeListener();
  useSharePageListener();
  useAudioReactiveListener();
  useStarsListener();
  useImmersiveModeListener();

  if (isLoading) {
    return (
      <LoadingScreen 
        onLoadComplete={() => setIsLoading(false)} 
      />
    );
  }

  return (
    <main>
      <Sidebar />
      <Shaders />
      <ThreeScene />
      <Footer />
    </main>
  );
}