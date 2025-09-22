/* eslint-disable @typescript-eslint/no-unused-vars */
import { geodesicFragmentShader, geodesicVertexShader } from '@/lib/geodesic-shader';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';


interface WormholeParameters {
  rho: number;    // Wormhole radius (ρ)
  a: number;      // Half-length of cylindrical interior
  M: number;      // Lensing parameter
}

const AdvancedWormholeViewer: React.FC<{ className?: string }> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const animationIdRef = useRef<number>();
  const rayTracerMaterialRef = useRef<THREE.ShaderMaterial>();
  
  const [parameters, setParameters] = useState<WormholeParameters>({
    rho: 0.9,
    a: 0.5,
    M: 0.53
  });

  const [cameraPosition, setCameraPosition] = useState({ 
    distance: 2.0, 
    theta: 0, 
    phi: 0 
  });

  const [textures, setTextures] = useState<{
    galaxy?: THREE.Texture;
    saturn?: THREE.Texture;
  }>({});

  // Load textures
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    
    // Load galaxy texture
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
        console.log('Galaxy texture not found, using procedural fallback');
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
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;
    
    // Black space background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 2048, 1024);
    
    // Add nebula patches
    const nebulae = [
      { x: 0.3, y: 0.4, size: 200, colors: ['#FF6B9D', '#C44569'] },
      { x: 0.7, y: 0.3, size: 150, colors: ['#4ECDC4', '#44A08D'] },
      { x: 0.5, y: 0.7, size: 180, colors: ['#45B7D1', '#96CEB4'] },
      { x: 0.2, y: 0.6, size: 120, colors: ['#FECA57', '#FF9FF3'] }
    ];
    
    nebulae.forEach(nebula => {
      const centerX = nebula.x * 2048;
      const centerY = nebula.y * 1024;
      
      nebula.colors.forEach((color, i) => {
        const gradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, nebula.size * (1 - i * 0.3)
        );
        gradient.addColorStop(0, color + '40');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(centerX - nebula.size, centerY - nebula.size, 
                    nebula.size * 2, nebula.size * 2);
      });
    });
    
    // Add stars
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * 2048;
      const y = Math.random() * 1024;
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
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 2048, 1024);
    
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * 2048;
      const y = Math.random() * 1024;
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

  const createRayTracer = useCallback((scene: THREE.Scene) => {
    // Remove existing ray tracer
    const existing = scene.getObjectByName('rayTracer');
    if (existing) scene.remove(existing);

    if (!textures.galaxy || !textures.saturn) return;

    // Create large plane for ray tracing
    const geometry = new THREE.PlaneGeometry(200, 200);
    const material = new THREE.ShaderMaterial({
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

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'rayTracer';
    scene.add(mesh);

    rayTracerMaterialRef.current = material;
  }, [parameters, textures, geodesicVertexShader, geodesicFragmentShader]);

  // Initialize scene
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

    createRayTracer(scene);
    updateCameraPosition();

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      if (rayTracerMaterialRef.current && cameraRef.current) {
        const material = rayTracerMaterialRef.current;
        material.uniforms.uTime.value += 0.01;
        material.uniforms.uCameraPos.value.copy(cameraRef.current.position);
        material.uniforms.uRho.value = parameters.rho;
        material.uniforms.uA.value = parameters.a;
        material.uniforms.uM.value = parameters.M;
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
  }, [createRayTracer, updateCameraPosition]);

  // Update ray tracer when dependencies change
  useEffect(() => {
    if (sceneRef.current) {
      createRayTracer(sceneRef.current);
    }
  }, [createRayTracer]);

  useEffect(() => {
    updateCameraPosition();
  }, [updateCameraPosition]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Physics Controls */}
      <div className="absolute top-4 left-4 bg-black/95 backdrop-blur-sm rounded-lg p-4 text-white max-w-xs">
        <h3 className="text-lg font-semibold mb-3">Geodesic Ray Tracing</h3>
        
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
              className="w-full accent-purple-500"
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
              className="w-full accent-purple-500"
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
              className="w-full accent-purple-500"
            />
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-600">
          <div className="text-xs text-gray-400">
            <div>Lensing Width: {(1.42953 * parameters.M).toFixed(3)}</div>
            <div>Throat Area: {(4 * Math.PI * parameters.rho * parameters.rho).toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Camera Controls */}
      <div className="absolute bottom-4 left-4 bg-black/95 backdrop-blur-sm rounded-lg p-4 text-white max-w-xs">
        <h3 className="text-lg font-semibold mb-3">Observer Position</h3>
        
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
              className="w-full accent-purple-500"
            />
          </div>
          
          <div>
            <label className="block text-sm mb-2">Polar: {(cameraPosition.theta * 180 / Math.PI).toFixed(1)}°</label>
            <input
              type="range"
              min="0"
              max={Math.PI}
              step="0.01"
              value={cameraPosition.theta}
              onChange={(e) => setCameraPosition(prev => ({ ...prev, theta: parseFloat(e.target.value) }))}
              className="w-full accent-purple-500"
            />
          </div>
          
          <div>
            <label className="block text-sm mb-2">Azimuth: {(cameraPosition.phi * 180 / Math.PI).toFixed(1)}°</label>
            <input
              type="range"
              min="0"
              max={Math.PI * 2}
              step="0.01"
              value={cameraPosition.phi}
              onChange={(e) => setCameraPosition(prev => ({ ...prev, phi: parseFloat(e.target.value) }))}
              className="w-full accent-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Physics Status */}
      <div className="absolute top-4 right-4 bg-black/95 backdrop-blur-sm rounded-lg p-4 text-white">
        <h3 className="text-lg font-semibold mb-2">Physics Engine</h3>
        <div className="text-sm space-y-1">
          <div className="text-green-400">✓ Geodesic Integration</div>
          <div className="text-green-400">✓ Equation (A.7) Active</div>
          <div className="text-green-400">✓ Dual Celestial Spheres</div>
          <div className="text-green-400">✓ Einstein Ring</div>
          <div className="text-purple-400">ℹ Max Steps: 200</div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedWormholeViewer;