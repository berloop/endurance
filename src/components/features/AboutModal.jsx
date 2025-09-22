"use client";

import { useEffect } from 'react';
import { 
  InfoIcon, 
  XCircleIcon, 
  LightbulbIcon,
  HeartIcon,
  CoffeeIcon,
  RabbitIcon, 
} from 'lucide-react';
import Image from 'next/image';

const AboutModal = ({ isOpen, onClose }) => {
  // Handle escape key to close the modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);



  if (!isOpen) return null;

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
              <InfoIcon size={18} strokeWidth={1.5} />
              About Break Me
            </h2>
            {onClose && (
              <button
                onClick={onClose}
                className="
                  text-neutral-400 
                  hover:text-white 
                  transition-colors
                "
              >
                <XCircleIcon size={18} strokeWidth={1.5} />
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* App Description */}
            <div className="bg-neutral-800 p-4 rounded-xl">
              <div className="flex items-center gap-3 mb-1">
                <LightbulbIcon size={10} />
                <span className="text-neutral-300 font-medium">What is Break Me?</span>
              </div>
              <p className="text-neutral-400 text-sm">
              Break Me is a fun little time-waster, a mind relaxation tool that helps you relax and clear your mind. It&apos;s super simple to use—just mess around with it. It will calm your mind.
              </p>
            </div>

            {/* Version and Creator */}
            <div className="flex items-center justify-between bg-neutral-800 p-4 rounded-xl">
              <div className="text-neutral-400 text-sm mx-1 ">
                <p className='mb-1'>Build Version: <code className='font-bold'>2.0</code></p>
                <p className="flex items-center">
                  Created with 
                  <HeartIcon size={10} className="text-yellow-500 mx-1 fill-current" />
                  by
                  <a 
                    href="https://linktr.ee/egrettas"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-500 ml-1 hover:underline"
                  >
                    Egret
                  </a>
                </p>
              </div>
              <div className="relative w-10 h-10">
                <a  
                  href="https://linktr.ee/egrettas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative w-10 h-10 block"
                >
                  <Image
                    src="/images/avatar.jpg"
                    alt="Egret Avatar"
                    fill
                    className="rounded-full object-cover border-2 border-yellow-500"
                    priority={true}
                  />
                </a>
              </div>
            </div>

            {/* Ko-fi Button */}
            <div className="flex justify-center mt-6 mx-4">
              <a
                href="https://ko-fi.com/K3K4O097H"
                target="_blank"
                rel="noopener noreferrer"
                className="
                  bg-gradient-to-r 
                   from-teal-500 
                  via-yellow-600 
                  to-rose-600
                  text-black
                  rounded-2xl 
                  px-6 
                  py-3 
                  flex 
                  items-center 
                  gap-2 
                  transition-all
                  hover:shadow-lg
                  hover:shadow-yellow-500/20
                  font-black
                  w-full
                  justify-center
                "
              >
                <CoffeeIcon className='animate-pulse' size={15} strokeWidth={1.8} />
                Buy Me a Coffee
              </a>
            </div>

            <div className="text-center mt-2 text-xs text-zinc-600 flex items-center justify-center gap-1">
              <RabbitIcon size={10} strokeWidth={2} />
              Your support helps keep this project alive.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;