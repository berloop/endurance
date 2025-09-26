/* eslint-disable @typescript-eslint/no-unused-vars */
// components/blackhole/main-blackhole.tsx
"use client";

import { SliderRange, SliderThumb, SliderTrack } from "@radix-ui/react-slider";
import { CircleDot, ChevronDown, ChevronUp, Maximize, Download } from "lucide-react";
import React, { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { Slider } from "../ui/slider";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { AnimatePresence, motion } from "framer-motion";
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { createTwinklingStarMaterial } from "@/lib/star-shader";
import MusicControls from "./music-controls";

const fragmentShader = `
#define PI 3.141592653589793238462643383279
#define DEG_TO_RAD (PI/180.0)
#define ROT_Y(a) mat3(1, 0, 0, 0, cos(a), sin(a), 0, -sin(a), cos(a))
#define ROT_Z(a) mat3(cos(a), -sin(a), 0, sin(a), cos(a), 0, 0, 0, 1)

uniform float time;
uniform vec2 resolution;
uniform vec3 cam_pos;
uniform vec3 cam_dir;
uniform vec3 cam_up;
uniform float fov;
uniform vec3 cam_vel;

const float MIN_TEMPERATURE = 1000.0;
const float TEMPERATURE_RANGE = 39000.0;

uniform bool accretion_disk;
uniform bool use_disk_texture;
const float DISK_IN = 2.0;
const float DISK_WIDTH = 4.0;

uniform bool doppler_shift;
uniform bool lorentz_transform;
uniform bool beaming;

uniform sampler2D bg_texture;
uniform sampler2D star_texture;
uniform sampler2D disk_texture;

vec2 square_frame(vec2 screen_size){
  vec2 position = 2.0 * (gl_FragCoord.xy / screen_size.xy) - 1.0;
  return position;
}

vec2 to_spherical(vec3 cartesian_coord){
  vec2 uv = vec2(atan(cartesian_coord.z,cartesian_coord.x), asin(cartesian_coord.y));
  uv *= vec2(1.0/(2.0*PI), 1.0/PI);
  uv += 0.5;
  return uv;
}

vec3 lorentz_transform_velocity(vec3 u, vec3 v){
  float speed = length(v);
  if (speed > 0.0){
    float gamma = 1.0/sqrt(1.0-dot(v,v));
    float denominator = 1.0 - dot(v,u);
    vec3 new_u = (u/gamma - v + (gamma/(gamma+1.0)) * dot(u,v)*v)/denominator;
    return new_u;
  }
  return u;
}

vec3 temp_to_color(float temp_kelvin){
  vec3 color;
  temp_kelvin = clamp(temp_kelvin, 1000.0, 40000.0) / 100.0;
  if (temp_kelvin <= 66.0){
    color.r = 255.0;
    color.g = temp_kelvin;
    color.g = 99.4708025861 * log(color.g) - 161.1195681661;
    if (color.g < 0.0) color.g = 0.0;
    if (color.g > 255.0) color.g = 255.0;
  } else {
    color.r = temp_kelvin - 60.0;
    if (color.r < 0.0) color.r = 0.0;
    color.r = 329.698727446 * pow(color.r, -0.1332047592);
    if (color.r < 0.0) color.r = 0.0;
    if (color.r > 255.0) color.r = 255.0;
    color.g = temp_kelvin - 60.0;
    if (color.g < 0.0) color.g = 0.0;
    color.g = 288.1221695283 * pow(color.g, -0.0755148492);
    if (color.g > 255.0) color.g = 255.0;
  }
  if (temp_kelvin >= 66.0){
    color.b = 255.0;
  } else if (temp_kelvin <= 19.0){
    color.b = 0.0;
  } else {
    color.b = temp_kelvin - 10.0;
    color.b = 138.5177312231 * log(color.b) - 305.0447927307;
    if (color.b < 0.0) color.b = 0.0;
    if (color.b > 255.0) color.b = 255.0;
  }
  color /= 255.0;
  return color;
}

void main() {
  float uvfov = tan(fov / 2.0 * DEG_TO_RAD);
  vec2 uv = square_frame(resolution);
  uv *= vec2(resolution.x/resolution.y, 1.0);
  
  vec3 forward = normalize(cam_dir);
  vec3 up = normalize(cam_up);
  vec3 nright = normalize(cross(forward, up));
  up = cross(nright, forward);
  
  vec3 pixel_pos = cam_pos + forward + nright*uv.x*uvfov + up*uv.y*uvfov;
  vec3 ray_dir = normalize(pixel_pos - cam_pos);
  
  if (lorentz_transform)
    ray_dir = lorentz_transform_velocity(ray_dir, cam_vel);
  
 vec4 color = vec4(0.0,0.0,0.0,0.0);
  
  vec3 point = cam_pos;
  vec3 velocity = ray_dir;
  vec3 c = cross(point,velocity);
  float h2 = dot(c,c);
  
  float ray_gamma = 1.0/sqrt(1.0-dot(cam_vel,cam_vel));
  float ray_doppler_factor = ray_gamma * (1.0 + dot(ray_dir, -cam_vel));
  float ray_intensity = 1.0;
  if (beaming)
    ray_intensity /= pow(ray_doppler_factor, 3.0);
  
  vec3 oldpoint;
  float distance = length(point);
  
  for (int i=0; i<NSTEPS; i++){
    oldpoint = point;
    point += velocity * STEP;
    vec3 accel = -1.5 * h2 * point / pow(dot(point,point), 2.5);
    velocity += accel * STEP;
    
    distance = length(point);
    if (distance < 0.0) break;
    
    bool horizon_mask = distance < 1.0 && length(oldpoint) > 1.0;
    if (horizon_mask) {
      color += vec4(0.0,0.0,0.0,1.0);
      break;
    }
    
    if (accretion_disk){
      if (oldpoint.y * point.y < 0.0){
        float lambda = -oldpoint.y/velocity.y;
        vec3 intersection = oldpoint + lambda*velocity;
        float r = length(intersection);
        if (DISK_IN <= r && r <= DISK_IN+DISK_WIDTH){
          float phi = atan(intersection.x, intersection.z);
          vec3 disk_velocity = vec3(-intersection.x, 0.0, intersection.z)/sqrt(2.0*(r-1.0))/(r*r);
          phi -= time;
          phi = mod(phi, PI*2.0);
          float disk_gamma = 1.0/sqrt(1.0-dot(disk_velocity, disk_velocity));
          float disk_doppler_factor = disk_gamma*(1.0+dot(ray_dir/distance, disk_velocity));
          
          if (use_disk_texture){
            vec2 tex_coord = vec2(mod(phi,2.0*PI)/(2.0*PI), 1.0-(r-DISK_IN)/(DISK_WIDTH));
            vec4 disk_color = texture2D(disk_texture, tex_coord) / (ray_doppler_factor * disk_doppler_factor);
            float disk_alpha = clamp(dot(disk_color,disk_color)/4.5, 0.0, 1.0);
            if (beaming)
              disk_alpha /= pow(disk_doppler_factor, 3.0);
            color += vec4(disk_color)*disk_alpha;
          } else {
            float disk_temperature = 10000.0*(pow(r/DISK_IN, -3.0/4.0));
            if (doppler_shift)
              disk_temperature /= ray_doppler_factor*disk_doppler_factor;
            vec3 disk_color = temp_to_color(disk_temperature);
            float disk_alpha = clamp(dot(disk_color,disk_color)/3.0, 0.0, 1.0);
            if (beaming)
              disk_alpha /= pow(disk_doppler_factor, 3.0);
            color += vec4(disk_color, 1.0)*disk_alpha;
          }
        }
      }
    }
  }
  
  
  
// At the very end, replace gl_FragColor line with:
if (color.a > 0.01) {
  gl_FragColor = vec4(color.rgb * ray_intensity, color.a);
} else {
  discard; // Don't render transparent areas at all
}
}
`;

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const MainBlackHole: React.FC<{ className?: string }> = ({ className = "" }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const materialRef = useRef<THREE.ShaderMaterial>();
  const composerRef = useRef<EffectComposer>();
  const bloomPassRef = useRef<UnrealBloomPass>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const sceneRef = useRef<THREE.Scene>();
const cameraRef = useRef<THREE.PerspectiveCamera>();
  const uiSoundRef = useRef<HTMLAudioElement>(null);
  
  const [uiVisible, setUiVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [fps, setFps] = useState(60);
  const frameTimeRef = useRef(performance.now());
  const fpsHistory = useRef<number[]>([]);
  const lastFpsUpdate = useRef(0);

 // Adding refs at the top with other refs
const distanceRef = useRef(10.0);
const thetaRef = useRef(0);
const inclineRef = useRef(-5 * Math.PI / 180);
const orbitRef = useRef(false);

// Keep the state (for UI display)
const [distance, setDistance] = useState(10.0);
const [theta, setTheta] = useState(0);
const [incline, setIncline] = useState(-5 * Math.PI / 180);
  
  const [fov, setFov] = useState(75);
  const [orbit, setOrbit] = useState(false);
  
  const [showPerformance, setShowPerformance] = useState(false);
  const [showBloom, setShowBloom] = useState(false);
  const [showEffects, setShowEffects] = useState(false);
  
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [resolution, setResolution] = useState(1.0);

  const [bloom, setBloom] = useState({
    strength: 2.0,
    radius: 0.15,
    threshold: 0.6,
  });

  const [physics, setPhysics] = useState({
    lorentz: true,
    doppler: true,
    beaming: true,
    disc: true,
    useTexture: true,
  });

  const playUISound = useCallback(() => {
    if (soundEnabled && uiSoundRef.current) {
      uiSoundRef.current.currentTime = 0;
      uiSoundRef.current.volume = 0.3;
      uiSoundRef.current.play().catch(() => {});
    }
  }, [soundEnabled]);

  const toggleFullscreen = useCallback(async () => {
    playUISound();
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, [playUISound]);

const saveImage = useCallback(() => {
  if (!rendererRef.current || !sceneRef.current || !cameraRef.current) {
    console.log("Missing refs");
    return;
  }
  playUISound();
  
  try {
    // Force a render
    if (composerRef.current) {
      composerRef.current.render();
    }
    
    // Try direct canvas method
    rendererRef.current.domElement.toBlob((blob) => {
      if (!blob) {
        console.error("Failed to create blob");
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `blackhole-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log("Image saved successfully");
    });
  } catch (error) {
    console.error("Save image error:", error);
  }
}, [playUISound]);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(
  75, 
  window.innerWidth / window.innerHeight, 
  0.1, 
  1000
);
camera.position.z = 1;
cameraRef.current = camera; 

    const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Composer with bloom
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(128, 128),
      bloom.strength,
      bloom.radius,
      bloom.threshold
    );
    composer.addPass(renderPass);
    composer.addPass(bloomPass);
    composerRef.current = composer;
    bloomPassRef.current = bloomPass;

    const textureLoader = new THREE.TextureLoader();
    const bgTexture = textureLoader.load('/blackhole/galaxy_0.jpg');
    const starTexture = textureLoader.load('/blackhole/galaxy_0.jpg');
    const discTexture = textureLoader.load('/blackhole/accretion_disk_monochrome.png');

    [bgTexture, starTexture, discTexture].forEach(tex => {
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
    });

    const getDefines = (q: string) => {
      const configs = {
        low: { STEP: 0.1, NSTEPS: 300 },
        medium: { STEP: 0.05, NSTEPS: 600 },
        high: { STEP: 0.02, NSTEPS: 1000 },
      };
      const config = configs[q as keyof typeof configs];
      return `#define STEP ${config.STEP}\n#define NSTEPS ${config.NSTEPS}\n`;
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader: getDefines(quality) + fragmentShader,
      transparent: true,
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        cam_pos: { value: new THREE.Vector3() },
        cam_dir: { value: new THREE.Vector3(0, 0, -1) },
        cam_up: { value: new THREE.Vector3(0, 1, 0) },
        fov: { value: fov },
        cam_vel: { value: new THREE.Vector3() },
        accretion_disk: { value: true },
        use_disk_texture: { value: true },
        doppler_shift: { value: true },
        lorentz_transform: { value: true },
        beaming: { value: true },
        bg_texture: { value: bgTexture },
        star_texture: { value: starTexture },
        disk_texture: { value: discTexture },
      },
    });
    materialRef.current = material;

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), material);
    mesh.rotation.z = -15 * Math.PI / 180; // Anticlockwise tilt
    scene.add(mesh);

    // Add twinkling stars
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 3000;
    const starPositions = new Float32Array(starCount * 3);
    const flickerData = new Float32Array(starCount);
    const flickerSpeed = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
  const phi = Math.random() * Math.PI * 2;
  const theta = Math.random() * Math.PI;
  const radius = 80; // CHANGE THIS to 20 or 30 (much closer)
  starPositions[i * 3] = radius * Math.sin(theta) * Math.cos(phi);
  starPositions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
  starPositions[i * 3 + 2] = radius * Math.cos(theta);
  flickerData[i] = Math.random() * Math.PI * 2;
  flickerSpeed[i] = 0.5 + Math.random() * 2.0;
}
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute("flickerData", new THREE.BufferAttribute(flickerData, 1));
    starGeometry.setAttribute("flickerSpeed", new THREE.BufferAttribute(flickerSpeed, 1));

   const starMaterial = new THREE.ShaderMaterial(createTwinklingStarMaterial(0.2)); // Much brighter/bigger
    const stars = new THREE.Points(starGeometry, starMaterial);
    stars.name = "stars";
    scene.add(stars);

    let animationId: number;
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const now = performance.now();
      const deltaTime = now - frameTimeRef.current;
      frameTimeRef.current = now;
      const currentFps = 1000 / deltaTime;
      fpsHistory.current.push(currentFps);
      if (fpsHistory.current.length > 60) fpsHistory.current.shift();

      if (now - lastFpsUpdate.current > 2000) {
        const avgFps = fpsHistory.current.reduce((a, b) => a + b, 0) / fpsHistory.current.length;
        setFps(Math.round(avgFps));
        lastFpsUpdate.current = now;
      }

   // Auto-orbit
if (orbitRef.current) {
  thetaRef.current += 0.005;
  setTheta(thetaRef.current);
}

  const r = distanceRef.current;
const theta = thetaRef.current;
const incline = inclineRef.current;

// Spherical coordinates with incline as elevation angle
const x = r * Math.cos(incline) * Math.sin(theta);
const y = r * Math.sin(incline);
const z = r * Math.cos(incline) * Math.cos(theta);

const pos = new THREE.Vector3(x, y, z);

// Velocity calculation with incline
const maxAngularVel = 1 / Math.sqrt(2.0 * (r - 1.0)) / r;
const vel = new THREE.Vector3(
  Math.cos(theta) * maxAngularVel * Math.cos(incline),
  0,
  -Math.sin(theta) * maxAngularVel * Math.cos(incline)
);

      const dir = new THREE.Vector3(0, 0, 0).sub(pos).normalize();
      const up = new THREE.Vector3(0, 1, 0);

      material.uniforms.time.value += 0.01;
      material.uniforms.cam_pos.value.copy(pos);
      material.uniforms.cam_dir.value.copy(dir);
      material.uniforms.cam_up.value.copy(up);
      material.uniforms.cam_vel.value.copy(vel);

     
     // Update stars
const starsObj = scene.getObjectByName("stars") as THREE.Points;
if (starsObj?.material) {
  console.log("Stars count:", starsObj.geometry.attributes.position.count); // ADD THIS
  (starsObj.material as THREE.ShaderMaterial).uniforms.uTime.value += 0.01;
}
      // Resolution
      renderer.setPixelRatio(window.devicePixelRatio * resolution);
      composer.setSize(
        window.innerWidth * resolution,
        window.innerHeight * resolution
      );

      composer.render();
    };
    animate();

   const handleResize = () => {
  if (!mountRef.current) return;
  const cam = cameraRef.current;
  if (cam) {
    cam.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
    cam.updateProjectionMatrix();
  }
  renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      composer.setSize(
        mountRef.current.clientWidth * resolution,
        mountRef.current.clientHeight * resolution
      );
      material.uniforms.resolution.value.set(
        mountRef.current.clientWidth * resolution,
        mountRef.current.clientHeight * resolution
      );
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (materialRef.current) {
      const getDefines = (q: string) => {
        const configs = {
          low: { STEP: 0.1, NSTEPS: 300 },
          medium: { STEP: 0.05, NSTEPS: 600 },
          high: { STEP: 0.02, NSTEPS: 1000 },
        };
        const config = configs[q as keyof typeof configs];
        return `#define STEP ${config.STEP}\n#define NSTEPS ${config.NSTEPS}\n`;
      };
      materialRef.current.fragmentShader = getDefines(quality) + fragmentShader;
      materialRef.current.needsUpdate = true;
    }
  }, [quality]);

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.accretion_disk.value = physics.disc;
      materialRef.current.uniforms.use_disk_texture.value = physics.useTexture;
      materialRef.current.uniforms.doppler_shift.value = physics.doppler;
      materialRef.current.uniforms.lorentz_transform.value = physics.lorentz;
      materialRef.current.uniforms.beaming.value = physics.beaming;
    }
  }, [physics]);

