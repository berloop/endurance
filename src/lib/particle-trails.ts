/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

// NOTE: Attempted to add particle trails in geometry mode around the wormhole.
// This caused severe performance issues and site instability, so the shader was disabled by me.

import * as THREE from 'three';

export class ParticleTrailSystem {
  private particles: THREE.Points[] = [];
  private trails: THREE.Line[] = [];
  private particleData: Array<{
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    trail: THREE.Vector3[];
    age: number;
  }> = [];
  private scene: THREE.Scene;
  private wormholeParams: { rho: number; a: number; M: number };

  constructor(scene: THREE.Scene, wormholeParams: { rho: number; a: number; M: number }) {
    this.scene = scene;
    this.wormholeParams = wormholeParams;
    this.initializeParticles();
  }

  private initializeParticles() {
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
      // Initialize particles around the wormhole throat
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = this.wormholeParams.rho + Math.random() * 2;
      const height = (Math.random() - 0.5) * this.wormholeParams.a * 4;
      
      const particle = {
        position: new THREE.Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          height
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
        trail: [] as THREE.Vector3[],
        age: 0
      };
      
      this.particleData.push(particle);
    }
  }

  private calculateWormholeForce(position: THREE.Vector3): THREE.Vector3 {
    const { rho, a, M } = this.wormholeParams;
    const r = Math.sqrt(position.x * position.x + position.y * position.y);
    const l = position.z;
    
    // Simple gravitational attraction toward throat
    const force = new THREE.Vector3();
    
    // Radial force toward throat radius
    const radialForce = (rho - r) * 0.001;
    force.x = (position.x / r) * radialForce;
    force.y = (position.y / r) * radialForce;
    
    // Axial force toward throat center
    force.z = -l * 0.0005;
    
    // Add some orbital motion
    const orbitalForce = 0.0002;
    force.x += -position.y * orbitalForce;
    force.y += position.x * orbitalForce;
    
    return force;
  }

  public update(deltaTime: number) {
    this.particleData.forEach((particle, index) => {
      // Apply wormhole forces
      const force = this.calculateWormholeForce(particle.position);
      particle.velocity.add(force);
      
      // Apply damping
      particle.velocity.multiplyScalar(0.98);
      
      // Update position
      particle.position.add(particle.velocity.clone().multiplyScalar(deltaTime));
      
      // Add to trail
      particle.trail.push(particle.position.clone());
      
      // Limit trail length
      if (particle.trail.length > 30) {
        particle.trail.shift();
      }
      
      // Reset particle if it gets too far
      const distance = particle.position.length();
      if (distance > 20 || particle.age > 1000) {
        this.resetParticle(particle);
      }
      
      particle.age++;
      
      // Update trail visualization
      this.updateTrailVisualization(particle, index);
    });
  }

  private resetParticle(particle: any) {
    const angle = Math.random() * Math.PI * 2;
    const radius = this.wormholeParams.rho + Math.random() * 2;
    const height = (Math.random() - 0.5) * this.wormholeParams.a * 4;
    
    particle.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      height
    );
    particle.velocity.set(
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02
    );
    particle.trail = [];
    particle.age = 0;
  }

  private updateTrailVisualization(particle: any, index: number) {
    // Remove old trail
    if (this.trails[index]) {
      this.scene.remove(this.trails[index]);
    }
    
    // Create new trail if we have enough points
    if (particle.trail.length > 2) {
      const trailGeometry = new THREE.BufferGeometry().setFromPoints(particle.trail);
      const trailMaterial = new THREE.LineBasicMaterial({
        color: 0x10b981, 
        transparent: true,
        opacity: 0.6,
        linewidth: 2
      });
      
      const trail = new THREE.Line(trailGeometry, trailMaterial);
      this.trails[index] = trail;
      this.scene.add(trail);
    }
  }

  public updateWormholeParams(params: { rho: number; a: number; M: number }) {
    this.wormholeParams = params;
  }

  public dispose() {
    // Clean up trails
    this.trails.forEach(trail => {
      if (trail) {
        this.scene.remove(trail);
      }
    });
    this.trails = [];
    this.particleData = [];
  }
}