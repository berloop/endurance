"use client";

import { useEffect } from 'react';

export default function usePhysicsChangeListener() {
  useEffect(() => {
    const handlePhysicsChange = (event) => {
      const { 
        particleSize, 
        interactionArea, 
        ease, 
        rotationSpeed, 
        maxRotation 
      } = event.detail;
      
      // Check if createParticlesInstance is available
      if (window.createParticlesInstance) {
        const instance = window.createParticlesInstance;
        
        // Update data properties
        instance.data.particleSize = particleSize;
        instance.data.area = interactionArea;
        instance.data.ease = ease;
        
        // Update rotation-related properties
        instance.rotationSpeed = rotationSpeed;
        instance.maxRotation = maxRotation;

        console.log('Physics updated:', {
          particleSize,
          interactionArea,
          ease,
          rotationSpeed,
          maxRotation
        });
      } else {
        console.warn('Physics change event received but ThreeScene is not ready');
      }
    };

    // Listen for custom physics change events
    window.addEventListener('breakme:physicsChange', handlePhysicsChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('breakme:physicsChange', handlePhysicsChange);
    };
  }, []);
  
  return null;
}