/* eslint-disable react-hooks/exhaustive-deps */
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

const WormholeViewer: React.FC<WormholeViewerProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const animationIdRef = useRef<number>();
  
  const [parameters, setParameters] = useState<WormholeParameters>({
    rho: 1.0,    // Default wormhole radius
    a: 0.005,    // Very short wormhole (as used in Interstellar)
    M: 0.05      // Modest lensing
  });

  const [cameraPosition, setCameraPosition] = useState({ 
    distance: 6.25, 
    theta: Math.PI / 2, 
    phi: 0 
  });

  // Create lensing particle effect
  const createLensingEffect = useCallback((group: THREE.Group, params: WormholeParameters) => {
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = params.rho + Math.random() * params.M * 10;
      const z = (Math.random() - 0.5) * params.a * 4;
      
      posArray[i * 3] = Math.cos(angle) * radius;
      posArray[i * 3 + 1] = Math.sin(angle) * radius;
      posArray[i * 3 + 2] = z;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.01,
      color: 0xffffff,
      transparent: true,
      opacity: 0.6
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    group.add(particlesMesh);
  }, []);

  // Create wormhole geometry
  const createWormholeGeometry = useCallback((scene: THREE.Scene, params: WormholeParameters) => {
    const group = new THREE.Group();
    group.name = 'wormhole';

    // Create wormhole throat (cylinder)
    const throatGeometry = new THREE.CylinderGeometry(params.rho, params.rho, 2 * params.a, 32);
    const throatMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x444444, 
      transparent: true, 
      opacity: 0.3,
      wireframe: true 
    });
    const throat = new THREE.Mesh(throatGeometry, throatMaterial);
    throat.rotation.x = Math.PI / 2;
    group.add(throat);

    // Create wormhole mouths (rings)
    const createMouth = (z: number) => {
      const mouthGeometry = new THREE.RingGeometry(params.rho * 0.95, params.rho * 1.05, 64);
      const mouthMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00aaff, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
      });
      const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
      mouth.position.z = z;
      return mouth;
    };

    group.add(createMouth(params.a));
    group.add(createMouth(-params.a));

    // Add lensing effect
    createLensingEffect(group, params);

    scene.add(group);
  }, [createLensingEffect]);

  // Update camera position
  const updateCameraPosition = useCallback(() => {
    if (!cameraRef.current) return;

    const { distance, theta, phi } = cameraPosition;
    const x = distance * Math.sin(theta) * Math.cos(phi);
    const y = distance * Math.sin(theta) * Math.sin(phi);
    const z = distance * Math.cos(theta);

    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(0, 0, 0);
  }, [cameraPosition]);

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

    // Create initial wormhole
    createWormholeGeometry(scene, parameters);
    updateCameraPosition();

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      const wormhole = scene.getObjectByName('wormhole');
      if (wormhole) {
        wormhole.rotation.z += 0.001;
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

    // Cleanup
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
  }, [createWormholeGeometry, parameters, updateCameraPosition]);

  // Update wormhole when parameters change
  useEffect(() => {
    if (!sceneRef.current) return;
    
    const existingWormhole = sceneRef.current.getObjectByName('wormhole');
    if (existingWormhole) {
      sceneRef.current.remove(existingWormhole);
    }
    
    createWormholeGeometry(sceneRef.current, parameters);
  }, [createWormholeGeometry, parameters]);

  // Update camera when position changes
  useEffect(() => {
    updateCameraPosition();
  }, [updateCameraPosition]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* 3D Viewport */}
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Parameter Controls */}
      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white max-w-xs">
        <h3 className="text-lg font-semibold mb-3">Wormhole Parameters</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Radius (ρ): {parameters.rho.toFixed(3)}</label>
            <input
              type="range"
              min="0.1"
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
      <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white max-w-xs">
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
      <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white">
        <h3 className="text-lg font-semibold mb-2">Physics Data</h3>
        <div className="text-sm space-y-1">
          <div>Lensing Width: {(1.42953 * parameters.M).toFixed(3)}</div>
          <div>Length/Diameter: {(2 * parameters.a / (2 * parameters.rho)).toFixed(3)}</div>
          <div>Throat Area: {(4 * Math.PI * parameters.rho * parameters.rho).toFixed(2)}</div>
          <div>Camera Distance: {cameraPosition.distance.toFixed(2)}ρ</div>
        </div>
      </div>
    </div>
  );
};

export default WormholeViewer;