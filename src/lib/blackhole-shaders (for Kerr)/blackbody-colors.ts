/* eslint-disable @typescript-eslint/no-unused-vars */
// lib/utils/blackbody-color.ts

/**
 * Convert blackbody temperature to RGB color
 * Based on Planck's law and CIE color matching functions
 * Temperature in Kelvin
 */

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

/**
 * Blackbody color using approximation by Tanner Helland
 * Valid for T = 1000K to 40000K
 */
export function temperatureToRGB(kelvin: number): RGBColor {
  // Clamp to valid range
  const temp = Math.max(1000, Math.min(40000, kelvin)) / 100;
  
  let r: number, g: number, b: number;
  
  // Red calculation
  if (temp <= 66) {
    r = 255;
  } else {
    r = temp - 60;
    r = 329.698727446 * Math.pow(r, -0.1332047592);
    r = Math.max(0, Math.min(255, r));
  }
  
  // Green calculation
  if (temp <= 66) {
    g = temp;
    g = 99.4708025861 * Math.log(g) - 161.1195681661;
  } else {
    g = temp - 60;
    g = 288.1221695283 * Math.pow(g, -0.0755148492);
  }
  g = Math.max(0, Math.min(255, g));
  
  // Blue calculation
  if (temp >= 66) {
    b = 255;
  } else if (temp <= 19) {
    b = 0;
  } else {
    b = temp - 10;
    b = 138.5177312231 * Math.log(b) - 305.0447927307;
    b = Math.max(0, Math.min(255, b));
  }
  
  return {
    r: r / 255,
    g: g / 255,
    b: b / 255
  };
}

/**
 * Accretion disk temperature profile
 * Based on Shakura-Sunyaev model
 * T(r) ∝ (Ṁ / r³)^(1/4)
 */
export function diskTemperature(
  radius: number,
  accretionRate: number = 1.0,
  blackHoleMass: number = 1.0
): number {
  const r_g = blackHoleMass; // Gravitational radius
  const r_norm = radius / r_g;
  
  // Temperature normalization (typical AGN: ~10^7 K at ISCO)
  const T0 = 1e7;
  const r_isco = 6.0; // Approximate for Schwarzschild
  
  // T ∝ r^(-3/4)
  const temp = T0 * Math.pow(accretionRate, 0.25) * Math.pow(r_isco / r_norm, 0.75);
  
  return Math.max(1000, Math.min(40000, temp)); // Clamp to visible range
}

/**
 * Doppler shift factor for disc at radius r
 * blueshift = ν_observed / ν_emitted
 */
export function dopplerShift(
  radius: number,
  phi: number, // Azimuthal angle
  blackHoleSpin: number,
  observerInclination: number = Math.PI / 2 // Edge-on by default
): number {
  // Keplerian velocity for Kerr metric (approximate)
  const a = blackHoleSpin;
  const omega = 1 / (Math.pow(radius, 1.5) + a);
  const v = omega * radius; // Tangential velocity
  
  // Doppler factor: 1/(1 - v·n/c)
  // v·n = v * sin(i) * cos(phi) for circular orbit
  const cosAngle = Math.sin(observerInclination) * Math.cos(phi);
  const doppler = 1.0 / (1.0 - v * cosAngle);
  
  return doppler;
}

/**
 * Gravitational redshift factor
 * z = (1 - 2M/r)^(-1/2) - 1 for Schwarzschild
 * More complex for Kerr
 */
export function gravitationalRedshift(
  radius: number,
  blackHoleSpin: number = 0,
  blackHoleMass: number = 1
): number {
  const a = blackHoleSpin * blackHoleMass;
  const r = radius;
  
  // Approximate formula for Kerr
  const sigma = r*r + a*a * (1 - 2*blackHoleMass/r);
  const delta = r*r - 2*blackHoleMass*r + a*a;
  
  const g_tt = -(1 - 2*blackHoleMass*r / sigma);
  const redshift = 1 / Math.sqrt(-g_tt);
  
  return redshift;
}

/**
 * Combined frequency shift (Doppler + gravitational)
 */
export function totalFrequencyShift(
  radius: number,
  phi: number,
  blackHoleSpin: number,
  observerInclination: number = Math.PI / 2
): number {
  const doppler = dopplerShift(radius, phi, blackHoleSpin, observerInclination);
  const grav = gravitationalRedshift(radius, blackHoleSpin);
  
  return doppler * grav;
}

/**
 * Get disc color at given position including all effects
 */
export function getDiscColor(
  radius: number,
  phi: number,
  blackHoleSpin: number,
  accretionRate: number = 1.0,
  includeDoppler: boolean = true
): RGBColor {
  // Base temperature
  const T_emit = diskTemperature(radius, accretionRate);
  
  // Frequency shift
  let T_obs = T_emit;
  if (includeDoppler) {
    const shift = totalFrequencyShift(radius, phi, blackHoleSpin);
    T_obs = T_emit * shift; // Temperature scales with frequency
  }
  
  return temperatureToRGB(T_obs);
}