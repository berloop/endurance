// "use client";

// import { useState, useRef, useEffect } from 'react';
// import { 
//   Volume2, 
//   XCircleIcon, 
//   CheckCheckIcon, 
//   UploadIcon 
// } from 'lucide-react';
// import PlaybackControlBar from './PlaybackControlBar';
// import Image from 'next/image';

// // Preset audio tracks with thumbnails
// const AUDIO_PRESETS = [
//   {
//     id: 'preset1',
//     title: 'Cosmic Waves',
//     genre: 'Ambient',
//     thumbnail: '/images/audio-presets/cosmic-waves.jpg',
//     audioSrc: '/audio/cosmic-waves.mp3'
//   },
//   {
//     id: 'preset2',
//     title: 'Lofi',
//     genre: 'Electronic',
//     thumbnail: '/images/audio-presets/urban-pulse.jpg',
//     audioSrc: '/audio/urban-pulse.mp3'
//   },
//   {
//     id: 'preset3',
//     title: 'Nature Rhythm',
//     genre: 'Natural Sounds',
//     thumbnail: '/images/audio-presets/nature-rhythm.jpg',
//     audioSrc: '/audio/nature-rhythm.mp3'
//   }
// ];

// const AudioReactiveModal = ({ isOpen, onClose }) => {
//   const [selectedPreset, setSelectedPreset] = useState(null);
//   const fileInputRef = useRef(null);
//   const [customFile, setCustomFile] = useState(null);
//   const [isAudioApplied, setIsAudioApplied] = useState(false);

//   // Listen for audio end to reset the applied state
//   useEffect(() => {
//     const handleAudioEnd = () => {
//       setIsAudioApplied(false);
//     };

//     window.addEventListener('breakme:audioEnd', handleAudioEnd);

//     return () => {
//       window.removeEventListener('breakme:audioEnd', handleAudioEnd);
//     };
//   }, []);

//   const handlePresetSelect = (preset) => {
//     setSelectedPreset(preset);
//     setCustomFile(null);
//   };

//   const handleFileUpload = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       setCustomFile(file);
//       setSelectedPreset(null);
//     }
//   };

//   const handleApply = () => {
//     // Set audio as applied first to ensure the UI updates immediately
//     setIsAudioApplied(true);
    
//     // Dispatch audio reactive change event
//     const audioSource = selectedPreset 
//       ? selectedPreset.audioSrc 
//       : customFile 
//         ? URL.createObjectURL(customFile)
//         : null;
  
//     if (audioSource) {
//       // Use setTimeout to ensure state update has happened before dispatching the event
//       setTimeout(() => {
//         const event = new CustomEvent('breakme:audioStart', { 
//           detail: { 
//             audio: audioSource,
//             title: selectedPreset 
//               ? selectedPreset.title 
//               : customFile.name
//           }
//         });
//         window.dispatchEvent(event);
//       }, 0);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div 
//       className="
//         fixed 
//         top-1/2 
//         left-32 
//         transform 
//         -translate-y-1/2 
//         z-50 
//         transition-all 
//         duration-300
//       "
//     >
//       <div 
//         className="
//           bg-neutral-900 
//           text-neutral-400 
//           rounded-3xl 
//           w-80 
//           shadow-2xl 
//           border 
//           border-neutral-800
//           relative
//         "
//       >
//         <div className="p-6">
//           <div className="flex justify-between items-center mb-4">
//             <h2 
//               className="
//                 text-zinc-300
//                 text-xl 
//                 font-medium
//                 flex 
//                 items-center 
//                 gap-2
//               "
//             >
//               <Volume2 size={20} strokeWidth={1.5} />
//               Audio Reactive
//             </h2>
//             {onClose && (
//               <button
//                 onClick={onClose}
//                 className="
//                   text-neutral-400 
//                   hover:text-white 
//                   transition-colors
//                 "
//               >
//                 <XCircleIcon size={18} strokeWidth={1.5} />
//               </button>
//             )}
//           </div>

