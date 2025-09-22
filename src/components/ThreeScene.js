"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const ThreeScene = () => {
  const containerRef = useRef(null);
  const sceneInitialized = useRef(false);

  useEffect(() => {
    // Only initialize once
    if (sceneInitialized.current || !containerRef.current) return;
    sceneInitialized.current = true;

    // Initialize the Three.js scene
    const preload = () => {
      var typo = null;
      var particle = null;
      let fontLoaded = false;
      let particleLoaded = false;

      console.log("Preload function started");

      // Function to check if everything is loaded and create environment
      function checkAllLoaded() {
        console.log("Checking if all resources loaded:", {
          fontLoaded,
          particleLoaded,
          typoExists: !!typo,
        });
        if (fontLoaded && particleLoaded && typo) {
          console.log("All resources loaded, creating Environment");
          new Environment(typo, particle);
        }
      }

      // Import FontLoader dynamically to avoid TypeScript errors
      import("three/examples/jsm/loaders/FontLoader")
        .then(({ FontLoader }) => {
          console.log("FontLoader imported successfully");
          const loader = new FontLoader();
          loader.load(
            "/data/quentin.json",
            function (font) {
              console.log("Font loaded successfully:", font);
              typo = font;
              fontLoaded = true;
              checkAllLoaded();
            },
            // Progress callback
            function (xhr) {
              console.log((xhr.loaded / xhr.total) * 100 + "% of font loaded");
            },
            // Error callback
            function (err) {
              console.error("Error loading font:", err);
            }
          );
        })
        .catch((error) => {
          console.error("Error importing FontLoader:", error);
        });

      // Load particle texture
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
        "https://res.cloudinary.com/dfvtkoboz/image/upload/v1605013866/particle_a64uzf.png",
        function (texture) {
          console.log("Particle texture loaded successfully");
          particle = texture;
          particleLoaded = true;
          checkAllLoaded();
        },
        // Progress callback
        function (xhr) {
          console.log(
            (xhr.loaded / xhr.total) * 100 + "% of particle texture loaded"
          );
        },
        // Error callback
        function (err) {
          console.error("Error loading particle texture:", err);
        }
      );
    };

    // Class definitions from original code
    class Environment {
      constructor(font, particle) {
        console.log("Environment constructor called with:", {
          fontExists: !!font,
          particleExists: !!particle,
        });
        this.font = font;
        this.particle = particle;
        this.container = containerRef.current;
        console.log("Container element:", {
          exists: !!this.container,
          id: this.container ? this.container.id : null,
          width: this.container ? this.container.clientWidth : null,
          height: this.container ? this.container.clientHeight : null,
        });
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000); // Dark gray background

        // Add test cube to verify rendering
        // const testCube = new THREE.Mesh(
        //   new THREE.BoxGeometry(10, 10, 10),
        //   new THREE.MeshBasicMaterial({ color: 0xff0000 })
        // );
        // testCube.position.z = 50;
        // this.scene.add(testCube);
        // console.log("Added test cube to scene at position:", testCube.position);
        this.createCamera();
        this.createRenderer();
        this.setup();
        this.bindEvents();
        this.setup3DRotation();
      }

      bindEvents() {
        window.addEventListener("resize", this.onWindowResize.bind(this));
      }

      setup() {
        this.createParticles = new CreateParticles(
          this.scene,
          this.font,
          this.particle,
          this.camera,
          this.renderer
        );
      }

      render() {
        this.createParticles.render();
        this.renderer.render(this.scene, this.camera);
      }

      createCamera() {
        this.camera = new THREE.PerspectiveCamera(
          65,
          this.container.clientWidth / this.container.clientHeight,
          1,
          10000
        );
        this.camera.position.set(0, 0, 100);
        console.log("Camera position:", this.camera.position);
      }

      createRenderer() {
        this.renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,

          preserveDrawingBuffer: true, // For Screenshoting.
        });

        // Use window dimensions directly
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Fix for: 'sRGBEncoding' is not exported from 'three'
        // Use the newer property instead:
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;

        this.container.appendChild(this.renderer.domElement);

        console.log(
          "Canvas added to DOM:",
          this.container.contains(this.renderer.domElement)
        );

        // Ensure canvas fills viewport
        this.renderer.domElement.style.width = "100%";
        this.renderer.domElement.style.height = "100%";
        this.renderer.domElement.style.display = "block";
        this.renderer.domElement.style.position = "absolute";
        this.renderer.domElement.style.zIndex = "1";
        this.renderer.domElement.style.background = "rgba(0,0,0,0.1)";

        this.renderer.setAnimationLoop(() => {
          console.log(
            "Animation frame - particles in scene:",
            !!this.createParticles.particles
          );
          this.render();
        });
      }

      onWindowResize() {
        // Update camera
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        // Update renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
      }

      setup3DRotation() {
        this.createParticles.setup3DRotation();
      }
    }

    class CreateParticles {
      constructor(scene, font, particleImg, camera, renderer) {
        this.scene = scene;
        this.font = font;
        this.particleImg = particleImg;
        this.camera = camera;
        this.renderer = renderer;

        // Add this line to expose the instance globally
        window.createParticlesInstance = this;

        // Add these properties to your CreateParticles constructor
        this.enable3DRotation = true;
        this.rotationSpeed = 0.01;
        this.maxRotation = Math.PI / 6; // Maximum rotation in radians (30 degrees)
        this.targetRotation = { x: 0, y: 0, z: 0 };
        this.currentRotation = { x: 0, y: 0, z: 0 };

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2(-200, 200);

        this.colorChange = new THREE.Color();

        this.buttom = false;

        // Add these new properties for multiple text states
        this.textStates = ["Break Me"];
        this.currentTextIndex = 0;
        this.currentText = this.textStates[this.currentTextIndex]; // Track current text
        this.isTransitioning = false;
        this.transitionProgress = 0;
        this.transitionSpeed = 0.02; // Adjust for faster/slower transitions
        this.transitionType = "direct"; // 'direct', 'explosion', 'swirl'
        this.originalPositions = []; // Store original positions for each text state
        this.targetPositions = []; // Store target positions during transition
        this.explosionVelocities = [];
        this.usedIndices = new Set();

        // Load text states from JSON
        this.loadTextStates();

        // Optional: Add automatic transition timer
        this.transitionTimer = setInterval(() => {
          this.transitionToNextText();
        }, 8000); // Change text every 8 seconds

        this.data = {
          text: this.currentText, // Use the current text
          amount: 250,
          particleSize: window.innerWidth < 768 ? 0.8 : 1, // Smaller particles on mobile
          particleColor: 0xffffff,
          textSize: window.innerWidth < 768 ? 10 : 18, // Smaller text on mobile
          area: window.innerWidth < 768 ? 300 : 400, // Adjusted interaction area
          ease: 0.09,
        };

        // Text Rain specific properties
        this.textRainActive = false;
        this.textRainWords = [];
        this.textRainParticles = [];
        this.textRainConfig = {
          words: ["Break", "Create", "Explore", "Dream", "Connect"],
          fallSpeed: 0.5,
          wordSize: 1,
          interactivity: 0.5,
        };

        this.setup();
        this.bindEvents();

        // Add this line at the end of the constructor
        window.createParticlesInstance = this;
      }

      // New method to start text rain
      startTextRain() {
        this.textRainActive = true;
        this.textRainWords = this.textRainConfig.words;
        this.createTextRainParticles();
      }

      createTextRainParticles() {
        // Clear existing particles
        if (this.textRainParticles.length) {
          this.textRainParticles.forEach((particle) =>
            this.scene.remove(particle)
          );
        }
        this.textRainParticles = [];

        // Create particles for each word
        this.textRainWords.forEach((word, index) => {
          // Generate text geometry
          let shapes = this.font.generateShapes(
            word,
            this.textRainConfig.wordSize
          );
          let geometry = new THREE.ShapeGeometry(shapes);

          // Create material
          const material = new THREE.ShaderMaterial({
            uniforms: {
              color: { value: new THREE.Color(0xffffff) },
              pointTexture: { value: this.particleImg },
            },
            vertexShader: document.getElementById("vertexshader").textContent,
            fragmentShader:
              document.getElementById("fragmentshader").textContent,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true,
          });

          // Create initial position for the word (spread across top of screen)
          const xPosition = (index - (this.textRainWords.length - 1) / 2) * 2;

          // Create particle system for this word
          const particleSystem = new THREE.Points(geometry, material);
          particleSystem.position.set(xPosition, 10, 0); // Start high up

          this.scene.add(particleSystem);
          this.textRainParticles.push(particleSystem);
        });
      }

      setup() {
        console.log("CreateParticles.setup called, font exists:", !!this.font);
        const geometry = new THREE.PlaneGeometry(
          this.visibleWidthAtZDepth(100, this.camera),
          this.visibleHeightAtZDepth(100, this.camera)
        );
        const material = new THREE.MeshBasicMaterial({
          color: 0x00ff00,
          transparent: true,
        });
        this.planeArea = new THREE.Mesh(geometry, material);
        this.planeArea.visible = false;
        this.scene.add(this.planeArea);
        this.createText();
      }

      bindEvents() {
        document.addEventListener("mousedown", this.onMouseDown.bind(this));
        document.addEventListener("mousemove", this.onMouseMove.bind(this));
        document.addEventListener("mouseup", this.onMouseUp.bind(this));

        // Touch events - add { passive: false } to allow preventDefault()
        document.addEventListener("touchstart", this.onTouchStart.bind(this), {
          passive: false,
        });
        document.addEventListener("touchmove", this.onTouchMove.bind(this), {
          passive: false,
        });
        document.addEventListener("touchend", this.onTouchEnd.bind(this));

        // Add text transition events
        this.bindTextTransitionEvents();
      }

      // New method to load and randomize text states from JSON
      loadTextStates() {
        fetch("/data/texts.json")
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json();
          })
          .then((data) => {
            if (
              data.textStates &&
              Array.isArray(data.textStates) &&
              data.textStates.length > 0
            ) {
              // Store all words from JSON
              this.allAvailableWords = data.textStates;

              // Initialize with first few words
              this.textStates = ["Break Me"];

              // Add a few initial random words
              this.addMoreRandomWords(4);

              // Update current text
              this.currentText = this.textStates[this.currentTextIndex];
              this.data.text = this.currentText;
            }
          })
          .catch((error) => {
            console.error("Error loading text states:", error);
          });
      }

      // Add this new method for text transition events
      // Add this new method for text transition events
      bindTextTransitionEvents() {
        document.addEventListener(
          "dblclick",
          this.transitionToNextText.bind(this)
        );

        // Store the handler as a class property so we can remove it later
        this.handleKeyDown = (event) => {
          if (event.key === " " || event.key === "Spacebar") {
            this.transitionToNextText();
          } else if (event.key === "1") {
            this.transitionType = "direct";
          } else if (event.key === "2") {
            this.transitionType = "explosion";
          } else if (event.key === "3") {
            this.transitionType = "swirl";
          }
        };

        // Add keyboard control using the stored handler
        document.addEventListener("keydown", this.handleKeyDown);
      }

      // New method to add more random words
      addMoreRandomWords(count = 1) {
        if (!this.allAvailableWords || this.allAvailableWords.length === 0)
          return;

        // If we've used all words, reset the used indices
        if (this.usedIndices.size >= this.allAvailableWords.length) {
          this.usedIndices = new Set();
        }

        for (let i = 0; i < count; i++) {
          let found = false;
          let attempts = 0;
          const maxAttempts = this.allAvailableWords.length * 2; // Avoid infinite loop

          while (!found && attempts < maxAttempts) {
            const randomIndex = Math.floor(
              Math.random() * this.allAvailableWords.length
            );

            // Use this word if we haven't used it before
            if (!this.usedIndices.has(randomIndex)) {
              this.usedIndices.add(randomIndex);
              this.textStates.push(this.allAvailableWords[randomIndex]);
              found = true;
            }
            attempts++;
          }
        }
      }

      // New method to transition to next text
      transitionToNextText() {
        if (this.isTransitioning) return; // Don't start new transition if one is in progress

        // Check if we need to add more words
        if (this.currentTextIndex >= this.textStates.length - 2) {
          this.addMoreRandomWords(3); // Add 3 more words when we're getting close to the end
        }

        // Update the text index
        this.currentTextIndex =
          (this.currentTextIndex + 1) % this.textStates.length;
        this.currentText = this.textStates[this.currentTextIndex];

        // Store current particle positions
        this.storeCurrentPositions();

        // Generate positions for new text
        this.generateTextPositions(this.currentText);

        // Start transition animation
        this.startTransitionAnimation();
      }

      // Store current positions before transition
      storeCurrentPositions() {
        const pos = this.particles.geometry.attributes.position;
        this.originalPositions = [];

        for (let i = 0; i < pos.count; i++) {
          this.originalPositions.push({
            x: pos.getX(i),
            y: pos.getY(i),
            z: pos.getZ(i),
          });
        }
      }

      // Generate positions for new text
      generateTextPositions(text) {
        let shapes = this.font.generateShapes(text, this.data.textSize);
        let geometry = new THREE.ShapeGeometry(shapes);
        geometry.computeBoundingBox();

        const xMid =
          -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
        const yMid =
          (geometry.boundingBox.max.y - geometry.boundingBox.min.y) / 2.85;

        geometry.center();

        let holeShapes = [];

        for (let q = 0; q < shapes.length; q++) {
          let shape = shapes[q];

          if (shape.holes && shape.holes.length > 0) {
            for (let j = 0; j < shape.holes.length; j++) {
              let hole = shape.holes[j];
              holeShapes.push(hole);
            }
          }
        }
        shapes.push.apply(shapes, holeShapes);

        // Generate target positions
        this.targetPositions = [];

        for (let x = 0; x < shapes.length; x++) {
          let shape = shapes[x];
          const amountPoints =
            shape.type == "Path" ? this.data.amount / 2 : this.data.amount;
          let points = shape.getSpacedPoints(amountPoints);

          points.forEach((element) => {
            this.targetPositions.push({
              x: element.x + xMid,
              y: element.y + yMid,
              z: 0,
            });
          });
        }

        // If we have more particles than target positions, repeat the last position
        while (this.targetPositions.length < this.originalPositions.length) {
          this.targetPositions.push(
            this.targetPositions[this.targetPositions.length - 1]
          );
        }

        // If we have more target positions than particles, truncate
        this.targetPositions = this.targetPositions.slice(
          0,
          this.originalPositions.length
        );
      }

      // Start the transition animation
      startTransitionAnimation() {
        this.isTransitioning = true;
        this.transitionProgress = 0;

        // Different transition effects can be triggered here
        if (this.transitionType === "explosion") {
          this.startExplosionTransition();
        } else if (this.transitionType === "swirl") {
          this.startSwirlTransition();
        }
        // 'direct' doesn't need special setup
      }

      // Special transition: explosion effect
      startExplosionTransition() {
        const pos = this.particles.geometry.attributes.position;

        // Add random explosion velocity to each particle
        this.explosionVelocities = [];
        for (let i = 0; i < pos.count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const strength = 2 + Math.random() * 3;
          this.explosionVelocities.push({
            x: Math.cos(angle) * strength,
            y: Math.sin(angle) * strength,
            z: (Math.random() - 0.5) * strength,
          });
        }
      }

      // Special transition: swirl effect
      startSwirlTransition() {
        // Initialize swirl parameters
        this.swirlCenter = {
          x: 0,
          y: 0,
          z: 0,
        };
        this.swirlRadius = 20;
        this.swirlSpeed = 1;
      }

      onMouseDown(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        const vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 0.5);
        vector.unproject(this.camera);
        const dir = vector.sub(this.camera.position).normalize();
        const distance = -this.camera.position.z / dir.z;
        this.currenPosition = this.camera.position
          .clone()
          .add(dir.multiplyScalar(distance));

        this.buttom = true;
        this.data.ease = 0.01;
      }

      setup3DRotation() {
        // Check if DeviceOrientationEvent is available (for mobile gyroscope)
        if (window.DeviceOrientationEvent && "ontouchstart" in window) {
          window.addEventListener(
            "deviceorientation",
            this.handleDeviceOrientation.bind(this)
          );
        } else {
          // Fallback to mouse movement for desktop
          document.addEventListener(
            "mousemove",
            this.handleMouseMove3D.bind(this)
          );
        }
      }

      // Handle device orientation changes
      handleDeviceOrientation(event) {
        if (!this.enable3DRotation) return;

        // Beta is front-to-back tilt
        // Gamma is left-to-right tilt
        const beta = event.beta || 0; // Range: -180 to 180
        const gamma = event.gamma || 0; // Range: -90 to 90

        // Convert to radians and limit range
        this.targetRotation.x = (beta / 180) * this.maxRotation;
        this.targetRotation.y = (gamma / 90) * this.maxRotation;
      }

      // Handle mouse movement for desktop
      handleMouseMove3D(event) {
        if (!this.enable3DRotation) return;

        // Calculate mouse position relative to center of screen
        const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        const mouseY = (event.clientY / window.innerHeight) * 2 - 1;

        // Set target rotation based on mouse position
        this.targetRotation.y = mouseX * this.maxRotation;
        this.targetRotation.x = -mouseY * this.maxRotation;
      }

      // Update 3D rotation in your render method
      update3DRotation() {
        if (!this.enable3DRotation) return;

        // Smoothly interpolate towards target rotation
        this.currentRotation.x +=
          (this.targetRotation.x - this.currentRotation.x) * this.rotationSpeed;
        this.currentRotation.y +=
          (this.targetRotation.y - this.currentRotation.y) * this.rotationSpeed;

        // Apply rotation to particles
        this.particles.rotation.x = this.currentRotation.x;
        this.particles.rotation.y = this.currentRotation.y;
      }

      onMouseUp() {
        this.buttom = false;
        this.data.ease = 0.05;
      }

      onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      }

      onTouchStart(event) {
        // Prevent default to avoid scrolling
        event.preventDefault();

        const touch = event.touches[0];

        this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;

        const vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 0.5);
        vector.unproject(this.camera);
        const dir = vector.sub(this.camera.position).normalize();
        const distance = -this.camera.position.z / dir.z;
        this.currenPosition = this.camera.position
          .clone()
          .add(dir.multiplyScalar(distance));

        this.buttom = true;
        this.data.ease = 0.01;
      }

      onTouchMove(event) {
        // Prevent default to avoid scrolling
        event.preventDefault();

        const touch = event.touches[0];

        this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
      }

      onTouchEnd(/* event */) {
        this.buttom = false;
        this.data.ease = 0.05;
      }

      // Update transition animation
      updateTransition() {
        this.transitionProgress += this.transitionSpeed;

        if (this.transitionProgress >= 1) {
          this.isTransitioning = false;
          this.transitionProgress = 1;

          // Update the reference geometry to match the new text!
          // This is the critical part - we need to update geometryCopy
          // when the transition is complete
          this.geometryCopy = new THREE.BufferGeometry();
          this.geometryCopy.copy(this.particles.geometry);
        }

        const pos = this.particles.geometry.attributes.position;

        for (let i = 0; i < pos.count; i++) {
          let newX, newY, newZ;

          if (this.transitionType === "direct") {
            // Direct linear interpolation
            newX =
              this.originalPositions[i].x +
              (this.targetPositions[i].x - this.originalPositions[i].x) *
                this.transitionProgress;
            newY =
              this.originalPositions[i].y +
              (this.targetPositions[i].y - this.originalPositions[i].y) *
                this.transitionProgress;
            newZ =
              this.originalPositions[i].z +
              (this.targetPositions[i].z - this.originalPositions[i].z) *
                this.transitionProgress;
          } else if (this.transitionType === "explosion") {
            // Explosion effect: particles fly outward then come back
            const midpoint = 0.5;
            if (this.transitionProgress < midpoint) {
              // Flying outward phase
              const t = this.transitionProgress / midpoint;
              newX =
                this.originalPositions[i].x + this.explosionVelocities[i].x * t;
              newY =
                this.originalPositions[i].y + this.explosionVelocities[i].y * t;
              newZ =
                this.originalPositions[i].z + this.explosionVelocities[i].z * t;
            } else {
              // Coming back phase
              const t = (this.transitionProgress - midpoint) / midpoint;
              newX =
                this.originalPositions[i].x +
                this.explosionVelocities[i].x * (1 - t) +
                (this.targetPositions[i].x - this.originalPositions[i].x) * t;
              newY =
                this.originalPositions[i].y +
                this.explosionVelocities[i].y * (1 - t) +
                (this.targetPositions[i].y - this.originalPositions[i].y) * t;
              newZ =
                this.originalPositions[i].z +
                this.explosionVelocities[i].z * (1 - t) +
                (this.targetPositions[i].z - this.originalPositions[i].z) * t;
            }
          } else if (this.transitionType === "swirl") {
            // Swirl effect
            const midpoint = 0.5;
            if (this.transitionProgress < midpoint) {
              // Going into the swirl
              const t = this.transitionProgress / midpoint;
              const angle = t * Math.PI * 4; // 2 complete rotations
              const radius = this.swirlRadius * t;

              newX = this.swirlCenter.x + Math.cos(angle + i * 0.01) * radius;
              newY = this.swirlCenter.y + Math.sin(angle + i * 0.01) * radius;
              newZ = this.swirlCenter.z;
            } else {
              // Coming out of the swirl to the target position
              const t = (this.transitionProgress - midpoint) / midpoint;
              const angle = Math.PI * 4 * (1 - t); // 2 complete rotations (reverse)
              const radius = this.swirlRadius * (1 - t);

              newX =
                this.swirlCenter.x +
                Math.cos(angle + i * 0.01) * radius * (1 - t) +
                this.targetPositions[i].x * t;
              newY =
                this.swirlCenter.y +
                Math.sin(angle + i * 0.01) * radius * (1 - t) +
                this.targetPositions[i].y * t;
              newZ =
                this.swirlCenter.z * (1 - t) + this.targetPositions[i].z * t;
            }
          }

          // Update the particle position
          pos.setXYZ(i, newX, newY, newZ);
        }

        pos.needsUpdate = true;
      }

      // Add this to properly clean up when the component is destroyed
      destroy() {
        if (this.transitionTimer) {
          clearInterval(this.transitionTimer);
        }

        // Remove event listeners
        document.removeEventListener(
          "dblclick",
          this.transitionToNextText.bind(this)
        );
        document.removeEventListener("mousedown", this.onMouseDown.bind(this));
        document.removeEventListener("mousemove", this.onMouseMove.bind(this));
        document.removeEventListener("mouseup", this.onMouseUp.bind(this));
        document.removeEventListener(
          "touchstart",
          this.onTouchStart.bind(this),
          { passive: false }
        );
        document.removeEventListener("touchmove", this.onTouchMove.bind(this), {
          passive: false,
        });
        document.removeEventListener("touchend", this.onTouchEnd.bind(this));

        // Remove 3D rotation event listeners
        if (window.DeviceOrientationEvent && "ontouchstart" in window) {
          window.removeEventListener(
            "deviceorientation",
            this.handleDeviceOrientation.bind(this)
          );
        } else {
          document.removeEventListener(
            "mousemove",
            this.handleMouseMove3D.bind(this)
          );
        }

        // Remove keyboard event listeners
        document.removeEventListener("keydown", this.handleKeyDown);

        // Remove other event listeners as needed
      }

      render() {
        // Add this line at the beginning of your render method
        this.update3DRotation();
      
        // Add this to handle transitions
        if (this.isTransitioning) {
          this.updateTransition();
        }
        
        const time = ((0.001 * performance.now()) % 12) / 12;
        const zigzagTime = (1 + Math.sin(time * 2 * Math.PI)) / 6;
      
        this.raycaster.setFromCamera(this.mouse, this.camera);
      
        // Update shooting stars (replaces text rain)
        if (this.starsActive && this.starSystems && this.starSystems.length) {
          this.updateShootingStars();
        }
      
        const intersects = this.raycaster.intersectObject(this.planeArea);
      
        if (intersects.length > 0) {
          const pos = this.particles.geometry.attributes.position;
          const copy = this.geometryCopy.attributes.position;
          const coulors = this.particles.geometry.attributes.customColor;
          const size = this.particles.geometry.attributes.size;
      
          const mx = intersects[0].point.x;
          const my = intersects[0].point.y;
          // const mz = intersects[0].point.z;
      
          //PARTICLE COLOR DATA IMPLEMENTATION.
          // Determine color based on particleColor data
          const getParticleColor = () => {
            // If custom color data exists, use it
            if (this.data.particleColor) {
              const primaryColor = this.data.particleColor.primary;
              // const secondaryColor = this.data.particleColor.secondary;
              const mode = this.data.particleColor.mode;
      
              switch (mode) {
                case "static":
                  return {
                    h: primaryColor.hsl.h,
                    s: primaryColor.hsl.s,
                    l: primaryColor.hsl.l,
                  };
      
                case "gradient":
                  // Interpolate between primary and custom
                  return {
                    h: (primaryColor.hsl.h + zigzagTime.hsl.h) / 2,
                    s: (primaryColor.hsl.s + zigzagTime.hsl.s) / 2,
                    l: (primaryColor.hsl.l + zigzagTime.hsl.l) / 2,
                  };
      
                case "reactive":
                  // For reactive, use a dynamic color based on interaction
                  return {
                    h: 0.5 + zigzagTime,
                    s: 1.0,
                    l: 0.5,
                  };
      
                default:
                  // Fallback to original default color
                  return { h: 0.5, s: 1, l: 1 };
              }
            }
      
            // If no custom color data, use the original default colors from your existing code
            return { h: 0.5, s: 1, l: 1 };
          };
      
          for (var i = 0, l = pos.count; i < l; i++) {
            const initX = copy.getX(i);
            const initY = copy.getY(i);
            const initZ = copy.getZ(i);
      
            let px = pos.getX(i);
            let py = pos.getY(i);
            let pz = pos.getZ(i);
      
            // Use dynamic color
            const particleColor = getParticleColor();
      
            // this.colorChange.setHSL(0.5, 1, 1);
      
            this.colorChange.setHSL(
              particleColor.h,
              particleColor.s,
              particleColor.l
            );
      
            coulors.setXYZ(
              i,
              this.colorChange.r,
              this.colorChange.g,
              this.colorChange.b
            );
            coulors.needsUpdate = true;
      
            size.array[i] = this.data.particleSize;
            size.needsUpdate = true;
      
            let dx = mx - px;
            let dy = my - py;
            // const dz = mz - pz;
      
            const mouseDistance = this.distance(mx, my, px, py);
            let d = (dx = mx - px) * dx + (dy = my - py) * dy;
            const f = -this.data.area / d;
      
            if (this.buttom) {
              const t = Math.atan2(dy, dx);
              px -= f * Math.cos(t);
              py -= f * Math.sin(t);
      
              this.colorChange.setHSL(0.5 + zigzagTime, 1.0, 0.5);
              coulors.setXYZ(
                i,
                this.colorChange.r,
                this.colorChange.g,
                this.colorChange.b
              );
              coulors.needsUpdate = true;
      
              if (
                px > initX + 70 ||
                px < initX - 70 ||
                py > initY + 70 ||
                py < initY - 70
              ) {
                this.colorChange.setHSL(0.15, 1.0, 0.5);
                coulors.setXYZ(
                  i,
                  this.colorChange.r,
                  this.colorChange.g,
                  this.colorChange.b
                );
                coulors.needsUpdate = true;
              }
            } else {
              if (mouseDistance < this.data.area) {
                if (i % 5 == 0) {
                  const t = Math.atan2(dy, dx);
                  px -= 0.03 * Math.cos(t);
                  py -= 0.03 * Math.sin(t);
      
                  this.colorChange.setHSL(0.15, 1.0, 0.5);
                  coulors.setXYZ(
                    i,
                    this.colorChange.r,
                    this.colorChange.g,
                    this.colorChange.b
                  );
                  coulors.needsUpdate = true;
      
                  size.array[i] = this.data.particleSize / 1.2;
                  size.needsUpdate = true;
                } else {
                  const t = Math.atan2(dy, dx);
                  px += f * Math.cos(t);
                  py += f * Math.sin(t);
      
                  pos.setXYZ(i, px, py, pz);
                  pos.needsUpdate = true;
      
                  size.array[i] = this.data.particleSize * 1.3;
                  size.needsUpdate = true;
                }
      
                if (
                  px > initX + 10 ||
                  px < initX - 10 ||
                  py > initY + 10 ||
                  py < initY - 10
                ) {
                  this.colorChange.setHSL(0.15, 1.0, 0.5);
                  coulors.setXYZ(
                    i,
                    this.colorChange.r,
                    this.colorChange.g,
                    this.colorChange.b
                  );
                  coulors.needsUpdate = true;
      
                  size.array[i] = this.data.particleSize / 1.8;
                  size.needsUpdate = true;
                }
              }
            }
      
            px += (initX - px) * this.data.ease;
            py += (initY - py) * this.data.ease;
            pz += (initZ - pz) * this.data.ease;
      
            pos.setXYZ(i, px, py, pz);
            pos.needsUpdate = true;
          }
        }
      }
