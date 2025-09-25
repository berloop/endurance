// lib/shaders/accretion-disk.ts

export const accretionDiskFunctions = `
  // Temperature to RGB conversion (in GLSL)
  vec3 temperatureToRGB(float kelvin) {
    float temp = clamp(kelvin, 1000.0, 40000.0) / 100.0;
    vec3 color;
    
    // Red
    if (temp <= 66.0) {
      color.r = 1.0;
    } else {
      float r = temp - 60.0;
      color.r = clamp(329.698727446 * pow(r, -0.1332047592) / 255.0, 0.0, 1.0);
    }
    
    // Green
    if (temp <= 66.0) {
      color.g = clamp((99.4708025861 * log(temp) - 161.1195681661) / 255.0, 0.0, 1.0);
    } else {
      float g = temp - 60.0;
      color.g = clamp(288.1221695283 * pow(g, -0.0755148492) / 255.0, 0.0, 1.0);
    }
    
    // Blue
    if (temp >= 66.0) {
      color.b = 1.0;
    } else if (temp <= 19.0) {
      color.b = 0.0;
    } else {
      float b = temp - 10.0;
      color.b = clamp((138.5177312231 * log(b) - 305.0447927307) / 255.0, 0.0, 1.0);
    }
    
    return color;
  }
  
  // Disc temperature profile
  float diskTemperature(float radius, float accretionRate) {
    float T0 = 10000.0; // Base temperature
    float r_isco = 6.0;
    float temp = T0 * pow(accretionRate, 0.25) * pow(r_isco / radius, 0.75);
    return clamp(temp, 1000.0, 40000.0);
  }
  
  // Doppler shift from orbital motion
  float dopplerShift(float radius, float phi, float spin) {
    float a = spin;
    float omega = 1.0 / (pow(radius, 1.5) + a);
    float v = omega * radius;
    
    // Assume edge-on viewing (sin(i) = 1)
    float cosAngle = cos(phi);
    return 1.0 / (1.0 - v * cosAngle);
  }
  
  // Gravitational redshift
  float gravitationalRedshift(float radius, float spin) {
    float a = spin;
    float r = radius;
    float sigma = r*r + a*a * (1.0 - 2.0/r);
    float g_tt = -(1.0 - 2.0*r / sigma);
    return 1.0 / sqrt(-g_tt);
  }
  
  // Combined disc color with all effects
  vec3 getDiscColor(float radius, float phi, float spin, bool showDoppler) {
    float T_emit = diskTemperature(radius, 1.0);
    float T_obs = T_emit;
    
    if (showDoppler) {
      float doppler = dopplerShift(radius, phi, spin);
      float grav = gravitationalRedshift(radius, spin);
      T_obs = T_emit * doppler * grav;
    }
    
    return temperatureToRGB(T_obs);
  }
`;