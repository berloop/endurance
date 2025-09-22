"use client";

import { useState, useEffect } from 'react';
import { 
  Droplets, 
  XCircleIcon, 
  CheckCheckIcon, 
  PlusIcon, 
  TrashIcon 
} from 'lucide-react';

const TextRainControls = ({ isOpen, onClose }) => {
  // Default configuration for Text Rain
  const DEFAULT_VALUES = {
    words: ['Break', 'Create', 'Explore', 'Dream', 'Connect'],
    fallSpeed: 0.5,
    wordSize: 1,
    interactivity: 0.5
  };

  const [words, setWords] = useState(DEFAULT_VALUES.words);
  const [newWord, setNewWord] = useState('');
  const [fallSpeed, setFallSpeed] = useState(DEFAULT_VALUES.fallSpeed);
  const [wordSize, setWordSize] = useState(DEFAULT_VALUES.wordSize);
  const [interactivity, setInteractivity] = useState(DEFAULT_VALUES.interactivity);

  const addWord = () => {
    if (newWord.trim() && !words.includes(newWord.trim())) {
      setWords([...words, newWord.trim()]);
      setNewWord('');
    }
  };

  const removeWord = (wordToRemove) => {
    setWords(words.filter(word => word !== wordToRemove));
  };

  const handleSubmit = () => {
    // Dispatch text rain configuration event
    const event = new CustomEvent('breakme:textRainChange', {
      detail: {
        words,
        fallSpeed,
        wordSize,
        interactivity
      }
    });
    window.dispatchEvent(event);

    // Close the controls
    if (onClose) onClose();
  };

  const handleReset = () => {
    // Reset to default values
    setWords(DEFAULT_VALUES.words);
    setFallSpeed(DEFAULT_VALUES.fallSpeed);
    setWordSize(DEFAULT_VALUES.wordSize);
    setInteractivity(DEFAULT_VALUES.interactivity);

    // Dispatch reset event
    const event = new CustomEvent('breakme:textRainChange', {
      detail: DEFAULT_VALUES
    });
    window.dispatchEvent(event);
  };

  // Handle escape key to close the controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
              <Droplets size={20} strokeWidth={1.5} />
              Text Rain
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
            {/* Word List Management */}
            <div>
              <label className="block text-neutral-300 mb-2">
                Words to Rain
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  placeholder="Add a word"
                  className="
                    w-full 
                    p-2 
                    bg-neutral-800 
                    text-white 
                    rounded-xl 
                    border 
                    border-neutral-700
                  "
                />
                <button
                  onClick={addWord}
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
              <div className="flex flex-wrap gap-2">
                {words.map((word) => (
                  <div 
                    key={word}
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
                    <span>{word}</span>
                    <button
                      onClick={() => removeWord(word)}
                      className="
                        text-neutral-400 
                        hover:text-red-500 
                        transition-colors
                      "
                    >
                      <TrashIcon size={12} strokeWidth={1.5} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Fall Speed Slider */}
            <div>
              <div className="flex justify-between items-center">
                <label className="text-neutral-300">Fall Speed</label>
                <span className="text-neutral-400">
                  <code>
                    {fallSpeed <= 0.2 ? 'Slow' : 
                     fallSpeed <= 0.5 ? 'Normal' : 
                     'Fast'}
                  </code>
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={fallSpeed}
                onChange={(e) => setFallSpeed(parseFloat(e.target.value))}
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

            {/* Word Size Slider */}
            <div>
              <div className="flex justify-between items-center">
                <label className="text-neutral-300">Word Size</label>
                <span className="text-neutral-400">
                  <code>
                    {wordSize <= 0.5 ? 'Small' : 
                     wordSize <= 1 ? 'Medium' : 
                     'Large'}
                  </code>
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2"
                step="0.2"
                value={wordSize}
                onChange={(e) => setWordSize(parseFloat(e.target.value))}
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

            {/* Interactivity Slider */}
            <div>
              <div className="flex justify-between items-center">
                <label className="text-neutral-300">Interactivity</label>
                <span className="text-neutral-400">
                  <code>
                    {interactivity <= 0.3 ? 'Low' : 
                     interactivity <= 0.7 ? 'Medium' : 
                     'High'}
                  </code>
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={interactivity}
                onChange={(e) => setInteractivity(parseFloat(e.target.value))}
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
              <XCircleIcon size={10} strokeWidth={1.5} />
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

export default TextRainControls;