// Add these methods to the CreateParticles class constructor or methods
// startTextRain() {
//   console.log("[TextRain] Starting text rain with config:", JSON.stringify(this.textRainConfig, null, 2));
  
//   // Clear any existing text rain particles
//   this.stopTextRain();
  
//   this.textRainActive = true;
//   this.textRainParticles = [];
  
//   // Validate words array
//   if (!this.textRainConfig.words || !Array.isArray(this.textRainConfig.words) || this.textRainConfig.words.length === 0) {
//     console.error("[TextRain] No words provided in config!");
//     return;
//   }

//   console.log(`[TextRain] Creating particles for ${this.textRainConfig.words.length} words`);
  
//   // Create particles for each word
//   this.textRainConfig.words.forEach((word, index) => {
//     console.log(`[TextRain] Creating particles for word: "${word}"`);
    
//     // Generate text geometry
//     const shapes = this.font.generateShapes(word, this.textRainConfig.wordSize * 5); // Increase size for visibility
//     const geometry = new THREE.ShapeGeometry(shapes);
//     geometry.computeBoundingBox();
//     geometry.center(); // Center the geometry
    
//     // Create particles from the geometry
//     const particlesCount = 200; // Number of particles per word
//     const positions = [];
//     const colors = [];
//     const sizes = [];
    
