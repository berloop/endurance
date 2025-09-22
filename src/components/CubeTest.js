"use client";

import { useEffect, useRef } from 'react';

const CubeTest = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Import Three.js dynamically to avoid any server-side rendering issues
    import('three').then(THREE => {
      if (!canvasRef.current) return;
      
      // Create scene
      const scene = new THREE.Scene();
      
      // Create camera
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 5;
      
      // Create renderer
      const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0xff0000); // Red background to make it obvious
      
      // Create a cube
      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);
      
      // Animation loop
      function animate() {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
      }
      
      animate();
      
      // Handle resize
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      
      window.addEventListener('resize', handleResize);
      
      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
      };
    });
  }, []);

  return (
    <div style={{ position: 'fixed', width: '100%', height: '100%', top: 0, left: 0 }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      <div style={{ 
        position: 'absolute', 
        bottom: 20, 
        width: '100%', 
        textAlign: 'center',
        color: 'white'
      }}>
        <span>Relax and Keep Touching/Clicking🤖</span>
        <h1 style={{ fontSize: '15px', fontWeight: 100 }}>
          Made with 🧡 by <a style={{ color: 'rgb(255, 138, 49)', textDecoration: 'none' }} href="https://linktr.ee/egrettas" target="_blank" rel="noopener noreferrer">Egret.</a>
        </h1>
      </div>
    </div>
  );
};

export default CubeTest;