// Update bloom in real-time
useEffect(() => {
  if (bloomPassRef.current) {
    bloomPassRef.current.strength = bloom.strength;
    bloomPassRef.current.radius = bloom.radius;
    bloomPassRef.current.threshold = bloom.threshold;
  }
}, [bloom]);

// Update FOV in real-time
useEffect(() => {
  if (materialRef.current) {
    materialRef.current.uniforms.fov.value = fov;
  }
}, [fov]);

// Add these useEffects to sync state to refs..
useEffect(() => { distanceRef.current = distance; }, [distance]);
useEffect(() => { thetaRef.current = theta; }, [theta]);
useEffect(() => { inclineRef.current = incline; }, [incline]);
useEffect(() => { orbitRef.current = orbit; }, [orbit]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "h" || e.key === "H") {
        playUISound();
        setUiVisible(!uiVisible);
      }
      if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [uiVisible, toggleFullscreen, playUISound]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={mountRef} className="w-full h-full" />

      <AnimatePresence>
        {uiVisible && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-4 left-4 bg-neutral-950/20 backdrop-blur-lg rounded-sm p-4 text-white max-w-xs max-h-[90vh] overflow-y-auto scrollbar-thin"
          >
            <h3 className="text-lg font-semibold mb-3">Schwarzschild Black Hole</h3>

            <div className="space-y-4">
              {/* Performance */}
              <Button size="sm" variant="cooper" onClick={() => { playUISound(); setShowPerformance(!showPerformance); }} className="w-full justify-between">
                <span>Performance</span>
                {showPerformance ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>

              {showPerformance && (
                <div className="space-y-3 pl-2">
                  <div>
                    <label className="block text-sm mb-2">Resolution: {resolution}</label>
                    <select 
                      value={resolution}
                      onChange={(e) => { playUISound(); setResolution(Number(e.target.value)); }}
                      className="w-full bg-neutral-800 rounded p-1 text-sm"
                    >
                      <option value={0.25}>0.25</option>
                      <option value={0.5}>0.5</option>
                      <option value={1.0}>1.0</option>
                      <option value={2.0}>2.0</option>
                      <option value={4.0}>4.0</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Quality:</label>
                    <div className="flex gap-2">
                      {(['low', 'medium', 'high'] as const).map((q) => (
                        <Button key={q} size="sm" variant={quality === q ? "default" : "secondary"} onClick={() => { playUISound(); setQuality(q); }}>
                          {q}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Bloom */}
              <Button size="sm" variant="cooper" onClick={() => { playUISound(); setShowBloom(!showBloom); }} className="w-full justify-between">
                <span>Bloom</span>
                {showBloom ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>

              {showBloom && (
                <div className="space-y-3 pl-2">
                  <div>
                    <label className="block text-sm mb-2 flex justify-between">
                      <span>Strength:</span>
                      <span className="font-mono">{bloom.strength.toFixed(1)}</span>
                    </label>
                    <Slider value={[bloom.strength]} onValueChange={(v) => { playUISound(); setBloom(b => ({ ...b, strength: v[0] })); }} min={0} max={3} step={0.1}>
                      <SliderTrack><SliderRange /></SliderTrack>
                      <SliderThumb />
                    </Slider>
                  </div>
                  <div>
                    <label className="block text-sm mb-2 flex justify-between">
                      <span>Radius:</span>
                      <span className="font-mono">{bloom.radius.toFixed(1)}</span>
                    </label>
                    <Slider value={[bloom.radius]} onValueChange={(v) => { playUISound(); setBloom(b => ({ ...b, radius: v[0] })); }} min={0} max={1} step={0.1}>
                      <SliderTrack><SliderRange /></SliderTrack>
                      <SliderThumb />
                    </Slider>
                  </div>
                  <div>
                    <label className="block text-sm mb-2 flex justify-between">
                      <span>Threshold:</span>
                      <span className="font-mono">{bloom.threshold.toFixed(1)}</span>
                    </label>
                    <Slider value={[bloom.threshold]} onValueChange={(v) => { playUISound(); setBloom(b => ({ ...b, threshold: v[0] })); }} min={0} max={1} step={0.1}>
                      <SliderTrack><SliderRange /></SliderTrack>
                      <SliderThumb />
                    </Slider>
                  </div>
                </div>
              )}

              {/* Observer */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm mb-2 flex justify-between">
                    <span>Distance:</span>
                    <span className="font-mono">{distance.toFixed(1)}M</span>
                  </label>
                  <Slider value={[distance]} onValueChange={(v) => { playUISound(); setDistance(v[0]); }} min={2} max={14} step={0.5}>
                    <SliderTrack><SliderRange /></SliderTrack>
                    <SliderThumb />
                  </Slider>
                </div>
                 <div>
    <label className="block text-sm mb-2 flex justify-between">
      <span>Angle:</span>
      <span className="font-mono">{Math.round(theta * 180 / Math.PI)}°</span>
    </label>
    <Slider value={[theta]} onValueChange={(v) => { playUISound(); setTheta(v[0]); }} min={0} max={Math.PI * 2} step={0.01}>
      <SliderTrack><SliderRange /></SliderTrack>
      <SliderThumb />
    </Slider>
  </div>

  <div>
    <label className="block text-sm mb-2 flex justify-between">
      <span>Incline:</span>
      <span className="font-mono">{Math.round(incline * 180 / Math.PI)}°</span>
    </label>
    <Slider value={[incline]} onValueChange={(v) => { playUISound(); setIncline(v[0]); }} min={-Math.PI / 2} max={Math.PI / 2} step={0.01}>
      <SliderTrack><SliderRange /></SliderTrack>
      <SliderThumb />
    </Slider>
  </div>

                <div>
                  <label className="block text-sm mb-2 flex justify-between">
                    <span>FOV:</span>
                    <span className="font-mono">{fov}°</span>
                  </label>
                  <Slider value={[fov]} onValueChange={(v) => { playUISound(); setFov(v[0]); }} min={30} max={90} step={1}>
                    <SliderTrack><SliderRange /></SliderTrack>
                    <SliderThumb />
                    </Slider>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="orbit" checked={orbit} onCheckedChange={(c) => { playUISound(); setOrbit(c as boolean); }} />
                  <label htmlFor="orbit" className="text-sm cursor-pointer">Orbit</label>
                </div>
              </div>

              {/* Effects */}
              <Button size="sm" variant="cooper" onClick={() => { playUISound(); setShowEffects(!showEffects); }} className="w-full justify-between">
                <span>Effects</span>
                {showEffects ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>

              {showEffects && (
                <div className="space-y-2 pl-2">
                  {Object.entries({
                    lorentz: "Lorentz Transform",
                    doppler: "Doppler Shift",
                    beaming: "Relativistic Beaming",
                    disc: "Accretion Disc",
                    // useTexture: "Use Disc Texture",
                  }).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox 
                        id={key}
                        checked={physics[key as keyof typeof physics]} 
                        onCheckedChange={(c) => { playUISound(); setPhysics(p => ({ ...p, [key]: c })); }} 
                      />
                      <label htmlFor={key} className="text-sm cursor-pointer">{label}</label>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 border-t border-neutral-600 space-y-2">
                <Button size="sm" onClick={saveImage} className="w-full flex items-center gap-2 justify-center">
                  <Download className="w-4 h-4" />
                  Save as Image
                </Button>
                <Button size="sm" onClick={toggleFullscreen} className="w-full flex items-center gap-2 justify-center">
                  <Maximize className="w-4 h-4" />
                  {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {uiVisible && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-4 right-4 bg-neutral-950/20 backdrop-blur-lg rounded-sm p-4 text-white"
          >
            <div className="text-xs">
              <div className="flex items-center text-green-500 gap-2">
                <CircleDot className="w-2 h-2 animate-ping" />
                Schwarzschild
              </div>
              <div className="text-neutral-300 mt-1">{fps} FPS</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
   {/* Music Controls - NEW */}
<AnimatePresence>
  {uiVisible && (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: 20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.8, x: 20 }}
      transition={{ 
        type: "spring", 
        stiffness: 500, 
        damping: 25,
        duration: 0.15 
      }}
      className="absolute bottom-14 right-4 hidden md:block"
    >
      <MusicControls />
    </motion.div>
  )}
</AnimatePresence>
      <div className="absolute bottom-4 left-4 text-white text-xs opacity-50">
        Press &apos;H&apos; to {uiVisible ? "hide" : "show"} UI | Press &apos;F&apos; for fullscreen
      </div>

      {/* UI Sound */}
      <audio ref={uiSoundRef} preload="auto">
        <source src="/sounds/ui-click.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
};

export default MainBlackHole;