// lib/star-shader.ts

/**
 * Star Shader by Egret.
 * 
 * This shader simulates twinkling stars in a 3D scene.
 * 
 * Vertex Shader:
 * - Uses `flickerData` and `flickerSpeed` attributes to create a sinusoidal twinkling effect.
 * - Computes `vAlpha` to vary each star's opacity over time (0.2 to 1.0).
 * - Sets point size with distance-based scaling to simulate depth perspective.
 * 
 * Fragment Shader:
 * - Renders each star as a circular point with soft edges.
 * - Applies `vAlpha` from the vertex shader to modulate twinkling intensity.
 * - Discards fragments outside the circular area to maintain a round star shape.
 * 
 * Material Helper:
 * - `createTwinklingStarMaterial(size)` returns a shader material with additive blending for glowing stars.
 * - Transparent with depthWrite disabled, so stars can overlap naturally.
 * 
 * Usage:
 * - Ideal for creating a dynamic, realistic starfield in Three.js.
 * - Update `uTime` uniform each frame to animate the twinkling.
 */


import * as THREE from 'three';

export const starVertexShader = `
  attribute float flickerData;
  attribute float flickerSpeed;
  uniform float uTime;
  uniform float uSize;
  varying float vAlpha;
  
  void main() {
    // Create twinkling effect with sine wave
    float flicker = 0.5 + 0.5 * sin(uTime * flickerSpeed + flickerData * 6.28318);
    vAlpha = 0.2 + 0.8 * flicker; // Opacity varies from 0.2 to 1.0
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Size based on distance for depth effect
    gl_PointSize = uSize * (300.0 / -mvPosition.z);
  }
`;

export const starFragmentShader = `
  varying float vAlpha;
  
  void main() {
    // Create circular star shape
    float dist = distance(gl_PointCoord, vec2(0.5));
    if (dist > 0.5) discard;
    
    // Soft edge falloff
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    alpha *= vAlpha; // Apply twinkling
    
    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
  }
`;

// Helper function to create twinkling star material
export const createTwinklingStarMaterial = (size: number = 0.1) => {
  return {
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: size }
    },
    vertexShader: starVertexShader,
    fragmentShader: starFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending, // Makes stars glow nicely
    depthWrite: false
  };
};