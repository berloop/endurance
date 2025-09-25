// lib/shaders/kerr-raytracer.ts

export const kerrVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const kerrFragmentShader = `
  #define PI 3.1415926538
  
  uniform float uSpin;
  uniform vec3 uCameraPos;
  uniform float uTime;
  uniform float uDiscInner;
  uniform float uDiscOuter;
  uniform bool uShowDoppler;
  uniform int uMaxSteps;
  uniform float uStepSize;
  uniform float uEpsilon;
  uniform float uCamDistance;
  uniform float uTilt;
  uniform float uZoom;
  
  varying vec2 vUv;
  
  // Diagonal matrix
  mat4 diag(vec4 v) {
    return mat4(
      v.x, 0, 0, 0,
      0, v.y, 0, 0,
      0, 0, v.z, 0,
      0, 0, 0, v.w
    );
  }
  
  // r from coordinates (pos = vec4(t,x,y,z))
  float rFromCoords(vec4 pos) {
    vec3 p = pos.yzw; // spatial part
    float rho2 = dot(p, p) - uSpin * uSpin;
    float r2 = 0.5 * (rho2 + sqrt(rho2 * rho2 + 4.0 * uSpin * uSpin * pos.w * pos.w));
    return sqrt(max(0.0, r2));
  }
  
  // Kerr metric in Kerr-Schild coordinates
  mat4 metric(vec4 pos) {
    float r = rFromCoords(pos);
    float a = uSpin;
    
    // Null vector k
    vec4 k = vec4(
      -1.0,
      (r * pos.y - a * pos.w) / (r * r + a * a),
      (r * pos.z + a * pos.y) / (r * r + a * a),
      pos.w / r
    );
    
    float f = 2.0 * r / (r * r + a * a * pos.w * pos.w / (r * r));
    return f * mat4(k.x * k, k.y * k, k.z * k, k.w * k) + diag(vec4(-1, 1, 1, 1));
  }
  
  // Hamiltonian
  float hamiltonian(vec4 x, vec4 p) {
    return 0.5 * dot(inverse(metric(x)) * p, p);
  }
  
  // Hamiltonian gradient
  vec4 hamiltonianGradient(vec4 x, vec4 p) {
    float eps = uEpsilon;
    float H0 = hamiltonian(x, p);
    return vec4(
      hamiltonian(x + vec4(eps,0,0,0), p) - H0,
      hamiltonian(x + vec4(0,eps,0,0), p) - H0,
      hamiltonian(x + vec4(0,0,eps,0), p) - H0,
      hamiltonian(x + vec4(0,0,0,eps), p) - H0
    ) / eps;
  }
  
  // Integration step
  void transportStep(inout vec4 x, inout vec4 p) {
    p -= uStepSize * hamiltonianGradient(x, p);
    x += uStepSize * inverse(metric(x)) * p;
  }
  
  // Unit vector with respect to metric
  vec4 unit(vec4 v, mat4 g) {
    float norm2 = dot(g * v, v);
    return (norm2 != 0.0) ? v / sqrt(abs(norm2)) : v;
  }
  
  // Orthonormal tetrad
  mat4 tetrad(vec4 x, vec4 time, vec4 aim, vec4 vert) {
    mat4 g = metric(x);
    vec4 E0 = unit(time, g);
    vec4 E1 = unit(aim + dot(g * aim, E0) * E0, g);
    vec4 E3 = unit(vert - dot(g * vert, E1) * E1 + dot(g * vert, E0) * E0, g);
    
    // E2 via cross product
    vec4 E2 = unit(
      inverse(g) * vec4(
        dot(E0.yzw, cross(E1.yzw, E3.yzw)),
        -dot(E0.zwx, cross(E1.zwx, E3.zwx)),
        dot(E0.wxy, cross(E1.wxy, E3.wxy)),
        -dot(E0.xyz, cross(E1.xyz, E3.xyz))
      ), 
      g
    );
    
    return mat4(E0, E1, E2, E3);
  }
  
  void main() {
    vec2 uv = (2.0 * vUv - 1.0);
    uv.x *= 1.0; // aspect ratio adjustment if needed
    
    float camR = uCamDistance;
    float tilt = uTilt;
    float zoom = uZoom;
    float a = uSpin;
    
    // Camera position (t, x, y, z)
    float x = sqrt(camR * camR + a * a) * cos(tilt);
    float z = camR * sin(tilt);
    vec4 camPos = vec4(0.0, x, 0.0, z);
    
    // Camera basis vectors
    vec4 time = vec4(1.0, 0.0, 0.0, 0.0);
    vec4 aim = vec4(0.0, x, 0.0, z);
    vec4 vert = vec4(0.0, -x * z, 0.0, x * x) * sign(cos(tilt));
    mat4 axes = tetrad(camPos, time, aim, vert);
    
    // Ray direction
    vec4 pos = camPos;
    vec3 dir = normalize(vec3(-zoom, uv));
    vec4 dir4D = -axes[0] + dir.x * axes[1] + dir.y * axes[2] + dir.z * axes[3];
    vec4 p = metric(pos) * dir4D;
    
    bool captured = false;
    bool hitDisc = false;
    vec4 intersectPos;
    float blueshift = 1.0;
    
    float r_horizon = 1.0 + sqrt(max(0.0, 1.0 - a * a));
    
    // Ray tracing
    for (int i = 0; i < 500; i++) {
      if (i >= uMaxSteps) break;
      
      vec4 lastpos = pos;
      transportStep(pos, p);
      
      // Check disc intersection (z crosses zero)
      if (pos.w * lastpos.w < 0.0) {
        intersectPos = (pos * abs(lastpos.w) + lastpos * abs(pos.w)) / abs(lastpos.w - pos.w);
        float r = rFromCoords(intersectPos);
        
        if (r > uDiscInner && r < uDiscOuter) {
          hitDisc = true;
          
          // Keplerian disc velocity for Doppler
          vec4 discVel = vec4(
            r + a / sqrt(r),
            vec3(-intersectPos.z, intersectPos.y, 0.0) * sign(a) / sqrt(r)
          ) / sqrt(r * r - 3.0 * r + 2.0 * a * sqrt(r));
          
          blueshift = 1.0 / max(0.1, dot(p, discVel));
          break;
        }
      }
      
      // Stop condition
      float r = rFromCoords(pos);
      if (r < r_horizon) {
        captured = true;
        break;
      }
      if (r > max(2.0 * camR, 30.0)) {
        break;
      }
    }
    
    vec3 color = vec3(0.0);
    
    if (hitDisc) {
      // Procedural disc color
      float r = rFromCoords(intersectPos);
      float phi = atan(intersectPos.z, intersectPos.y);
      
      // Temperature gradient
      float temp = 15000.0 * pow(6.0 / r, 0.75);
      temp = clamp(temp, 3000.0, 30000.0);
      
      // Simple temperature to color
      color = vec3(1.0, 0.6, 0.3) * (temp / 15000.0);
      
      // Doppler effect
      if (uShowDoppler) {
        color *= pow(blueshift, 3.0);
      }
      
    } else if (!captured) {
      // Background stars
      color = vec3(0.01); // Dim background
    }
    
    gl_FragColor = vec4(color, 1.0);
  }
`;