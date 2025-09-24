/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { Music, SkipForward, SkipBack } from 'lucide-react';
import { Button } from '../ui/button';

interface MusicControlsProps {
  className?: string;
}

const MusicControls: React.FC<MusicControlsProps> = ({ className = "" }) => {
  const [currentTrack, setCurrentTrack] = useState(0);

  // Add your music tracks here - these should be in your public folder. These are my fav tracks ever...
  const tracks = [
    { name: 'Day One (Interstellar Theme)', file: '/music/Day.One.mp3' },
    { name: 'The Wormhole - Zimmer', file: '/music/The.Wormhole.mp3' },
     { name: 'Alessandro Roussel - ScienceClic Musique', file: '/music/Science.Clic.Musique.mp3' },
        { name: 'Dust Bowl x Day One', file: '/music/dust.bowl.mp3' },
   
   
  ];

  const handlePrevious = () => {
    setCurrentTrack((prev) => (prev === 0 ? tracks.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentTrack((prev) => (prev === tracks.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={`bg-neutral-950 backdrop-blur-sm rounded-xs p-4 text-white max-w-xs ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Music className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Audio Controls</h3>
      </div>

      {/* Track Selection */}
      <div className="mb-4">
        <label className="block text-sm mb-2">Track:</label>
        <div className="grid grid-cols-1 gap-1">
          {tracks.map((track, index) => (
            <Button
              key={index}
              size="sm"
              variant={currentTrack === index ? "default" : "secondary"}
              onClick={() => setCurrentTrack(index)}
              className="text-xs justify-start h-8"
            >
              {track.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Current Track Info */}
      <div className="mb-3 text-xs text-neutral-400 font-mono tracking-tight">
        <div className="truncate">
          Now Playing: {tracks[currentTrack].name}
        </div>
      </div>

      {/* Audio Player */}
      <div className="audio-player-wrapper font-mono tracking-tighter">
        <AudioPlayer
          src={tracks[currentTrack].file}
          volume={0.3}
          loop={true}
          showSkipControls={true}
          showJumpControls={false}
          onClickPrevious={handlePrevious}
          onClickNext={handleNext}
          onEnded={handleNext}
          customAdditionalControls={[]}
          style={{
            backgroundColor: 'transparent',
            boxShadow: 'none',
          }}
        />
      </div>

      <style jsx>{`
        .audio-player-wrapper :global(.rhap_container) {
          background-color: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .audio-player-wrapper :global(.rhap_main-controls-button) {
          color: #ffffff !important;
        }
        .audio-player-wrapper :global(.rhap_volume-button) {
          color: #ffffff !important;
        }
        .audio-player-wrapper :global(.rhap_time) {
          color: #a3a3a3 !important;
          font-size:14px;
          
        }
        .audio-player-wrapper :global(.rhap_volume-indicator) {
  display: none !important;
}
        .audio-player-wrapper :global(.rhap_progress-indicator) {
 display: none !important;
 
  

}
        .audio-player-wrapper :global(.rhap_progress-filled) {
          background-color: #20B356 !important;
             border-radius:none !important;
        }
        .audio-player-wrapper :global(.rhap_volume-filled) {
          background-color: #20B356 !important;
          border-radius:none !important;
        }
      `}</style>
    </div>
  );
};

export default MusicControls;