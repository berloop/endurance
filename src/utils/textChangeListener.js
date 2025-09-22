// src/utils/textChangeListener.js
"use client";

import { useEffect } from "react";

export default function useTextChangeListener() {
  useEffect(() => {
    console.log("TextChangeListener: Setting up event listener");
    const handleTextChange = (event) => {

      console.log("TextChangeListener: Received event", event.detail);



      // Log what we can find about the ThreeScene instance
    console.log("window.createParticlesInstance exists:", !!window.createParticlesInstance);
    
      // Get the text from the event
      const newText = event.detail.text;

      // Find all TextStates instances in the DOM
      // This is a hackish way to access the Three.js objects without modifying them
      if (window.createParticlesInstance) {
        const instance = window.createParticlesInstance;
        console.log("Found instance, attempting to change text to:", newText);
        
        try {
          instance.currentText = newText;
          instance.data.text = newText;
          instance.storeCurrentPositions();
          instance.generateTextPositions(newText);
          instance.startTransitionAnimation();
          console.log("Text change completed successfully");
        } catch (error) {
          console.error("Error changing text:", error);
        }
      } else {
        console.warn("Text change event received but ThreeScene is not ready");
      }
    };

    // Listen for custom text change events
    window.addEventListener("breakme:textChange", handleTextChange);

    // Cleanup
    return () => {
      window.removeEventListener("breakme:textChange", handleTextChange);
    };
  }, []);

}
