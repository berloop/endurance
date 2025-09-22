/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { geodesicFragmentShader, geodesicVertexShader } from '@/lib/geodesic-shader';
import { rayTracingFragmentShader, rayTracingVertexShader } from '@/lib/ray-tracing-shader';
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
    rho: 0.3,
    a: 0.001,
    M: 0.53
  });

  const [cameraPosition, setCameraPosition] = useState({ 
    distance: 10.0, 
    theta: 0, 
    phi: 0 
  });

  const [renderMode, setRenderMode] = useState<'geometry' | 'raytraced' | 'geodesic'>('raytraced');

 


  const [textures, setTextures] = useState<{
    galaxy?: THREE.Texture;
    saturn?: THREE.Texture;
  }>({});

  // Load textures
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    
    // Try to load galaxy texture
    loader.load('/galaxy.jpg', 
      (texture) => {
        texture.generateMipmaps = false;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.flipY = false;
        setTextures(prev => ({ ...prev, galaxy: texture }));
      },
      undefined,
      (error) => {
        console.log('Galaxy texture not found, using fallback');
        const fallbackTexture = createProceduralGalaxy();
        setTextures(prev => ({ ...prev, galaxy: fallbackTexture }));
      }
    );

    // Create Saturn-side starfield
    const saturnTexture = createStarfield();
    setTextures(prev => ({ ...prev, saturn: saturnTexture }));
  }, []);

  const createProceduralGalaxy = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d')!;
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 2048, 2048);
    
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      const size = Math.random() * 150 + 50;
      const opacity = Math.random() * 0.4 + 0.1;
      
      const colors = ['#FF6B9D', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      gradient.addColorStop(0, color + Math.floor(opacity * 255).toString(16).padStart(2, '0'));
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x - size, y - size, size * 2, size * 2);
    }
    
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
    
    return new THREE.CanvasTexture(canvas);
  };

  const createStarfield = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d')!;
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 1024, 512);
    
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
    // Remove existing objects
    const existingWormhole = scene.getObjectByName('wormhole');
    const existingRayTracer = scene.getObjectByName('rayTracer');
    const existingGeodesicTracer = scene.getObjectByName('geodesicTracer');
    
    if (existingWormhole) scene.remove(existingWormhole);
    if (existingRayTracer) scene.remove(existingRayTracer);
    if (existingGeodesicTracer) scene.remove(existingGeodesicTracer);

    if (renderMode === 'raytraced' && textures.galaxy) {
      // Simple ray-tracing mode
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
      
      (rayTracer as any).rayTracerMaterial = rayTracerMaterial;
      
    } else if (renderMode === 'geodesic' && textures.galaxy && textures.saturn) {
      // Geodesic ray-tracing mode using imported shaders
      const geodesicGeometry = new THREE.PlaneGeometry(200, 200);
      const geodesicMaterial = new THREE.ShaderMaterial({
        vertexShader: geodesicVertexShader,
        fragmentShader: geodesicFragmentShader,
        uniforms: {
          uRho: { value: parameters.rho },
          uA: { value: parameters.a },
          uM: { value: parameters.M },
          uGalaxyTexture: { value: textures.galaxy },
          uSaturnTexture: { value: textures.saturn },
          uCameraPos: { value: new THREE.Vector3() },
          uTime: { value: 0 }
        },
        side: THREE.DoubleSide
      });

      const geodesicTracer = new THREE.Mesh(geodesicGeometry, geodesicMaterial);
      geodesicTracer.name = 'geodesicTracer';
      scene.add(geodesicTracer);
      
      (geodesicTracer as any).geodesicMaterial = geodesicMaterial;
      
    } else {
      // Geometry mode - show 3D wormhole structure
      const group = new THREE.Group();
      group.name = 'wormhole';

      // Wormhole throat
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

      // Upper mouth (purple)
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
      
      // Lower mouth (orange)
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

      // Particles for lensing visualization
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

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
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
      } else if (renderMode === 'geodesic') {
        const geodesicTracer = scene.getObjectByName('geodesicTracer');
        if (geodesicTracer && (geodesicTracer as any).geodesicMaterial && cameraRef.current) {
          const material = (geodesicTracer as any).geodesicMaterial;
          material.uniforms.uTime.value += 0.01;
          material.uniforms.uCameraPos.value.copy(cameraRef.current.position);
          material.uniforms.uRho.value = parameters.rho;
          material.uniforms.uA.value = parameters.a;
          material.uniforms.uM.value = parameters.M;
        }
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
  }, [createWormholeGeometry, updateCameraPosition]);

  useEffect(() => {
    if (sceneRef.current) {
      createWormholeGeometry(sceneRef.current);
    }
  }, [createWormholeGeometry]);

  useEffect(() => {
    updateCameraPosition();
  }, [updateCameraPosition]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Parameter Controls */}
      <div className="absolute top-4 left-4 bg-neutral-950 backdrop-blur-sm rounded-xs p-4 text-white max-w-xs">
        <h3 className="text-lg font-semibold mb-3">Wormhole Parameters</h3>
        
        {/* Render Mode Toggle */}
        <div className="mb-4">
          <label className="block text-sm mb-2">Render Mode:</label>
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => setRenderMode('geometry')}
              className={`px-2 py-1 text-xs rounded ${
                renderMode === 'geometry' 
                  ? 'bg-rose-500 text-white' 
                  : 'bg-gray-600 text-gray-300'
              }`}
            >
              Geometry
            </button>
            <button
              onClick={() => setRenderMode('raytraced')}
              className={`px-2 py-1 text-xs rounded ${
                renderMode === 'raytraced' 
                  ? 'bg-rose-500 text-white' 
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
              min="0.3"
              max="2.0"
              step="0.01"
              value={parameters.rho}
              onChange={(e) => setParameters(prev => ({ ...prev, rho: parseFloat(e.target.value) }))}
              className="w-full accent-rose-500"
            />
          </div>
          
          <div>
            <label className="block text-sm mb-2">Length (2a): {(2 * parameters.a).toFixed(3)}</label>
            <input
              type="range"
              min="0.001"
              max="1.0"
              step="0.001"
              value={parameters.a}
              onChange={(e) => setParameters(prev => ({ ...prev, a: parseFloat(e.target.value) }))}
              className="w-full accent-rose-500"
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
              className="w-full accent-rose-500"
            />
          </div>
        </div>
        
        <div className="mt-3 pt-2 border-t border-gray-600 text-xs text-gray-400">
          <div>Lensing Width: {(1.42953 * parameters.M).toFixed(3)}</div>
          <div>Throat Area: {(4 * Math.PI * parameters.rho * parameters.rho).toFixed(2)}</div>
        </div>
      </div>

      {/* Camera Controls */}
      <div className="absolute bottom-4 left-4 bg-neutral-950 backdrop-blur-sm rounded-xs p-4 text-white max-w-xs">
        <h3 className="text-lg font-semibold mb-3">Camera Position</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Distance: {cameraPosition.distance.toFixed(2)}</label>
            <input
              type="range"
              min="1.5"
              max="10"
              step="0.1"
              value={cameraPosition.distance}
              onChange={(e) => setCameraPosition(prev => ({ ...prev, distance: parseFloat(e.target.value) }))}
              className="w-full accent-rose-500"
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
              className="w-full accent-rose-500"
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
              className="w-full accent-rose-500"
            />
          </div>
        </div>
      </div>

      {/* Status Display */}
      <div className="absolute top-4 right-4 bg-neutral-950 backdrop-blur-sm rounded-xs p-4 text-white">
        <h3 className="text-lg font-semibold mb-2">Status</h3>
        <div className="text-sm space-y-1">
          <div className="text-green-400">✓ Texture Loaded</div>
          <div className="text-green-400">✓ Animation Active</div>
          <div className="text-green-400">✓ Physics Modules</div>
          {renderMode === 'geodesic' ? (
            <div className="text-purple-400">✓ Geodesic Integration</div>
          ) : renderMode === 'raytraced' ? (
            <div className="text-rose-400">✓ Ray Tracing Active</div>
          ) : (
            <div className="text-yellow-400">✓ Geometry Mode</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebugWormhole;