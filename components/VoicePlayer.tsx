import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Square, Volume2 } from 'lucide-react';

interface VoicePlayerProps {
  text: string;
  autoPlay?: boolean;
  onEnd?: () => void;
}

export const VoicePlayer: React.FC<VoicePlayerProps> = ({ text, autoPlay = false, onEnd }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const synth = window.speechSynthesis;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      synth.cancel();
    };
  }, []);

  useEffect(() => {
    if (autoPlay && text) {
      handlePlay();
    }
  }, [text, autoPlay]);

  const handlePlay = () => {
    if (isPaused) {
      synth.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    synth.cancel(); // Clear previous
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.9; // Slightly slower for soothing effect
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      if (onEnd) onEnd();
    };

    utteranceRef.current = utterance;
    synth.speak(utterance);
    setIsPlaying(true);
  };

  const handlePause = () => {
    synth.pause();
    setIsPlaying(false);
    setIsPaused(true);
  };

  const handleStop = () => {
    synth.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  return (
    <div className="flex items-center gap-4 bg-white/40 backdrop-blur-md border border-white/50 rounded-full px-4 py-2 shadow-sm">
      <div className="flex items-center gap-2">
        {!isPlaying ? (
          <button
            onClick={handlePlay}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-peace-500 text-white hover:bg-peace-600 transition-colors shadow-md"
          >
            <Play size={14} fill="currentColor" className="ml-0.5" />
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-peace-500 border border-peace-200 hover:bg-peace-50 transition-colors"
          >
            <Pause size={14} fill="currentColor" />
          </button>
        )}
        
        {(isPlaying || isPaused) && (
             <button
             onClick={handleStop}
             className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
           >
             <Square size={12} fill="currentColor" />
           </button>
        )}
      </div>

      {/* Visualizer Animation */}
      <div className="flex items-center gap-1 h-6 w-24 justify-center">
        {isPlaying ? (
          <>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-peace-400 rounded-full"
                animate={{
                  height: [4, 16, 8, 20, 4],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: i * 0.1,
                }}
              />
            ))}
          </>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
             <Volume2 size={14} />
             <span>Listen</span>
          </div>
        )}
      </div>
    </div>
  );
};