"use client";

import { useEffect } from 'react';

export default function useTextRainListener() {
  useEffect(() => {
    console.log("[TextRainListener] Initializing listener");

    const handleTextRainChange = (event) => {
      console.log("[TextRainListener] Event received:", event.detail);
      
      if (window.createParticlesInstance) {
        console.log("[TextRainListener] Found particles instance");
        const instance = window.createParticlesInstance;
        
        // Stop any existing text rain
        if (instance.textRainActive) {
          console.log("[TextRainListener] Stopping existing text rain");
          instance.stopTextRain();
        } else {
          console.log("[TextRainListener] No active text rain to stop");
        }
        
        // Update text rain config
        console.log("[TextRainListener] Updating config with:", {
          words: event.detail.words,
          fallSpeed: event.detail.fallSpeed,
          wordSize: event.detail.wordSize,
          interactivity: event.detail.interactivity
        });
        
        instance.textRainConfig = {
          words: event.detail.words,
          fallSpeed: event.detail.fallSpeed,
          wordSize: event.detail.wordSize,
          interactivity: event.detail.interactivity
        };
        
        // Start new text rain
        console.log("[TextRainListener] Starting text rain");
        try {
          instance.startTextRain();
          console.log("[TextRainListener] Text rain started successfully");
        } catch (error) {
          console.error("[TextRainListener] Error starting text rain:", error);
        }
      } else {
        console.error("[TextRainListener] Particles instance not found on window!");
      }
    };
    
    console.log("[TextRainListener] Adding event listener");
    window.addEventListener('breakme:textRainChange', handleTextRainChange);
    
    // Check if particles instance exists on mount
    if (window.createParticlesInstance) {
      console.log("[TextRainListener] Particles instance found on mount");
    } else {
      console.warn("[TextRainListener] Particles instance not found on mount. Will check again if event fires.");
    }
    
    return () => {
      console.log("[TextRainListener] Cleaning up listener");
      window.removeEventListener('breakme:textRainChange', handleTextRainChange);
    };
  }, []);
  
  return null;
}