import React, { useState, useEffect, useCallback } from 'react';
import { useSpeech } from '@/hooks/useSpeech';

interface BreathingExerciseProps {
  type: 'cactus-arms' | 'root-breaths' | 'blow-petals' | 'warm-hands' | 'brave-breath' | 'slow-hands';
  cycles: number;
  onComplete: () => void;
  characterColor: string;
  audioEnabled?: boolean;
  character?: string;
  narrationSpeed?: number;
}

const BreathingExercise: React.FC<BreathingExerciseProps> = ({
  type,
  cycles,
  onComplete,
  characterColor,
  audioEnabled = false,
  character = 'Cobie',
  narrationSpeed = 0.8,
}) => {
  const [currentCycle, setCurrentCycle] = useState(0);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [isActive, setIsActive] = useState(false);
  const [petalsBlown, setPetalsBlown] = useState(0);

  const { speak, stop, isSupported } = useSpeech({
    character,
    speedMultiplier: narrationSpeed,
    enabled: audioEnabled,
  });

  const instructions: Record<string, { 
    inhale: string; 
    exhale: string; 
    title: string;
    startMessage: string;
    completeMessage: string;
  }> = {
    'cactus-arms': {
      title: 'Cactus Arms',
      inhale: 'Open your arms wide like a cactus...',
      exhale: 'Give yourself a gentle hug...',
      startMessage: "Let's do cactus arms together. When you breathe in, open your arms wide like a cactus. When you breathe out, give yourself a gentle hug.",
      completeMessage: "Wonderful! You did such a great job with your cactus arms. Your body feels calmer now.",
    },
    'root-breaths': {
      title: 'Root Breaths',
      inhale: 'Breathe in... "I am here"',
      exhale: 'Breathe out... "I am safe"',
      startMessage: "Let's take some root breaths together. Imagine you're a strong tree with roots going deep into the ground. Breathe in and say 'I am here'. Breathe out and say 'I am safe'.",
      completeMessage: "Beautiful! You're as strong and steady as a tree. Your roots are deep and you are safe.",
    },
    'blow-petals': {
      title: 'Blow the Petals',
      inhale: 'Take a big breath in...',
      exhale: 'Blow the petal gently...',
      startMessage: "Let's blow some petals together. Take a big breath in, then blow out gently like you're blowing a petal off a flower. Nice and slow.",
      completeMessage: "All the petals are floating away, and so is that fizzy feeling. You did it!",
    },
    'warm-hands': {
      title: 'Warm Hands',
      inhale: 'Rub your hands together...',
      exhale: 'Place them on your heart...',
      startMessage: "Let's make warm hands together. Rub your hands together to make them warm, then place them gently on your heart. Feel the warmth spreading.",
      completeMessage: "Your heart feels warm and loved. You gave yourself a beautiful gift of comfort.",
    },
    'brave-breath': {
      title: 'Brave Breath',
      inhale: 'Smell the flower...',
      exhale: 'Blow out the candle...',
      startMessage: "Let's take some brave breaths. Pretend you're smelling a beautiful flower when you breathe in. Then blow out like you're blowing out a birthday candle.",
      completeMessage: "You found your brave breath! Each breath made you a little bit braver.",
    },
    'slow-hands': {
      title: 'Slow Hands',
      inhale: 'Trace the line slowly...',
      exhale: 'Keep going nice and slow...',
      startMessage: "Let's do slow hands together. Open your hand and slowly trace up one finger as you breathe in, then trace down as you breathe out. Nice and slow.",
      completeMessage: "Your hands are calm and steady now. You did such a patient job!",
    },
  };

  const currentInstruction = instructions[type];

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  useEffect(() => {
    if (!isActive) return;

    const phaseDurations = {
      inhale: 3000,
      hold: 1000,
      exhale: 4000,
    };

    const timer = setTimeout(() => {
      if (phase === 'inhale') {
        setPhase('hold');
      } else if (phase === 'hold') {
        setPhase('exhale');
        // Speak exhale instruction
        if (audioEnabled && isSupported) {
          speak(currentInstruction.exhale);
        }
      } else {
        if (type === 'blow-petals') {
          setPetalsBlown(prev => prev + 1);
        }
        if (currentCycle + 1 >= cycles) {
          setIsActive(false);
          // Speak completion message
          if (audioEnabled && isSupported) {
            speak(currentInstruction.completeMessage);
          }
          onComplete();
        } else {
          setCurrentCycle(prev => prev + 1);
          setPhase('inhale');
          // Speak inhale instruction for next cycle
          if (audioEnabled && isSupported) {
            speak(currentInstruction.inhale);
          }
        }
      }
    }, phaseDurations[phase]);

    return () => clearTimeout(timer);
  }, [phase, currentCycle, cycles, isActive, onComplete, type, audioEnabled, isSupported, speak, currentInstruction]);

  const startExercise = useCallback(() => {
    setIsActive(true);
    setCurrentCycle(0);
    setPhase('inhale');
    setPetalsBlown(0);
    
    // Speak start message and first instruction
    if (audioEnabled && isSupported) {
      speak(currentInstruction.startMessage, { immediate: true });
      // Queue the first inhale instruction
      setTimeout(() => {
        speak(currentInstruction.inhale);
      }, 4000); // After start message
    }
  }, [audioEnabled, isSupported, speak, currentInstruction]);

  const getCircleSize = () => {
    if (phase === 'inhale') return 'scale-100';
    if (phase === 'hold') return 'scale-100';
    return 'scale-75';
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <h3 className="text-2xl font-rounded font-bold text-gray-700 mb-6">
        {currentInstruction.title}
      </h3>

      {!isActive ? (
        <button
          onClick={startExercise}
          className={`px-8 py-4 rounded-full text-white font-semibold text-xl transition-all duration-300 hover:scale-105 shadow-lg ${characterColor}`}
        >
          Start Breathing
        </button>
      ) : (
        <>
          {/* Breathing circle visualization */}
          <div className="relative w-48 h-48 mb-6">
            <div
              className={`absolute inset-0 rounded-full ${characterColor} opacity-30 transition-transform duration-[3000ms] ease-in-out ${getCircleSize()}`}
            />
            <div
              className={`absolute inset-4 rounded-full ${characterColor} opacity-50 transition-transform duration-[3000ms] ease-in-out ${getCircleSize()}`}
            />
            <div
              className={`absolute inset-8 rounded-full ${characterColor} opacity-70 transition-transform duration-[3000ms] ease-in-out ${getCircleSize()}`}
            />
            <div
              className={`absolute inset-12 rounded-full ${characterColor} flex items-center justify-center transition-transform duration-[3000ms] ease-in-out ${getCircleSize()}`}
            >
              <span className="text-white font-bold text-lg">
                {phase === 'inhale' ? 'In' : phase === 'hold' ? 'Hold' : 'Out'}
              </span>
            </div>
          </div>

          {/* Instruction text */}
          <p className="text-xl text-gray-600 text-center mb-4 font-rounded">
            {phase === 'exhale' ? currentInstruction.exhale : currentInstruction.inhale}
          </p>

          {/* Petals for blow-petals type */}
          {type === 'blow-petals' && (
            <div className="flex gap-2 mt-4">
              {Array.from({ length: cycles }).map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full transition-all duration-500 ${
                    i < petalsBlown
                      ? 'bg-pink-300 opacity-30 translate-x-8'
                      : 'bg-pink-400'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Progress indicator */}
          <div className="flex gap-2 mt-6">
            {Array.from({ length: cycles }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  i <= currentCycle ? characterColor : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BreathingExercise;
