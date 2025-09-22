// "use client";

// import { useEffect } from 'react';

// export default function useStarsListener() {
//   useEffect(() => {
//     console.log("[StarsListener] Initializing listener");

//     const handleStarsChange = (event) => {
//       console.log("[StarsListener] Event received:", event.detail);
      
//       if (window.createParticlesInstance) {
//         console.log("[StarsListener] Found particles instance");
//         const instance = window.createParticlesInstance;
        
//         // Stop any existing stars
//         if (instance.starsActive) {
//           console.log("[StarsListener] Stopping existing shooting stars");
//           instance.stopShootingStars();
//         } else {
//           console.log("[StarsListener] No active shooting stars to stop");
//         }
        
//         // Update stars config
//         console.log("[StarsListener] Updating stars config with:", {
//           count: event.detail.count,
//           speed: event.detail.speed,
//           size: event.detail.size,
//           colors: event.detail.colors,
//           trail: event.detail.trail,
//           interactivity: event.detail.interactivity
//         });
        
//         instance.starsConfig = {
//           count: event.detail.count || 20,
//           speed: event.detail.speed || 0.5,
//           size: event.detail.size || 1.5,
//           colors: event.detail.colors || ['#ffffff', '#44ccff', '#ff44aa'],
//           trail: event.detail.trail || 20,
//           interactivity: event.detail.interactivity || 0.5
          
//         };
        
//         // Start new shooting stars
//         console.log("[StarsListener] Starting shooting stars");
//         try {
//           instance.startShootingStars();
//           console.log("[StarsListener] Shooting stars started successfully");
//         } catch (error) {
//           console.error("[StarsListener] Error starting shooting stars:", error);
//         }
//       } else {
//         console.error("[StarsListener] Particles instance not found on window!");
//       }
//     };
    
//     console.log("[StarsListener] Adding event listener");
//     window.addEventListener('breakme:starsChange', handleStarsChange);
    
//     // Check if particles instance exists on mount
//     if (window.createParticlesInstance) {
//       console.log("[StarsListener] Particles instance found on mount");
//     } else {
//       console.warn("[StarsListener] Particles instance not found on mount. Will check again if event fires.");
//     }
    
//     return () => {
//       console.log("[StarsListener] Cleaning up listener");
//       window.removeEventListener('breakme:starsChange', handleStarsChange);
//     };
//   }, []);
  
//   return null;
// }

"use client";

import { useEffect } from 'react';

export default function useStarsListener() {
  useEffect(() => {
    console.log("[StarsListener] Initializing listener");

    const handleStarsChange = (event) => {
      console.log("[StarsListener] Event received:", event.detail);
      
      if (window.createParticlesInstance) {
        console.log("[StarsListener] Found particles instance");
        const instance = window.createParticlesInstance;
        
        // Stop any existing stars
        if (instance.starsActive) {
          console.log("[StarsListener] Stopping existing shooting stars");
          instance.stopShootingStars();
        } else {
          console.log("[StarsListener] No active shooting stars to stop");
        }
        
        // Update stars config
        console.log("[StarsListener] Updating stars config with:", {
          count: event.detail.count,
          speed: event.detail.speed,
          size: event.detail.size,
          colors: event.detail.colors,
          trail: event.detail.trail,
          interactivity: event.detail.interactivity
        });
        
        instance.starsConfig = {
          count: event.detail.count || 20,
          speed: event.detail.speed || 0.5,
          size: event.detail.size || 1.5,
          colors: event.detail.colors || ['#ffffff', '#44ccff', '#ff44aa'],
          trail: event.detail.trail || 20,
          interactivity: event.detail.interactivity || 0.5
          
        };
        
        // Start new shooting stars
        console.log("[StarsListener] Starting shooting stars");
        try {
          instance.startShootingStars();
          console.log("[StarsListener] Shooting stars started successfully");
        } catch (error) {
          console.error("[StarsListener] Error starting shooting stars:", error);
        }
      } else {
        console.error("[StarsListener] Particles instance not found on window!");
      }
    };
    
    // Add the new handler for stopping stars
    const handleStarsStop = () => {
      console.log("[StarsListener] Stop event received");
      
      if (window.createParticlesInstance) {
        console.log("[StarsListener] Found particles instance for stop");
        const instance = window.createParticlesInstance;
        
        if (instance.starsActive) {
          console.log("[StarsListener] Stopping shooting stars");
          instance.stopShootingStars();
          console.log("[StarsListener] Shooting stars stopped successfully");
        } else {
          console.log("[StarsListener] No active shooting stars to stop");
        }
      } else {
        console.error("[StarsListener] Particles instance not found on window!");
      }
    };
    
    console.log("[StarsListener] Adding event listeners");
    window.addEventListener('breakme:starsChange', handleStarsChange);
    window.addEventListener('breakme:starsStop', handleStarsStop);
    
    // Check if particles instance exists on mount
    if (window.createParticlesInstance) {
      console.log("[StarsListener] Particles instance found on mount");
    } else {
      console.warn("[StarsListener] Particles instance not found on mount. Will check again if event fires.");
    }
    
    return () => {
      console.log("[StarsListener] Cleaning up listeners");
      window.removeEventListener('breakme:starsChange', handleStarsChange);
      window.removeEventListener('breakme:starsStop', handleStarsStop);
    };
  }, []);
  
  return null;
}