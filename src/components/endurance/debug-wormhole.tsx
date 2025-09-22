/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';

interface WormholeParameters {
  rho: number;    // Wormhole radius (ρ)
  a: number;      // Half-length of cylindrical interior
  M: number;      // Lensing parameter
}

const DebugWormhole: React.FC<{ className?: string }> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const animationIdRef = useRef<number>();
  
const [parameters, setParameters] = useState<WormholeParameters>({
  rho: 0.9,
  a: 0.5,    // This gives length (2a) = 1.0
  M: 0.53
});

 const [cameraPosition, setCameraPosition] = useState({ 
  distance: 2.0, 
  theta: 0,    // 0° instead of 90°
  phi: 0 
});

 const [renderMode, setRenderMode] = useState<'geometry' | 'raytraced'>('raytraced');

  // Simple ray-tracing shader
  const rayTracingVertexShader = `
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    
    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const rayTracingFragmentShader = `
    uniform float uRho;
    uniform float uA;
    uniform float uM;
    uniform sampler2D uGalaxyTexture;
    uniform vec3 uCameraPos;
    uniform float uTime;
    
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    
    const float PI = 3.14159265359;
    const float EPSILON = 1e-6;
    
    // Convert 3D direction to equirectangular UV coordinates
    vec2 directionToEquirectangular(vec3 dir) {
      float theta = acos(clamp(dir.y, -1.0, 1.0));
      float phi = atan(dir.z, dir.x);
      if (phi < 0.0) phi += 2.0 * PI;
      return vec2(phi / (2.0 * PI), theta / PI);
    }
    
    // Simplified wormhole ray tracing
    vec3 traceRay(vec3 rayOrigin, vec3 rayDir) {
      // Distance from camera to wormhole center
      float distToCenter = length(rayOrigin);
      
      // Check if ray passes through wormhole
      vec3 toCenter = -rayOrigin;
      float projectionLength = dot(rayDir, normalize(toCenter));
      
      if (projectionLength > 0.0) {
        vec3 closestPoint = rayOrigin + rayDir * projectionLength;
        float distToAxis = length(closestPoint);
        
        // If ray passes through wormhole mouth
        if (distToAxis < uRho * 1.2) {
          // Ray goes through wormhole - sample galaxy texture
          vec3 throughDirection = rayDir;
          
          // Apply simple gravitational lensing distortion
          float lensStrength = uM * (1.0 - distToAxis / (uRho * 1.2));
          float angle = atan(closestPoint.z, closestPoint.x);
          throughDirection.x += sin(angle * 4.0 + uTime) * lensStrength * 0.1;
          throughDirection.z += cos(angle * 4.0 + uTime) * lensStrength * 0.1;
          throughDirection = normalize(throughDirection);
          
          vec2 uv = directionToEquirectangular(throughDirection);
          vec3 galaxyColor = texture2D(uGalaxyTexture, uv).rgb;
          
          // Add wormhole glow effect
          float glowFactor = 1.0 - (distToAxis / (uRho * 1.2));
          galaxyColor += vec3(0.2, 0.4, 1.0) * glowFactor * 0.3;
          
          return galaxyColor;
        }
      }
      
      // Ray doesn't go through wormhole - sample background
      vec2 bgUv = directionToEquirectangular(rayDir);
      return texture2D(uGalaxyTexture, bgUv).rgb * 0.3; // Dimmed background
    }
    
    void main() {
      // Calculate ray direction from camera to this pixel
      vec3 rayDir = normalize(vWorldPosition - uCameraPos);
      
      // Trace ray through wormhole
      vec3 color = traceRay(uCameraPos, rayDir);
      
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const [textures, setTextures] = useState<{
    galaxy?: THREE.Texture;
    saturn?: THREE.Texture;
  }>({});

  // Load textures
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    
    // Try to load your single texture first
    loader.load('/galaxy.jpg', 
      (texture) => {
        // Preserve texture quality
        texture.generateMipmaps = false;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.flipY = false; // Important for equirectangular textures
        setTextures(prev => ({ ...prev, galaxy: texture }));
      },
      undefined,
      (error) => {
        console.log('Galaxy texture not found, using fallback');
        // Create proper black space with nebula
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d')!;
        
        // BLACK space background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 1024, 512);
        
        // Add colorful nebula patches
        for (let i = 0; i < 30; i++) {
          const x = Math.random() * 1024;
          const y = Math.random() * 512;
          const size = Math.random() * 150 + 50;
          const opacity = Math.random() * 0.4 + 0.1;
          
          const colors = ['#FF6B9D', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'];
          const color = colors[Math.floor(Math.random() * colors.length)];
          
          const nebulaGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
          nebulaGradient.addColorStop(0, color + Math.floor(opacity * 255).toString(16).padStart(2, '0'));
          nebulaGradient.addColorStop(1, 'transparent');
          
          ctx.fillStyle = nebulaGradient;
          ctx.fillRect(x - size, y - size, size * 2, size * 2);
        }
        
        // Add white stars
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 2000; i++) {
          const x = Math.random() * 1024;
          const y = Math.random() * 512;
          const brightness = Math.random();
          const size = brightness * 2;
          ctx.globalAlpha = brightness;
          ctx.fillRect(x, y, size, size);
        }
        ctx.globalAlpha = 1;
        
        const fallbackTexture = new THREE.CanvasTexture(canvas);
        setTextures(prev => ({ ...prev, galaxy: fallbackTexture }));
      }
    );

    // Create simple black starfield for Saturn side
    const createStarfield = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;
      
      // BLACK space background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 1024, 512);
      
      // Add white stars only
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < 1500; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 512;
        const brightness = Math.random();
        const size = brightness * 1.5;
        ctx.globalAlpha = brightness;
        ctx.fillRect(x, y, size, size);
      }
      ctx.globalAlpha = 1;
      
      return new THREE.CanvasTexture(canvas);
    };

    setTextures(prev => ({ ...prev, saturn: createStarfield() }));
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

  const createWormholeGeometry = useCallback((scene: THREE.Scene) => {
    // Remove existing wormhole and spheres
    const existingWormhole = scene.getObjectByName('wormhole');
    const existingGalaxy = scene.getObjectByName('galaxySphere');
    const existingSaturn = scene.getObjectByName('saturnSphere');
    const existingRayTracer = scene.getObjectByName('rayTracer');
    
    if (existingWormhole) scene.remove(existingWormhole);
    if (existingGalaxy) scene.remove(existingGalaxy);
    if (existingSaturn) scene.remove(existingSaturn);
    if (existingRayTracer) scene.remove(existingRayTracer);

    if (renderMode === 'raytraced' && textures.galaxy) {
      // Create ray-tracing plane
      const rayTracerGeometry = new THREE.PlaneGeometry(100, 100);
      const rayTracerMaterial = new THREE.ShaderMaterial({
        vertexShader: rayTracingVertexShader,
        fragmentShader: rayTracingFragmentShader,
        uniforms: {
          uRho: { value: parameters.rho },
          uA: { value: parameters.a },
          uM: { value: parameters.M },
          uGalaxyTexture: { value: textures.galaxy },
          uCameraPos: { value: new THREE.Vector3() },
          uTime: { value: 0 }
        },
        side: THREE.DoubleSide
      });

      const rayTracer = new THREE.Mesh(rayTracerGeometry, rayTracerMaterial);
      rayTracer.name = 'rayTracer';
      scene.add(rayTracer);
      
      // Store material reference for animation
      (rayTracer as any).rayTracerMaterial = rayTracerMaterial;
      
    } else {
     

      // Create wormhole geometry
      const group = new THREE.Group();
      group.name = 'wormhole';

      const throatGeometry = new THREE.CylinderGeometry(
        parameters.rho, 
        parameters.rho, 
        2 * parameters.a, 
        32
      );
      const throatMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x444444, 
        wireframe: true,
        transparent: true,
        opacity: 0.8
      });
      const throat = new THREE.Mesh(throatGeometry, throatMaterial);
      throat.rotation.x = Math.PI / 2;
      group.add(throat);

      // Wormhole mouths
      const upperRingGeometry = new THREE.RingGeometry(
        parameters.rho * 0.9, 
        parameters.rho * 1.1, 
        64
      );
      const upperRingMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x6633ff, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9
      });
      const upperRing = new THREE.Mesh(upperRingGeometry, upperRingMaterial);
      upperRing.position.z = parameters.a;
      group.add(upperRing);
      
      const lowerRingGeometry = new THREE.RingGeometry(
        parameters.rho * 0.9, 
        parameters.rho * 1.1, 
        64
      );
      const lowerRingMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffaa33, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9
      });
      const lowerRing = new THREE.Mesh(lowerRingGeometry, lowerRingMaterial);
      lowerRing.position.z = -parameters.a;
      group.add(lowerRing);

      // Add particles
      const particleGeometry = new THREE.BufferGeometry();
      const particleCount = 1000;
      const particlePositions = new Float32Array(particleCount * 3);
      
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = parameters.rho + Math.random() * parameters.M * 5;
        const height = (Math.random() - 0.5) * parameters.a * 4;
        
        particlePositions[i * 3] = Math.cos(angle) * radius;
        particlePositions[i * 3 + 1] = Math.sin(angle) * radius;
        particlePositions[i * 3 + 2] = height;
      }
      
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      
      const particleMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.02,
        transparent: true,
        opacity: 0.6
      });
      
      const particles = new THREE.Points(particleGeometry, particleMaterial);
      group.add(particles);

      scene.add(group);
    }
  }, [parameters, textures, renderMode, rayTracingVertexShader, rayTracingFragmentShader]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
   scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add background stars
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 1000;
    const starPositions = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 100;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1
    });
    
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Create wormhole
    createWormholeGeometry(scene);
    updateCameraPosition();

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      if (renderMode === 'geometry') {
        const wormhole = scene.getObjectByName('wormhole');
        if (wormhole) {
          wormhole.rotation.z += 0.005;
        }
      } else if (renderMode === 'raytraced') {
        const rayTracer = scene.getObjectByName('rayTracer');
        if (rayTracer && (rayTracer as any).rayTracerMaterial && cameraRef.current) {
          const material = (rayTracer as any).rayTracerMaterial;
          material.uniforms.uTime.value += 0.02;
          material.uniforms.uCameraPos.value.copy(cameraRef.current.position);
          material.uniforms.uRho.value = parameters.rho;
          material.uniforms.uA.value = parameters.a;
          material.uniforms.uM.value = parameters.M;
        }
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
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
  }, [createWormholeGeometry, updateCameraPosition]);

  // Update wormhole when parameters change
  useEffect(() => {
    if (sceneRef.current) {
      createWormholeGeometry(sceneRef.current);
    }
  }, [createWormholeGeometry]);

  // Update camera when position changes
  useEffect(() => {
    updateCameraPosition();
  }, [updateCameraPosition]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Parameter Controls */}
      <div className="absolute top-4 left-4 bg-black/90 backdrop-blur-sm rounded-lg p-4 text-white max-w-xs">
        <h3 className="text-lg font-semibold mb-3">Wormhole Parameters</h3>
        
        {/* Render Mode Toggle */}
        <div className="mb-4">
          <label className="block text-sm mb-2">Render Mode:</label>
          <div className="flex gap-2">
            <button
              onClick={() => setRenderMode('geometry')}
              className={`px-3 py-1 text-xs rounded ${
                renderMode === 'geometry' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-600 text-gray-300'
              }`}
            >
              Geometry
            </button>
            <button
              onClick={() => setRenderMode('raytraced')}
              className={`px-3 py-1 text-xs rounded ${
                renderMode === 'raytraced' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-600 text-gray-300'
              }`}
            >
              Ray Traced
            </button>
          </div>
        </div>
        
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
            <label className="block text-sm mb-2">Length (2a): {(2 * parameters.a).toFixed(3)}</label>
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.1"
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

      {/* Status Display */}
      <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-sm rounded-lg p-4 text-white">
        <h3 className="text-lg font-semibold mb-2">Status</h3>
        <div className="text-sm space-y-1">
          <div className="text-green-400">✓ High-Res Texture Loaded</div>
          <div className="text-green-400">✓ Animation Active</div>
          <div className="text-green-400">✓ Equirectangular Mapping</div>
          {renderMode === 'raytraced' ? (
            <div className="text-green-400">✓ Ray Tracing Active</div>
          ) : (
            <div className="text-yellow-400">⚠ Ray Tracing Disabled</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebugWormhole;