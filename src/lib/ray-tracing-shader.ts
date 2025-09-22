// lib/ray-tracing-shader.ts
// Proper physics-based ray tracing shader without kaleidoscope artifacts

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
  const float dt = 0.1;
  const int maxSteps = 200;
  
  // Wormhole function r(l) - exact from reference
  float LtoR(float l) {
    float x = max(0.0, 2.0 * (abs(l) - uA) / PI / uM);
    return uRho + uM * (x * atan(x) - 0.5 * log(1.0 + x * x));
  }
  
  // Wormhole derivative - exact from reference  
  float LtoDR(float l) {
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
    
    for (int steps = 0; steps < maxSteps; steps++) {
      if (abs(l) >= max(abs(camL) * 2.0, uA + 2.0)) break;
      
      dr = LtoDR(l);
      r = LtoR(l);
      l += dl * dt;
      phi += H / (r * r) * dt;
      dl += H * H * dr / (r * r * r) * dt;
    }
    
    // Sky direction - exact from reference
    float dx = dl * dr * cos(phi) - H / r * sin(phi);
    float dy = dl * dr * sin(phi) + H / r * cos(phi);
    vec3 rayVec = normalize(vec3(dx, dy * beta));
    vec3 cubeVec = vec3(-rayVec.x, rayVec.z, -rayVec.y);
    
    // Sample texture based on which side of wormhole
    vec2 uv = directionToEquirectangular(cubeVec);
    if (l > 0.0) {
      gl_FragColor = texture2D(uGalaxyTexture, uv);
    } else {
      gl_FragColor = texture2D(uGalaxyTexture, uv) * 0.6; // Dimmed for other side
    }
  }
`;