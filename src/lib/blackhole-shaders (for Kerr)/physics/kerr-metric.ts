// lib/physics/kerr-metric.ts

/**
 * Kerr Black Hole Metric in Kerr-Schild Coordinates
 * Based on the Interstellar paper and reference implementation
 * 
 * Kerr-Schild form: g_μν = η_μν + f * k_μ * k_ν
 * where η is Minkowski metric and k is a null vector
 */

export interface Vec4 {
  t: number;
  x: number;
  y: number;
  z: number;
}

export interface Mat4 {
  data: number[][]; // 4x4 matrix
}

/**
 * Calculate r coordinate from Kerr-Schild spatial coordinates
 * Solves: x² + y² + z² = r² + a²(1 - z²/r²)
 */
export function rFromCoords(pos: Vec4, a: number): number {
  const { x, y, z } = pos;
  const rho2 = x*x + y*y + z*z - a*a;
  const r2 = 0.5 * (rho2 + Math.sqrt(rho2*rho2 + 4*a*a*z*z));
  return Math.sqrt(Math.max(0, r2)); // Ensure non-negative
}

/**
 * Kerr-Schild null vector k^μ = (-1, k_spatial)
 * Points toward the black hole
 */
export function nullVector(pos: Vec4, a: number): Vec4 {
  const r = rFromCoords(pos, a);
  const { x, y, z } = pos;
  const r2_a2 = r*r + a*a;
  
  // Avoid division by zero at singularity
  if (r2_a2 < 1e-10) {
    return { t: -1, x: 0, y: 0, z: 0 };
  }
  
  return {
    t: -1,
    x: (r*x - a*z) / r2_a2,
    y: (r*y + a*x) / r2_a2,
    z: z / r
  };
}

/**
 * Kerr-Schild metric: g_μν = η_μν + f * k_μ * k_ν
 * f = 2Mr³/(r⁴ + a²z²)
 */
export function kerrMetric(pos: Vec4, a: number, M: number = 1): Mat4 {
  const r = rFromCoords(pos, a);
  const k = nullVector(pos, a);
  
  // f factor
  const r2 = r * r;
  const z2 = pos.z * pos.z;
  const denom = r2*r2 + a*a*z2;
  const f = denom > 1e-10 ? (2 * M * r2 * r) / denom : 0;
  
  // Minkowski metric η_μν with signature (-,+,+,+)
  const eta: number[][] = [
    [-1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ];
  
  // g_μν = η_μν + f * k_μ * k_ν
  const g: number[][] = Array(4).fill(0).map((_, i) => 
    Array(4).fill(0).map((_, j) => {
      const k_i = i === 0 ? k.t : (i === 1 ? k.x : (i === 2 ? k.y : k.z));
      const k_j = j === 0 ? k.t : (j === 1 ? k.x : (j === 2 ? k.y : k.z));
      return eta[i][j] + f * k_i * k_j;
    })
  );
  
  return { data: g };
}

/**
 * Matrix inverse using Gaussian elimination
 * Needed for converting covariant to contravariant vectors
 */
export function inverseMetric(g: Mat4): Mat4 {
  const n = 4;
  const A = g.data.map(row => [...row]); // Copy
  const I: number[][] = Array(n).fill(0).map((_, i) => 
    Array(n).fill(0).map((_, j) => i === j ? 1 : 0)
  );
  
  // Gaussian elimination with partial pivoting
  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) {
        maxRow = k;
      }
    }
    
    // Swap rows
    [A[i], A[maxRow]] = [A[maxRow], A[i]];
    [I[i], I[maxRow]] = [I[maxRow], I[i]];
    
    // Scale pivot row
    const pivot = A[i][i];
    if (Math.abs(pivot) < 1e-10) continue; // Singular matrix
    
    for (let j = 0; j < n; j++) {
      A[i][j] /= pivot;
      I[i][j] /= pivot;
    }
    
    // Eliminate column
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = A[k][i];
        for (let j = 0; j < n; j++) {
          A[k][j] -= factor * A[i][j];
          I[k][j] -= factor * I[i][j];
        }
      }
    }
  }
  
  return { data: I };
}

/**
 * Matrix-vector multiplication: g_μν * p^ν
 */
export function metricDot(g: Mat4, p: Vec4): Vec4 {
  const pArray = [p.t, p.x, p.y, p.z];
  const result = g.data.map(row => 
    row.reduce((sum, val, i) => sum + val * pArray[i], 0)
  );
  return { t: result[0], x: result[1], y: result[2], z: result[3] };
}

/**
 * Inner product using metric: g_μν * p^μ * q^ν
 */
export function innerProduct(g: Mat4, p: Vec4, q: Vec4): number {
  const gp = metricDot(g, p);
  return gp.t * q.t + gp.x * q.x + gp.y * q.y + gp.z * q.z;
}

/**
 * Event horizon radius for Kerr black hole
 * r_+ = M + sqrt(M² - a²)
 */
export function horizonRadius(a: number, M: number = 1): number {
  return M + Math.sqrt(Math.max(0, M*M - a*a));
}

/**
 * Innermost stable circular orbit (ISCO) radius
 * Approximate formula for prograde orbits
 */
export function iscoRadius(a: number, M: number = 1): number {
  const Z1 = 1 + Math.pow(1 - a*a, 1/3) * (Math.pow(1 + a, 1/3) + Math.pow(1 - a, 1/3));
  const Z2 = Math.sqrt(3*a*a + Z1*Z1);
  return M * (3 + Z2 - Math.sqrt((3 - Z1)*(3 + Z1 + 2*Z2)));
}

/**
 * Check if position is inside horizon
 */
export function isInsideHorizon(pos: Vec4, a: number, M: number = 1): boolean {
  const r = rFromCoords(pos, a);
  const r_horizon = horizonRadius(a, M);
  return r < r_horizon;
}