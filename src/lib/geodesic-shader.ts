// components/GeodesicShader.ts
// GLSL shaders implementing the exact geodesic equations from the paper

export const geodesicVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  
  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const geodesicFragmentShader = `
  uniform float uRho;
  uniform float uA;
  uniform float uM;
  uniform sampler2D uGalaxyTexture;
  uniform sampler2D uSaturnTexture;
  uniform vec3 uCameraPos;
  uniform float uTime;
  
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  
  const float PI = 3.14159265359;
  const int MAX_STEPS = 200;
  const float STEP_SIZE = 0.02;
  const float CELESTIAL_DISTANCE = 50.0;
  
  // Wormhole radius function r(ℓ) from equation (5)
  float getWormholeRadius(float l) {
    float absL = abs(l);
    if (absL <= uA) {
      return uRho;
    } else {
      float x = 2.0 * (absL - uA) / (PI * uM);
      return uRho + uM * (x * atan(x) - 0.5 * log(1.0 + x * x));
    }
  }
  
  // Derivative dr/dℓ for geodesic integration
  float getRadiusDerivative(float l) {
    float absL = abs(l);
    if (absL <= uA) {
      return 0.0;
    } else {
      float x = 2.0 * (absL - uA) / (PI * uM);
      return sign(l) * (2.0 / PI) * atan(x);
    }
  }
  
  // Convert direction to equirectangular UV coordinates
  vec2 directionToEquirectangular(vec3 dir) {
    float theta = acos(clamp(dir.y, -1.0, 1.0));
    float phi = atan(dir.z, dir.x);
    phi = mod(phi + 2.0 * PI, 2.0 * PI);
    return vec2(phi / (2.0 * PI), theta / PI);
  }
  
  // Sample celestial sphere texture
  vec3 sampleCelestialSphere(vec3 direction, bool isUpper) {
    vec2 uv = directionToEquirectangular(direction);
    
    if (isUpper) {
      return texture2D(uGalaxyTexture, uv).rgb;
    } else {
      return texture2D(uSaturnTexture, uv).rgb;
    }
  }
  
  // Ray state structure for geodesic integration
  struct RayState {
    float l;        // Position along wormhole axis
    float theta;    // Polar angle
    float phi;      // Azimuthal angle
    float p_l;      // Canonical momentum
    float p_theta;  // Canonical momentum
    float p_phi;    // Conserved angular momentum
  };
  
  // Initialize ray from camera position and direction
  RayState initializeRay(vec3 rayOrigin, vec3 rayDir) {
    RayState state;
    
    // Convert to wormhole coordinates
    state.l = rayOrigin.z;
    float r_cam = length(rayOrigin.xy);
    state.theta = atan(r_cam, rayOrigin.z) + PI * 0.5;
    state.phi = atan(rayOrigin.y, rayOrigin.x);
    
    // Calculate initial canonical momenta
    state.p_l = rayDir.z;
    state.p_theta = r_cam * r_cam * rayDir.y;
    state.p_phi = r_cam * r_cam * sin(state.theta) * rayDir.x;
    
    return state;
  }
  
  // Single integration step using geodesic equations (A.7)
  RayState integrateStep(RayState state, float dt) {
    float r = getWormholeRadius(state.l);
    float dr_dl = getRadiusDerivative(state.l);
    
    // Constants of motion
    float b = state.p_phi;
    float B_squared = state.p_theta * state.p_theta + 
                     (state.p_phi * state.p_phi) / (sin(state.theta) * sin(state.theta));
    
    // Geodesic equations from paper (A.7)
    float dl_dt = state.p_l;
    float dtheta_dt = state.p_theta / (r * r);
    float dphi_dt = b / (r * r * sin(state.theta) * sin(state.theta));
    float dp_l_dt = B_squared * dr_dl / (r * r * r);
    float dp_theta_dt = (b * b * cos(state.theta)) / 
                       (r * r * sin(state.theta) * sin(state.theta) * sin(state.theta));
    
    // Update state
    RayState newState;
    newState.l = state.l + dl_dt * dt;
    newState.theta = state.theta + dtheta_dt * dt;
    newState.phi = state.phi + dphi_dt * dt;
    newState.p_l = state.p_l + dp_l_dt * dt;
    newState.p_theta = state.p_theta + dp_theta_dt * dt;
    newState.p_phi = state.p_phi; // Conserved
    
    return newState;
  }
  
  // Trace ray backward to celestial sphere
  vec3 traceRayToCelestialSphere(vec3 rayOrigin, vec3 rayDir) {
    RayState state = initializeRay(rayOrigin, rayDir);
    
    for (int step = 0; step < MAX_STEPS; step++) {
      state = integrateStep(state, -STEP_SIZE); // Backward integration
      
      // Check if we've reached a celestial sphere
      if (abs(state.l) > CELESTIAL_DISTANCE) {
        // Convert final state back to 3D direction
        vec3 direction = vec3(
          sin(state.theta) * cos(state.phi),
          cos(state.theta),
          sin(state.theta) * sin(state.phi)
        );
        
        // Sample appropriate celestial sphere
        bool isUpper = state.l > 0.0;
        return sampleCelestialSphere(direction, isUpper);
      }
      
      // Safety checks
      float r = getWormholeRadius(state.l);
      if (r < uRho * 0.1 || r > 100.0) {
        break;
      }
    }
    
    // Ray didn't reach celestial sphere - return background
    vec2 bgUv = directionToEquirectangular(rayDir);
    return texture2D(uGalaxyTexture, bgUv).rgb * 0.1;
  }
  
  void main() {
    // Calculate ray direction from camera through this pixel
    vec3 rayDir = normalize(vWorldPosition - uCameraPos);
    
    // Trace ray through curved spacetime to celestial sphere
    vec3 color = traceRayToCelestialSphere(uCameraPos, rayDir);
    
    // Add Einstein ring effect near wormhole edges
    float distFromCenter = length(vUv - 0.5);
    float einsteinRingRadius = 0.45; // Adjust based on wormhole parameters
    float ringWidth = 0.02;
    
    if (abs(distFromCenter - einsteinRingRadius) < ringWidth) {
      float ringIntensity = 1.0 - abs(distFromCenter - einsteinRingRadius) / ringWidth;
      color += vec3(0.3, 0.6, 1.0) * ringIntensity * 0.5;
    }
    
    gl_FragColor = vec4(color, 1.0);
  }
`;