//     // Sample points from the text geometry
//     const tempPoints = [];
    
//     // Process each shape (including holes)
//     for (let q = 0; q < shapes.length; q++) {
//       const shape = shapes[q];
//       const points = shape.getSpacedPoints(Math.floor(particlesCount / shapes.length));
      
//       points.forEach(point => {
//         tempPoints.push({
//           x: point.x,
//           y: point.y,
//           z: 0
//         });
//       });
      
//       // Process holes if any
//       if (shape.holes && shape.holes.length > 0) {
//         for (let j = 0; j < shape.holes.length; j++) {
//           const hole = shape.holes[j];
//           const holePoints = hole.getSpacedPoints(Math.floor(particlesCount / (shapes.length * 2)));
          
//           holePoints.forEach(point => {
//             tempPoints.push({
//               x: point.x,
//               y: point.y,
//               z: 0
//             });
//           });
//         }
//       }
//     }
    
//     console.log(`[TextRain] Generated ${tempPoints.length} points for word "${word}"`);
    
//     // Convert points to position array
//     tempPoints.forEach(point => {
//       positions.push(point.x, point.y, point.z);
      
//       // Add random colors
//       const hue = Math.random();
//       const color = new THREE.Color().setHSL(hue, 1.0, 0.5);
//       colors.push(color.r, color.g, color.b);
      
//       // Add sizes
//       sizes.push(this.data.particleSize * 2); // Make particles more visible
//     });
    
//     // Create particle geometry
//     const particleGeometry = new THREE.BufferGeometry();
//     particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
//     particleGeometry.setAttribute('customColor', new THREE.Float32BufferAttribute(colors, 3));
//     particleGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    
//     // Create particle material (reuse the same shader as main particles)
//     const material = new THREE.ShaderMaterial({
//       uniforms: {
//         color: { value: new THREE.Color(0xffffff) },
//         pointTexture: { value: this.particleImg }
//       },
//       vertexShader: document.getElementById("vertexshader").textContent,
//       fragmentShader: document.getElementById("fragmentshader").textContent,
//       blending: THREE.AdditiveBlending,
//       depthTest: false,
//       transparent: true
//     });
    
//     // Create and position the particle system
//     const particleSystem = new THREE.Points(particleGeometry, material);
    
//     // Spread words across the screen width
//     const screenWidth = this.visibleWidthAtZDepth(100, this.camera);
//     const spacing = screenWidth * 0.8 / this.textRainConfig.words.length;
//     const startX = -screenWidth * 0.4 + spacing / 2;
    
//     particleSystem.position.set(
//       startX + index * spacing,
//       20, // Start high above screen
//       0
//     );
    
