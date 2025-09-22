"use client";

import { useEffect, useRef } from 'react';

export default function useAudioReactiveListener() {
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const audioSourceRef = useRef(null);
  const audioElementRef = useRef(null);

  useEffect(() => {
    const handleAudioReactive = async (event) => {
      const {  audio, title } = event.detail;
      // Use the type if needed, or remove if not required
    //   console.log('Audio Source Type:', type);


    

      // Clean up any existing audio context
      if (audioSourceRef.current) {
        audioSourceRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }

      // Create new audio context
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      // Create analyser node
      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Create audio element
      const audioElement = new Audio(audio);
      audioElementRef.current = audioElement;

      // Create source node
      const source = audioContext.createMediaElementSource(audioElement);
      audioSourceRef.current = source;

      // Connect nodes
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      // Dispatch audio start event
      const audioStartEvent = new CustomEvent('breakme:audioStart', { 
        detail: {
            audio,  // Ensure this is the full audio source
             title
             } 
      });
      window.dispatchEvent(audioStartEvent);

      // Start playing
      try {
        await audioElement.play();
      } catch (error) {
        console.error('Error playing audio:', error);
      }

      // Animation loop for audio reactivity
      const animateParticles = () => {
        if (!window.createParticlesInstance) return;

        // Get frequency data
        analyser.getByteFrequencyData(dataArray);

        // Calculate average frequency
        const averageFrequency = dataArray.reduce((a, b) => a + b) / bufferLength;

        // Map audio characteristics to particle properties
        const instance = window.createParticlesInstance;
        
        // Example reactive mappings
        instance.data.particleSize = 1 + (averageFrequency / 255);
        instance.data.ease = 0.05 + (averageFrequency / 255 * 0.1);
        
        // Color reactivity
        const hue = (averageFrequency / 255) * 360;
        instance.colorChange.setHSL(hue / 360, 1, 0.5);

        // Continue animation if audio is playing
        if (!audioElement.paused) {
          requestAnimationFrame(animateParticles);
        }
      };

      // Start particle animation
      animateParticles();

      // Handle audio end
      audioElement.addEventListener('ended', () => {
        const audioEndEvent = new CustomEvent('breakme:audioEnd');
        window.dispatchEvent(audioEndEvent);
      });
    };

    // Listen for audio reactive events
    window.addEventListener('breakme:audioReactive', handleAudioReactive);

    // Cleanup function
    return () => {
      window.removeEventListener('breakme:audioReactive', handleAudioReactive);
      
      // Close audio context and stop playback
      if (audioSourceRef.current) {
        audioSourceRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
    };
  }, []);

  return null;
}