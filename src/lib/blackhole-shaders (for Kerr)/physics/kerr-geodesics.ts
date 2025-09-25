/* eslint-disable @typescript-eslint/no-unused-vars */
// lib/physics/kerr-geodesics.ts

import { 
  Vec4, Mat4, kerrMetric, inverseMetric, 
  metricDot, innerProduct, rFromCoords 
} from './kerr-metric';
/**
 * Hamiltonian for geodesic motion: H = (1/2) g^μν p_μ p_ν
 * For null geodesics (photons), H = 0
 */
export function hamiltonian(pos: Vec4, momentum: Vec4, a: number, M: number = 1): number {
  const g = kerrMetric(pos, a, M);
  const g_inv = inverseMetric(g);
  return 0.5 * innerProduct(g_inv, momentum, momentum);
}

/**
 * Numerical gradient of Hamiltonian: ∂H/∂x^μ
 * Uses finite differences with step size eps
 */
export function hamiltonianGradient(
  pos: Vec4, 
  momentum: Vec4, 
  a: number, 
  eps: number = 0.01,
  M: number = 1
): Vec4 {
  const H0 = hamiltonian(pos, momentum, a, M);
  
  const dH_dt = (hamiltonian({ ...pos, t: pos.t + eps }, momentum, a, M) - H0) / eps;
  const dH_dx = (hamiltonian({ ...pos, x: pos.x + eps }, momentum, a, M) - H0) / eps;
  const dH_dy = (hamiltonian({ ...pos, y: pos.y + eps }, momentum, a, M) - H0) / eps;
  const dH_dz = (hamiltonian({ ...pos, z: pos.z + eps }, momentum, a, M) - H0) / eps;
  
  return { t: dH_dt, x: dH_dx, y: dH_dy, z: dH_dz };
}

/**
 * Hamilton's equations of motion:
 * dx^μ/dτ = ∂H/∂p_μ = g^μν p_ν
 * dp_μ/dτ = -∂H/∂x^μ
 */
export function hamiltonStep(
  pos: Vec4,
  momentum: Vec4,
  a: number,
  dtau: number,
  eps: number = 0.01,
  M: number = 1
): { newPos: Vec4; newMomentum: Vec4 } {
  // Update momentum: p_μ → p_μ - dtau * ∂H/∂x^μ
  const grad = hamiltonianGradient(pos, momentum, a, eps, M);
  const newMomentum: Vec4 = {
    t: momentum.t - dtau * grad.t,
    x: momentum.x - dtau * grad.x,
    y: momentum.y - dtau * grad.y,
    z: momentum.z - dtau * grad.z
  };
  
  // Update position: x^μ → x^μ + dtau * g^μν p_ν
  const g = kerrMetric(pos, a, M);
  const g_inv = inverseMetric(g);
  const velocity = metricDot(g_inv, newMomentum);
  
  const newPos: Vec4 = {
    t: pos.t + dtau * velocity.t,
    x: pos.x + dtau * velocity.x,
    y: pos.y + dtau * velocity.y,
    z: pos.z + dtau * velocity.z
  };
  
  return { newPos, newMomentum };
}

/**
 * Integrate geodesic from camera to destination
 * Returns array of positions along the path
 */
export interface GeodesicResult {
  positions: Vec4[];
  captured: boolean; // true if fell into horizon
  escaped: boolean;  // true if reached far distance
  finalPos: Vec4;
  finalMomentum: Vec4;
}

export function integrateGeodesic(
  initialPos: Vec4,
  initialMomentum: Vec4,
  a: number,
  options: {
    maxSteps?: number;
    dtau?: number;
    eps?: number;
    maxDistance?: number;
    M?: number;
    saveTrajectory?: boolean;
  } = {}
): GeodesicResult {
  const {
    maxSteps = 500,
    dtau = 0.1,
    eps = 0.01,
    maxDistance = 100,
    M = 1,
    saveTrajectory = false
  } = options;
  
  let pos = { ...initialPos };
  let momentum = { ...initialMomentum };
  const positions: Vec4[] = saveTrajectory ? [{ ...pos }] : [];
  
  const r_horizon = M + Math.sqrt(Math.max(0, M*M - a*a));
  
  for (let step = 0; step < maxSteps; step++) {
    // Integration step
    const result = hamiltonStep(pos, momentum, a, dtau, eps, M);
    pos = result.newPos;
    momentum = result.newMomentum;
    
    if (saveTrajectory) {
      positions.push({ ...pos });
    }
    
    // Check stopping conditions
    const r = rFromCoords(pos, a);
    
    // Captured by black hole
    if (r < r_horizon * 1.01) { // Small margin for numerical stability
      return {
        positions,
        captured: true,
        escaped: false,
        finalPos: pos,
        finalMomentum: momentum
      };
    }
    
    // Escaped to infinity
    if (r > maxDistance) {
      return {
        positions,
        captured: false,
        escaped: true,
        finalPos: pos,
        finalMomentum: momentum
      };
    }
  }
  
  // Max steps reached
  return {
    positions,
    captured: false,
    escaped: false,
    finalPos: pos,
    finalMomentum: momentum
  };
}

/**
 * Calculate initial photon momentum from camera direction
 * Camera is at rest in Kerr-Schild coordinates
 */
export function initialPhotonMomentum(
  cameraPos: Vec4,
  direction: { x: number; y: number; z: number }, // Unit vector in camera frame
  a: number,
  M: number = 1
): Vec4 {
  // In Kerr-Schild coords, locally Minkowski at far distances
  // Normalize direction
  const dirMag = Math.sqrt(direction.x**2 + direction.y**2 + direction.z**2);
  const dir = {
    x: direction.x / dirMag,
    y: direction.y / dirMag,
    z: direction.z / dirMag
  };
  
  // For photon: p_t = -E (energy, negative for ingoing)
  // p_i = E * direction_i
  const E = 1.0; // Arbitrary energy scale
  
  const g = kerrMetric(cameraPos, a, M);
  const p_contravariant: Vec4 = {
    t: -E,
    x: E * dir.x,
    y: E * dir.y,
    z: E * dir.z
  };
  
  // Lower index: p_μ = g_μν p^ν
  return metricDot(g, p_contravariant);
}

/**
 * Adaptive step size control (simple version)
 * Adjusts dtau based on curvature (proximity to black hole)
 */
export function adaptiveStepSize(pos: Vec4, a: number, baseStep: number = 0.1): number {
  const r = rFromCoords(pos, a);
  const r_horizon = 1 + Math.sqrt(Math.max(0, 1 - a*a));
  
  // Smaller steps near horizon, larger far away
  const factor = Math.max(0.1, Math.min(1.0, (r - r_horizon) / 5.0));
  return baseStep * factor;
}
