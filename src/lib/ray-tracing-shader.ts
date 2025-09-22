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
  uniform vec3 uCameraPos;
  uniform float uTime;
  
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  
  const float PI = 3.1415926538;
  const float dt = 0.05;
  const int maxSteps = 300;
  
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
    float zoom = 1.5;
    
    // Ray projection - exact from reference (no rotation here)
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
    
   for (int steps = 0; steps < maxSteps; steps++) {
  // Extend integration bounds based on lensing parameter
  float integrationBound = max(abs(camL) * 2.0, uA + uM * 8.0); // Increased from 5.0
  if (abs(l) >= integrationBound) break;
  
  dr = LtoDR(l);
  r = LtoR(l);
  
  // Adaptive step size - smaller steps for weaker lensing
  float adaptiveStep = dt * (0.5 + uM * 0.5); // Scale step with lensing strength
  
  l += dl * adaptiveStep;
  phi += H / (r * r) * adaptiveStep;
  dl += H * H * dr / (r * r * r) * adaptiveStep;
}
  
    
    // Sky direction - exact from reference
    float dx = dl * dr * cos(phi) - H / r * sin(phi);
    float dy = dl * dr * sin(phi) + H / r * cos(phi);
    vec3 rayVec = normalize(vec3(dx, dy * beta));
    vec3 cubeVec = vec3(-rayVec.x, rayVec.z, -rayVec.y);
    
    // Add rotation effect to texture sampling only
    vec2 uv = directionToEquirectangular(cubeVec);
    float distFromCenter = length(screenUV);
    
    // Apply rotation based on distance from center and lensing strength
    float rotationAmount = uTime * 0.2 * (1.0 - exp(-distFromCenter * 2.0)); //tHE WARPING EFFECT.
    //float rotationAmount = uTime * 0.2 * (1.0 - exp(-distFromCenter * 0.5));  //One directional bending cause the formula returns positive values.
    


    uv.x = mod(uv.x + rotationAmount, 1.0);
    
    vec4 galaxyColor = texture2D(uGalaxyTexture, uv);
    
    // Add Einstein ring glow
    float ringRadius = .1;
    float ringDistance = abs(distFromCenter - ringRadius);
    float ringGlow = exp(-ringDistance * 15.0) * 0.4;
    galaxyColor.rgb += vec3(0.6, 0.8, 1.0) * ringGlow;
    
    gl_FragColor = galaxyColor;
  }
`;