//           {/* Preset Audio Selection */}
//           <div className="mb-4">
//             <h3 className="text-neutral-300 mb-2">Audio Presets</h3>
//             <div className="grid grid-cols-3 gap-2">
//               {AUDIO_PRESETS.map((preset) => (
//                 <button
//                 key={preset.id}
//                 onClick={() => handlePresetSelect(preset)}
//                 className={`
//                   relative 
//                   rounded-xl 
//                   overflow-hidden 
//                   border-2 
//                   transition-all
//                   ${selectedPreset?.id === preset.id 
//                     ? 'border-yellow-500' 
//                     : 'border-neutral-800 hover:border-neutral-600'}
//                 `}
//               >
//                 <Image 
//                   src={preset.thumbnail} 
//                   alt={preset.title} 
//                   width={200}
//                   height={96}
//                   className="w-full h-24 object-cover"
//                 />
//                 <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-1">
//                   <p className="text-xs text-white truncate">{preset.title}</p>
//                 </div>
//               </button>
//               ))}
//             </div>
//           </div>

//           {/* Custom File Upload */}
//           <div>
//             <h3 className="text-neutral-300 mb-2">Upload Audio</h3>
//             <div 
//               className="
//                 border-2 
//                 border-dashed 
//                 border-neutral-700 
//                 rounded-xl 
//                 p-4 
//                 text-center
//                 hover:border-yellow-500
//                 transition-colors
//               "
//             >
//               <input 
//                 type="file" 
//                 ref={fileInputRef}
//                 onChange={handleFileUpload}
//                 accept=".mp3,.wav,.ogg"
//                 className="hidden"
//               />
//               <button
//                 onClick={() => fileInputRef.current.click()}
//                 className="
//                   w-full 
//                   flex 
//                   items-center 
//                   justify-center 
//                   gap-2 
//                   text-neutral-400
//                   hover:text-yellow-500
//                   transition-colors
//                 "
//               >
//                 <UploadIcon size={16} />
//                 {customFile 
//                   ? `${customFile.name}` 
//                   : 'Choose File (MP3, WAV)'}
//               </button>
//             </div>
//           </div>

//           {/* Apply Button */}
//           <div className="flex justify-end mt-6">
//             <button
//               onClick={handleApply}
//               disabled={!selectedPreset && !customFile}
//               className={`
//                 ${selectedPreset || customFile 
//                   ? 'bg-neutral-700 hover:bg-yellow-500 text-white' 
//                   : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'}
//                 rounded-xl 
//                 px-4 
//                 py-2 
//                 flex 
//                 items-center 
//                 gap-2 
//                 transition-colors 
//                 hover:text-black
//               `}
//             >
//               <CheckCheckIcon size={16} strokeWidth={1.5} />
//               Apply Audio
//             </button>
//           </div>

//           {/* Playback Control Bar */}
//           {isAudioApplied && (
//             <div className="absolute bottom-[-50px] left-0 w-full">
//               <PlaybackControlBar />
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AudioReactiveModal;

"use client";

import { useState, useRef, useEffect } from 'react';
import { 
  Volume2, 
  XCircleIcon, 
  CheckCheckIcon, 
  UploadIcon 
} from 'lucide-react';
import PlaybackControlBar from './PlaybackControlBar';
import Image from 'next/image';
import { Skeleton } from "@/components/ui/skeleton";

// Preset audio tracks with thumbnails
const AUDIO_PRESETS = [
  {
    id: 'preset1',
    title: 'Cosmic Waves',
    genre: 'Ambient',
    thumbnail: '/images/audio-presets/cosmic-waves.jpg',
    audioSrc: '/audio/cosmic-waves.mp3'
  },
  {
    id: 'preset2',
    title: 'Lofi',
    genre: 'Electronic',
    thumbnail: '/images/audio-presets/urban-pulse.jpg',
    audioSrc: '/audio/urban-pulse.mp3'
  },
  {
    id: 'preset3',
    title: 'Nature Rhythm',
    genre: 'Natural Sounds',
    thumbnail: '/images/audio-presets/nature-rhythm.jpg',
    audioSrc: '/audio/nature-rhythm.mp3'
  }
];

