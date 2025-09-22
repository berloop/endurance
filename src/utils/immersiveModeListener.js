"use client";

import { useEffect } from 'react';

export default function useImmersiveModeListener() {
  useEffect(() => {
    const handleImmersiveMode = (event) => {
      const { active } = event.detail;
      
      // Select elements to hide/show
      const sidebar = document.querySelector('[data-component="sidebar"]');
      const footer = document.querySelector('[data-component="footer"]');
      const magic = document.getElementById('magic');

      if (active) {
        // Hide sidebar
        if (sidebar) sidebar.classList.add('opacity-0', 'pointer-events-none');
        
        // Fade out footer
        if (footer) footer.classList.add('opacity-30');
        
        // Make magic container fullscreen
        if (magic) {
          magic.classList.add('fixed', 'top-0', 'left-0', 'w-screen', 'h-screen', 'z-50');
        }

        // Hide browser UI elements
        document.body.classList.add('overflow-hidden');
      } else {
        // Restore sidebar
        if (sidebar) sidebar.classList.remove('opacity-0', 'pointer-events-none');
        
        // Restore footer
        if (footer) footer.classList.remove('opacity-30');
        
        // Restore magic container
        if (magic) {
          magic.classList.remove('fixed', 'top-0', 'left-0', 'w-screen', 'h-screen', 'z-50');
        }

        // Restore browser UI
        document.body.classList.remove('overflow-hidden');
      }
    };

    // Listen for immersive mode events
    window.addEventListener('breakme:immersiveMode', handleImmersiveMode);
    
    // Cleanup
    return () => {
      window.removeEventListener('breakme:immersiveMode', handleImmersiveMode);
    };
  }, []);
  
  return null;
}