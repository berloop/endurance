"use client";

import { useEffect } from 'react';

export default function useTransitionChangeListener() {
  console.log('Transition Change Listener DEFINED'); // Add this line
  useEffect(() => {
    console.log('Transition Change Listener EFFECT RUNNING'); // Add this line
    const handleTransitionChange = (event) => {
      console.log('TRANSITION CHANGE EVENT RECEIVED', event.detail);
      const { transitionType, transitionSpeed } = event.detail;

      console.log('Window CreateParticlesInstance:', window.createParticlesInstance);
      
      
      // Check if createParticlesInstance is available
      if (window.createParticlesInstance) {
        const instance = window.createParticlesInstance;
        
        // Update transition type and speed
        instance.transitionType = transitionType;
        instance.transitionSpeed = transitionSpeed;

        console.log('Transition Updated in Instance:', {
          transitionType: instance.transitionType,
          transitionSpeed: instance.transitionSpeed
        });

        // Manually trigger text transition
        if (typeof instance.transitionToNextText === 'function') {
          instance.transitionToNextText();
        }
      } else {
        console.warn('CreateParticlesInstance not available');
      }
    };

    // Listen for custom transition change events
    window.addEventListener('breakme:transitionChange', handleTransitionChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('breakme:transitionChange', handleTransitionChange);
    };
  }, []);
  
  return null;
}