//     // Add to scene and track
//     this.scene.add(particleSystem);
//     this.textRainParticles.push({
//       system: particleSystem,
//       originalY: particleSystem.position.y,
//       fallSpeed: this.textRainConfig.fallSpeed * (0.8 + Math.random() * 0.4) // Add slight randomness
//     });
    
//     console.log(`[TextRain] Added word "${word}" at position:`, particleSystem.position);
//   });
  
//   console.log(`[TextRain] Created ${this.textRainParticles.length} word particle systems`);
// }
// Rename methods to match the new functionality
startShootingStars() {
  console.log("[ShootingStars] Starting shooting stars effect with config:", JSON.stringify(this.starsConfig, null, 2));
  
  // Clear any existing stars
  this.stopShootingStars();
  
  this.starsActive = true;
  this.starSystems = [];
  
  // Default config if not set
  this.starsConfig = this.starsConfig || {
    count: 20,
    speed: 0.5,
    size: 1.5,
    trail: 20,
    colors: ['#ffffff', '#44ccff', '#FF9800'], // Default colors
    interactivity: 0.5
  };

  console.log(`[ShootingStars] Creating ${this.starsConfig.count} shooting stars`);
  
  // Create stars
  for (let i = 0; i < this.starsConfig.count; i++) {
    this.createShootingStar(i, this.getRandomStarColor());
  }
  
  console.log(`[ShootingStars] Created ${this.starSystems.length} star systems`);
}

// Add this helper method to create star geometry
createStarGeometry(trailLength, color) {
  const positions = [];
  const colors = [];
  const sizes = [];
  
  for (let i = 0; i <= trailLength; i++) {
    const trailPosition = i * 0.3;
    positions.push(0, trailPosition, 0);
    
    const particleColor = new THREE.Color(color);
    const opacity = Math.pow(1 - (i / trailLength), 1.5);
    colors.push(particleColor.r * opacity, particleColor.g * opacity, particleColor.b * opacity);
    
    const particleSize = this.starsConfig.size * (1 - (i / trailLength) * 0.8) * 2;
    sizes.push(particleSize);
  }
  
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('customColor', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
  
  return geometry;
}

// Create a single shooting star

createShootingStar(index, color) {
  // Create star geometry
  const trailLength = this.starsConfig.trail * 3;
  const geometry = this.createStarGeometry(trailLength, color);
  
  // Create particle material
  const material = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(0xffffff) },
      pointTexture: { value: this.particleImg }
    },
    vertexShader: document.getElementById("vertexshader").textContent,
    fragmentShader: document.getElementById("fragmentshader").textContent,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true
  });
  
  // Create and position the star system
  const starSystem = new THREE.Points(geometry, material);
  
  // Calculate screen dimensions
  const screenWidth = this.visibleWidthAtZDepth(100, this.camera);
  const screenHeight = this.visibleHeightAtZDepth(100, this.camera);
  
  // Position initial star at top of screen with random horizontal position
  starSystem.position.set(
    (Math.random() - 0.5) * screenWidth * 0.8,
    screenHeight * 0.6,
    0
  );
  
  // Add to scene and track
  this.scene.add(starSystem);
  this.starSystems.push({
    system: starSystem,
    speed: this.starsConfig.speed * (2 + Math.random() * 2),
    direction: { x: (Math.random() - 0.5) * 0.3, y: -1 },
    color: color
  });
}

