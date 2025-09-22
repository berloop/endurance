/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';

interface WormholeParameters {
  rho: number;    // Wormhole radius (ρ)
  a: number;      // Half-length of cylindrical interior
  M: number;      // Lensing parameter
}

interface WormholeViewerProps {
  className?: string;
}

// Vertex shader for ray tracing
const vertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  
  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment shader implementing geodesic ray tracing
const fragmentShader = `
  uniform float uRho;
  uniform float uA;
  uniform float uM;
  uniform vec3 uCameraPosition;
  uniform sampler2D uGalaxyTexture;
  uniform sampler2D uSaturnTexture;
  uniform float uTime;
  
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  
  const int MAX_STEPS = 200;
  const float STEP_SIZE = 0.01;
  const float PI = 3.14159265359;
  const float EPSILON = 1e-6;
  
  // Wormhole radius function r(l) from the paper
  float getRadius(float l) {
    float absL = abs(l);
    if (absL <= uA) {
      return uRho;
    } else {
      float x = 2.0 * (absL - uA) / (PI * uM);
      return uRho + uM * (x * atan(x) - 0.5 * log(1.0 + x * x));
    }
  }
  
  // Derivative dr/dl for geodesic integration
  float getRadiusDerivative(float l) {
    float absL = abs(l);
    if (absL <= uA) {
      return 0.0;
    } else {
      float x = 2.0 * (absL - uA) / (PI * uM);
      return sign(l) * (2.0 / PI) * atan(x);
    }
  }
  
  // Convert 3D direction to spherical coordinates
  vec2 directionToSpherical(vec3 dir) {
    float theta = acos(clamp(dir.z, -1.0, 1.0));
    float phi = atan(dir.y, dir.x);
    if (phi < 0.0) phi += 2.0 * PI;
    return vec2(theta / PI, phi / (2.0 * PI));
  }
  
  // Sample texture with longitude-latitude mapping
  vec3 sampleCelestialSphere(sampler2D tex, vec3 direction) {
    vec2 uv = directionToSpherical(direction);
    return texture2D(tex, uv).rgb;
  }
  
  // Integrate geodesic equations backward from camera
  vec3 traceRay(vec3 rayOrigin, vec3 rayDirection) {
    // Convert to wormhole coordinate system
    float l = rayOrigin.z;
    float r = getRadius(l);
    
    // Initial conditions for geodesic integration
    vec3 pos = rayOrigin;
    vec3 dir = rayDirection;
    
    // Spherical coordinates
    float theta = atan(length(pos.xy), pos.z) + PI * 0.5;
    float phi = atan(pos.y, pos.x);
    
    // Canonical momenta (simplified version)
    float p_l = dir.z;
    float p_theta = r * r * dir.y;
    float p_phi = r * r * sin(theta) * dir.x;
    
    // Constants of motion
    float b = p_phi;
    float B_squared = p_theta * p_theta + p_phi * p_phi / (sin(theta) * sin(theta));
    
    // Integration loop
    for (int step = 0; step < MAX_STEPS; step++) {
      float dt = STEP_SIZE;
      
      // Current radius
      r = getRadius(l);
      float dr_dl = getRadiusDerivative(l);
      
      // Update position and momentum using simplified geodesic equations
      float dl_dt = p_l;
      float dtheta_dt = p_theta / (r * r);
      float dphi_dt = b / (r * r * sin(theta) * sin(theta));
      
      float dp_l_dt = B_squared * dr_dl / (r * r * r);
      float dp_theta_dt = b * b * cos(theta) / (r * r * sin(theta) * sin(theta) * sin(theta));
      
      // Update values
      l += dl_dt * dt;
      theta += dtheta_dt * dt;
      phi += dphi_dt * dt;
      p_l += dp_l_dt * dt;
      p_theta += dp_theta_dt * dt;
      
      // Check if we've reached a celestial sphere
      if (abs(l) > 50.0) {
        vec3 direction = vec3(
          sin(theta) * cos(phi),
          sin(theta) * sin(phi),
          cos(theta)
        );
        
        // Determine which celestial sphere we hit
        if (l > 0.0) {
          // Upper celestial sphere (galaxy side)
          return sampleCelestialSphere(uGalaxyTexture, direction);
        } else {
          // Lower celestial sphere (Saturn side)
          return sampleCelestialSphere(uSaturnTexture, direction);
        }
      }
      
      // Safety check to prevent infinite loops
      if (r < uRho * 0.1 || r > 100.0) break;
    }
    
    // Default background color if ray doesn't hit anything
    return vec3(0.0, 0.0, 0.1);
  }
  
  void main() {
    // Calculate ray direction from camera through this pixel
    vec3 rayOrigin = uCameraPosition;
    vec3 rayDirection = normalize(vWorldPosition - rayOrigin);
    
    // Trace the ray through the wormhole spacetime
    vec3 color = traceRay(rayOrigin, rayDirection);
    
    // Add some atmospheric effects near the wormhole
    float distToWormhole = length(vWorldPosition);
    float wormholeGlow = exp(-distToWormhole / (uRho * 2.0)) * 0.3;
    color += vec3(0.2, 0.6, 1.0) * wormholeGlow;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

const RayTracingWormhole: React.FC<WormholeViewerProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const animationIdRef = useRef<number>();
  const wormholeMaterialRef = useRef<THREE.ShaderMaterial>();
  
  const [parameters, setParameters] = useState<WormholeParameters>({
    rho: 1.0,
    a: 0.005,
    M: 0.05
  });

  const [cameraPosition, setCameraPosition] = useState({ 
    distance: 6.25, 
    theta: Math.PI / 2, 
    phi: 0 
  });

  // Load textures
  const [textures, setTextures] = useState<{
    galaxy?: THREE.Texture;
    saturn?: THREE.Texture;
  }>({});

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    
    // Create placeholder textures
    const createGalaxyTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;
      
      // Create galaxy-like pattern
      const gradient = ctx.createRadialGradient(256, 128, 0, 256, 128, 200);
      gradient.addColorStop(0, '#FFE4B5');
      gradient.addColorStop(0.3, '#DDA0DD');
      gradient.addColorStop(0.6, '#4169E1');
      gradient.addColorStop(1, '#000000');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 256);
      
      // Add stars
      ctx.fillStyle = 'white';
      for (let i = 0; i < 1000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 256;
        const size = Math.random() * 2;
        ctx.fillRect(x, y, size, size);
      }
      
      return new THREE.CanvasTexture(canvas);
    };

    const createSaturnTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;
      
      // Create starfield
      ctx.fillStyle = '#000011';
      ctx.fillRect(0, 0, 512, 256);
      
      ctx.fillStyle = 'white';
      for (let i = 0; i < 500; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 256;
        const size = Math.random() * 1.5;
        ctx.fillRect(x, y, size, size);
      }
      
      return new THREE.CanvasTexture(canvas);
    };

    setTextures({
      galaxy: createGalaxyTexture(),
      saturn: createSaturnTexture()
    });
  }, []);

  const updateCameraPosition = useCallback(() => {
    if (!cameraRef.current) return;

    const { distance, theta, phi } = cameraPosition;
    const x = distance * Math.sin(theta) * Math.cos(phi);
    const y = distance * Math.sin(theta) * Math.sin(phi);
    const z = distance * Math.cos(theta);

    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(0, 0, 0);
  }, [cameraPosition]);

  const createWormholeGeometry = useCallback(() => {
    if (!sceneRef.current || !textures.galaxy || !textures.saturn) return;

    // Remove existing wormhole
    const existingWormhole = sceneRef.current.getObjectByName('wormhole');
    if (existingWormhole) {
      sceneRef.current.remove(existingWormhole);
    }

    // Create large sphere for ray tracing
    const geometry = new THREE.SphereGeometry(50, 64, 64);
    
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uRho: { value: parameters.rho },
        uA: { value: parameters.a },
        uM: { value: parameters.M },
        uCameraPosition: { value: new THREE.Vector3() },
        uGalaxyTexture: { value: textures.galaxy },
        uSaturnTexture: { value: textures.saturn },
        uTime: { value: 0 }
      },
      side: THREE.BackSide
    });

    wormholeMaterialRef.current = material;

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'wormhole';
    sceneRef.current.add(mesh);
  }, [parameters, textures]);

  // Initialize scene
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    updateCameraPosition();
    createWormholeGeometry();

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      if (wormholeMaterialRef.current && cameraRef.current) {
        wormholeMaterialRef.current.uniforms.uTime.value += 0.01;
        wormholeMaterialRef.current.uniforms.uCameraPosition.value.copy(cameraRef.current.position);
      }
      
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [updateCameraPosition, createWormholeGeometry]);

  // Update wormhole when parameters change
  useEffect(() => {
    if (wormholeMaterialRef.current) {
      wormholeMaterialRef.current.uniforms.uRho.value = parameters.rho;
      wormholeMaterialRef.current.uniforms.uA.value = parameters.a;
      wormholeMaterialRef.current.uniforms.uM.value = parameters.M;
    }
  }, [parameters]);

  useEffect(() => {
    updateCameraPosition();
  }, [updateCameraPosition]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Parameter Controls */}
      <div className="absolute top-4 left-4 bg-black/90 backdrop-blur-sm rounded-lg p-4 text-white max-w-xs">
        <h3 className="text-lg font-semibold mb-3">Wormhole Parameters</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Radius (ρ): {parameters.rho.toFixed(3)}</label>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={parameters.rho}
              onChange={(e) => setParameters(prev => ({ ...prev, rho: parseFloat(e.target.value) }))}
              className="w-full accent-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm mb-2">Length (2a): {(2 * parameters.a).toFixed(4)}</label>
            <input
              type="range"
              min="0.001"
              max="0.1"
              step="0.001"
              value={parameters.a}
              onChange={(e) => setParameters(prev => ({ ...prev, a: parseFloat(e.target.value) }))}
              className="w-full accent-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm mb-2">Lensing (M): {parameters.M.toFixed(3)}</label>
            <input
              type="range"
              min="0.01"
              max="1.0"
              step="0.01"
              value={parameters.M}
              onChange={(e) => setParameters(prev => ({ ...prev, M: parseFloat(e.target.value) }))}
              className="w-full accent-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Camera Controls */}
      <div className="absolute bottom-4 left-4 bg-black/90 backdrop-blur-sm rounded-lg p-4 text-white max-w-xs">
        <h3 className="text-lg font-semibold mb-3">Camera Position</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Distance: {cameraPosition.distance.toFixed(2)}</label>
            <input
              type="range"
              min="2"
              max="20"
              step="0.1"
              value={cameraPosition.distance}
              onChange={(e) => setCameraPosition(prev => ({ ...prev, distance: parseFloat(e.target.value) }))}
              className="w-full accent-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm mb-2">Theta: {(cameraPosition.theta * 180 / Math.PI).toFixed(1)}°</label>
            <input
              type="range"
              min="0"
              max={Math.PI}
              step="0.01"
              value={cameraPosition.theta}
              onChange={(e) => setCameraPosition(prev => ({ ...prev, theta: parseFloat(e.target.value) }))}
              className="w-full accent-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm mb-2">Phi: {(cameraPosition.phi * 180 / Math.PI).toFixed(1)}°</label>
            <input
              type="range"
              min="0"
              max={Math.PI * 2}
              step="0.01"
              value={cameraPosition.phi}
              onChange={(e) => setCameraPosition(prev => ({ ...prev, phi: parseFloat(e.target.value) }))}
              className="w-full accent-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Physics Info */}
      <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-sm rounded-lg p-4 text-white">
        <h3 className="text-lg font-semibold mb-2">Ray Tracing Active</h3>
        <div className="text-sm space-y-1">
          <div>Lensing Width: {(1.42953 * parameters.M).toFixed(3)}</div>
          <div>Einstein Ring: Visible</div>
          <div>Geodesic Integration: ON</div>
          <div>Max Ray Steps: 200</div>
        </div>
      </div>
    </div>
  );
};

export default RayTracingWormhole;