"use client";

import { useState, useEffect } from 'react';
import { 
  Maximize2, 
  XCircleIcon, 
  Info 
} from 'lucide-react';

const ImmersiveMode = ({ isOpen, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enterImmersiveMode = () => {
    // Dispatch immersive mode event
    const event = new CustomEvent('breakme:immersiveMode', {
      detail: { 
        active: true 
      }
    });
    window.dispatchEvent(event);

    // Optional: Try to enter fullscreen
    const docElm = document.documentElement;
    if (docElm.requestFullscreen) {
      docElm.requestFullscreen();
    } else if (docElm.mozRequestFullScreen) { // Firefox
      docElm.mozRequestFullScreen();
    } else if (docElm.webkitRequestFullScreen) { // Chrome, Safari and Opera
      docElm.webkitRequestFullScreen();
    } else if (docElm.msRequestFullscreen) { // IE/Edge
      docElm.msRequestFullscreen();
    }

    setIsFullscreen(true);

    // Automatically close the modal
  if (onClose) {
    // Use a small delay to allow visual feedback before closing
    setTimeout(onClose, 500);
  }

  };

  const exitImmersiveMode = () => {
    // Dispatch immersive mode exit event
    const event = new CustomEvent('breakme:immersiveMode', {
      detail: { 
        active: false 
      }
    });
    window.dispatchEvent(event);

    // Exit fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { // Firefox
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { // IE/Edge
      document.msExitFullscreen();
    }

    setIsFullscreen(false);
    
    // Close the modal
    if (onClose) onClose();
  };

  // Handle escape key to exit immersive mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        exitImmersiveMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

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
              <Maximize2 size={20} strokeWidth={1.5} />
              Immersive Mode
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
            <div className="bg-neutral-800 p-4 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Info size={16} className="text-yellow-500" />
                <span className="text-neutral-300 font-medium">Immersive Mode Controls</span>
              </div>
              <p className="text-neutral-400 text-sm">
                Press <kbd className="bg-neutral-700 px-2 py-1 rounded mx-1">ESC</kbd> 
                to exit Immersive Mode at any time.
              </p>
            </div>

            <button
              onClick={enterImmersiveMode}
              className="
                w-full 
                bg-neutral-700 
                hover:bg-yellow-500 
                text-white 
                rounded-xl 
                px-4 
                py-2 
                flex 
                items-center 
                justify-center
                gap-2 
                transition-colors 
                hover:text-black
              "
            >
              <Maximize2 size={16} strokeWidth={1.5} />
              Enter Immersive Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImmersiveMode;