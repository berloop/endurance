"use client";

import { useState, useEffect } from "react";
import {
  XCircleIcon,
  CheckCheckIcon,
  RefreshCcwDotIcon,
  OrbitIcon,
} from "lucide-react";

const PhysicsControls = ({ isOpen, onClose }) => {
  // Function to get default values safely
  const getDefaultValues = () => {
    if (typeof window !== "undefined") {
      return {
        particleSize: window.innerWidth < 768 ? 0.8 : 1,
        interactionArea: window.innerWidth < 768 ? 300 : 400,
        ease: 0.09,
        rotationSpeed: 0.01,
        maxRotation: Math.PI / 6,
      };
    }

    // Fallback default values
    return {
      particleSize: 1,
      interactionArea: 400,
      ease: 0.09,
      rotationSpeed: 0.01,
      maxRotation: Math.PI / 6,
    };
  };
  // Use the function to get initial default values
  const DEFAULT_VALUES = getDefaultValues();

  // // Initial default values matching ThreeScene component
  // const DEFAULT_VALUES = {
  //   particleSize: window.innerWidth < 768 ? 0.8 : 1,
  //   interactionArea: window.innerWidth < 768 ? 300 : 400,
  //   ease: 0.09,
  //   rotationSpeed: 0.01,
  //   maxRotation: Math.PI / 6,
  // };

  const [particleSize, setParticleSize] = useState(DEFAULT_VALUES.particleSize);
  const [interactionArea, setInteractionArea] = useState(
    DEFAULT_VALUES.interactionArea
  );
  const [ease, setEase] = useState(DEFAULT_VALUES.ease);
  const [rotationSpeed, setRotationSpeed] = useState(
    DEFAULT_VALUES.rotationSpeed
  );
  const [maxRotation, setMaxRotation] = useState(DEFAULT_VALUES.maxRotation);

  const handleSubmit = () => {
    // Log the current values
    console.log("Physics Values Applied:", {
      particleSize,
      interactionArea,
      ease,
      rotationSpeed,
      maxRotation,
    });

    // Dispatch physics change event
    const event = new CustomEvent("breakme:physicsChange", {
      detail: {
        particleSize,
        interactionArea,
        ease,
        rotationSpeed,
        maxRotation,
      },
    });
    window.dispatchEvent(event);

    // Close the controls
    if (onClose) onClose();
  };

  const handleReset = () => {
    // Log reset values
    console.log("Physics Values Reset to Defaults:", DEFAULT_VALUES);

    // Reset to default values
    setParticleSize(DEFAULT_VALUES.particleSize);
    setInteractionArea(DEFAULT_VALUES.interactionArea);
    setEase(DEFAULT_VALUES.ease);
    setRotationSpeed(DEFAULT_VALUES.rotationSpeed);
    setMaxRotation(DEFAULT_VALUES.maxRotation);

    // Dispatch reset event
    const event = new CustomEvent("breakme:physicsChange", {
      detail: DEFAULT_VALUES,
    });
    window.dispatchEvent(event);
  };

  // Handle escape key to close the controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && onClose) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="
        fixed 
        top-1/2 
        left-32 
        transform 
        -translate-y-1/2 
        z-50 
        transition-all 
        duration-300
      "
    >
      <div
        className="
          bg-neutral-900 
          text-neutral-400 
          rounded-3xl 
          w-80 
          shadow-2xl 
          border 
          border-neutral-800
        "
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2
              className="
                text-zinc-300
                text-xl 
                font-medium
                flex 
                items-center 
                gap-2
              "
            >
              <OrbitIcon size={20} strokeWidth={1.5} />
              Particles Control
            </h2>
            {onClose && (
              <button
                onClick={onClose}
                className="
                  text-neutral-400 
                  hover:text-white 
                  transition-colors
                "
              >
                <XCircleIcon size={18} strokeWidth={1.5} />
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Particle Size Slider */}
            <div>
              <div className="flex justify-between items-center">
                <label className="text-neutral-300">Particle Size</label>
                <span className="text-neutral-400">
                  <code>{particleSize.toFixed(2)}</code>
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={particleSize}
                onChange={(e) => setParticleSize(parseFloat(e.target.value))}
                className="
      w-full 
      h-2 
      bg-neutral-800 
      rounded-xl 
      appearance-none
      cursor-pointer
      [&::-webkit-slider-thumb]:appearance-none
      [&::-webkit-slider-thumb]:w-4
      [&::-webkit-slider-thumb]:h-4
      [&::-webkit-slider-thumb]:bg-yellow-500
      [&::-webkit-slider-thumb]:rounded-full
    "
              />
            </div>

            {/* Interaction Area Slider */}
            <div>
              <div className="flex justify-between items-center">
                <label
                  className="
                  text-neutral-300 
                "
                >
                  Space Area
                </label>
                <span className="text-neutral-400">
                  <code>{interactionArea}</code>
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="800"
                step="10"
                value={interactionArea}
                onChange={(e) => setInteractionArea(parseInt(e.target.value))}
                className="
                  w-full 
                  h-2 
                  bg-neutral-800 
                  rounded-xl 
                  appearance-none
                  cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:bg-yellow-500
                  [&::-webkit-slider-thumb]:rounded-full
                "
              />
            </div>

            {/* Ease (Return Speed) Slider */}
            <div>
              <div className="flex justify-between items-center">
                <label
                  className="
                  text-neutral-300"
                >
                  Return Speed
                </label>
                <span className="text-neutral-400">
                  {/* <code> {ease.toFixed(3)}</code> */}
                  {/* <code>
                    {ease <= 0.03 ? "Slow" : ease <= 0.07 ? "Normal" : "Fast"}
                  </code> */}
                  <code>
                    {ease <= 0.02
                      ? "Docking"
                      : ease <= 0.04
                      ? "Slow"
                      : ease <= 0.07
                      ? "Normal"
                      : ease <= 0.12
                      ? "Fast"
                      : "Interstellar"}
                  </code>
                </span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.2"
                step="0.01"
                value={ease}
                onChange={(e) => setEase(parseFloat(e.target.value))}
                className="
                  w-full 
                  h-2 
                  bg-neutral-800 
                  rounded-xl 
                  appearance-none
                  cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:bg-yellow-500
                  [&::-webkit-slider-thumb]:rounded-full
                "
              />
            </div>

            {/* Rotation Speed Slider */}
            <div>
              <div className="flex justify-between items-center">
                <label
                  className="
                  text-neutral-300 
                "
                >
                  Rotation Speed
                </label>
                <span className="text-neutral-400">
                  {/* <code> {rotationSpeed.toFixed(3)}</code> */}
                  <code>
                    {rotationSpeed <= 0.005
                      ? "Gentle"
                      : rotationSpeed <= 0.02
                      ? "Moderate"
                      : rotationSpeed <= 0.04
                      ? "Rage"
                      : "Cosmic"}
                  </code>
                </span>
              </div>
              <input
                type="range"
                min="0.001"
                max="0.05"
                step="0.001"
                value={rotationSpeed}
                onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
                className="
                  w-full 
                  h-2 
                  bg-neutral-800 
                  rounded-xl 
                  appearance-none
                  cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:bg-yellow-500
                  [&::-webkit-slider-thumb]:rounded-full
                "
              />
            </div>

            {/* Max Rotation Slider */}
            <div>
              <div className="flex justify-between items-center">
                <label
                  className="
              
                  text-neutral-300 
                  mb-2
                "
                >
                  Space Rotation
                </label>
                <span className="text-neutral-400">
                  <code> {((maxRotation * 180) / Math.PI).toFixed(0)}°</code>
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.01"
                value={maxRotation}
                onChange={(e) => setMaxRotation(parseFloat(e.target.value))}
                className="
                  w-full 
                  h-2 
                  bg-neutral-800 
                  rounded-xl 
                  appearance-none
                  cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:bg-yellow-500
                  [&::-webkit-slider-thumb]:rounded-full
                "
              />
            </div>
          </div>

          <div className="flex justify-end mt-6 space-x-2">
            <button
              onClick={handleReset}
              className="
          bg-neutral-800 
          hover:bg-neutral-700 
          text-neutral-300 
          rounded-xl 
          px-4 
          py-2 
          flex 
          items-center 
          gap-2 
          transition-colors
        "
            >
              <RefreshCcwDotIcon size={10} strokeWidth={1.5} />
              Reset
            </button>
            <button
              onClick={handleSubmit}
              className="
                bg-neutral-700 
                hover:bg-yellow-500 
                text-white 
                rounded-xl 
                px-4 
                py-2 
                flex 
                items-center 
                gap-2 
                transition-colors 
                hover:text-black
              "
            >
              <CheckCheckIcon size={16} strokeWidth={1.5} />
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhysicsControls;
