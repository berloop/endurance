// "use client";

// import { useState, useEffect, useRef } from "react";
// import { Play, Pause, StopCircle, Volume2, VolumeX } from "lucide-react";

// const PlaybackControlBar = () => {
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentTrack, setCurrentTrack] = useState(null);
//   const [audioSrc, setAudioSrc] = useState(null);
//   const [volume, setVolume] = useState(1);
//   const [isMuted, setIsMuted] = useState(false);
// //   const [duration, setDuration] = useState(0);
//   const [ setCurrentTime] = useState(0);
  
//   const audioRef = useRef(null);
//   const requestRef = useRef(null);
//   const containerRef = useRef(null);
//   const progressBarRef = useRef(null);

//   // Update current time
//   const updateCurrentTime = () => {
//     if (audioRef.current) {
//     //   setCurrentTime(audioRef.current.currentTime);
      
//     //   // Update progress bar
//     //   if (progressBarRef.current && duration > 0) {
//     //     const progress = (audioRef.current.currentTime / duration) * 100;
//     //     progressBarRef.current.style.width = `${progress}%`;
//     //   }
      
//       requestRef.current = requestAnimationFrame(updateCurrentTime);
//     }
//   };

//   // Handle audio events
//   useEffect(() => {
//     const handleAudioStart = async (event) => {
//       const { audio, title } = event.detail;
      
//       try {
//         // Stop any existing audio
//         if (audioRef.current) {
//           audioRef.current.pause();
//           audioRef.current.currentTime = 0;
//         }

//         // Cancel any existing animation frame
//         if (requestRef.current) {
//           cancelAnimationFrame(requestRef.current);
//         }

//         setCurrentTrack(title);
//         setAudioSrc(audio);
        
//         // Set up audio playback with the HTML audio element
//         if (audioRef.current) {
//           audioRef.current.src = audio;
          
//           // Play audio when loaded
//           audioRef.current.addEventListener('loadedmetadata', () => {
//             setDuration(audioRef.current.duration);
            
//             audioRef.current.play().then(() => {
//               setIsPlaying(true);
//               requestRef.current = requestAnimationFrame(updateCurrentTime);
//             }).catch(error => {
//               console.error('Audio Play Error:', error);
//             });
//           }, { once: true });
//         }
//       } catch (error) {
//         console.error('Audio Setup Error:', error);
//       }
//     };

//     const handleAudioEnd = () => {
//       setIsPlaying(false);
//       setCurrentTrack(null);
//       setAudioSrc(null);
      
//       if (audioRef.current) {
//         audioRef.current.pause();
//         audioRef.current.currentTime = 0;
//       }
      
//       if (requestRef.current) {
//         cancelAnimationFrame(requestRef.current);
//       }
//     };

//     window.addEventListener("breakme:audioStart", handleAudioStart);
//     window.addEventListener("breakme:audioEnd", handleAudioEnd);

//     return () => {
//       window.removeEventListener("breakme:audioStart", handleAudioStart);
//       window.removeEventListener("breakme:audioEnd", handleAudioEnd);
      
//       if (requestRef.current) {
//         cancelAnimationFrame(requestRef.current);
//       }
//     };
//   }, []);

//   // Update audio volume when volume state changes
//   useEffect(() => {
//     if (audioRef.current) {
//       audioRef.current.volume = isMuted ? 0 : volume;
//     }
//   }, [volume, isMuted]);

//   const handlePlayPause = () => {
//     if (audioRef.current) {
//       if (isPlaying) {
//         audioRef.current.pause();
//         setIsPlaying(false);
//         cancelAnimationFrame(requestRef.current);
//       } else {
//         audioRef.current.play()
//           .then(() => {
//             setIsPlaying(true);
//             requestRef.current = requestAnimationFrame(updateCurrentTime);
//           })
//           .catch(error => {
//             console.error('Play/Pause Error:', error);
//           });
//       }
//     }
//   };

