// src/components/features/ProductHuntModal.jsx
"use client";


import { useEffect } from 'react';
import { Award, XCircleIcon } from 'lucide-react';
import Image from 'next/image';

const ProductHuntModal = ({ isOpen, onClose }) => {
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
          w-80 
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
              <Award size={20} strokeWidth={1.5} />
              On Product Hunt
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
          
          <div className="mb-2">
          <p className="text-zinc-300 mb-2 text-sm">
  <span className='font-bold'>Break Me</span> has been featured on Product Hunt! If you&apos;re enjoying it, your support would mean a lot! - <span className=''>Egret</span>
</p>

          </div>

          <div className="flex justify-center">
            <a 
              href="https://www.producthunt.com/posts/break-me?utm_source=badge-top-post-badge&utm_medium=badge&utm_souce=badge-break&#0045;me" 
              target="_blank" 
              rel="noopener noreferrer"
              className="transform hover:scale-105 transition-transform duration-100"
            >
             <Image 
                src="https://api.producthunt.com/widgets/embed-image/v1/top-post-badge.svg?post_id=941495&theme=light&period=daily&t=1742220747342" 
                alt="Break Me - Interactive website to relax and clear your mind | Product Hunt" 
                width={250}
                height={54}
                style={{ width: "250px", height: "54px" }}
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductHuntModal;