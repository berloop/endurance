/**
 * Star Shader
 * -----------
 * Author: Egret
 *
 * Description:
 *   This GLSL shader simulates twinkling stars in a 3D scene.
 *   It uses a combination of vertex and fragment shaders to create 
 *   realistic, animated star points with depth-based sizing and soft edges.
 *
 * Vertex Shader:
 *   - Computes per-star opacity with `flickerData` and `flickerSpeed`.
 *   - Applies distance-based scaling to simulate depth perspective.
 *   - Outputs `vAlpha` to control fragment twinkling intensity.
 *
 * Fragment Shader:
 *   - Renders each star as a circular point with smooth edges.
 *   - Applies `vAlpha` to modulate the twinkle effect.
 *   - Discards fragments outside the circular area for round stars.
 *
 * Material Helper:
 *   - `createTwinklingStarMaterial(size)` creates a Three.js shader material.
 *   - Uses additive blending and disables depthWrite for natural overlap and glow.
 *
 * Usage:
 *   - Ideal for dynamic, realistic starfields in Three.js or WebGL scenes.
 *   - Update `uTime` each frame to animate twinkling.
 *
 * Personal note:
 *   - We used to look up at the sky and wonder at our place in the stars. 
 *     Now we just look down, and worry about our place in the dirt. - Cooper.
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