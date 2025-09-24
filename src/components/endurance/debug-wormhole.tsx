/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  geodesicFragmentShader,
  geodesicVertexShader,
} from "@/lib/geodesic-shader";
import {
  rayTracingFragmentShader,
  rayTracingVertexShader,
} from "@/lib/ray-tracing-shader";
import { SliderRange, SliderThumb, SliderTrack } from "@radix-ui/react-slider";
import {
  Activity,
  BoxIcon,
  Check,
  CircleDot,
  Cpu,
  Disc3Icon,
  ChevronDown,
  ChevronUp,
  Settings,
  Settings2Icon,
  Play,
  Pause,
  MoonStarIcon,
} from "lucide-react";
import React, { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { Slider } from "../ui/slider";
import { Button } from "../ui/button";
import MusicControls from "./music-controls";
import { createTwinklingStarMaterial } from "@/lib/star-shader";
import { WormholeAnnotations } from "@/lib/wormhole-annotations";

interface WormholeParameters {
  rho: number; // Wormhole radius (ρ)
  a: number; // Half-length of cylindrical interior
  M: number; // Lensing parameter
}

interface AdvancedParameters {
  rotationSpeed: number;
  warpingDistance: number;
  ringRadius: number;
  ringSharpness: number;
  ringIntensity: number;
  ringColor: { r: number; g: number; b: number };
  zoom: number;
  maxSteps: number;
  rotationMode: number;
  wormholeRadius: number;
  animationPaused: boolean;
  showParticles: boolean;
}

const DebugWormhole: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const animationIdRef = useRef<number>();
  const annotationsRef = useRef<WormholeAnnotations | null>(null);

  const [parameters, setParameters] = useState<WormholeParameters>({
    rho: 0.3,
    a: 0.002,
    M: 0.53,
  });

  const [cameraPosition, setCameraPosition] = useState({
    distance: 7.0,
    theta: 0,
    phi: 0,
  });

  const [renderMode, setRenderMode] = useState<
    "geometry" | "raytraced" | "geodesic"
  >("raytraced");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [advancedParams, setAdvancedParams] = useState<AdvancedParameters>({
    rotationSpeed: 0.37,
    warpingDistance: 4.0,
    ringRadius: 0.09,
    ringSharpness: 68.0,
    ringIntensity: 0.68,
    ringColor: { r: 0.26, g: 0.45, b: 0.79 },
    zoom: 1.77,
    maxSteps: 365,
    rotationMode: 0,
    wormholeRadius: 0.6,
    animationPaused: false,
    showParticles: true
  });

  const [textures, setTextures] = useState<{
    galaxy?: THREE.Texture;
    saturn?: THREE.Texture; //am no longer using this, had some issues.
    outside?: THREE.Texture;
  }>({});

  // Load textures
  useEffect(() => {
    const loader = new THREE.TextureLoader();

    // Try to load galaxy texture, I obtained them from research paper, there's a link there.
    loader.load(
      "/galaxy.jpg",
      (texture) => {
        texture.generateMipmaps = false;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.flipY = false;
        setTextures((prev) => ({ ...prev, galaxy: texture }));
      },
      undefined,
      (error) => {
        console.log("Galaxy texture not found, using fallback");
        const fallbackTexture = createProceduralGalaxy();
        setTextures((prev) => ({ ...prev, galaxy: fallbackTexture }));
      }
    );
    // Load outside texture (outside wormhole)...
    loader.load(
      "/galaxy_05.jpg",
      (texture) => {
        texture.generateMipmaps = false;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.flipY = false;
        setTextures((prev) => ({ ...prev, outside: texture }));
      },
      undefined,
      (error) => {
        console.log("Outside texture not found, using fallback");
        const fallbackTexture = createStarfield();
        setTextures((prev) => ({ ...prev, outside: fallbackTexture }));
      }
    );

    // Create Saturn-side starfield
    const saturnTexture = createStarfield();
    setTextures((prev) => ({ ...prev, saturn: saturnTexture }));
  }, []);

  const createProceduralGalaxy = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 2048, 2048);

    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      const size = Math.random() * 150 + 50;
      const opacity = Math.random() * 0.4 + 0.1;

      const colors = ["#FF6B9D", "#4ECDC4", "#45B7D1", "#96CEB4", "#FECA57"];
      const color = colors[Math.floor(Math.random() * colors.length)];

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      gradient.addColorStop(
        0,
        color +
          Math.floor(opacity * 255)
            .toString(16)
            .padStart(2, "0")
      );
      gradient.addColorStop(1, "transparent");

      ctx.fillStyle = gradient;
      ctx.fillRect(x - size, y - size, size * 2, size * 2);
    }

    ctx.fillStyle = "#FFFFFF";
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      const brightness = Math.random();
      const size = brightness * 2;
      ctx.globalAlpha = brightness;
      ctx.fillRect(x, y, size, size);
    }
    ctx.globalAlpha = 1;

    return new THREE.CanvasTexture(canvas);
  };

  const createStarfield = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 1024, 512);

    ctx.fillStyle = "#FFFFFF";
    for (let i = 0; i < 1500; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      const brightness = Math.random();
      const size = brightness * 1.5;
      ctx.globalAlpha = brightness;
      ctx.fillRect(x, y, size, size);
    }
    ctx.globalAlpha = 1;

    return new THREE.CanvasTexture(canvas);
  };

  const updateCameraPosition = useCallback(() => {
    if (!cameraRef.current) return;

    const { distance, theta, phi } = cameraPosition;
    const x = distance * Math.sin(theta) * Math.cos(phi);
    const y = distance * Math.sin(theta) * Math.sin(phi);
    const z = distance * Math.cos(theta);

    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(0, 0, 0);
  }, [cameraPosition]);

  const createWormholeGeometry = useCallback(
    (scene: THREE.Scene) => {
      // Remove existing objects
      const existingWormhole = scene.getObjectByName("wormhole");
      const existingRayTracer = scene.getObjectByName("rayTracer");
      const existingGeodesicTracer = scene.getObjectByName("geodesicTracer");

      if (existingWormhole) scene.remove(existingWormhole);
      if (existingRayTracer) scene.remove(existingRayTracer);
      if (existingGeodesicTracer) scene.remove(existingGeodesicTracer);

      if (renderMode === "raytraced" && textures.galaxy) {
        // Simple ray-tracing mode
        const rayTracerGeometry = new THREE.PlaneGeometry(100, 100);
        const rayTracerMaterial = new THREE.ShaderMaterial({
          vertexShader: rayTracingVertexShader,
          fragmentShader: rayTracingFragmentShader,
          uniforms: {
            uRho: { value: parameters.rho },
            uA: { value: parameters.a },
            uM: { value: parameters.M },
            uGalaxyTexture: { value: textures.galaxy },
            uOutsideTexture: { value: textures.outside },
            uCameraPos: { value: new THREE.Vector3() },
            uTime: { value: 0 },
            uAnimationPaused: { value: advancedParams.animationPaused },
uPausedTime: { value: 0 },
            // Advanced parameters
            uRotationSpeed: { value: advancedParams.rotationSpeed },
            uWarpingDistance: { value: advancedParams.warpingDistance },
            uRingRadius: { value: advancedParams.ringRadius },
            uRingSharpness: { value: advancedParams.ringSharpness },
            uRingIntensity: { value: advancedParams.ringIntensity },
            uRingColor: {
              value: new THREE.Vector3(
                advancedParams.ringColor.r,
                advancedParams.ringColor.g,
                advancedParams.ringColor.b
              ),
            },
            uZoom: { value: advancedParams.zoom },
            uRotationMode: { value: advancedParams.rotationMode },
            uMaxSteps: { value: advancedParams.maxSteps },
            uWormholeRadius: { value: advancedParams.wormholeRadius },
          },
          side: THREE.DoubleSide,
        });

        const rayTracer = new THREE.Mesh(rayTracerGeometry, rayTracerMaterial);
        rayTracer.name = "rayTracer";
        scene.add(rayTracer);
    
// Let me add some hollywood stars...
if (advancedParams.showParticles) {
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 1000;
  const starPositions = new Float32Array(starCount * 3);
  const flickerData = new Float32Array(starCount);
  const flickerSpeed = new Float32Array(starCount);

  for (let i = 0; i < starCount; i++) {
    // Create stars in a spherical shell, keeping them far from camera
    const phi = Math.random() * Math.PI * 2;
    const theta = Math.random() * Math.PI;
    const minRadius = 50; // Minimum distance from center
    const maxRadius = 80; // Maximum distance from center
    const radius = minRadius + Math.random() * (maxRadius - minRadius);
    
    starPositions[i * 3] = radius * Math.sin(theta) * Math.cos(phi);
    starPositions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
    starPositions[i * 3 + 2] = radius * Math.cos(theta);
    
    // Flicker attributes
    flickerData[i] = Math.random() * Math.PI * 2; // Random phase
    flickerSpeed[i] = 0.5 + Math.random() * 2.0; // Random speed
  }

  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeometry.setAttribute('flickerData', new THREE.BufferAttribute(flickerData, 1));
  starGeometry.setAttribute('flickerSpeed', new THREE.BufferAttribute(flickerSpeed, 1));

  // Create twinkling star material
  const starMaterial = new THREE.ShaderMaterial(createTwinklingStarMaterial(0.4));
  const stars = new THREE.Points(starGeometry, starMaterial);
  stars.name = 'stars'; // For animation updates
  scene.add(stars);
}

        (rayTracer as any).rayTracerMaterial = rayTracerMaterial;
      } else if (
        renderMode === "geodesic" &&
        textures.galaxy &&
        textures.saturn
      ) {
        // Geodesic ray-tracing mode using imported shaders
        const geodesicGeometry = new THREE.PlaneGeometry(200, 200);
        const geodesicMaterial = new THREE.ShaderMaterial({
          vertexShader: geodesicVertexShader,
          fragmentShader: geodesicFragmentShader,
          uniforms: {
            uRho: { value: parameters.rho },
            uA: { value: parameters.a },
            uM: { value: parameters.M },
            uGalaxyTexture: { value: textures.galaxy },
            uSaturnTexture: { value: textures.saturn },
            uCameraPos: { value: new THREE.Vector3() },
            uTime: { value: 0 },
          },
          side: THREE.DoubleSide,
        });

        const geodesicTracer = new THREE.Mesh(
          geodesicGeometry,
          geodesicMaterial
        );
        geodesicTracer.name = "geodesicTracer";
        scene.add(geodesicTracer);

        (geodesicTracer as any).geodesicMaterial = geodesicMaterial;
      } else {
        // Geometry mode - proper embedding diagram surface
        const group = new THREE.Group();
        group.name = "wormhole";

        // Create the embedding surface using equation (6) from the paper
        const segments = 128;
        const rings = 64;
        const maxL = parameters.a + parameters.M * 5; // Extend beyond throat

        // Custom geometry for the embedding surface
        const embeddingGeometry = new THREE.BufferGeometry();
        const positions = [];
        const indices = [];

        // Generate vertices using r(ℓ) function and embedding equation
        for (let i = 0; i <= rings; i++) {
          const l = (i / rings - 0.5) * 2 * maxL; // ℓ coordinate from -maxL to +maxL
          let r;

          // Compute r(ℓ) using your LtoR function logic
          if (Math.abs(l) <= parameters.a) {
            r = parameters.rho; // Inside throat
          } else {
            const x =
              (2.0 * (Math.abs(l) - parameters.a)) / (Math.PI * parameters.M);
            r =
              parameters.rho +
              parameters.M * (x * Math.atan(x) - 0.5 * Math.log(1.0 + x * x));
          }

          // Create ring of vertices at this ℓ position
          for (let j = 0; j <= segments; j++) {
            const phi = (j / segments) * Math.PI * 2;
            const x = r * Math.cos(phi);
            const y = r * Math.sin(phi);
            const z = l; // ℓ becomes z coordinate

            positions.push(x, y, z);
          }
        }

        // Generate quad wireframe indices instead of triangles
        // Longitudinal lines (along ℓ direction)
        for (let i = 0; i < rings; i++) {
          for (let j = 0; j <= segments; j++) {
            const current = i * (segments + 1) + j;
            const next = (i + 1) * (segments + 1) + j;
            if (i < rings - 1) {
              indices.push(current, next);
            }
          }
        }

        // Circumferential lines (around each ring)
        for (let i = 0; i <= rings; i++) {
          for (let j = 0; j < segments; j++) {
            const current = i * (segments + 1) + j;
            const next = i * (segments + 1) + (j + 1);
            indices.push(current, next);
          }
        }

        embeddingGeometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(positions, 3)
        );
        embeddingGeometry.setIndex(indices);

        const embeddingMaterial = new THREE.LineBasicMaterial({
          color: 0x444444,
          transparent: true,
          opacity: 0.8,
        });

        const embeddingSurface = new THREE.LineSegments(
          embeddingGeometry,
          embeddingMaterial
        );
        embeddingSurface.rotation.z = Math.PI / 2;
        group.add(embeddingSurface);

        // Add throat markers
        const throatRing = new THREE.Mesh(
          new THREE.RingGeometry(
            parameters.rho * 0.98,
            parameters.rho * 1.02,
            64
          ),
          new THREE.MeshBasicMaterial({
            color: 0x20B356,
            transparent: true,
            opacity: 0.8,
          })
        );
        group.add(throatRing);

        // Keep your particles with the improved scaling
        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 1000;
        const particlePositions = new Float32Array(particleCount * 3);
        const maxRadius = Math.max(
          cameraPosition.distance * 1.5,
          parameters.a + parameters.M * 10
        );

        for (let i = 0; i < particleCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const radius = parameters.rho + Math.random() * maxRadius;
          const height = (Math.random() - 0.5) * maxL * 2;

          particlePositions[i * 3] = Math.cos(angle) * radius;
          particlePositions[i * 3 + 1] = Math.sin(angle) * radius;
          particlePositions[i * 3 + 2] = height;
        }

        particleGeometry.setAttribute(
          "position",
          new THREE.BufferAttribute(particlePositions, 3)
        );

        const particleMaterial = new THREE.PointsMaterial({
          color: 0xffffff,
          size: 0.05,
          transparent: true,
          opacity: 0.6,
        });

        const particles = new THREE.Points(particleGeometry, particleMaterial);
        group.add(particles);

        scene.add(group);
         // Add mathematical annotations
  if (!annotationsRef.current) {
    annotationsRef.current = new WormholeAnnotations(scene);
  }
  annotationsRef.current.createAnnotations(parameters);

         // Adding background stars for geometry mode..
if (advancedParams.showParticles) {
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 1000;
  const starPositions = new Float32Array(starCount * 3);
  const flickerData = new Float32Array(starCount);
  const flickerSpeed = new Float32Array(starCount);

  for (let i = 0; i < starCount; i++) {
    // Create stars in a spherical shell, keeping them far from camera
    const phi = Math.random() * Math.PI * 2;
    const theta = Math.random() * Math.PI;
    const minRadius = 50; // Minimum distance from center
    const maxRadius = 80; // Maximum distance from center
    const radius = minRadius + Math.random() * (maxRadius - minRadius);
    
    starPositions[i * 3] = radius * Math.sin(theta) * Math.cos(phi);
    starPositions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
    starPositions[i * 3 + 2] = radius * Math.cos(theta);
    
    // Flicker attributes
    flickerData[i] = Math.random() * Math.PI * 2; // Random phase
    flickerSpeed[i] = 0.5 + Math.random() * 2.0; // Random speed
  }

  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeometry.setAttribute('flickerData', new THREE.BufferAttribute(flickerData, 1));
  starGeometry.setAttribute('flickerSpeed', new THREE.BufferAttribute(flickerSpeed, 1));

  // Create twinkling star material
  const starMaterial = new THREE.ShaderMaterial(createTwinklingStarMaterial(0.4));
  const stars = new THREE.Points(starGeometry, starMaterial);
  stars.name = 'stars'; // For animation updates
  scene.add(stars);
}
      }
    },
    [
      parameters,
      textures,
      renderMode,
      advancedParams,
      cameraPosition,
      rayTracingVertexShader,
      rayTracingFragmentShader,
    ]
  );

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    
 

    createWormholeGeometry(scene);
    updateCameraPosition();

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      if (renderMode === "geometry") {
        const wormhole = scene.getObjectByName("wormhole");
        if (wormhole) {
          wormhole.rotation.z += 0.005;
        }
         // Update annotations with current parameters
// In geometry mode, after creating annotations
if (annotationsRef.current) {
  annotationsRef.current.createAnnotations(parameters);
  console.log("Annotations created, children count:", annotationsRef.current.getChildrenCount());
}
      } else if (renderMode === "raytraced") {
        const rayTracer = scene.getObjectByName("rayTracer");
        if (
          rayTracer &&
          (rayTracer as any).rayTracerMaterial &&
          cameraRef.current
        ) {
          const material = (rayTracer as any).rayTracerMaterial;
          // material.uniforms.uTime.value += 0.02;

          // Only update time if not paused
          if (!advancedParams.animationPaused) {
  material.uniforms.uTime.value += 0.02;
  material.uniforms.uPausedTime.value = material.uniforms.uTime.value;
}
material.uniforms.uAnimationPaused.value = advancedParams.animationPaused;
          material.uniforms.uCameraPos.value.copy(cameraRef.current.position);
          material.uniforms.uRho.value = parameters.rho;
          material.uniforms.uA.value = parameters.a;
          material.uniforms.uM.value = parameters.M;
          // Update advanced parameters
          material.uniforms.uRotationSpeed.value = advancedParams.rotationSpeed;
          material.uniforms.uRotationMode.value = advancedParams.rotationMode;
          material.uniforms.uWarpingDistance.value =
            advancedParams.warpingDistance;
          material.uniforms.uRingRadius.value = advancedParams.ringRadius;
          material.uniforms.uRingSharpness.value = advancedParams.ringSharpness;
          material.uniforms.uWormholeRadius.value =
            advancedParams.wormholeRadius;
          material.uniforms.uRingIntensity.value = advancedParams.ringIntensity;
          material.uniforms.uRingColor.value.set(
            advancedParams.ringColor.r,
            advancedParams.ringColor.g,
            advancedParams.ringColor.b
          );
          material.uniforms.uZoom.value = advancedParams.zoom;
          material.uniforms.uMaxSteps.value = advancedParams.maxSteps;
        }
      } else if (renderMode === "geodesic") {
        const geodesicTracer = scene.getObjectByName("geodesicTracer");
        if (
          geodesicTracer &&
          (geodesicTracer as any).geodesicMaterial &&
          cameraRef.current
        ) {
          const material = (geodesicTracer as any).geodesicMaterial;
          material.uniforms.uTime.value += 0.01;
          material.uniforms.uCameraPos.value.copy(cameraRef.current.position);
          material.uniforms.uRho.value = parameters.rho;
          material.uniforms.uA.value = parameters.a;
          material.uniforms.uM.value = parameters.M;
        }
      }

      // Update star twinkling
