"use client";

import { useEffect } from 'react';

export default function useColorChangeListener() {
  useEffect(() => {
    const handleColorChange = (event) => {
      const { primaryColor, secondaryColor, colorMode } = event.detail;
      
      // Check if createParticlesInstance is available
      if (window.createParticlesInstance) {
        const instance = window.createParticlesInstance;
        
        // Convert hex to RGB for easier manipulation
        const hexToRGB = (hex) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return { r, g, b };
        };

        // Convert hex to HSL for ThreeJS color change
        const hexToHSL = (hex) => {
          const { r, g, b } = hexToRGB(hex);
          const rr = r / 255;
          const gg = g / 255;
          const bb = b / 255;
          
          const max = Math.max(rr, gg, bb);
          const min = Math.min(rr, gg, bb);
          let h, s, l = (max + min) / 2;

          if (max === min) {
            h = s = 0; // achromatic
          } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
              case rr: h = (gg - bb) / d + (gg < bb ? 6 : 0); break;
              case gg: h = (bb - rr) / d + 2; break;
              case bb: h = (rr - gg) / d + 4; break;
            }
            h /= 6;
          }

          return { h, s, l, r, g, b };
        };

        // Update color-related properties
        const primaryHSL = hexToHSL(primaryColor);
        const secondaryHSL = hexToHSL(secondaryColor);

        // Ensure the data object has color information
        instance.data.particleColor = {
          primary: {
            hex: primaryColor,
            hsl: primaryHSL,
            rgb: hexToRGB(primaryColor)
          },
          secondary: {
            hex: secondaryColor,
            hsl: secondaryHSL,
            rgb: hexToRGB(secondaryColor)
          },
          mode: colorMode
        };

        // Optional: Immediately update color change for instant feedback
        instance.colorChange.setHSL(
          primaryHSL.h, 
          primaryHSL.s, 
          primaryHSL.l
        );

        console.log('Color updated:', instance.data.particleColor);
      } else {
        console.warn('Color change event received but ThreeScene is not ready');
      }
    };

    // Listen for custom color change events
    window.addEventListener('breakme:colorChange', handleColorChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('breakme:colorChange', handleColorChange);
    };
  }, []);
  
  return null;
}