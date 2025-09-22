// "use client";

// import { useEffect } from 'react';

// export default function useSharePageListener() {
//   useEffect(() => {
//     // Check if we're on a share page
//     const path = window.location.pathname;
//     const shareMatch = path.match(/^\/share\/([a-zA-Z0-9]+)$/);

//     if (shareMatch) {
//       const shareId = shareMatch[1];
      
//       // Retrieve configuration from localStorage
//       const storedConfig = localStorage.getItem(`particle-share-${shareId}`);
      
//       if (storedConfig) {
//         try {
//           const config = JSON.parse(storedConfig);
          
//           // Wait for createParticlesInstance to be available
//           const checkAndApplyConfig = () => {
//             if (window.createParticlesInstance) {
//               console.log('Applying Shared Configuration:', config);
              
//               // Update particle instance with shared configuration
//               const instance = window.createParticlesInstance;
              
//               // Update text
//               if (config.text) {
//                 instance.currentText = config.text;
//                 instance.data.text = config.text;
//                 instance.storeCurrentPositions();
//                 instance.generateTextPositions(config.text);
//                 instance.startTransitionAnimation();
//               }

//               // Update color
//               if (config.color && config.colorMode) {
//                 const colorChangeEvent = new CustomEvent('breakme:colorChange', {
//                   detail: {
//                     primaryColor: config.color,
//                     secondaryColor: config.color,
//                     colorMode: config.colorMode
//                   }
//                 });
//                 window.dispatchEvent(colorChangeEvent);
//               }

//               // Update physics/particle properties
//               if (config.particleSize) {
//                 const physicsChangeEvent = new CustomEvent('breakme:physicsChange', {
//                   detail: {
//                     particleSize: config.particleSize,
//                     interactionArea: config.spaceArea,
//                     ease: config.returnSpeed,
//                     rotationSpeed: 0.01,
//                     maxRotation: Math.PI / 6
//                   }
//                 });
//                 window.dispatchEvent(physicsChangeEvent);
//               }

//               // Update transition type
//               if (config.transitionType) {
//                 const transitionChangeEvent = new CustomEvent('breakme:transitionChange', {
//                   detail: {
//                     transitionType: config.transitionType,
//                     transitionSpeed: 0.02
//                   }
//                 });
//                 window.dispatchEvent(transitionChangeEvent);
//               }
//             } else {
//               // If not ready, try again in a moment
//               setTimeout(checkAndApplyConfig, 100);
//             }
//           };

//           // Start checking and applying
//           checkAndApplyConfig();

//         } catch (error) {
//           console.error('Error parsing shared configuration:', error);
//         }
//       }
//     }
//   }, []);
  
//   return null;
// }



"use client";

import { useEffect } from 'react';

export default function useSharePageListener() {
  useEffect(() => {
    // Check if we're on a share page
    const path = window.location.pathname;
    const shareMatch = path.match(/^\/share\/([a-zA-Z0-9]+)$/);

    if (shareMatch) {
      const shareId = shareMatch[1];
      
      // Fetch configuration from database
      const fetchSharedConfig = async () => {
        try {
          const response = await fetch(`/api/share?shareId=${shareId}`);
          const result = await response.json();

          if (result.success) {
            const config = result.config;
            
            // Wait for createParticlesInstance to be available
            const checkAndApplyConfig = () => {
              if (window.createParticlesInstance) {
                console.log('Applying Shared Configuration:', config);
                
                // Update particle instance with shared configuration
                const instance = window.createParticlesInstance;
                
                // Update text
                if (config.text) {
                  instance.currentText = config.text;
                  instance.data.text = config.text;
                  instance.storeCurrentPositions();
                  instance.generateTextPositions(config.text);
                  instance.startTransitionAnimation();
                }

                // Update color
                if (config.color && config.colorMode) {
                  const colorChangeEvent = new CustomEvent('breakme:colorChange', {
                    detail: {
                      primaryColor: config.color,
                      secondaryColor: config.color,
                      colorMode: config.colorMode
                    }
                  });
                  window.dispatchEvent(colorChangeEvent);
                }

                // Update physics/particle properties
                if (config.particleSize) {
                  const physicsChangeEvent = new CustomEvent('breakme:physicsChange', {
                    detail: {
                      particleSize: config.particleSize,
                      interactionArea: config.spaceArea,
                      ease: config.returnSpeed,
                      rotationSpeed: 0.01,
                      maxRotation: Math.PI / 6
                    }
                  });
                  window.dispatchEvent(physicsChangeEvent);
                }

                // Update transition type
                if (config.transitionType) {
                  const transitionChangeEvent = new CustomEvent('breakme:transitionChange', {
                    detail: {
                      transitionType: config.transitionType,
                      transitionSpeed: 0.02
                    }
                  });
                  window.dispatchEvent(transitionChangeEvent);
                }
              } else {
                // If not ready, try again in a moment
                setTimeout(checkAndApplyConfig, 100);
              }
            };

            // Start checking and applying
            checkAndApplyConfig();
          } else {
            console.error('Could not fetch shared configuration');
          }
        } catch (error) {
          console.error('Error fetching shared configuration:', error);
        }
      };

      // Initiate fetch
      fetchSharedConfig();
    }
  }, []);
  
  return null;
}