const AudioReactiveModal = ({ isOpen, onClose }) => {
  const [selectedPreset, setSelectedPreset] = useState(null);
  const fileInputRef = useRef(null);
  const [customFile, setCustomFile] = useState(null);
  const [isAudioApplied, setIsAudioApplied] = useState(false);
  const [loadedImages, setLoadedImages] = useState({});

  // Listen for audio end to reset the applied state
  useEffect(() => {
    const handleAudioEnd = () => {
      setIsAudioApplied(false);
    };

    window.addEventListener('breakme:audioEnd', handleAudioEnd);

    return () => {
      window.removeEventListener('breakme:audioEnd', handleAudioEnd);
    };
  }, []);

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset);
    setCustomFile(null);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCustomFile(file);
      setSelectedPreset(null);
    }
  };

  const handleImageLoaded = (presetId) => {
    setLoadedImages(prev => ({
      ...prev,
      [presetId]: true
    }));
  };

  const handleApply = () => {
    // Set audio as applied first to ensure the UI updates immediately
    setIsAudioApplied(true);
    
    // Dispatch audio reactive change event
    const audioSource = selectedPreset 
      ? selectedPreset.audioSrc 
      : customFile 
        ? URL.createObjectURL(customFile)
        : null;
  
    if (audioSource) {
      // Use setTimeout to ensure state update has happened before dispatching the event
      setTimeout(() => {
        const event = new CustomEvent('breakme:audioStart', { 
          detail: { 
            audio: audioSource,
            title: selectedPreset 
              ? selectedPreset.title 
              : customFile.name
          }
        });
        window.dispatchEvent(event);
      }, 0);
    }
  };

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
          relative
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
              <Volume2 size={20} strokeWidth={1.5} />
              Audio Reactive
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

          {/* Preset Audio Selection */}
          <div className="mb-4">
            <h3 className="text-neutral-300 mb-2">Audio Presets</h3>
            <div className="grid grid-cols-3 gap-2">
              {AUDIO_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset)}
                  className={`
                    relative 
                    rounded-xl 
                    overflow-hidden 
                    border-2 
                    transition-all
                    ${selectedPreset?.id === preset.id 
                      ? 'border-yellow-500' 
                      : 'border-neutral-800 hover:border-neutral-600'}
                  `}
                >
                  {/* Skeleton */}
                  {!loadedImages[preset.id] && (
                    <Skeleton className="absolute inset-0 w-full h-24" />
                  )}
                  
                  <Image 
                    src={preset.thumbnail} 
                    alt={preset.title} 
                    width={200}
                    height={96}
                    className={`w-full h-24 object-cover ${
                      loadedImages[preset.id] ? 'opacity-100' : 'opacity-0'
                    } transition-opacity duration-300`}
                    onLoad={() => handleImageLoaded(preset.id)}
                  />
                  {/* am using a skeleton to add fading animation to the image */}
                   <Skeleton className="absolute inset-0 bg-black/65 w-full h-24" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-1">
                    <p className="text-xs text-white truncate">{preset.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom File Upload */}
          <div>
            <h3 className="text-neutral-300 mb-2">Upload Audio</h3>
            <div 
              className="
                border-2 
                border-dashed 
                border-neutral-700 
                rounded-xl 
                p-4 
                text-center
                hover:border-yellow-500
                transition-colors
              "
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".mp3,.wav,.ogg"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current.click()}
                className="
                  w-full 
                  flex 
                  items-center 
                  justify-center 
                  gap-2 
                  text-neutral-400
                  hover:text-yellow-500
                  transition-colors
                "
              >
                <UploadIcon size={16} />
                {customFile 
                  ? `${customFile.name}` 
                  : 'Choose File (MP3, WAV)'}
              </button>
            </div>
          </div>

          {/* Apply Button */}
          <div className="flex justify-end mt-6">
            <button
              onClick={handleApply}
              disabled={!selectedPreset && !customFile}
              className={`
                ${selectedPreset || customFile 
                  ? 'bg-neutral-700 hover:bg-yellow-500 text-white' 
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'}
                rounded-xl 
                px-4 
                py-2 
                flex 
                items-center 
                gap-2 
                transition-colors 
                hover:text-black
              `}
            >
              <CheckCheckIcon size={16} strokeWidth={1.5} />
              Apply Audio
            </button>
          </div>

          {/* Playback Control Bar */}
          {isAudioApplied && (
            <div className="absolute bottom-[-50px] left-0 w-full">
              <PlaybackControlBar />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioReactiveModal;