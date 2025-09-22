// lib/wormhole-physics.ts
// Pure physics calculations from the research paper

export interface WormholeParameters {
  rho: number;    // Wormhole radius (ρ)
  a: number;      // Half-length of cylindrical interior
  M: number;      // Lensing parameter
}

/**
 * Calculate wormhole radius r(ℓ) from equation (5) in the paper
 */
export function getWormholeRadius(l: number, params: WormholeParameters): number {
  const { rho, a, M } = params;
  const absL = Math.abs(l);
  
  if (absL <= a) {
    // Inside the cylindrical interior
    return rho;
  } else {
    // Outside the wormhole - equation (5b)
    const x = (2 * (absL - a)) / (Math.PI * M);
    return rho + M * (x * Math.atan(x) - 0.5 * Math.log(1 + x * x));
  }
}

/**
 * Calculate dr/dℓ derivative for geodesic integration
 */
export function getRadiusDerivative(l: number, params: WormholeParameters): number {
  const { a, M } = params;
  const absL = Math.abs(l);
  
  if (absL <= a) {
    return 0.0;
  } else {
    const x = (2 * (absL - a)) / (Math.PI * M);
    return Math.sign(l) * (2 / Math.PI) * Math.atan(x);
  }
}

/**
 * Convert 3D direction to spherical coordinates (θ, φ)
 */
export function directionToSpherical(dir: [number, number, number]): [number, number] {
  const [x, y, z] = dir;
  const theta = Math.acos(Math.max(-1, Math.min(1, z)));
  let phi = Math.atan2(y, x);
  if (phi < 0) phi += 2 * Math.PI;
  return [theta, phi];
}

/**
 * Convert spherical coordinates to equirectangular UV
 */
export function sphericalToEquirectangular(theta: number, phi: number): [number, number] {
  const u = phi / (2 * Math.PI);
  const v = theta / Math.PI;
  return [u, v];
}

/**
 * Geodesic ray state for integration
 */
export interface RayState {
  l: number;      // Position along wormhole axis
  theta: number;  // Polar angle
  phi: number;    // Azimuthal angle
  p_l: number;    // Canonical momentum conjugate to l
  p_theta: number; // Canonical momentum conjugate to theta
  p_phi: number;  // Canonical momentum conjugate to phi (conserved)
}

/**
 * Initialize ray state from camera position and direction
 */
export function initializeRay(
  cameraPos: [number, number, number],
  rayDir: [number, number, number]
): RayState {
  const [x, y, z] = cameraPos;
  const [dx, dy, dz] = rayDir;
  
  // Convert to spherical coordinates
  const l = z;
  const r_cam = Math.sqrt(x * x + y * y);
  const theta = Math.atan2(r_cam, z) + Math.PI / 2;
  const phi = Math.atan2(y, x);
  
  // Calculate canonical momenta (simplified)
  const p_l = dz;
  const p_theta = r_cam * r_cam * dy; // Approximate
  const p_phi = r_cam * r_cam * Math.sin(theta) * dx; // Approximate
  
  return { l, theta, phi, p_l, p_theta, p_phi };
}

/**
 * Integration step for geodesic equations (A.7) from the paper
 */
export function integrateGeodesicStep(
  state: RayState, 
  params: WormholeParameters, 
  dt: number
): RayState {
  const { l, theta, phi, p_l, p_theta, p_phi } = state;
  
  // Current radius and its derivative
  const r = getWormholeRadius(l, params);
  const dr_dl = getRadiusDerivative(l, params);
  
  // Constants of motion
  const b = p_phi; // Conserved angular momentum
  const B_squared = p_theta * p_theta + (p_phi * p_phi) / (Math.sin(theta) * Math.sin(theta));
  
  // Geodesic equations from paper (A.7)
  const dl_dt = p_l;
  const dtheta_dt = p_theta / (r * r);
  const dphi_dt = b / (r * r * Math.sin(theta) * Math.sin(theta));
  const dp_l_dt = B_squared * dr_dl / (r * r * r);
  const dp_theta_dt = (b * b * Math.cos(theta)) / (r * r * Math.sin(theta) * Math.sin(theta) * Math.sin(theta));
  
  // Update state
  return {
    l: l + dl_dt * dt,
    theta: theta + dtheta_dt * dt,
    phi: phi + dphi_dt * dt,
    p_l: p_l + dp_l_dt * dt,
    p_theta: p_theta + dp_theta_dt * dt,
    p_phi: p_phi // Conserved
  };
}

/**
 * Integrate ray backward to celestial sphere
 * Returns [celestialSide, theta, phi] where side is 'upper' or 'lower'
 */
export function traceRayToCelestialSphere(
  cameraPos: [number, number, number],
  rayDir: [number, number, number],
  params: WormholeParameters,
  maxSteps: number = 1000,
  stepSize: number = 0.01
): [string, number, number] | null {
  
  let state = initializeRay(cameraPos, rayDir);
  
  for (let step = 0; step < maxSteps; step++) {
    state = integrateGeodesicStep(state, params, -stepSize); // Backward integration
    
    // Check if we've reached a celestial sphere
    if (Math.abs(state.l) > 50) {
      const side = state.l > 0 ? 'upper' : 'lower';
      return [side, state.theta, state.phi];
    }
    
    // Safety checks
    const r = getWormholeRadius(state.l, params);
    if (r < params.rho * 0.1 || r > 100) {
      break;
    }
  }
  
  return null; // Ray didn't reach celestial sphere
}