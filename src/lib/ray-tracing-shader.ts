// lib/ray-tracing-shader.ts

export const rayTracingVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  
  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const rayTracingFragmentShader = `
  uniform float uRho;
  uniform float uA;
  uniform float uM;
  uniform sampler2D uGalaxyTexture;
  uniform sampler2D uOutsideTexture;
  uniform vec3 uCameraPos;
  uniform float uTime;
  
  // Advanced parameters
  uniform float uRotationSpeed;
  uniform float uWarpingDistance;
  uniform float uRingRadius;
  uniform float uRingSharpness;
  uniform float uRingIntensity;
  uniform vec3 uRingColor;
  uniform float uZoom;
  uniform int uMaxSteps;
  uniform int uRotationMode;
  uniform float uWormholeRadius;
  
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  
  const float PI = 3.1415926538;
  const float dt = 0.05;
  
  // Wormhole function r(l) - exact from reference
  float LtoR(float l) {
    if (abs(l) <= uA) {
      return uRho;
    }
    float x = max(0.0, 2.0 * (abs(l) - uA) / (PI * uM));
    return uRho + uM * (x * atan(x) - 0.5 * log(1.0 + x * x));
  }
  
  // Wormhole derivative - exact from reference  
  float LtoDR(float l) {
    if (abs(l) <= uA) {
      return 0.0;
    }
    float x = max(0.0, 2.0 * (abs(l) - uA) / (PI * uM));
    return 2.0 * atan(x) * sign(l) / PI;
  }
    
  vec2 directionToEquirectangular(vec3 dir) {
    float theta = acos(clamp(dir.y, -1.0, 1.0));
    float phi = atan(dir.z, dir.x);
    phi = mod(phi + 2.0 * PI, 2.0 * PI);
    return vec2(phi / (2.0 * PI), theta / PI);
  }
  
  void main() {
    float camL = length(uCameraPos);
    float zoom = uZoom;
    
    // Ray projection - exact from reference
    vec2 screenUV = (vUv - 0.5) * 2.0;
    vec3 vel = normalize(vec3(-zoom, screenUV));
    vec2 beta = normalize(vel.yz);
    
    // Ray tracing - exact algorithm from reference
    float l = camL;
    float r = LtoR(camL);
    float dl = vel.x;
    float H = r * length(vel.yz);
    float phi = 0.0;
    float dr;
    
    for (int steps = 0; steps < uMaxSteps; steps++) {
      // Extend integration bounds based on lensing parameter
      float integrationBound = max(abs(camL) * 2.0, uA + uM * 8.0);
      if (abs(l) >= integrationBound) break;
      
      dr = LtoDR(l);
      r = LtoR(l);
      
      // Adaptive step size - smaller steps for weaker lensing
      float adaptiveStep = dt * (0.5 + uM * 0.5);
      
      l += dl * adaptiveStep;
      phi += H / (r * r) * adaptiveStep;
      dl += H * H * dr / (r * r * r) * adaptiveStep;
    }
    
    // Sky direction - exact from reference
    float dx = dl * dr * cos(phi) - H / r * sin(phi);
    float dy = dl * dr * sin(phi) + H / r * cos(phi);
    vec3 rayVec = normalize(vec3(dx, dy * beta));
    vec3 cubeVec = vec3(-rayVec.x, rayVec.z, -rayVec.y);
    
    // Add rotation effect with multiple modes
    vec2 uv = directionToEquirectangular(cubeVec);
    float distFromCenter = length(screenUV);
    
    // Multiple rotation modes for user experimentation
    float rotationAmount;
    if (uRotationMode == 0) {
      // Oscillating (recommended - gentle swaying)
      rotationAmount = sin(uTime * uRotationSpeed) * 0.5 * (1.0 - exp(-distFromCenter * uWarpingDistance));
    } else if (uRotationMode == 1) {
      // Bounded continuous (smooth spinning that resets)
      rotationAmount = fract(uTime * uRotationSpeed * 0.1) * (1.0 - exp(-distFromCenter * uWarpingDistance));
    } else if (uRotationMode == 2) {
      // Slow linear (very gradual continuous rotation)
      rotationAmount = mod(uTime * uRotationSpeed * 0.1, 1.0) * (1.0 - exp(-distFromCenter * uWarpingDistance));
    } else {
      // Accelerating (original - creates spiral effect over time)
      rotationAmount = uTime * uRotationSpeed * (1.0 - exp(-distFromCenter * uWarpingDistance));
    }

    // Use fract() for smoother wrapping and add small offset to avoid hard edges
    uv.x = fract(uv.x + rotationAmount + 0.5) - 0.5 + 0.5;

    // Clamp UV coordinates to avoid sampling at exact texture edges
    uv = clamp(uv, vec2(0.002, 0.002), vec2(0.998, 0.998));

    // Dual texture sampling with soft blending
vec4 galaxyColor;
float blendWidth = 0.1; // Controls softness of the blend
float blend = smoothstep(uWormholeRadius - blendWidth, uWormholeRadius + blendWidth, distFromCenter);

// Sample both textures
vec4 insideColor = texture2D(uGalaxyTexture, uv);
vec4 outsideColor = texture2D(uOutsideTexture, uv);

// Blend between them (I am blending the edge between one texture and the other one...)
galaxyColor = mix(insideColor, outsideColor, blend);
    
    // Adding Einstein's ring glow with controllable parameters
    float ringDistance = abs(distFromCenter - uRingRadius);
    float ringGlow = exp(-ringDistance * uRingSharpness) * uRingIntensity;
    galaxyColor.rgb += uRingColor * ringGlow;
    
    gl_FragColor = galaxyColor;
  }
`;