stopShootingStars() {
  console.log("[ShootingStars] Stopping shooting stars effect");
  
  if (this.starSystems && this.starSystems.length) {
    console.log(`[ShootingStars] Removing ${this.starSystems.length} star systems`);
    
    this.starSystems.forEach(starData => {
      this.scene.remove(starData.system);
      starData.system.geometry.dispose();
      starData.system.material.dispose();
    });
    
    this.starSystems = [];
  }
  
  this.starsActive = false;
  console.log("[ShootingStars] Shooting stars stopped");
}

// Helper to get a random color from the config's color array
getRandomStarColor() {
  const colors = this.starsConfig.colors || ['#ffffff'];
  return colors[Math.floor(Math.random() * colors.length)];
}


// Update the updateShootingStars function to match new direction logic

updateShootingStars() {
  if (!this.starsActive || !this.starSystems || this.starSystems.length === 0) {
    return;
  }
  

  const screenHeight = this.visibleHeightAtZDepth(100, this.camera);
  
  // We'll use this to track which stars need to be recreated
  const starsToRecreate = [];
  
  this.starSystems.forEach((starData, index) => {
    // Apply movement based on direction vector
    const moveX = starData.direction.x * starData.speed * 0.5;
    const moveY = starData.direction.y * starData.speed * 0.5;
    
    // Move the star
    starData.system.position.x += moveX;
    starData.system.position.y += moveY;
    
    // Check if star has moved out of view
    if (starData.system.position.y < -screenHeight * 0.6) {
      // Mark this star for recreation
      starsToRecreate.push(index);
    }
  });
  
  // Recreate stars that went off-screen
  // Process in reverse order to avoid index shifting issues
  for (let i = starsToRecreate.length - 1; i >= 0; i--) {
    const index = starsToRecreate[i];
    const starData = this.starSystems[index];
    
    // Remove the old star
    this.scene.remove(starData.system);
    starData.system.geometry.dispose();
    starData.system.material.dispose();
    
    // Remove from array
    this.starSystems.splice(index, 1);
    
    // Create a new star to replace it
    this.createShootingStar(index, this.getRandomStarColor());
  }
}

