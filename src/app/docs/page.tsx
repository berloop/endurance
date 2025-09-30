/* eslint-disable @typescript-eslint/no-unused-vars */
// app/docs/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, BookOpen, Atom, Code, Lightbulb, ArrowLeft, TelescopeIcon } from 'lucide-react';



const DocsPage = () => {
  const [activeSection, setActiveSection] = useState('about');

  useEffect(() => {
  // Set overflow
  document.body.style.overflow = 'auto';
  document.documentElement.style.overflow = 'auto';
  
  // Style the scrollbar with inline styles (these override everything)
  const style = document.createElement('style');
  style.textContent = `
    html::-webkit-scrollbar {
      width: 8px !important;
    }
    html::-webkit-scrollbar-track {
      background: black !important;
    }
    html::-webkit-scrollbar-thumb {
      background: #171717 !important;
      border-radius: 4px !important;
    }
    html::-webkit-scrollbar-thumb:hover {
      background: #262626 !important;
    }
    html {
      scrollbar-width: thin !important;
      scrollbar-color: #171717 black !important;
    }
  `;
  document.head.appendChild(style);
  
  return () => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.head.removeChild(style);
  };
}, []);

  const sections = [
    { id: 'about', label: 'About', icon: BookOpen },
    { id: 'guide', label: 'User Guide', icon: TelescopeIcon },
    { id: 'shaders', label: 'Shader Explanation', icon: Code },
    { id: 'theory', label: 'Theory & Science', icon: Atom },
  ];
  return (

    
  <div className="h-screen bg-black text-white overflow-hidden flex flex-col">
    <div className="max-w-7xl mx-auto px-4 w-full pt-8 pb-4">
      <button 
        onClick={() => window.history.back()}
        className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>
    </div>

    <div className="flex-1 max-w-7xl mx-auto px-4 w-full overflow-hidden">
      <div className="flex flex-col md:flex-row gap-8 h-full">
        {/* Sidebar - hidden on mobile, visible on md+ */}
        <aside className="hidden md:block md:w-64 shrink-0">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold mb-6">Documentation</h2>
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-none transition-all ${
                    activeSection === section.id
                      ? 'bg-white/10 text-white'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{section.label}</span>
                  {activeSection === section.id && (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Mobile tabs - visible only on mobile */}
        <div className="md:hidden flex gap-2 overflow-x-auto pb-4">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded-none whitespace-nowrap transition-all ${
                activeSection === section.id
                  ? 'bg-white/10 text-white'
                  : 'text-neutral-400 bg-neutral-950'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeSection === 'about' && <AboutSection />}
              {activeSection === 'guide' && <UserGuideSection />}
              {activeSection === 'shaders' && <ShaderSection />}
              {activeSection === 'theory' && <TheorySection />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  </div>
  );
};

const AboutSection = () => (
  <div className="prose prose-invert max-w-none">
    <h1 className="text-4xl font-bold mb-6">About Project L.A.Z.A.R.U.S</h1>
    
    <p className="text-lg text-neutral-300 mb-8">
      Project L.A.Z.A.R.U.S is a real-time relativistic visualization engine that simulates gravitational phenomena
      using physically-based rendering techniques. The project demonstrates advanced shader programming,
      general relativity concepts, and interactive 3D graphics.
    </p>

  <h2 className="text-2xl font-semibold mt-8 mb-4">Features</h2>
<ul className="space-y-2 text-neutral-300">
  <li>✓ Real-time geodesic ray tracing around a Schwarzschild black hole</li>
  <li>✓ Visualization of Morris–Thorne wormholes</li>
  <li>✓ Physically accurate gravitational lensing</li>
  <li>✓ Temperature-based rendering of accretion disks</li>
  <li>✓ Doppler shift and relativistic beaming effects</li>
  <li>✓ Interactive camera controls and physics toggles</li>
</ul>


    <h2 className="text-2xl font-semibold mt-8 mb-4">Technologies</h2>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <TechCard name="Next.js 15" desc="React framework" />
      <TechCard name="Three.js" desc="3D rendering" />
      <TechCard name="GLSL" desc="Shader programming" />
      <TechCard name="TypeScript" desc="Type safety" />
      <TechCard name="Tailwind CSS" desc="Styling" />
      <TechCard name="Framer Motion" desc="Animations" />
    </div>

    <h2 className="text-2xl font-semibold mt-8 mb-4">Credits</h2>
   <p className="text-neutral-300">
  Developed by <a href="https://linktr.ee/egrettas" className="text-green-500 hover:underline" target="_blank" rel="noopener noreferrer">Egret</a>. Inspired by the visual effects of Interstellar (2014) and research papers
  on gravitational lensing by Kip Thorne and the Double Negative VFX team. All music used in this project is credited to the original artists.
</p>

<p className="text-neutral-300 mt-4">
  All of the music used in this project is credited to the original artists:
</p>
<ul className="list-disc list-inside text-neutral-300">
  
  <li>Day One — Hans Zimmer (Interstellar Theme).</li>
  <li>Dust Bowl — Hans Zimmer x Ken Burns (Introducing The Dust Bowl).</li>
  <li>No Time for Caution — Hans Zimmer.</li>
  <li>Musique Mysterieuse— Alessandro Roussel (Science Clic).</li>
  <li>The Wormhole — Hans Zimmer.</li>
</ul>

  </div>
);

const UserGuideSection = () => (
  <div className="prose prose-invert max-w-none">
    <h1 className="text-4xl font-bold mb-6">User Guide</h1>

    <h2 className="text-2xl font-semibold mt-8 mb-4">Black Hole Controls</h2>
    
    <ControlDoc 
      title="Observer Controls"
      controls={[
        { name: 'Distance', desc: 'Camera distance from black hole (7-14 Schwarzschild radii)' },
        { name: 'Angle', desc: 'Horizontal orbital position around black hole (0-360°)' },
        { name: 'Incline', desc: 'Vertical viewing angle (-90° to 90°)' },
        { name: 'FOV', desc: 'Field of view (30-90°)' },
        { name: 'Auto-Orbit', desc: 'Automatic camera rotation around black hole' },
      ]}
    />

    <ControlDoc 
      title="Bloom Settings"
      controls={[
        { name: 'Strength', desc: 'Intensity of bloom glow effect (0-3)' },
        { name: 'Radius', desc: 'Spread of bloom (0-1)' },
        { name: 'Threshold', desc: 'Brightness threshold for bloom (0-1)' },
        { name: 'Disk Temperature', desc: 'Color temperature of accretion disk (3000-12000K)' },
      ]}
    />

    <ControlDoc 
      title="Performance"
      controls={[
        { name: 'Resolution', desc: 'Render resolution multiplier (0.25x - 4x)' },
        { name: 'Quality', desc: 'Ray tracing step count (low: 300, medium: 600, high: 1000)' },
      ]}
    />

    {/* <h2 className="text-2xl font-semibold mt-8 mb-4">Keyboard Shortcuts</h2>
    <div className="bg-neutral-950 rounded-none p-6">
      <div className="space-y-3">
        <KeyShortcut key="H" action="Toggle UI visibility" />
        <KeyShortcut key="F" action="Toggle fullscreen" />
      </div>
    </div> */}

    <h2 className="text-2xl font-semibold mt-8 mb-4">Wormhole Controls</h2>
    <p className="text-neutral-300 mb-4">
      The wormhole simulation features similar camera controls with additional wormhole-specific parameters
      for throat radius and traversal effects.
    </p>
    <ControlDoc 
  title="Wormhole Parameters"
  controls={[
    { name: 'Radius (ρ)', desc: 'Throat radius of the wormhole (0.3-2.0 Schwarzschild radii)' },
    { name: 'Length (2a)', desc: 'Length of cylindrical interior (0.002-2.0). Near-zero creates sharp transition' },
    { name: 'Lensing (M)', desc: 'Gravitational lensing parameter (0.01-1.0). Higher values increase spacetime curvature' },
  ]}
/>

<ControlDoc 
  title="Camera Controls"
  controls={[
    { name: 'Distance', desc: 'Camera distance from wormhole center (1.5-10.0)' },
    { name: 'Theta', desc: 'Vertical viewing angle (0°-180°)' },
    { name: 'Background Particles', desc: 'Toggle twinkling background stars' },
  ]}
/>

<ControlDoc 
  title="Advanced Parameters"
  controls={[
    { name: 'Rotation Speed', desc: 'Galaxy rotation rate through the wormhole (0-1.0)' },
    { name: 'Rotation Mode', desc: 'Oscillating, Bounded, Linear, or Spiral motion patterns' },
    { name: 'Warping Distance', desc: 'Extent of spacetime distortion effects (0.1-5.0)' },
    { name: 'Einstein Ring Radius', desc: 'Size of gravitational lensing rings (0.01-1.0)' },
    { name: 'Ring Sharpness', desc: 'Edge definition of lensing rings (25-100)' },
    { name: 'Ring Intensity', desc: 'Brightness of Einstein rings (0-1.0)' },
    { name: 'Ring Color', desc: 'RGB color values for lensing effects' },
    { name: 'Vignetting', desc: 'Edge darkening effect (0.03-0.3)' },
    { name: 'Max Steps', desc: 'Ray marching iterations (270-400)' },
    { name: 'Time Control', desc: 'Pause/resume the simulation' },
  ]}
/>
  </div>
);

const ShaderSection = () => (
  <div className="prose prose-invert max-w-none">
    <h1 className="text-4xl font-bold mb-6">Shader Explanation</h1>

    <h2 className="text-2xl font-semibold mt-8 mb-4">Black Hole Ray Tracing</h2>
    <p className="text-neutral-300 mb-4">
      The black hole visualization uses a custom GLSL fragment shader that performs geodesic ray tracing
      in curved spacetime. Each pixel traces a light ray backward from the camera through the gravitational
      field of the black hole.
    </p>

    <CodeBlock 
      title="Core Ray Marching Loop"
      code={`for (int i=0; i<NSTEPS; i++){
  oldpoint = point;
  point += velocity * STEP;
  
  // Schwarzschild metric acceleration
  vec3 accel = -1.5 * h2 * point / pow(dot(point,point), 2.5);
  velocity += accel * STEP;
  
  distance = length(point);
  if (distance < 1.0) break; // Event horizon
  
  // Check disk intersection
  if (oldpoint.y * point.y < 0.0) {
    // Ray crossed y=0 plane
    checkDiskIntersection();
  }
}`}
    />

    <h3 className="text-xl font-semibold mt-6 mb-3">Schwarzschild Metric Implementation</h3>
    <p className="text-neutral-300 mb-4">
      The acceleration term derives from the geodesic equation in general relativity. In natural units
      where G=c=1 and mass M=1, the acceleration simplifies to:
    </p>

    <CodeBlock 
      title="Geodesic Acceleration"
      code={`// Calculate specific angular momentum (conserved quantity)
vec3 c = cross(point, velocity);
float h2 = dot(c, c);

// Acceleration from Schwarzschild metric
// This comes from: d²x/dλ² = -(3/2) * (h²/r⁵) * x
vec3 accel = -1.5 * h2 * point / pow(dot(point,point), 2.5);`}
    />

    <h2 className="text-2xl font-semibold mt-8 mb-4">Accretion Disk Rendering</h2>
    <p className="text-neutral-300 mb-4">
      The accretion disk uses plane intersection testing with temperature gradients and FBM turbulence.
      The disk features both monochrome texture mapping and temperature-based coloring.
    </p>

    <CodeBlock 
      title="Disk Intersection and Temperature Mapping"
      code={`// Find y=0 plane intersection
float lambda = -oldpoint.y/velocity.y;
vec3 intersection = oldpoint + lambda*velocity;
float r = length(intersection);

if (DISK_IN <= r && r <= DISK_IN+DISK_WIDTH) {
  // Temperature gradient calculation
  float temp_factor = 1.0 - ((r - DISK_IN) / DISK_WIDTH);
  temp_factor = pow(temp_factor, 0.8);
  
  // Hot inner (blue-white) to cool outer (orange-red)
  vec3 hot_color = vec3(0.7, 0.8, 1.0);
  vec3 cool_color = vec3(1.0, 0.6, 0.3);
  vec3 gradient_tint = mix(cool_color, hot_color, temp_factor);
  
  // Add FBM turbulence for realistic disk structure
  float diskHeight = fbm(diskPos * 3.0 + time * 0.1) * 0.05;
  float turbulence = 1.0 + diskHeight * 2.0;
}`}
    />

    <h3 className="text-xl font-semibold mt-6 mb-3">Relativistic Effects</h3>
    
    <CodeBlock 
      title="Doppler Shift and Beaming"
      code={`// Disk orbital velocity at radius r
vec3 disk_velocity = vec3(-intersection.x, 0.0, intersection.z) 
                     / sqrt(2.0*(r-1.0)) / (r*r);

// Lorentz factor and Doppler shift
float disk_gamma = 1.0/sqrt(1.0-dot(disk_velocity, disk_velocity));
float disk_doppler_factor = disk_gamma*(1.0+dot(ray_dir/distance, disk_velocity));

// Apply Doppler shift to temperature
if (doppler_shift)
  disk_temperature /= ray_doppler_factor*disk_doppler_factor;

// Relativistic beaming intensity modification
if (beaming)
  disk_alpha /= pow(disk_doppler_factor, 3.0);`}
    />

    <CodeBlock 
      title="Temperature to Color Conversion"
      code={`vec3 temp_to_color(float temp_kelvin) {
  vec3 color;
  temp_kelvin = clamp(temp_kelvin, 1000.0, 40000.0) / 100.0;
  
  if (temp_kelvin <= 66.0) {
    color.r = 255.0;
    color.g = 99.4708025861 * log(temp_kelvin) - 161.1195681661;
  } else {
    color.r = 329.698727446 * pow(temp_kelvin - 60.0, -0.1332047592);
    color.g = 288.1221695283 * pow(temp_kelvin - 60.0, -0.0755148492);
  }
  
  // Blue calculation based on temperature
  if (temp_kelvin >= 66.0) {
    color.b = 255.0;
  } else if (temp_kelvin <= 19.0) {
    color.b = 0.0;
  } else {
    color.b = 138.5177312231 * log(temp_kelvin - 10.0) - 305.0447927307;
  }
  
  return clamp(color / 255.0, 0.0, 1.0);
}`}
    />

    <h2 className="text-2xl font-semibold mt-8 mb-4">Wormhole Ray Tracing</h2>
    <p className="text-neutral-300 mb-4">
      The wormhole shader implements the Morris-Thorne metric with an Ellis wormhole geometry,
      following the exact equations from the Interstellar papers. It uses proper radial coordinates
      and handles the metric transitions smoothly.
    </p>

    <CodeBlock 
      title="Wormhole Metric Functions"
      code={`// Convert proper radial coordinate ℓ to embedding radius r
float LtoR(float l) {
  if (abs(l) <= uA) {
    return uRho; // Inside throat: constant radius
  }
  // Ellis wormhole embedding - exact from Thorne's paper
  float x = max(0.0, 2.0 * (abs(l) - uA) / (PI * uM));
  return uRho + uM * (x * atan(x) - 0.5 * log(1.0 + x * x));
}

// Derivative dr/dℓ for ray tracing dynamics
float LtoDR(float l) {
  if (abs(l) <= uA) return 0.0; // Flat interior
  
  float x = max(0.0, 2.0 * (abs(l) - uA) / (PI * uM));
  return 2.0 * atan(x) * sign(l) / PI;
}`}
    />

    <CodeBlock 
      title="Wormhole Ray Integration"
      code={`// Initialize ray parameters
float l = camL;          // Proper distance along throat
float r = LtoR(camL);    // Radial coordinate
float dl = vel.x;        // Velocity along throat
float H = r * length(vel.yz); // Conserved angular momentum
float phi = 0.0;         // Azimuthal angle

// Geodesic integration loop
for (int steps = 0; steps < uMaxSteps; steps++) {
  float integrationBound = max(abs(camL) * 2.0, uA + uM * 8.0);
  if (abs(l) >= integrationBound) break;
  
  dr = LtoDR(l);
  r = LtoR(l);
  
  // Adaptive step size for numerical stability
  float adaptiveStep = dt * (0.5 + uM * 0.5);
  
  // Update position and velocity using geodesic equations
  l += dl * adaptiveStep;
  phi += H / (r * r) * adaptiveStep;
  dl += H * H * dr / (r * r * r) * adaptiveStep;
}`}
    />

    <h3 className="text-xl font-semibold mt-6 mb-3">Gravitational Lensing Effects</h3>
    
    <CodeBlock 
      title="Einstein Ring and Rotation Modes"
      code={`// Multiple rotation modes for artistic control
float rotationAmount;
if (uRotationMode == 0) {
  // Oscillating - gentle swaying motion
  rotationAmount = sin(timeValue * uRotationSpeed) * 0.5 
                   * (1.0 - exp(-distFromCenter * uWarpingDistance));
} else if (uRotationMode == 1) {
  // Smooth back-and-forth motion
  float cycle = timeValue * uRotationSpeed * 0.05;
  rotationAmount = (sin(cycle) * 0.5 + 0.5) 
                   * (1.0 - exp(-distFromCenter * uWarpingDistance));
} else if (uRotationMode == 2) {
  // Continuous slow rotation
  rotationAmount = timeValue * uRotationSpeed * 0.05 
                   * (1.0 - exp(-distFromCenter * uWarpingDistance));
}

// Einstein ring glow calculation
float ringDistance = abs(distFromCenter - uRingRadius);
float ringGlow = exp(-ringDistance * uRingSharpness) * uRingIntensity;
galaxyColor.rgb += uRingColor * ringGlow;`}
    />

    <h2 className="text-2xl font-semibold mt-8 mb-4">Star Field Rendering</h2>
    <p className="text-neutral-300 mb-4">
      The twinkling star shader creates realistic stellar backgrounds using per-star attributes
      for phase and speed variation, creating a natural twinkling effect.
    </p>

    <CodeBlock 
      title="Twinkling Star Implementation"
      code={`// Vertex shader: Calculate twinkling opacity
float flicker = 0.5 + 0.5 * sin(uTime * flickerSpeed + flickerData * 6.28318);
vAlpha = 0.2 + 0.8 * flicker; // Opacity varies from 0.2 to 1.0

// Size based on distance for depth perception
gl_PointSize = uSize * (300.0 / -mvPosition.z);

// Fragment shader: Render circular stars with soft edges
float dist = distance(gl_PointCoord, vec2(0.5));
if (dist > 0.5) discard;

float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
alpha *= vAlpha; // Apply twinkling

// Additive blending for natural glow
gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);`}
    />

    <h2 className="text-2xl font-semibold mt-8 mb-4">Performance Optimizations</h2>
    
    <CodeBlock 
      title="Quality Settings"
      code={`// Configurable quality levels
const configs = {
  low:    { STEP: 0.1,  NSTEPS: 300 },  // Fast preview
  medium: { STEP: 0.05, NSTEPS: 600 },  // Balanced
  high:   { STEP: 0.02, NSTEPS: 1000 }  // Maximum quality
};

// Resolution scaling for performance
renderer.setPixelRatio(window.devicePixelRatio * resolution);
composer.setSize(
  window.innerWidth * resolution,
  window.innerHeight * resolution
);`}
    />

    <div className="bg-neutral-950 rounded-lg p-6 mt-6">
      <h3 className="text-lg font-semibold mb-3">Key Implementation Details</h3>
      <ul className="space-y-2 text-neutral-300">
        <li>• <strong>Integration Method:</strong> Euler integration with adaptive step sizes</li>
        <li>• <strong>Coordinate System:</strong> Schwarzschild coordinates for black holes, Ellis coordinates for wormholes</li>
        <li>• <strong>Texture Mapping:</strong> Equirectangular projection for galaxy backgrounds</li>
        <li>• <strong>Post-processing:</strong> Three.js UnrealBloomPass for glowing effects</li>
        <li>• <strong>Color Science:</strong> Physically-based blackbody radiation with Kelvin temperature mapping</li>
        <li>• <strong>Noise Functions:</strong> 4-octave FBM for disk turbulence</li>
        <li>• <strong>Optimization:</strong> Early ray termination, configurable step counts, resolution scaling</li>
      </ul>
    </div>

    <h2 className="text-2xl font-semibold mt-8 mb-4">Artistic Controls</h2>
    <p className="text-neutral-300 mb-4">
      Beyond physical accuracy, the shaders expose numerous artistic parameters for creative control:
    </p>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-neutral-950 rounded-lg p-4">
        <h4 className="font-semibold mb-2">Black Hole</h4>
        <ul className="text-sm text-neutral-300 space-y-1">
          <li>• Disk temperature tinting</li>
          <li>• Bloom strength and radius</li>
          <li>• Texture vs procedural disk</li>
          <li>• Relativistic effect toggles</li>
        </ul>
      </div>
      <div className="bg-neutral-950 rounded-lg p-4">
        <h4 className="font-semibold mb-2">Wormhole</h4>
        <ul className="text-sm text-neutral-300 space-y-1">
          <li>• Einstein ring color/intensity</li>
          <li>• Multiple rotation modes</li>
          <li>• Dual texture blending</li>
          <li>• Warping distance control</li>
        </ul>
      </div>
    </div>

    <p className="text-neutral-300 mt-6">
      The shaders balance scientific accuracy with real-time performance and artistic flexibility,
      creating visualizations that are both educational and cinematically compelling.
    </p>
  </div>
);

const TheorySection = () => (
  <div className="prose prose-invert max-w-none">
    <h1 className="text-4xl font-bold mb-6">Theory & Science</h1>

    <h2 className="text-2xl font-semibold mt-8 mb-4">Schwarzschild Black Holes</h2>
    <p className="text-neutral-300 mb-4">
      A Schwarzschild black hole is the simplest solution to Einstein&apos;s field equations, describing
      a non-rotating, uncharged black hole. The Schwarzschild radius (event horizon) occurs at r = 2GM/c²,
      where G is gravitational constant, M is mass, and c is speed of light.
    </p>

    <div className="bg-neutral-950 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-3">Key Radii in Natural Units (GM/c² = 1)</h3>
      <ul className="space-y-3 text-neutral-300">
        <li><strong>Event Horizon (r = 2):</strong> The point of no return - not even light can escape</li>
        <li><strong>Photon Sphere (r = 3):</strong> Unstable circular orbit where photons orbit the black hole</li>
        <li><strong>Innermost Stable Circular Orbit (r = 6):</strong> Closest stable orbit for massive particles</li>
        <li><strong>Marginally Bound Orbit (r = 4):</strong> Particles have zero binding energy</li>
      </ul>
    </div>

    <h2 className="text-2xl font-semibold mt-8 mb-4">The Schwarzschild Metric</h2>
    <p className="text-neutral-300 mb-4">
      The spacetime geometry around a Schwarzschild black hole is described by the metric:
    </p>
    <CodeBlock 
      title="Schwarzschild Metric"
      code={`ds² = -(1 - 2M/r)dt² + (1 - 2M/r)⁻¹dr² + r²(dθ² + sin²θ dφ²)

Where:
- M is the black hole mass
- r is the radial coordinate
- t is time, θ and φ are angular coordinates`}
    />

    <h2 className="text-2xl font-semibold mt-8 mb-4">Gravitational Lensing</h2>
    <p className="text-neutral-300 mb-4">
      Einstein&apos;s theory predicts that massive objects bend spacetime, causing light rays to curve.
      This creates spectacular phenomena around black holes:
    </p>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
      <TheoryCard 
        title="Primary Image"
        description="Direct view of objects behind the black hole, minimally distorted"
      />
      <TheoryCard 
        title="Secondary Image"
        description="Light that orbits the black hole once before reaching observer"
      />
      <TheoryCard 
        title="Einstein Ring"
        description="Perfect circular image when source, lens, and observer align"
      />
      <TheoryCard 
        title="Photon Ring"
        description="Bright ring from photons orbiting near the photon sphere"
      />
    </div>

    <h2 className="text-2xl font-semibold mt-8 mb-4">Accretion Disk Physics</h2>
    <p className="text-neutral-300 mb-4">
      Matter spiraling into a black hole forms an accretion disk, converting gravitational energy
      into heat through viscous friction and tidal shearing.
    </p>

    <div className="bg-neutral-950 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-3">Disk Properties</h3>
      <ul className="space-y-3 text-neutral-300">
        <li><strong>Temperature Profile:</strong> T ∝ r⁻³/⁴ for thin disks (Shakura-Sunyaev)</li>
        <li><strong>Peak Temperature:</strong> Inner edge can reach 10⁷ K for stellar mass black holes</li>
        <li><strong>Orbital Velocity:</strong> v = √(GM/2r) for circular Keplerian orbits</li>
        <li><strong>Luminosity:</strong> Up to 40% of rest mass energy can be radiated</li>
      </ul>
    </div>

    <h2 className="text-2xl font-semibold mt-8 mb-4">Relativistic Effects</h2>
    <div className="space-y-4">
      <TheoryCard 
        title="Gravitational Redshift"
        description="Light climbing out of the gravitational well loses energy, shifting toward red. At the event horizon, redshift becomes infinite."
      />
      <TheoryCard 
        title="Doppler Shift"
        description="Disk material moving toward us appears blue-shifted and brighter, while receding material appears red-shifted and dimmer, creating the characteristic asymmetric appearance."
      />
      <TheoryCard 
        title="Relativistic Beaming"
        description="Special relativistic effect where emission is concentrated in the direction of motion. Intensity scales as D³ where D is the Doppler factor."
      />
      <TheoryCard 
        title="Time Dilation"
        description="Time runs slower in stronger gravitational fields. At the event horizon, time stops relative to distant observers."
      />
    </div>

    <h2 className="text-2xl font-semibold mt-8 mb-4">Morris-Thorne Wormholes</h2>
    <p className="text-neutral-300 mb-4">
      Traversable wormholes are theoretical shortcuts through spacetime. The Morris-Thorne metric
      describes a wormhole that could potentially be crossed by travelers:
    </p>

    <CodeBlock 
      title="Morris-Thorne Metric"
      code={`ds² = -dt² + dr²/(1 - b(r)/r) + r²(dθ² + sin²θ dφ²)

Where b(r) is the shape function that determines the wormhole geometry.
For the Ellis wormhole used in my visualization:
b(r) = ρ² / r  (where ρ is the throat radius)`}
    />

    <div className="bg-neutral-950 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-3">Wormhole Parameters</h3>
      <ul className="space-y-3 text-neutral-300">
        <li><strong>ρ (rho):</strong> Throat radius - minimum radius of the wormhole</li>
        <li><strong>a:</strong> Half-length of cylindrical throat interior</li>
        <li><strong>M:</strong> Lensing parameter controlling spacetime curvature</li>
        <li><strong>Lensing Width:</strong> W = 1.42953 × M (in units where ρ = 1)</li>
      </ul>
    </div>

    <h2 className="text-2xl font-semibold mt-8 mb-4">Scientific Papers & References</h2>
    <div className="space-y-4">
      <div className="bg-neutral-950 rounded-lg p-4">
        <h4 className="font-semibold text-white">Visualizing Interstellar&apos;s Wormhole</h4>
        <p className="text-sm text-neutral-400 mt-1">
          Oliver James, Eugénie von Tunzelmann, Paul Franklin, Kip S. Thorne (2015)<br/>
          American Journal of Physics 83(6): 486-499
        </p>
        <p className="text-sm text-neutral-300 mt-2">
          Describes the equations and visualization techniques used to create scientifically accurate
          wormhole imagery for the film Interstellar.
        </p>
      </div>

      <div className="bg-neutral-950 rounded-lg p-4">
        <h4 className="font-semibold text-white">Gravitational Lensing by Spinning Black Holes in Astrophysics, and in the Movie Interstellar</h4>
        <p className="text-sm text-neutral-400 mt-1">
          Oliver James, Eugénie von Tunzelmann, Paul Franklin, Kip S. Thorne (2015)<br/>
          Classical and Quantum Gravity 32: 065001
        </p>
        <p className="text-sm text-neutral-300 mt-2">
          Details the ray-tracing techniques for rendering black holes with gravitational lensing,
          including the creation of Gargantua for Interstellar.
        </p>
      </div>

      <div className="bg-neutral-950 rounded-lg p-4">
        <h4 className="font-semibold text-white">The Science of Interstellar</h4>
        <p className="text-sm text-neutral-400 mt-1">
          Kip S. Thorne (2014)<br/>
          W. W. Norton & Company
        </p>
        <p className="text-sm text-neutral-300 mt-2">
          Comprehensive book explaining the scientific concepts behind the film, from black holes
          to higher dimensions.
        </p>
      </div>

      <div className="bg-neutral-950 rounded-lg p-4">
        <h4 className="font-semibold text-white">Wormholes in Spacetime and Their Use for Interstellar Travel</h4>
        <p className="text-sm text-neutral-400 mt-1">
          Michael S. Morris, Kip S. Thorne (1988)<br/>
          American Journal of Physics 56: 395-412
        </p>
        <p className="text-sm text-neutral-300 mt-2">
          The foundational paper on traversable wormholes that inspired both scientific research
          and science fiction, including Contact and Interstellar.
        </p>
      </div>
    </div>

    <h2 className="text-2xl font-semibold mt-8 mb-4">Numerical Implementation</h2>
    <p className="text-neutral-300 mb-4">
      The visualization uses several numerical techniques to achieve real-time performance:
    </p>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-neutral-950 rounded-lg p-4">
        <h4 className="font-semibold mb-2">Ray Marching</h4>
        <p className="text-sm text-neutral-300">
          Fixed-step Euler integration along null geodesics with configurable step sizes
          (0.02 - 0.1) for quality/performance trade-offs.
        </p>
      </div>
      <div className="bg-neutral-950 rounded-lg p-4">
        <h4 className="font-semibold mb-2">Coordinate Systems</h4>
        <p className="text-sm text-neutral-300">
          Schwarzschild coordinates (t,r,θ,φ) for black holes, Ellis coordinates with
          proper distance ℓ for wormholes.
        </p>
      </div>
      <div className="bg-neutral-950 rounded-lg p-4">
        <h4 className="font-semibold mb-2">Conservation Laws</h4>
        <p className="text-sm text-neutral-300">
          Angular momentum h² = r² (dφ/dτ)² is conserved, simplifying the geodesic equations.
        </p>
      </div>
      <div className="bg-neutral-950 rounded-lg p-4">
        <h4 className="font-semibold mb-2">Texture Mapping</h4>
        <p className="text-sm text-neutral-300">
          Equirectangular projection for galaxy backgrounds with seamless wrapping at boundaries.
        </p>
      </div>
    </div>

    <p className="text-neutral-300 mt-6">
      This project demonstrates how modern GPU computing enables real-time visualization of
      phenomena that would have taken hours to render just a decade ago, making Einstein&apos;s
      universe accessible to everyone.
    </p>
  </div>
);

// Helper Components
const TechCard = ({ name, desc }: { name: string; desc: string }) => (
  <div className="bg-neutral-950 rounded-none p-4 border border-neutral-800">
    <h3 className="font-semibold text-white">{name}</h3>
    <p className="text-sm text-neutral-400">{desc}</p>
  </div>
);

const ControlDoc = ({ title, controls }: { title: string; controls: Array<{name: string; desc: string}> }) => (
  <div className="mb-8">
    <h3 className="text-xl font-semibold mb-4">{title}</h3>
    <div className="space-y-3">
      {controls.map((control) => (
        <div key={control.name} className="bg-neutral-950 rounded-none p-4">
          <h4 className="font-medium text-white mb-1">{control.name}</h4>
          <p className="text-sm text-neutral-400">{control.desc}</p>
        </div>
      ))}
    </div>
  </div>
);


const CodeBlock = ({ title, code }: { title: string; code: string }) => (
  <div className="my-6">
    <h3 className="text-lg font-semibold mb-3">{title}</h3>
    <pre className="bg-neutral-950 rounded-none p-4 overflow-x-auto border border-neutral-900 border-dashed">
      <code className="text-sm text-green-400 tracking-tight">{code}</code>
    </pre>
  </div>
);

const TheoryCard = ({ title, description }: { title: string; description: string }) => (
  <div className="bg-neutral-950 rounded-none p-6 border-l-4 border-green-500">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-neutral-300">{description}</p>
  </div>
);

export default DocsPage;