const stars = scene.getObjectByName('stars') as THREE.Points;
if (stars && stars.material && (stars.material as THREE.ShaderMaterial).uniforms) {
  (stars.material as THREE.ShaderMaterial).uniforms.uTime.value += 0.01;
}

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;

      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [createWormholeGeometry, updateCameraPosition]);

  useEffect(() => {
    if (sceneRef.current) {
      createWormholeGeometry(sceneRef.current);
    }
  }, [createWormholeGeometry]);

  useEffect(() => {
    updateCameraPosition();
  }, [updateCameraPosition]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={mountRef} className="w-full h-full" />

      {/* Parameter Controls */}
      <div className="absolute top-4 left-4 bg-neutral-950/20 backdrop-blur-lg rounded-sm p-4 text-white max-w-xs max-h-[90vh] overflow-y-auto scrollbar-none">
        <h3 className="text-lg font-semibold mb-3">Wormhole Parameters</h3>

        {/* Render Mode Toggle */}
        <div className="mb-4">
          <label className="block text-sm mb-2">Render Mode:</label>
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={renderMode === "geometry" ? "default" : "secondary"}
              onClick={() => setRenderMode("geometry")}
            >
              Geometry
            </Button>
            <Button
              size="sm"
              variant={renderMode === "raytraced" ? "default" : "secondary"}
              onClick={() => setRenderMode("raytraced")}
            >
              Ray Traced
            </Button>
          </div>
        </div>

        <div className="space-y-6">
         <div>
  <label className="block text-sm mb-2 flex justify-between">
    <span>Radius (ρ):</span>
    <span className="font-mono">{parameters.rho.toFixed(3)}</span>
  </label>
  <Slider
    value={[parameters.rho]}
    onValueChange={(value) =>
      setParameters((prev) => ({ ...prev, rho: value[0] }))
    }
    min={0.3}
    max={2.0}
    step={0.01}
  >
    <SliderTrack>
      <SliderRange />
    </SliderTrack>
    <SliderThumb />
  </Slider>
</div>


         <div>
  <label className="block text-sm mb-2 flex justify-between">
    <span>Length (2a):</span>
    <span className="font-mono">{(2 * parameters.a).toFixed(3)}</span>
  </label>
  <Slider
    value={[parameters.a]}
    onValueChange={(value) =>
      setParameters((prev) => ({ ...prev, a: value[0] }))
    }
    min={0.001}
    max={1.0}
    step={0.001}
  >
    <SliderTrack>
      <SliderRange />
    </SliderTrack>
    <SliderThumb />
  </Slider>
</div>


         <div>
  <label className="block text-sm mb-2 flex justify-between">
    <span>Lensing (M):</span>
    <span className="font-mono">{parameters.M.toFixed(3)}</span>
  </label>
  <Slider
    value={[parameters.M]}
    onValueChange={(value) =>
      setParameters((prev) => ({ ...prev, M: value[0] }))
    }
    min={0.01}
    max={1.0}
    step={0.01}
  >
    <SliderTrack>
      <SliderRange />
    </SliderTrack>
    <SliderThumb />
  </Slider>
</div>


          {/* Camera Controls */}
          <div className="pt-4 border-t border-gray-600">
            <h4 className="text-md font-medium mb-4 text-gray-300">
              Camera Position
            </h4>

            <div className="space-y-4">
              <div>
  <label className="block text-sm mb-2 flex justify-between">
    <span>Distance:</span>
    <span className="font-mono">{cameraPosition.distance.toFixed(2)}</span>
  </label>
  <Slider
    value={[cameraPosition.distance]}
    onValueChange={(value) =>
      setCameraPosition((prev) => ({
        ...prev,
        distance: value[0],
      }))
    }
    min={1.5}
    max={10}
    step={0.1}
  >
    <SliderTrack>
      <SliderRange />
    </SliderTrack>
    <SliderThumb />
  </Slider>
</div>
<div>
  <label className="block text-sm mb-2">Background Particles</label>
  <Button
    size="sm"
    variant={advancedParams.showParticles ? 'default' : 'secondary'}
    onClick={() => setAdvancedParams(prev => ({ ...prev, showParticles: !prev.showParticles }))}
    className="w-full flex items-center gap-2 justify-center"
  >
    {advancedParams.showParticles ? (
      <>
        <CircleDot className="w-4 h-4" />
        Hide Stars
      </>
    ) : (
      <>
        <MoonStarIcon className="w-4 h-4 rotate-6" />
        Show Stars
      </>
    )}
  </Button>
</div>

             <div>
  <label className="block text-sm mb-2 flex justify-between">
    <span>Theta:</span>
    <span className="font-mono">
      {((cameraPosition.theta * 180) / Math.PI).toFixed(1)}°
    </span>
  </label>
  <Slider
    value={[cameraPosition.theta]}
    onValueChange={(value) =>
      setCameraPosition((prev) => ({ ...prev, theta: value[0] }))
    }
    min={0}
    max={Math.PI}
    step={0.01}
  >
    <SliderTrack>
      <SliderRange />
    </SliderTrack>
    <SliderThumb />
  </Slider>
</div>

            </div>
          </div>
        </div>

        {/* Advanced Toggle */}
        <div className="mt-4 pt-4 border-t border-neutral-600">
          <Button
            size="sm"
            variant="cooper"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full justify-between text-neutral-300 hover:text-white"
          >
            <div className="flex items-center gap-2">
              <Settings2Icon className="w-4 h-4 rotate-90" />
              Advanced Parameters
            </div>
            {showAdvanced ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Advanced Parameters */}
        {showAdvanced && (
          <div className="mt-4 space-y-6 border-t border-neutral-600 pt-4">
            <div>
  <label className="block text-sm mb-2 flex justify-between">
    <span>Rotation Speed:</span>
    <span className="font-mono">{advancedParams.rotationSpeed.toFixed(2)}</span>
  </label>
  <Slider
    value={[advancedParams.rotationSpeed]}
    onValueChange={(value) =>
      setAdvancedParams((prev) => ({
        ...prev,
        rotationSpeed: value[0],
      }))
    }
    min={0}
    max={1.0}
    step={0.01}
  >
    <SliderTrack>
      <SliderRange />
    </SliderTrack>
    <SliderThumb />
  </Slider>
</div>


            <div>
  <label className="block text-sm mb-2 flex justify-between">
    <span>Warping Distance:</span>
    <span className="font-mono">{advancedParams.warpingDistance.toFixed(1)}</span>
  </label>
  <Slider
    value={[advancedParams.warpingDistance]}
    onValueChange={(value) =>
      setAdvancedParams((prev) => ({
        ...prev,
        warpingDistance: value[0],
      }))
    }
    min={0.1}
    max={5.0}
    step={0.1}
  >
    <SliderTrack>
      <SliderRange />
    </SliderTrack>
    <SliderThumb />
  </Slider>
</div>

            <div>
              <label className="block text-sm mb-2">Rotation Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant={
                    advancedParams.rotationMode === 0 ? "default" : "secondary"
                  }
                  onClick={() =>
                    setAdvancedParams((prev) => ({ ...prev, rotationMode: 0 }))
                  }
                >
                  Oscillating
                </Button>
                <Button
                  size="sm"
                  variant={
                    advancedParams.rotationMode === 1 ? "default" : "secondary"
                  }
                  onClick={() =>
                    setAdvancedParams((prev) => ({ ...prev, rotationMode: 1 }))
                  }
                >
                  Bounded
                </Button>
                <Button
                  size="sm"
                  variant={
                    advancedParams.rotationMode === 2 ? "default" : "secondary"
                  }
                  onClick={() =>
                    setAdvancedParams((prev) => ({ ...prev, rotationMode: 2 }))
                  }
                >
                  Linear
                </Button>
                <Button
                  size="sm"
                  variant={
                    advancedParams.rotationMode === 3 ? "default" : "secondary"
                  }
                  onClick={() =>
                    setAdvancedParams((prev) => ({ ...prev, rotationMode: 3 }))
                  }
                >
                  Spiral
                </Button>
              </div>
            </div>
            <div>
  <label className="block text-sm mb-2">Time Control</label>
  <Button
  size="sm"
  variant={advancedParams.animationPaused ? 'secondary' : 'default'}
  onClick={() => setAdvancedParams(prev => ({ ...prev, animationPaused: !prev.animationPaused }))}
  className="w-full flex items-center gap-2 justify-center"
>
  {advancedParams.animationPaused ? (
    <>
      <Play className="w-4 h-4" />
      Start Simulation
    </>
  ) : (
    <>
      <Pause className="w-4 h-4" />
      Stop Simulation
    </>
  )}
</Button>
</div>
            <div>
  <label className="block text-sm mb-2 flex justify-between">
    <span>Vignetting:</span>
    <span className="font-mono">{advancedParams.wormholeRadius.toFixed(2)}</span>
  </label>
  <Slider
    value={[advancedParams.wormholeRadius]}
    onValueChange={(value) =>
      setAdvancedParams((prev) => ({
        ...prev,
        wormholeRadius: value[0],
      }))
    }
    min={0.1}
    max={1.5}
    step={0.01}
  >
    <SliderTrack>
      <SliderRange />
    </SliderTrack>
    <SliderThumb />
  </Slider>
</div>


            <div>
  <label className="block text-sm mb-2 flex justify-between">
    <span>Einstein&apos;s Ring Radius:</span>
    <span className="font-mono">{advancedParams.ringRadius.toFixed(2)}</span>
  </label>
  <Slider
    value={[advancedParams.ringRadius]}
    onValueChange={(value) =>
      setAdvancedParams((prev) => ({
        ...prev,
        ringRadius: value[0],
      }))
    }
    min={0.01}
    max={1.0}
    step={0.01}
  >
    <SliderTrack>
      <SliderRange />
    </SliderTrack>
    <SliderThumb />
  </Slider>
</div>


           <div>
  <label className="block text-sm mb-2 flex justify-between">
    <span>Ring Sharpness:</span>
    <span className="font-mono">{advancedParams.ringSharpness.toFixed(1)}</span>
  </label>
  <Slider
    value={[advancedParams.ringSharpness]}
    onValueChange={(value) =>
      setAdvancedParams((prev) => ({
        ...prev,
        ringSharpness: value[0],
      }))
    }
    min={25.0}
    max={100.0}
    step={0.5}
  >
    <SliderTrack>
      <SliderRange />
    </SliderTrack>
    <SliderThumb />
  </Slider>
</div>


           <div>
  <label className="block text-sm mb-2 flex justify-between">
    <span>Ring Intensity:</span>
    <span className="font-mono">{advancedParams.ringIntensity.toFixed(2)}</span>
  </label>
  <Slider
    value={[advancedParams.ringIntensity]}
    onValueChange={(value) =>
      setAdvancedParams((prev) => ({
        ...prev,
        ringIntensity: value[0],
      }))
    }
    min={0}
    max={1.0}
    step={0.01}
  >
    <SliderTrack>
      <SliderRange />
    </SliderTrack>
    <SliderThumb />
  </Slider>
</div>


           <div>
  <label className="block text-sm mb-2 flex justify-between">
    <span>Zoom:</span>
    <span className="font-mono">{advancedParams.zoom.toFixed(2)}</span>
  </label>
  <Slider
    value={[advancedParams.zoom]}
    onValueChange={(value) =>
      setAdvancedParams((prev) => ({ ...prev, zoom: value[0] }))
    }
    min={1.5}
    max={2.0}
    step={0.01}
  >
    <SliderTrack>
      <SliderRange />
    </SliderTrack>
    <SliderThumb />
  </Slider>
</div>


            <div>
  <label className="block text-sm mb-2 flex justify-between">
    <span>Max Steps:</span>
    <span className="font-mono">{advancedParams.maxSteps}</span>
  </label>
  <Slider
    value={[advancedParams.maxSteps]}
    onValueChange={(value) =>
      setAdvancedParams((prev) => ({ ...prev, maxSteps: value[0] }))
    }
    min={270}
    max={400}
    step={5}
  >
    <SliderTrack>
      <SliderRange />
    </SliderTrack>
    <SliderThumb />
  </Slider>
</div>


            {/* Ring Color Controls */}
            <div className="space-y-4">
              <label className="block text-sm">Ring Color:</label>
            <div>
  <label className="block text-xs mb-1 flex justify-between text-neutral-400">
    <span>Red:</span>
    <span className="font-mono">{advancedParams.ringColor.r.toFixed(2)}</span>
  </label>
  <Slider
    value={[advancedParams.ringColor.r]}
    onValueChange={(value) =>
      setAdvancedParams((prev) => ({
        ...prev,
        ringColor: { ...prev.ringColor, r: value[0] },
      }))
    }
    min={0}
    max={1.0}
    step={0.01}
  >
    <SliderTrack>
      <SliderRange />
    </SliderTrack>
    <SliderThumb />
  </Slider>
</div>

              <div>
  <label className="block text-xs mb-1 flex justify-between text-neutral-400">
    <span>Green:</span>
    <span className="font-mono">{advancedParams.ringColor.g.toFixed(2)}</span>
  </label>
  <Slider
    value={[advancedParams.ringColor.g]}
    onValueChange={(value) =>
      setAdvancedParams((prev) => ({
        ...prev,
        ringColor: { ...prev.ringColor, g: value[0] },
      }))
    }
    min={0}
    max={1.0}
    step={0.01}
  >
    <SliderTrack>
      <SliderRange />
    </SliderTrack>
    <SliderThumb />
  </Slider>
</div>

              <div>
  <label className="block text-xs mb-1 flex justify-between text-gray-400">
    <span>Blue:</span>
    <span className="font-mono">{advancedParams.ringColor.b.toFixed(2)}</span>
  </label>
  <Slider
    value={[advancedParams.ringColor.b]}
    onValueChange={(value) =>
      setAdvancedParams((prev) => ({
        ...prev,
        ringColor: { ...prev.ringColor, b: value[0] },
      }))
    }
    min={0}
    max={1.0}
    step={0.01}
  >
    <SliderTrack>
      <SliderRange />
    </SliderTrack>
    <SliderThumb />
  </Slider>
</div>

            </div>
          </div>
        )}

       <div className="mt-3 pt-2 border-t border-neutral-600 text-xs text-neutral-400 flex justify-between">
  <div>
    L-Width: <span className="font-mono">{(1.42953 * parameters.M).toFixed(3)} m</span>
  </div>
  <div>
    T-Area: <span className="font-mono">{(4 * Math.PI * parameters.rho * parameters.rho).toFixed(2)} m²</span>
  </div>
</div>


      </div>

      {/* Status Display */}
      <div className="absolute top-4 right-4 bg-neutral-950/20 backdrop-blur-lg rounded-sm p-4 text-white">
        <div className="text-xs space-y-1">
          {renderMode === "geodesic" ? (
            <div className="flex items-center text-purple-400 gap-2">
              {/* I am no longer using Geodesic rendermode, it was not unnecessary.. */}
              <BoxIcon className="w-4 h-4" /> Geodesic Integration
            </div>
          ) : renderMode === "raytraced" ? (
            <div className="flex items-center text-green-500 gap-2">
              <CircleDot className="w-2 h-2 animate-ping" /> Ray Tracing Active.
            </div>
          ) : (
            <div className="flex items-center text-green-500 gap-2">
              <Disc3Icon className="w-4 h-4 animate-spin" /> Geometry Mode
            </div>
          )}
        </div>
      </div>


        {/* Music Controls - NEW shit */}
      <MusicControls className="absolute bottom-14 right-4" />
    </div>
  );
};

export default DebugWormhole;