// Helper method to update star color
updateStarColor(starSystem, newColor) {
  const trailLength = this.starsConfig.trail;
  const colors = starSystem.geometry.attributes.customColor;
  const threeColor = new THREE.Color(newColor);
  
  for (let i = 0; i <= trailLength; i++) {
    const opacity = 1 - (i / trailLength);
    colors.setXYZ(
      i, 
      threeColor.r * opacity, 
      threeColor.g * opacity, 
      threeColor.b * opacity
    );
  }
  
  colors.needsUpdate = true;
}

stopTextRain() {
  console.log("[TextRain] Stopping text rain");
  
  if (this.textRainParticles && this.textRainParticles.length) {
    console.log(`[TextRain] Removing ${this.textRainParticles.length} particle systems`);
    
    this.textRainParticles.forEach(particleData => {
      this.scene.remove(particleData.system);
      particleData.system.geometry.dispose();
      particleData.system.material.dispose();
    });
    
    this.textRainParticles = [];
  }
  
  this.textRainActive = false;
  console.log("[TextRain] Text rain stopped");
}

stopTextRain() {
  console.log("[TextRain] Stopping text rain");
  
  if (this.textRainParticles && this.textRainParticles.length) {
    console.log(`[TextRain] Removing ${this.textRainParticles.length} particle systems`);
    
    this.textRainParticles.forEach(particleData => {
      this.scene.remove(particleData.system);
      particleData.system.geometry.dispose();
      particleData.system.material.dispose();
    });
    
    this.textRainParticles = [];
  }
  
  this.textRainActive = false;
  console.log("[TextRain] Text rain stopped");
}

      //CREATE TEXT METHOD....
      createText() {
        console.log("CreateText called, font exists:", !!this.font);
        let thePoints = [];

        let shapes = this.font.generateShapes(
          this.data.text,
          this.data.textSize
        );
        let geometry = new THREE.ShapeGeometry(shapes);
        geometry.computeBoundingBox();

        const xMid =
          -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
        const yMid =
          (geometry.boundingBox.max.y - geometry.boundingBox.min.y) / 2.85;

        geometry.center();

        let holeShapes = [];

        for (let q = 0; q < shapes.length; q++) {
          let shape = shapes[q];

          if (shape.holes && shape.holes.length > 0) {
            for (let j = 0; j < shape.holes.length; j++) {
              let hole = shape.holes[j];
              holeShapes.push(hole);
            }
          }
        }
        shapes.push.apply(shapes, holeShapes);

        let colors = [];
        let sizes = [];

        for (let x = 0; x < shapes.length; x++) {
          let shape = shapes[x];

          const amountPoints =
            shape.type == "Path" ? this.data.amount / 2 : this.data.amount;

          let points = shape.getSpacedPoints(amountPoints);

          points.forEach((element /* , z */) => {
            const a = new THREE.Vector3(element.x, element.y, 0);
            thePoints.push(a);
            colors.push(
              this.colorChange.r,
              this.colorChange.g,
              this.colorChange.b
            );
            sizes.push(1);
          });
        }

        let geoParticles = new THREE.BufferGeometry().setFromPoints(thePoints);
        geoParticles.translate(xMid, yMid, 0);

        geoParticles.setAttribute(
          "customColor",
          new THREE.Float32BufferAttribute(colors, 3)
        );
        geoParticles.setAttribute(
          "size",
          new THREE.Float32BufferAttribute(sizes, 1)
        );

        const material = new THREE.ShaderMaterial({
          uniforms: {
            color: { value: new THREE.Color(0xffffff) },
            pointTexture: { value: this.particleImg },
          },
          vertexShader: document.getElementById("vertexshader").textContent,
          fragmentShader: document.getElementById("fragmentshader").textContent,

          blending: THREE.AdditiveBlending,
          depthTest: false,
          transparent: true,
        });

        this.particles = new THREE.Points(geoParticles, material);
        this.scene.add(this.particles);

        this.geometryCopy = new THREE.BufferGeometry();
        this.geometryCopy.copy(this.particles.geometry);
      }

      visibleHeightAtZDepth(depth, camera) {
        const cameraOffset = camera.position.z;
        if (depth < cameraOffset) depth -= cameraOffset;
        else depth += cameraOffset;

        const vFOV = (camera.fov * Math.PI) / 180;

        return 2 * Math.tan(vFOV / 2) * Math.abs(depth);
      }

      visibleWidthAtZDepth(depth, camera) {
        const height = this.visibleHeightAtZDepth(depth, camera);
        return height * camera.aspect;
      }

      distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
      }
    }

    // Initialize the scene
    preload();

    // Clean up function
    return () => {
      // Clean up Three.js resources
      if (containerRef.current) {
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
      }

      // Additional cleanup (like event listeners) could be done here
    };
  }, []);

  return <div id="magic" ref={containerRef}></div>;
};

export default ThreeScene;