//   const handleStop = () => {
//     if (audioRef.current) {
//       audioRef.current.pause();
//       audioRef.current.currentTime = 0;
//       setIsPlaying(false);
//       setCurrentTime(0);
      
//       if (progressBarRef.current) {
//         progressBarRef.current.style.width = "0%";
//       }
      
//       cancelAnimationFrame(requestRef.current);
//     }
//   };

//   const handleVolumeToggle = () => {
//     setIsMuted(!isMuted);
//   };

 

  

//   if (!currentTrack) return null;

//   return (
//     <div
//       ref={containerRef}
//       className="
//           w-full
//       bg-neutral-900
//       hover:opacity-90
//       rounded-3xl
//       shadow-2xl 
//       border 
//       border-neutral-800 
//       flex 
//       flex-col
//       p-4
//       space-y-3
//       "
//     >
      

//       {/* Controls row */}
//       <div className="flex items-center justify-between w-full">
//         {/* Track Info */}
//         {/* Track Info with marquee effect */}
// <div className="text-neutral-300 text-sm max-w-[150px] overflow-hidden">
//   <div className={`
//     ${currentTrack && currentTrack.length > 18 ? 'animate-marquee whitespace-nowrap' : 'truncate'}
//   `}>
//     {currentTrack}
//   </div>
// </div>

//         {/* Playback Controls */}
//         <div className="flex items-center space-x-2 ml-2">
//           <button
//             onClick={handlePlayPause}
//             className="
//               text-neutral-400 
//               hover:text-yellow-500 
//               transition-colors
//             "
//           >
//             {isPlaying ? <Pause size={15} /> : <Play size={15} />}
//           </button>
//           <button
//             onClick={handleStop}
//             className="
//               text-neutral-400 
//               hover:text-yellow-500 
//               transition-colors
//             "
//           >
//             <StopCircle size={18} strokeWidth={1.5} />
//           </button>
//         </div>

//         {/* Volume Control */}
//         <div className="flex items-center space-x-2 mx-2">
//           <button
//             onClick={handleVolumeToggle}
//             className="
//               text-neutral-400 
//               hover:text-yellow-500 
//               transition-colors
//             "
//           >
//             {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
//           </button>
//           <input
//             type="range"
//             min="0"
//             max="1"
//             step="0.1"
//             value={isMuted ? 0 : volume}
//             onChange={(e) => setVolume(parseFloat(e.target.value))}
//             className="
//               w-24 
//               h-2 
//               bg-neutral-800 
//               rounded-xl 
//               appearance-none
//               cursor-pointer
//               [&::-webkit-slider-thumb]:appearance-none
//               [&::-webkit-slider-thumb]:w-4
//               [&::-webkit-slider-thumb]:h-4
//               [&::-webkit-slider-thumb]:bg-yellow-500
//               [&::-webkit-slider-thumb]:rounded-full
//             "
//           />
//         </div>
//       </div>

//       {/* Hidden audio element for playback */}
//       <audio 
//         ref={audioRef} 
//         src={audioSrc} 
//         onEnded={() => {
//           setIsPlaying(false);
//           setCurrentTrack(null);
//           setAudioSrc(null);
//           cancelAnimationFrame(requestRef.current);
//           const audioEndEvent = new CustomEvent('breakme:audioEnd');
//           window.dispatchEvent(audioEndEvent);
//         }}
//       />
//     </div>
//   );
// };

// export default PlaybackControlBar;

"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, StopCircle, Volume2, VolumeX } from "lucide-react";

const PlaybackControlBar = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [audioSrc, setAudioSrc] = useState(null);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  // Not using currentTime in the UI, so removing it to avoid warnings
  
  const audioRef = useRef(null);
  const requestRef = useRef(null);
  const containerRef = useRef(null);
  const progressBarRef = useRef(null);

  // Update progress bar without using state to avoid unnecessary re-renders
  const updateProgressBar = () => {
    if (audioRef.current && progressBarRef.current && duration > 0) {
      const currentTime = audioRef.current.currentTime;
      const progress = (currentTime / duration) * 100;
      progressBarRef.current.style.width = `${progress}%`;
      
      requestRef.current = requestAnimationFrame(updateProgressBar);
    }
  };

  // Handle audio events
  useEffect(() => {
    const handleAudioStart = async (event) => {
      const { audio, title } = event.detail;
      
      try {
        // Stop any existing audio
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }

        // Cancel any existing animation frame
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
        }

        setCurrentTrack(title);
        setAudioSrc(audio);
        
        // Set up audio playback with the HTML audio element
        if (audioRef.current) {
          audioRef.current.src = audio;
          
          // Play audio when loaded
          audioRef.current.addEventListener('loadedmetadata', () => {
            setDuration(audioRef.current.duration);
            
            audioRef.current.play().then(() => {
              setIsPlaying(true);
              requestRef.current = requestAnimationFrame(updateProgressBar);
            }).catch(error => {
              console.error('Audio Play Error:', error);
            });
          }, { once: true });
        }
      } catch (error) {
        console.error('Audio Setup Error:', error);
      }
    };

    const handleAudioEnd = () => {
      setIsPlaying(false);
      setCurrentTrack(null);
      setAudioSrc(null);
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };

    window.addEventListener("breakme:audioStart", handleAudioStart);
    window.addEventListener("breakme:audioEnd", handleAudioEnd);

    return () => {
      window.removeEventListener("breakme:audioStart", handleAudioStart);
      window.removeEventListener("breakme:audioEnd", handleAudioEnd);
      
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  // Update audio volume when volume state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        cancelAnimationFrame(requestRef.current);
      } else {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            requestRef.current = requestAnimationFrame(updateProgressBar);
          })
          .catch(error => {
            console.error('Play/Pause Error:', error);
          });
      }
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      
      if (progressBarRef.current) {
        progressBarRef.current.style.width = "0%";
      }
      
      cancelAnimationFrame(requestRef.current);
    }
  };

  const handleVolumeToggle = () => {
    setIsMuted(!isMuted);
  };

  if (!currentTrack) return null;

  return (
    <div
      ref={containerRef}
      className="
          w-full
      bg-neutral-900
      hover:opacity-90
      rounded-3xl
      shadow-2xl 
      border 
      border-neutral-800 
      flex 
      flex-col
      p-4
      space-y-3
      "
    >
      {/* If you want a progress bar, uncomment this section */}
      {/* <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
        <div 
          ref={progressBarRef} 
          className="h-full bg-yellow-500 rounded-full" 
          style={{ width: '0%' }}
        />
      </div> */}
      
      {/* Controls row */}
      <div className="flex items-center justify-between w-full">
        {/* Track Info with marquee effect */}
        <div className="text-neutral-300 text-sm max-w-[150px] overflow-hidden">
          <div className={`
            ${currentTrack && currentTrack.length > 18 ? 'animate-marquee whitespace-nowrap' : 'truncate'}
          `}>
            {currentTrack}
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center space-x-2 ml-2">
          <button
            onClick={handlePlayPause}
            className="
              text-neutral-400 
              hover:text-yellow-500 
              transition-colors
            "
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
          </button>
          <button
            onClick={handleStop}
            className="
              text-neutral-400 
              hover:text-yellow-500 
              transition-colors
            "
          >
            <StopCircle size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2 mx-2">
          <button
            onClick={handleVolumeToggle}
            className="
              text-neutral-400 
              hover:text-yellow-500 
              transition-colors
            "
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="
              w-24 
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

      {/* Hidden audio element for playback */}
      <audio 
        ref={audioRef} 
        src={audioSrc} 
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTrack(null);
          setAudioSrc(null);
          cancelAnimationFrame(requestRef.current);
          const audioEndEvent = new CustomEvent('breakme:audioEnd');
          window.dispatchEvent(audioEndEvent);
        }}
      />
    </div>
  );
};

export default PlaybackControlBar;