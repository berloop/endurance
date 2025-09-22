

"use client";

import { useState, useEffect, useRef } from 'react';
import { Palette, CheckCheckIcon, XCircleIcon } from 'lucide-react';
import { HexColorPicker } from "react-colorful";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const PRESET_COLORS = [
  '#FF6B6B',   // Vibrant Red
  '#4ECDC4',   // Teal
  '#45B7D1',   // Bright Blue
  '#FDCB6E',   // Soft Yellow
  '#6C5CE7',   // Purple
  '#00D8FF',   // Cyan
  '#FF4081',   // Pink
  '#7ED321',   // Bright Green
  '#FF9800',   // Orange
  '#ED2324'    // Deep Purple
];

const ColorPalette = ({ isOpen, onClose }) => {
  const [color, setColor] = useState('#FFFFFF');
  const [colorMode, setColorMode] = useState('static');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef(null);

  const colorModes = [
    { value: 'static', label: 'Static' },
    { value: 'reactive', label: 'Reactive' }
  ];

  const handleSubmit = () => {
    // Dispatch color change event
    const event = new CustomEvent('breakme:colorChange', {
      detail: {
        primaryColor: color, 
        secondaryColor: color,
        colorMode 
      }
    });
    window.dispatchEvent(event);

    // Close the palette
    if (onClose) onClose();
  };

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
        setShowColorPicker(false);
      }
    };

    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColorPicker]);

  // Handle escape key to close the palette or color picker
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showColorPicker) {
          setShowColorPicker(false);
        } else if (isOpen && onClose) {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
              <Palette size={24} strokeWidth={1.5} />
              Color Palette
            </h2>
            {onClose && (
              <button
                onClick={onClose}
                className="
                  text-zinc-400 
                  hover:text-white 
                  transition-colors
                "
              >
                <XCircleIcon size={18} strokeWidth={1.5} />
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Preset Colors */}
            <div className="flex justify-center space-x-2 mb-4 mt-4">
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  onClick={() => setColor(presetColor)}
                  className="
                    w-4 
                    h-4 
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
                    boxShadow: color === presetColor 
                      ? '0 0 0 3px rgba(250,204,21,0.5)' 
                      : 'none'
                  }}
                  aria-label={`Select ${presetColor} color`}
                />
              ))}
            </div>

            {/* Color Picker */}
            <div className="relative">
              <label 
                className="
                  block 
                  text-neutral-300 
                  mb-2
                "
              >
                Color Picker
              </label>
              <div 
                className="
                  w-full 
                  h-16 
                  bg-neutral-800 
                  rounded-xl 
                  border 
                  border-neutral-700
                  cursor-pointer
                  overflow-hidden
                "
                onClick={() => setShowColorPicker(true)}
              >
                <div 
                  className="w-full h-full" 
                  style={{ backgroundColor: color }}
                />
              </div>
              

              {/* WHERE I CUSTOMIZE THE COLOR PICKER */}
              {/* Custom Color Picker Popup */}
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
                  <HexColorPicker color={color} onChange={setColor} />
                  <div className="flex mt-3 gap-2">
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
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
            </div>

            {/* Color Mode Selector */}
            {/* <div>
              <label 
                className="
                  block 
                  text-neutral-300 
                  mb-2
                "
              >
                Color Mode
              </label>
              <select
                value={colorMode}
                onChange={(e) => setColorMode(e.target.value)}
                className="
                  w-full 
                  p-3 
                  bg-neutral-800 
                  text-white 
                  rounded-xl 
                  border 
                  border-neutral-700
                "
              >
                {colorModes.map((mode) => (
                  <option 
                    key={mode.value} 
                    value={mode.value}
                    className="bg-neutral-900"
                  >
                    {mode.label}
                  </option>
                ))}
              </select>
            </div> */}
            
            {/* Color Mode Selector - Using shadcn/ui Select */}
            <div>
              <label
                className="
                  block 
                  text-neutral-300 
                  mb-2
                "
              >
                Color Mode
              </label>
              <Select value={colorMode} onValueChange={setColorMode}>
                <SelectTrigger className="w-full p-3 bg-neutral-800 text-white rounded-xl border border-neutral-700">
                  <SelectValue placeholder="Select color mode" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border border-neutral-700 text-white rounded-md">
                  {colorModes.map((mode) => (
                    <SelectItem
                      key={mode.value}
                      value={mode.value}
                      // className="focus:bg-yellow-500 focus:text-black data-[state=checked]:bg-yellow-500 data-[state=checked]:text-black px-2 rounded-md mb-1"
                      className="focus:bg-neutral-800 focus:text-white mb-1"
                    >
                      {mode.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>


            {/* Color Preview */}
            <div className="mt-4">
              <div 
                className="w-full h-12 rounded-xl" 
                style={{ backgroundColor: color }}
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
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
              <CheckCheckIcon size={18} strokeWidth={1.5} />
              Apply Color
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPalette;