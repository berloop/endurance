"use client";

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Waves, 
  XCircleIcon, 
  CheckCheckIcon, 
  RefreshCcwDotIcon 
} from 'lucide-react';

const TransitionEffects = ({ isOpen, onClose }) => {
  // Default values matching existing ThreeScene implementation
  const DEFAULT_VALUES = {
    transitionType: 'direct',
    transitionSpeed: 0.02
  };

  const transitionTypes = [
    { value: 'direct', label: 'Linear' },
    { value: 'explosion', label: 'Explode' },
    { value: 'swirl', label: 'Swirl' },
  ];

  const [transitionType, setTransitionType] = useState(DEFAULT_VALUES.transitionType);
  const [transitionSpeed, setTransitionSpeed] = useState(DEFAULT_VALUES.transitionSpeed);

  const handleSubmit = () => {
    // Log the current values
    console.log('Transition Effects Applied:', {
      transitionType,
      transitionSpeed
    });

    // Dispatch transition effects change event
    const event = new CustomEvent('breakme:transitionChange', {
      detail: {
        transitionType,
        transitionSpeed
      }
    });
    window.dispatchEvent(event);

    // Close the controls
    if (onClose) onClose();
  };

  const handleReset = () => {
    // Log reset values
    console.log('Transition Effects Reset to Defaults:', DEFAULT_VALUES);

    // Reset to default values
    setTransitionType(DEFAULT_VALUES.transitionType);
    setTransitionSpeed(DEFAULT_VALUES.transitionSpeed);

    // Dispatch reset event
    const event = new CustomEvent('breakme:transitionChange', {
      detail: DEFAULT_VALUES
    });
    window.dispatchEvent(event);
  };

  // Handle escape key to close the controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        console.log('Escape key pressed, closing transition effects panel');
        if (onClose) onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // If not open, don't render anything
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
              <Waves size={20} strokeWidth={1.5} />
              Transition Effects
            </h2>
            <button
              onClick={() => {
                console.log('Close button clicked');
                if (onClose) onClose();
              }}
              className="
                text-neutral-400 
                hover:text-white 
                transition-colors
              "
            >
              <XCircleIcon size={18} strokeWidth={1.5} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Transition Type Selector */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-neutral-300">Transition Type</label>
                <span className="text-neutral-400">
                  <code>
                    {transitionTypes.find(t => t.value === transitionType)?.label}
                  </code>
                </span>
              </div>
              {/* <select
                value={transitionType}
                onChange={(e) => setTransitionType(e.target.value)}
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
                {transitionTypes.map((type) => (
                  <option 
                    key={type.value} 
                    value={type.value}
                    className="bg-neutral-900"
                  >
                    {type.label}
                  </option>
                ))}
              </select> */}
              <Select value={transitionType} onValueChange={(value) => setTransitionType(value)}>
        <SelectTrigger className="w-full p-3 bg-neutral-800 text-white rounded-xl border border-neutral-700">
          <SelectValue placeholder="Select transition type" />
        </SelectTrigger>
        <SelectContent className="bg-neutral-900 text-white border-neutral-700">
          {transitionTypes.map((type) => (
            <SelectItem key={type.value} value={type.value} className="focus:bg-neutral-800 focus:text-white">
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
            </div>

            {/* Transition Speed Slider */}
            <div>
              <div className="flex justify-between items-center">
                <label className="text-neutral-300">Transition Speed</label>
                <span className="text-neutral-400">
                  <code>
                    {transitionSpeed <= 0.01 ? 'Slow' : 
                     transitionSpeed <= 0.03 ? 'Normal' : 
                     'Fast'}
                  </code>
                </span>
              </div>
              <input
                type="range"
                min="0.005"
                max="0.05"
                step="0.005"
                value={transitionSpeed}
                onChange={(e) => setTransitionSpeed(parseFloat(e.target.value))}
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

export default TransitionEffects;