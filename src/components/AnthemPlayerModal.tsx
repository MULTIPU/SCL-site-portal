import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Volume2, Sparkles, Music } from 'lucide-react';

interface AnthemPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnthemPlayerModal: React.FC<AnthemPlayerModalProps> = ({ isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);

  // Play musical chimes using Web Audio API
  const playChimes = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // School Anthem Melodic Notes (D major school fanfare)
      // D4, F#4, A4, B4, A4, F#4, E4, D4, E4, F#4, A4, D5
      const notes = [
        { freq: 293.66, dur: 0.6 },
        { freq: 369.99, dur: 0.6 },
        { freq: 440.00, dur: 0.8 },
        { freq: 493.88, dur: 0.6 },
        { freq: 440.00, dur: 0.8 },
        { freq: 369.99, dur: 0.6 },
        { freq: 329.63, dur: 0.8 },
        { freq: 293.66, dur: 1.0 },
        { freq: 329.63, dur: 0.6 },
        { freq: 369.99, dur: 0.6 },
        { freq: 440.00, dur: 0.8 },
        { freq: 587.33, dur: 1.5 }
      ];

      let startTime = ctx.currentTime + 0.1;
      notes.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.dur - 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + note.dur);
        startTime += note.dur * 0.9;
      });
    } catch (e) {
      console.warn('Web Audio playback error:', e);
    }
  };

  const handleTogglePlay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      playChimes();
    } else {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 2.5;
        });
      }, 250);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-gradient-to-b from-[#3a0004] via-[#500007] to-[#1a0002] text-white rounded-3xl p-5 shadow-2xl border-2 border-scl-gold/60 relative animate-in zoom-in-95 duration-200"
      >
        {/* Header Icon */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 text-[#450000] flex items-center justify-center mx-auto mb-3 shadow-[0_8px_25px_rgba(242,174,0,0.4)] border border-amber-200">
          <Music className="w-7 h-7" />
        </div>

        {/* Title */}
        <div className="text-center mb-3">
          <h3 className="font-black text-xl text-scl-lightgold tracking-wide">
            Shining Child Leaders Anthem
          </h3>
          <p className="text-xs text-amber-200/80 italic mt-0.5">
            "Raising Today's Children to Become Tomorrow's Leaders"
          </p>
        </div>

        {/* Visualizer Bar */}
        <div className="bg-white/10 p-3 rounded-2xl border border-amber-300/30 mb-4 text-center">
          <div className="flex items-center justify-center gap-1.5 h-10 mb-2">
            {[40, 75, 55, 90, 60, 100, 70, 85, 45, 95, 65, 80].map((h, i) => (
              <div 
                key={i} 
                className={`w-1.5 bg-gradient-to-t from-scl-gold to-amber-200 rounded-full transition-all duration-300 ${
                  isPlaying ? 'animate-pulse' : 'opacity-40'
                }`}
                style={{ 
                  height: isPlaying ? `${Math.max(15, (h * (progress % 30 + 10)) / 40)}px` : '15px',
                  animationDelay: `${i * 80}ms`
                }}
              />
            ))}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/15 h-2 rounded-full overflow-hidden mb-2">
            <div 
              className="bg-scl-gold h-full transition-all duration-300 rounded-full shadow-[0_0_10px_rgba(242,174,0,0.7)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-amber-200/80 font-mono px-1">
            <span>00:{Math.floor((progress * 0.12)).toString().padStart(2, '0')}</span>
            <span>00:12 (Anthem Chime)</span>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-4 mt-2">
            <button
              type="button"
              onClick={() => {
                setProgress(0);
                setIsPlaying(false);
              }}
              className="p-2 rounded-full hover:bg-white/10 text-amber-200 transition"
              title="Restart"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleTogglePlay}
              className="w-12 h-12 rounded-full bg-scl-gold text-[#450000] flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={playChimes}
              className="p-2 rounded-full hover:bg-white/10 text-amber-200 transition"
              title="Sound Fanfare"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Official Anthem Lyrics */}
        <div className="bg-black/30 p-3.5 rounded-2xl border border-amber-300/20 max-h-44 overflow-y-auto text-center text-xs leading-relaxed text-amber-100">
          <p className="font-bold text-amber-300 mb-1">Verse 1</p>
          <p>Arise, oh children of the light,<br/>
          In truth and knowledge we shall stand.<br/>
          With discipline and moral might,<br/>
          To lead and build our blessed land.</p>
          
          <p className="font-bold text-amber-300 mt-2.5 mb-1">Chorus</p>
          <p className="italic font-semibold text-white">
          Shining Child Leaders, shining so bright,<br/>
          Guided by wisdom, champions of right!<br/>
          Raising today's young minds to grow,<br/>
          Tomorrow's leaders, hear us roar!
          </p>

          <p className="font-bold text-amber-300 mt-2.5 mb-1">School Pledge</p>
          <p>I pledge to Shining Child Leaders School,<br/>
          To be honest, diligent, respectful and loyal,<br/>
          And to shine in excellence wherever I go.<br/>
          So help me God!</p>
        </div>

        {/* Close Button */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-amber-200 text-xs font-bold border border-amber-400/40 transition active:scale-95"
          >
            Close Anthem
          </button>
        </div>
      </div>
    </div>
  );
};
