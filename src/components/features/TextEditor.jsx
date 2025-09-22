"use client";

import { useState, useEffect } from 'react';
import { CheckCheck, PencilLineIcon, XCircleIcon } from 'lucide-react';

const TextEditor = ({ isOpen, onClose }) => {
  const [customText, setCustomText] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    // Basic validation
    if (!customText.trim()) {
      setError('*I needs some text🧑🏽‍🚀');
      return;
    }

    if (customText.length > 25) {
      setError('Text should be 25 characters or less');
      return;
    }

    console.log("TextEditor: Dispatching text change event with:", customText);

    // Dispatch a custom event with the new text
    const event = new CustomEvent('breakme:textChange', {
      detail: { text: customText }
    });
    window.dispatchEvent(event);

    // Clear error and close
    setError('');
    if (onClose) onClose();
  };

  // Handle escape key to close the editor
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
              <PencilLineIcon size={20} strokeWidth={1.5} />
              Custom Text
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

          <div className="mb-4">
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Enter your text (max 25 chars)"
              className="
                w-full 
                p-3 
                rounded-xl 
                bg-neutral-800 
                text-white 
                border 
                border-neutral-700 
                focus:border-yellow-500 
                focus:outline-none
              "
              maxLength={25}
            />
            {error && (
              <p className="
                text-red-500 
                mt-2 
                text-sm
              ">
                {error}
              </p>
            )}
            <p 
              className="
                text-neutral-400 
                mt-2 
                text-sm 
                text-right
              "
            >
              {25 - customText.length} characters remaining
            </p>
          </div>

          <div className="flex justify-end">
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
              <CheckCheck size={16} strokeWidth={1.5} />
              Apply Text
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextEditor;