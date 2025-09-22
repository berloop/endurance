"use client";


import { XCircleIcon,  FileCode2Icon, CircleCheckBigIcon, ShoppingCartIcon, LockIcon } from 'lucide-react';

const SourceCodeModal = ({ isOpen, onClose }) => {
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
              <FileCode2Icon size={24} strokeWidth={1.5} />
              Source Code
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
            {/* Description */}
            <p className="text-zinc-300 mb-3">
              Get full access to the codebase of Break Me for your personal or commercial projects.
            </p>
            
            <p className="text-zinc-400  text-sm mb-4">
              Your license includes all source files, tech support, and all future updates. Customize and integrate this particle visualization technology into your own applications.
            </p>
            
            {/* Features/Benefits */}
            <div className="mt-4 bg-neutral-800 rounded-xl p-4">
  <ul className="space-y-2 text-normal">
    <li className="flex items-center gap-2">
    <span className="text-zinc-400">
                    <CircleCheckBigIcon size={10} />
                  </span>
      <span>Commercial use license.</span>
    </li>
    <li className="flex items-center gap-2">
    <span className="text-zinc-400">
                    <CircleCheckBigIcon size={10} />
                  </span>
      <span>Full source code & setup support.</span>
    </li>
    <li className="flex items-center gap-2">
    <span className="text-zinc-400">
                    <CircleCheckBigIcon size={10} />
                  </span>
      <span>Free updates and technical support.</span>
    </li>
  </ul>
</div>
          </div>

          <div className="flex justify-center mt-6 mx-4">
            <a
              href="https://studio-whathunts.lemonsqueezy.com/buy/0c06367a-4ed0-45f7-b1bd-287ac791358c" // Replace with your actual LemonSqueezy checkout link
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
              <ShoppingCartIcon className='animate-pulse' size={15} strokeWidth={1.8} />
              Get Codebase
            </a>
            
          </div>
          <div className="text-center mt-2 text-xs text-zinc-600 flex items-center justify-center gap-1">
  <LockIcon size={10} strokeWidth={2} />
  Secure payment via Stripe. SSL encrypted.
</div>
        </div>
      </div>
    </div>
  );
};

export default SourceCodeModal;