// components/blackhole/main-blackhole.tsx

"use client";

import { SliderRange, SliderThumb, SliderTrack } from "@radix-ui/react-slider";
import { CircleDot, ChevronDown, ChevronUp } from "lucide-react";
import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { Slider } from "../ui/slider";
import { Button } from "../ui/button";
import { AnimatePresence, motion } from "framer-motion";

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
  if (speed > 0.0){float gamma = 1.0/sqrt(1.0-dot(v,v));
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
  
  vec4 color = vec4(0.0,0.0,0.0,1.0);
  
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
  
  if (distance > 1.0){
    ray_dir = normalize(point - oldpoint);
    vec2 tex_coord = to_spherical(ray_dir * ROT_Z(45.0 * DEG_TO_RAD));
    
    // Star texture with encoded data
    vec4 star_color = texture2D(star_texture, tex_coord);
    if (star_color.g > 0.0){
      float star_temperature = (MIN_TEMPERATURE + TEMPERATURE_RANGE*star_color.r);
      float star_velocity = star_color.b - 0.5;
      float star_doppler_factor = sqrt((1.0+star_velocity)/(1.0-star_velocity));
      if (doppler_shift)
        star_temperature /= ray_doppler_factor*star_doppler_factor;
      color += vec4(temp_to_color(star_temperature),1.0)* star_color.g;
    }
    
    color += texture2D(bg_texture, tex_coord) * 0.25;
  }
  
  gl_FragColor = color*ray_intensity;
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
  const [uiVisible, setUiVisible] = useState(true);
  const [fps, setFps] = useState(60);
  const frameTimeRef = useRef(performance.now());
  const fpsHistory = useRef<number[]>([]);
  const lastFpsUpdate = useRef(0);

  const [distance, setDistance] = useState(10.0);
  const [theta, setTheta] = useState(0);
  const [incline, setIncline] = useState(-5 * Math.PI / 180);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');

  const [physics, setPhysics] = useState({
    lorentz: true,
    doppler: true,
    beaming: true,
    disc: true,
    useTexture: true, // Enable texture by default
  });

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Load actual textures
    const textureLoader = new THREE.TextureLoader();
    const bgTexture = textureLoader.load('/blackhole/milkyway.jpg');
    const starTexture = textureLoader.load('/blackhole/star_noise.png');
    const discTexture = textureLoader.load('/blackhole/accretion_disk.png');

    // Configure textures
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
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        cam_pos: { value: new THREE.Vector3() },
        cam_dir: { value: new THREE.Vector3(0, 0, -1) },
        cam_up: { value: new THREE.Vector3(0, 1, 0) },
        fov: { value: 90 },
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

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

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

      const r = distance;
      const cos = Math.cos(theta);
      const sin = Math.sin(theta);
      const pos = new THREE.Vector3(r * sin, 0, r * cos);
      const inclineMatrix = new THREE.Matrix4().makeRotationX(incline);
      pos.applyMatrix4(inclineMatrix);

      const maxAngularVel = 1 / Math.sqrt(2.0 * (r - 1.0)) / r;
      const vel = new THREE.Vector3(cos * maxAngularVel, 0, -sin * maxAngularVel);
      vel.applyMatrix4(inclineMatrix);

      const dir = new THREE.Vector3(0, 0, 0).sub(pos).normalize();
      const up = new THREE.Vector3(0, 1, 0);

      material.uniforms.time.value += 0.01;
      material.uniforms.cam_pos.value.copy(pos);
      material.uniforms.cam_dir.value.copy(dir);
      material.uniforms.cam_up.value.copy(up);
      material.uniforms.cam_vel.value.copy(vel);
      material.uniforms.accretion_disk.value = physics.disc;
      material.uniforms.use_disk_texture.value = physics.useTexture;
      material.uniforms.doppler_shift.value = physics.doppler;
      material.uniforms.lorentz_transform.value = physics.lorentz;
      material.uniforms.beaming.value = physics.beaming;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      material.uniforms.resolution.value.set(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      material.dispose();
    };
  }, [quality]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "h" || e.key === "H") setUiVisible(!uiVisible);
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [uiVisible]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={mountRef} className="w-full h-full" />

      <AnimatePresence>
        {uiVisible && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-4 left-4 bg-neutral-950/20 backdrop-blur-lg rounded-sm p-4 text-white max-w-xs"
          >
            <h3 className="text-lg font-semibold mb-3">Schwarzschild Black Hole</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 flex justify-between">
                  <span>Distance:</span>
                  <span className="font-mono">{distance.toFixed(1)}M</span>
                </label>
                <Slider value={[distance]} onValueChange={(v) => setDistance(v[0])} min={3} max={20} step={0.5}>
                  <SliderTrack><SliderRange /></SliderTrack>
                  <SliderThumb />
                </Slider>
              </div>

              <div>
                <label className="block text-sm mb-2 flex justify-between">
                  <span>Angle:</span>
                  <span className="font-mono">{Math.round(theta * 180 / Math.PI)}°</span>
                </label>
                <Slider value={[theta]} onValueChange={(v) => setTheta(v[0])} min={0} max={Math.PI * 2} step={0.01}>
                  <SliderTrack><SliderRange /></SliderTrack>
                  <SliderThumb />
                </Slider>
              </div>

              <div>
                <label className="block text-sm mb-2 flex justify-between">
                  <span>Incline:</span>
                  <span className="font-mono">{Math.round(incline * 180 / Math.PI)}°</span>
                </label>
                <Slider value={[incline]} onValueChange={(v) => setIncline(v[0])} min={-Math.PI / 2} max={Math.PI / 2} step={0.01}>
                  <SliderTrack><SliderRange /></SliderTrack>
                  <SliderThumb />
                </Slider>
              </div>

              <div>
                <label className="block text-sm mb-2">Quality:</label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map((q) => (
                    <Button key={q} size="sm" variant={quality === q ? "default" : "secondary"} onClick={() => setQuality(q)}>
                      {q}
                    </Button>
                  ))}
                </div>
              </div>

              <Button size="sm" variant="cooper" onClick={() => setShowAdvanced(!showAdvanced)} className="w-full justify-between">
                <span>Physics</span>
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>

              {showAdvanced && (
                <div className="space-y-2 pt-2 border-t border-neutral-600">
                  {Object.entries({
                    lorentz: "Lorentz Transform",
                    doppler: "Doppler Shift",
                    beaming: "Relativistic Beaming",
                    disc: "Accretion Disc",
                    useTexture: "Use Disc Texture",
                  }).map(([key, label]) => (
                    <Button
                      key={key}
                      size="sm"
                      variant={physics[key as keyof typeof physics] ? "default" : "secondary"}
                      onClick={() => setPhysics((p) => ({ ...p, [key]: !p[key as keyof typeof p] }))}
                      className="w-full"
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              )}
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

      <div className="absolute bottom-4 left-4 text-white text-xs opacity-50">
        Press &apos;H&apos; to {uiVisible ? "hide" : "show"} UI
      </div>
    </div>
  );
};

export default MainBlackHole;