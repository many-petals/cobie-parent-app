import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Timer, Leaf, Cloud, Moon, Sun, Music, Waves } from 'lucide-react';
import { useBackgroundSound } from '@/hooks/useBackgroundSound';
import { SoundSettings, soundLibrary, getSoundsByCategory, Sound } from './soundConfig';

interface QuietCornerProps {
  onClose: () => void;
  soundSettings: SoundSettings;
}

type SceneType = 'day' | 'night' | 'forest' | 'ocean';
type TimerOption = 0 | 60 | 180 | 300 | 600; // 0 = no timer, then 1, 3, 5, 10 minutes

const timerOptions: { value: TimerOption; label: string }[] = [
  { value: 0, label: 'No Timer' },
  { value: 60, label: '1 min' },
  { value: 180, label: '3 min' },
  { value: 300, label: '5 min' },
  { value: 600, label: '10 min' },
];

const scenes: { id: SceneType; name: string; icon: React.ReactNode; bgClass: string; defaultSound: string }[] = [
  { id: 'day', name: 'Sunny Day', icon: <Sun className="w-5 h-5" />, bgClass: 'from-sky-300 via-sky-200 to-green-200', defaultSound: 'forest-birds' },
  { id: 'night', name: 'Starry Night', icon: <Moon className="w-5 h-5" />, bgClass: 'from-indigo-900 via-purple-900 to-slate-900', defaultSound: 'night-crickets' },
  { id: 'forest', name: 'Peaceful Forest', icon: <Leaf className="w-5 h-5" />, bgClass: 'from-green-600 via-green-500 to-emerald-400', defaultSound: 'wind-trees' },
  { id: 'ocean', name: 'Calm Ocean', icon: <Waves className="w-5 h-5" />, bgClass: 'from-cyan-500 via-blue-500 to-blue-700', defaultSound: 'ocean-waves' },
];

const QuietCorner: React.FC<QuietCornerProps> = ({ onClose, soundSettings }) => {
  const [currentScene, setCurrentScene] = useState<SceneType>('day');
  const [showSoundPicker, setShowSoundPicker] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerActive, setTimerActive] = useState(false);
  const [showTimerPicker, setShowTimerPicker] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathCount, setBreathCount] = useState(0);
  const [showBreathing, setShowBreathing] = useState(true);
  
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    currentSound,
    isPlaying,
    volume,
    play,
    stop,
    pause,
    resume,
    setVolume,
    toggleMute,
    isMuted,
  } = useBackgroundSound({ settings: soundSettings });

  // Start with scene's default sound
  useEffect(() => {
    const scene = scenes.find(s => s.id === currentScene);
    if (scene && soundSettings.enabled) {
      play(scene.defaultSound);
    }
    return () => {
      stop();
    };
  }, []);

  // Handle scene change
  const handleSceneChange = (sceneId: SceneType) => {
    setCurrentScene(sceneId);
    const scene = scenes.find(s => s.id === sceneId);
    if (scene && soundSettings.enabled) {
      play(scene.defaultSound);
    }
  };

  // Timer logic
  useEffect(() => {
    if (timerActive && timerSeconds > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            // Timer complete - could play a gentle chime
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [timerActive, timerSeconds]);

  const startTimer = (seconds: number) => {
    setTimerSeconds(seconds);
    setTimerActive(seconds > 0);
    setShowTimerPicker(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Breathing animation cycle
  useEffect(() => {
    if (!showBreathing) return;

    const breathCycle = () => {
      // Inhale for 4 seconds
      setBreathPhase('inhale');
      setTimeout(() => {
        // Hold for 2 seconds
        setBreathPhase('hold');
        setTimeout(() => {
          // Exhale for 4 seconds
          setBreathPhase('exhale');
          setTimeout(() => {
            setBreathCount(prev => prev + 1);
          }, 4000);
        }, 2000);
      }, 4000);
    };

    breathCycle();
    const interval = setInterval(breathCycle, 10000); // Full cycle is 10 seconds

    return () => clearInterval(interval);
  }, [showBreathing]);

  const scene = scenes.find(s => s.id === currentScene)!;
  const isNightScene = currentScene === 'night';

  return (
    <div className={`fixed inset-0 bg-gradient-to-b ${scene.bgClass} overflow-hidden transition-all duration-1000`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating clouds */}
        {(currentScene === 'day' || currentScene === 'ocean') && (
          <>
            <div className="absolute animate-float-slow" style={{ top: '10%', left: '-10%' }}>
              <CloudShape className="w-32 h-20 text-white/60" />
            </div>
            <div className="absolute animate-float-medium" style={{ top: '20%', left: '30%' }}>
              <CloudShape className="w-24 h-16 text-white/50" />
            </div>
            <div className="absolute animate-float-fast" style={{ top: '5%', right: '10%' }}>
              <CloudShape className="w-28 h-18 text-white/40" />
            </div>
            <div className="absolute animate-float-slow" style={{ top: '25%', right: '25%' }}>
              <CloudShape className="w-20 h-14 text-white/55" />
            </div>
          </>
        )}

        {/* Stars for night scene */}
        {isNightScene && (
          <>
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white animate-twinkle"
                style={{
                  width: Math.random() * 3 + 1 + 'px',
                  height: Math.random() * 3 + 1 + 'px',
                  top: Math.random() * 60 + '%',
                  left: Math.random() * 100 + '%',
                  animationDelay: Math.random() * 3 + 's',
                  animationDuration: Math.random() * 2 + 2 + 's',
                }}
              />
            ))}
            {/* Moon */}
            <div className="absolute top-16 right-16 w-20 h-20 rounded-full bg-yellow-100 shadow-[0_0_60px_20px_rgba(255,255,200,0.3)]" />
          </>
        )}

        {/* Swaying trees for forest */}
        {currentScene === 'forest' && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-around">
            {[...Array(7)].map((_, i) => (
              <TreeShape
                key={i}
                className="text-green-800"
                style={{
                  height: 150 + Math.random() * 100 + 'px',
                  animationDelay: i * 0.3 + 's',
                }}
              />
            ))}
          </div>
        )}

        {/* Ocean waves */}
        {currentScene === 'ocean' && (
          <div className="absolute bottom-0 left-0 right-0">
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-600/80 to-transparent" />
            <svg className="absolute bottom-0 w-full h-24 animate-wave" viewBox="0 0 1440 120" preserveAspectRatio="none">
              <path
                fill="rgba(59, 130, 246, 0.5)"
                d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
              />
            </svg>
            <svg className="absolute bottom-0 w-full h-20 animate-wave-slow" viewBox="0 0 1440 120" preserveAspectRatio="none">
              <path
                fill="rgba(37, 99, 235, 0.6)"
                d="M0,96L48,90.7C96,85,192,75,288,74.7C384,75,480,85,576,90.7C672,96,768,96,864,85.3C960,75,1056,53,1152,53.3C1248,53,1344,75,1392,85.3L1440,96L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
              />
            </svg>
          </div>
        )}

        {/* Grass/ground for day scene */}
        {currentScene === 'day' && (
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-green-400 to-green-300">
            <div className="absolute bottom-0 left-0 right-0 flex justify-around">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-green-600 rounded-t-full animate-sway"
                  style={{
                    height: 20 + Math.random() * 30 + 'px',
                    animationDelay: i * 0.1 + 's',
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Fireflies for night */}
        {isNightScene && (
          <>
            {[...Array(15)].map((_, i) => (
              <div
                key={`firefly-${i}`}
                className="absolute w-2 h-2 rounded-full bg-yellow-300 animate-firefly"
                style={{
                  top: 40 + Math.random() * 50 + '%',
                  left: Math.random() * 100 + '%',
                  animationDelay: Math.random() * 5 + 's',
                  animationDuration: 3 + Math.random() * 4 + 's',
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Header controls */}
      <header className="relative z-20 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${isNightScene ? 'bg-indigo-600' : 'bg-white/30'} backdrop-blur-sm flex items-center justify-center`}>
              <Cloud className={`w-5 h-5 ${isNightScene ? 'text-white' : 'text-gray-700'}`} />
            </div>
            <div>
              <h1 className={`text-lg font-bold ${isNightScene ? 'text-white' : 'text-gray-800'}`}>Quiet Corner</h1>
              <p className={`text-xs ${isNightScene ? 'text-white/70' : 'text-gray-600'}`}>A calm space just for you</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-full ${isNightScene ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-white/50 text-gray-700 hover:bg-white/70'} backdrop-blur-sm transition-colors`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4">
        {/* Breathing circle */}
        {showBreathing && (
          <div className="relative mb-8">
            <div
              className={`
                w-40 h-40 md:w-56 md:h-56 rounded-full flex items-center justify-center
                transition-all duration-[4000ms] ease-in-out
                ${breathPhase === 'inhale' ? 'scale-100 opacity-100' : ''}
                ${breathPhase === 'hold' ? 'scale-100 opacity-90' : ''}
                ${breathPhase === 'exhale' ? 'scale-75 opacity-70' : ''}
                ${isNightScene 
                  ? 'bg-gradient-to-br from-purple-400/40 to-indigo-500/40 shadow-[0_0_60px_20px_rgba(139,92,246,0.3)]' 
                  : 'bg-gradient-to-br from-white/50 to-sky-200/50 shadow-[0_0_60px_20px_rgba(255,255,255,0.4)]'
                }
                backdrop-blur-sm
              `}
            >
              <div
                className={`
                  w-28 h-28 md:w-40 md:h-40 rounded-full flex items-center justify-center
                  transition-all duration-[4000ms] ease-in-out
                  ${breathPhase === 'inhale' ? 'scale-100' : ''}
                  ${breathPhase === 'hold' ? 'scale-100' : ''}
                  ${breathPhase === 'exhale' ? 'scale-90' : ''}
                  ${isNightScene 
                    ? 'bg-gradient-to-br from-purple-300/50 to-indigo-400/50' 
                    : 'bg-gradient-to-br from-white/70 to-sky-100/70'
                  }
                `}
              >
                <span className={`text-xl md:text-2xl font-medium ${isNightScene ? 'text-white' : 'text-gray-700'}`}>
                  {breathPhase === 'inhale' && 'Breathe in...'}
                  {breathPhase === 'hold' && 'Hold...'}
                  {breathPhase === 'exhale' && 'Breathe out...'}
                </span>
              </div>
            </div>

            {/* Breath count */}
            <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm ${isNightScene ? 'text-white/60' : 'text-gray-500'}`}>
              {breathCount > 0 && `${breathCount} breath${breathCount > 1 ? 's' : ''}`}
            </div>
          </div>
        )}

        {/* Timer display */}
        {timerActive && timerSeconds > 0 && (
          <div className={`mb-6 px-6 py-3 rounded-full ${isNightScene ? 'bg-white/10' : 'bg-white/40'} backdrop-blur-sm`}>
            <span className={`text-2xl font-mono font-bold ${isNightScene ? 'text-white' : 'text-gray-700'}`}>
              {formatTime(timerSeconds)}
            </span>
          </div>
        )}

        {/* Now playing indicator */}
        {currentSound && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${isNightScene ? 'bg-white/10' : 'bg-white/40'} backdrop-blur-sm`}>
            <Music className={`w-4 h-4 ${isNightScene ? 'text-white/70' : 'text-gray-600'}`} />
            <span className={`text-sm ${isNightScene ? 'text-white/90' : 'text-gray-700'}`}>
              {currentSound.name}
            </span>
            {isPlaying && (
              <div className="flex gap-0.5 ml-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 ${isNightScene ? 'bg-white/70' : 'bg-gray-600'} rounded-full animate-equalizer`}
                    style={{ animationDelay: i * 0.15 + 's' }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom controls */}
      <footer className="fixed bottom-0 left-0 right-0 z-20 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Scene selector */}
          <div className={`flex justify-center gap-2 mb-4 p-2 rounded-2xl ${isNightScene ? 'bg-white/10' : 'bg-white/40'} backdrop-blur-sm`}>
            {scenes.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSceneChange(s.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl transition-all
                  ${currentScene === s.id
                    ? isNightScene
                      ? 'bg-white/30 text-white'
                      : 'bg-white text-gray-800 shadow-md'
                    : isNightScene
                      ? 'text-white/70 hover:bg-white/10'
                      : 'text-gray-600 hover:bg-white/50'
                  }
                `}
              >
                {s.icon}
                <span className="text-sm font-medium hidden sm:inline">{s.name}</span>
              </button>
            ))}
          </div>

          {/* Control buttons */}
          <div className={`flex items-center justify-center gap-3 p-3 rounded-2xl ${isNightScene ? 'bg-white/10' : 'bg-white/40'} backdrop-blur-sm`}>
            {/* Timer button */}
            <div className="relative">
              <button
                onClick={() => setShowTimerPicker(!showTimerPicker)}
                className={`
                  p-3 rounded-xl transition-all
                  ${timerActive
                    ? 'bg-green-500 text-white'
                    : isNightScene
                      ? 'bg-white/20 text-white hover:bg-white/30'
                      : 'bg-white/70 text-gray-700 hover:bg-white'
                  }
                `}
              >
                <Timer className="w-6 h-6" />
              </button>

              {/* Timer picker dropdown */}
              {showTimerPicker && (
                <div className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 p-2 rounded-xl ${isNightScene ? 'bg-indigo-800' : 'bg-white'} shadow-xl`}>
                  <div className="flex flex-col gap-1 min-w-[120px]">
                    {timerOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => startTimer(opt.value)}
                        className={`
                          px-4 py-2 rounded-lg text-sm font-medium transition-colors
                          ${isNightScene
                            ? 'text-white hover:bg-white/20'
                            : 'text-gray-700 hover:bg-gray-100'
                          }
                        `}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Play/Pause button */}
            <button
              onClick={() => isPlaying ? pause() : resume()}
              className={`
                p-4 rounded-xl transition-all
                ${isNightScene
                  ? 'bg-purple-500 text-white hover:bg-purple-400'
                  : 'bg-sky-500 text-white hover:bg-sky-400'
                }
              `}
            >
              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
            </button>

            {/* Sound picker button */}
            <button
              onClick={() => setShowSoundPicker(!showSoundPicker)}
              className={`
                p-3 rounded-xl transition-all
                ${isNightScene
                  ? 'bg-white/20 text-white hover:bg-white/30'
                  : 'bg-white/70 text-gray-700 hover:bg-white'
                }
              `}
            >
              <Music className="w-6 h-6" />
            </button>

            {/* Volume/Mute button */}
            <button
              onClick={toggleMute}
              className={`
                p-3 rounded-xl transition-all
                ${isMuted
                  ? 'bg-red-500/80 text-white'
                  : isNightScene
                    ? 'bg-white/20 text-white hover:bg-white/30'
                    : 'bg-white/70 text-gray-700 hover:bg-white'
                }
              `}
            >
              {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>

            {/* Toggle breathing */}
            <button
              onClick={() => setShowBreathing(!showBreathing)}
              className={`
                p-3 rounded-xl transition-all
                ${showBreathing
                  ? isNightScene
                    ? 'bg-purple-500 text-white'
                    : 'bg-sky-500 text-white'
                  : isNightScene
                    ? 'bg-white/20 text-white hover:bg-white/30'
                    : 'bg-white/70 text-gray-700 hover:bg-white'
                }
              `}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="8" />
                <path d="M12 8v8M8 12h8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Volume slider (when not muted) */}
          {!isMuted && (
            <div className={`mt-3 flex items-center gap-3 px-4 py-2 rounded-xl ${isNightScene ? 'bg-white/10' : 'bg-white/40'} backdrop-blur-sm`}>
              <Volume2 className={`w-4 h-4 ${isNightScene ? 'text-white/70' : 'text-gray-500'}`} />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="flex-1 h-2 rounded-full appearance-none cursor-pointer volume-slider"
                style={{
                  background: `linear-gradient(to right, ${isNightScene ? '#a78bfa' : '#0ea5e9'} 0%, ${isNightScene ? '#a78bfa' : '#0ea5e9'} ${volume * 100}%, ${isNightScene ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'} ${volume * 100}%, ${isNightScene ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'} 100%)`,
                }}
              />
              <span className={`text-xs w-8 ${isNightScene ? 'text-white/70' : 'text-gray-500'}`}>
                {Math.round(volume * 100)}%
              </span>
            </div>
          )}
        </div>
      </footer>

      {/* Sound picker modal */}
      {showSoundPicker && (
        <SoundPickerModal
          isNightScene={isNightScene}
          currentSoundId={currentSound?.id}
          approvedSounds={soundSettings.approvedSounds}
          onSelectSound={(soundId) => {
            play(soundId);
            setShowSoundPicker(false);
          }}
          onClose={() => setShowSoundPicker(false)}
        />
      )}
    </div>
  );
};

// Cloud SVG shape component
const CloudShape: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 100 60" fill="currentColor">
    <ellipse cx="30" cy="40" rx="25" ry="18" />
    <ellipse cx="55" cy="35" rx="30" ry="22" />
    <ellipse cx="75" cy="42" rx="20" ry="15" />
    <ellipse cx="45" cy="25" rx="18" ry="14" />
  </svg>
);

// Tree SVG shape component
const TreeShape: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg className={`${className} animate-sway-tree`} style={style} viewBox="0 0 40 100" fill="currentColor">
    <rect x="17" y="60" width="6" height="40" fill="#5D4037" />
    <ellipse cx="20" cy="35" rx="18" ry="35" />
    <ellipse cx="20" cy="20" rx="12" ry="22" />
  </svg>
);

// Sound picker modal component
interface SoundPickerModalProps {
  isNightScene: boolean;
  currentSoundId?: string;
  approvedSounds: string[];
  onSelectSound: (soundId: string) => void;
  onClose: () => void;
}

const SoundPickerModal: React.FC<SoundPickerModalProps> = ({
  isNightScene,
  currentSoundId,
  approvedSounds,
  onSelectSound,
  onClose,
}) => {
  const [activeCategory, setActiveCategory] = useState<'nature' | 'music' | 'whitenoise'>('nature');

  const categories = [
    { id: 'nature' as const, name: 'Nature', icon: <Leaf className="w-4 h-4" /> },
    { id: 'music' as const, name: 'Music', icon: <Music className="w-4 h-4" /> },
    { id: 'whitenoise' as const, name: 'White Noise', icon: <Waves className="w-4 h-4" /> },
  ];

  const sounds = getSoundsByCategory(activeCategory).filter(s => approvedSounds.includes(s.id));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      
      <div className={`relative w-full max-w-lg rounded-t-3xl ${isNightScene ? 'bg-indigo-900' : 'bg-white'} shadow-2xl animate-slide-up`}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className={`w-12 h-1 rounded-full ${isNightScene ? 'bg-white/30' : 'bg-gray-300'}`} />
        </div>

        {/* Header */}
        <div className="px-6 pb-4">
          <h3 className={`text-lg font-bold ${isNightScene ? 'text-white' : 'text-gray-800'}`}>
            Choose a Sound
          </h3>
        </div>

        {/* Category tabs */}
        <div className="px-4 pb-4">
          <div className={`flex gap-2 p-1 rounded-xl ${isNightScene ? 'bg-white/10' : 'bg-gray-100'}`}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all
                  ${activeCategory === cat.id
                    ? isNightScene
                      ? 'bg-purple-500 text-white'
                      : 'bg-white text-gray-800 shadow'
                    : isNightScene
                      ? 'text-white/70'
                      : 'text-gray-500'
                  }
                `}
              >
                {cat.icon}
                <span className="hidden sm:inline">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sound list */}
        <div className="px-4 pb-6 max-h-64 overflow-y-auto">
          <div className="grid grid-cols-2 gap-2">
            {sounds.map((sound) => (
              <button
                key={sound.id}
                onClick={() => onSelectSound(sound.id)}
                className={`
                  p-3 rounded-xl text-left transition-all
                  ${currentSoundId === sound.id
                    ? isNightScene
                      ? 'bg-purple-500 text-white'
                      : 'bg-sky-500 text-white'
                    : isNightScene
                      ? 'bg-white/10 text-white hover:bg-white/20'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <div className="font-medium text-sm">{sound.name}</div>
                <div className={`text-xs mt-1 ${currentSoundId === sound.id ? 'opacity-80' : 'opacity-60'}`}>
                  {sound.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuietCorner;
