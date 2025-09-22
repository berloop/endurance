"use client";

import { useState, useEffect, useRef } from "react";
import {
  SparklesIcon,
  XCircleIcon,
  PlusIcon,
  TrashIcon,
  MoveHorizontalIcon,
  RefreshCcwIcon,
  WandSparklesIcon,
  Trash2Icon,
} from "lucide-react";
import { HexColorPicker } from "react-colorful";

const PRESET_COLORS = [
  "#FFFFFF", // White
  "#44CCFF", // Sky Blue
  "#FF44AA", // Pink
  "#FDCB6E", // Soft Yellow
  "#eab308", // Yellow
  "#7ED321", // Bright Green
  "#FF9800", // Orange
  "#6C5CE7", // Purple
  // Vibrant Red
];

const ShootingStarsControls = ({ isOpen, onClose }) => {
  // Default configuration for Shooting Stars
  const DEFAULT_VALUES = {
    count: 5,
    speed: 0.2,
    size: 0.8,
    trail: 50,
    colors: ["#ffffff", "#44ccff", "#eab308"],
    interactivity: 0.5,
  };

  const [count, setCount] = useState(DEFAULT_VALUES.count);
  const [speed, setSpeed] = useState(DEFAULT_VALUES.speed);
  const [size, setSize] = useState(DEFAULT_VALUES.size);
  const [trail, setTrail] = useState(DEFAULT_VALUES.trail);
  const [interactivity, setInteractivity] = useState(
    DEFAULT_VALUES.interactivity
  );
  const [colors, setColors] = useState(DEFAULT_VALUES.colors);
  const [newColor, setNewColor] = useState("#ffffff");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef(null);

  const addColor = () => {
    if (newColor && !colors.includes(newColor)) {
      setColors([...colors, newColor]);
      setShowColorPicker(false);
    }
  };

  const removeColor = (colorToRemove) => {
    setColors(colors.filter((color) => color !== colorToRemove));
  };

  const handleSubmit = () => {
    // Dispatch shooting stars configuration event
    const event = new CustomEvent("breakme:starsChange", {
      detail: {
        count,
        speed,
        size,
        trail,
        colors,
        interactivity,
      },
    });
    window.dispatchEvent(event);

    // Close the controls
    if (onClose) onClose();
  };

  const handleReset = () => {
    // Reset to default values
    setCount(DEFAULT_VALUES.count);
    setSpeed(DEFAULT_VALUES.speed);
    setSize(DEFAULT_VALUES.size);
    setTrail(DEFAULT_VALUES.trail);
    setColors(DEFAULT_VALUES.colors);
    setInteractivity(DEFAULT_VALUES.interactivity);

    // Dispatch reset event
    const event = new CustomEvent("breakme:starsChange", {
      detail: DEFAULT_VALUES,
    });
    window.dispatchEvent(event);
  };

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target)
      ) {
        setShowColorPicker(false);
      }
    };

    if (showColorPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showColorPicker]);

  // Handle escape key to close the controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (showColorPicker) {
          setShowColorPicker(false);
        } else if (isOpen && onClose) {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, showColorPicker]);

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
              <SparklesIcon size={20} strokeWidth={1.5} />
              Shooting Stars
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
            {/* Star Count Slider */}
            <div>
              <div className="flex justify-between items-center">
                <label className="text-neutral-300">Star Count</label>
                <span className="text-neutral-400">
                  <code>{count}</code>
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
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

            {/* Fall Speed Slider */}
            <div>
              <div className="flex justify-between items-center">
                <label className="text-neutral-300">Speed</label>
                <span className="text-neutral-400">
                  <code>
                    {speed <= 0.2 ? "Orbital" : speed <= 0.5 ? "Normal" : "Interstellar"}
                  </code>
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
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

            {/* Star Size Slider */}
            <div>
              <div className="flex justify-between items-center">
                <label className="text-neutral-300">Star Size</label>
                <span className="text-neutral-400">
                  <code>
                  {size <= 1 ? "Shooting Star" : size <= 1.5 ? "Comet" : "Planet-Killer"}

                  </code>
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"  
                value={size}
                onChange={(e) => setSize(parseFloat(e.target.value))}
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

            {/* Trail Length Slider */}
            <div>
              <div className="flex justify-between items-center">
                <label className="text-neutral-300">
                  <div className="flex items-center gap-1">
                    <MoveHorizontalIcon size={12} />
                    Trail Length
                  </div>
                </label>
                <span className="text-neutral-400">
                <code>
      {trail <= 50 ? "Nebula Drift" : trail <= 100 ? "Solar Flare" : trail <= 150 ? "Warp Wake" : "Event Horizon"}
    </code>
                </span>
              </div>
              <input
                type="range"
                min="10" // Higher minimum for more visible trails
                max="190" // Much higher maximum for dramatic shooting star effects
                step="10" // Larger steps for bigger changes
                value={trail}
                onChange={(e) => setTrail(parseInt(e.target.value))}
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

            {/* Preset Colors */}
            <div>
              <label className="block text-neutral-300 mb-2">
                Preset Colors
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {PRESET_COLORS.map((presetColor) => (
                  <button
                    key={presetColor}
                    onClick={() => setNewColor(presetColor)}
                    className="
                      w-6 
                      h-6 
                      rounded-full 
                      hover:scale-110 
                      transition-transform
                      border-2
                      border-neutral-700
                      focus:outline-none
                      focus:ring-2
                      focus:ring-yellow-500
                    "
                    style={{
                      backgroundColor: presetColor,
                      boxShadow:
                        newColor === presetColor
                          ? "0 0 0 2px rgba(250,204,21,0.5)"
                          : "none",
                    }}
                    aria-label={`Select ${presetColor} color`}
                  />
                ))}
              </div>
            </div>

            {/* Color Management with HexColorPicker */}
            <div className="relative">
              <label className="block text-neutral-300 mb-2">Colors Picker</label>
              <div className="flex space-x-2 mb-2">
                <div
                  className="
                    w-12
                    h-10
                    border
                    border-neutral-700
                    rounded-xl
                    bg-transparent
                    cursor-pointer
                    flex
                    items-center
                    justify-center
                    overflow-hidden
                  "
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  style={{ backgroundColor: newColor }}
                ></div>
                <button
                  onClick={addColor}
                  className="
                    bg-neutral-700 
                    hover:bg-yellow-500 
                    text-white 
                    rounded-xl 
                    p-2 
                    transition-colors 
                    hover:text-black
                  "
                >
                  <PlusIcon size={16} strokeWidth={1.5} />
                </button>
              </div>

              {/* Color Picker Popup */}
              {showColorPicker && (
                <div
                  ref={colorPickerRef}
                  className="
                    absolute 
                    z-50 
                    bg-neutral-800 
                    p-2
                    mr-2
                    rounded-xl
                    border 
                    -top-20
                    left-80
                    border-neutral-700 
                    shadow-xl
                  "
                >
                  <HexColorPicker color={newColor} onChange={setNewColor} />
                  <div className="flex mt-3 gap-2">
                    <input
                      type="text"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      className="
                        flex-1
                        bg-neutral-700
                        border
                        border-neutral-600
                        text-white
                        p-2
                        rounded-lg
                        text-sm
                      "
                    />
                    <button
                      onClick={() => setShowColorPicker(false)}
                      className="
                        bg-neutral-600
                        hover:bg-neutral-500
                        text-white
                        p-2
                        rounded-lg
                        text-sm
                      "
                    >
                      OK
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <div
                    key={color}
                    className="
                      bg-neutral-800 
                      text-neutral-300 
                      px-2 
                      py-1 
                      rounded-lg 
                      flex 
                      items-center 
                      space-x-2
                    "
                  >
                    <div
                      className="w-4 h-4 rounded-md mr-1"
                      style={{ backgroundColor: color }}
                    ></div>
                    <span>{color}</span>
                    <button
                      onClick={() => removeColor(color)}
                      className="
                        text-neutral-400 
                        hover:text-white 
                        transition-colors
                      "
                    >
                      <TrashIcon size={10} strokeWidth={1.5} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        
          <div className="flex justify- mt-6 space-x-2">
              
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
              <RefreshCcwIcon size={12} strokeWidth={1.5} />
              Reset
            </button>
            <button
      onClick={() => {
        const event = new CustomEvent('breakme:starsStop');
        window.dispatchEvent(event);
        if (onClose) onClose();
      }}
      className="
        flex-1
        bg-neutral-800 
        hover:bg-pink-800
        text-neutral-300 
        rounded-xl 
        px-4 
        py-2 
        flex 
        items-center 
        justify-center
        gap-2 
        transition-colors
        hover:text-white
      "
    >
      <Trash2Icon size={10} strokeWidth={1.5} />
      Destroy
    </button>

         
          </div>
           {/* Bottom row with Stop button taking full width */}
           <div className="my-4">
  
  <button
      onClick={handleSubmit}
      className="
        w-full
        bg-neutral-700 
        hover:bg-yellow-500 
        text-white 
        rounded-xl 
        py-2 
        flex 
        items-center 
        justify-center
        gap-2 
        transition-colors 
        hover:text-black
      "
    >
      <WandSparklesIcon size={12} strokeWidth={1.5} />
      Apply Effects
    </button>
  </div>
        </div>
      </div>
    </div>
  );
};

export default ShootingStarsControls;
