import React, { useState, useEffect } from 'react';
import { useSpeech } from '@/hooks/useSpeech';

interface GoodbyeRitualProps {
  characterName: string;
  characterImage: string;
  color: string;
  message: string;
  onComplete: () => void;
  audioEnabled?: boolean;
  narrationSpeed?: number;
}

const GoodbyeRitual: React.FC<GoodbyeRitualProps> = ({
  characterName,
  characterImage,
  color,
  message,
  onComplete,
  audioEnabled = false,
  narrationSpeed = 0.8,
}) => {
  const [fadePhase, setFadePhase] = useState(0);
  const [petalsClosed, setPetalsClosed] = useState(false);

  const { speak, stop, isSupported } = useSpeech({
    character: characterName,
    speedMultiplier: narrationSpeed,
    enabled: audioEnabled,
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  useEffect(() => {
    // Speak the goodbye messages in sequence
    if (audioEnabled && isSupported) {
      // First message
      speak(message, { immediate: true });
      
      // Second message after delay
      setTimeout(() => {
        speak(`${characterName} is proud of you.`);
      }, 3000);
      
      // Third message
      setTimeout(() => {
        speak("You did something brave today.");
      }, 5500);
    }

    const timer1 = setTimeout(() => setFadePhase(1), 1000);
    const timer2 = setTimeout(() => setFadePhase(2), 2500);
    const timer3 = setTimeout(() => setPetalsClosed(true), 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [audioEnabled, isSupported, speak, message, characterName]);

  const handleComplete = () => {
    stop();
    onComplete();
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 min-h-[400px]">
      {/* Petal close animation */}
      <div className="relative w-64 h-64 mb-8">
        {/* Outer petals */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`absolute w-16 h-24 rounded-full ${color} opacity-40 transition-all duration-[2000ms] ease-in-out`}
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateY(${
                petalsClosed ? '0px' : '-60px'
              })`,
              opacity: petalsClosed ? 0.1 : 0.4,
            }}
          />
        ))}

        {/* Character in center */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-[2000ms] ${
            petalsClosed ? 'opacity-50 scale-90' : 'opacity-100 scale-100'
          }`}
        >
          <div className="w-32 h-32 rounded-full bg-white/80 flex items-center justify-center shadow-lg">
            <img
              src={characterImage}
              alt={characterName}
              className="w-24 h-24 object-contain"
            />
          </div>
        </div>

        {/* Soft glow */}
        <div
          className={`absolute inset-0 rounded-full ${color} opacity-10 blur-xl transition-all duration-[3000ms] ${
            petalsClosed ? 'scale-50 opacity-5' : 'scale-100'
          }`}
        />
      </div>

      {/* Message phases */}
      <div className="text-center space-y-4">
        <p
          className={`text-xl font-rounded text-gray-700 transition-opacity duration-1000 ${
            fadePhase >= 0 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {message}
        </p>
        <p
          className={`text-lg font-rounded text-gray-500 transition-opacity duration-1000 ${
            fadePhase >= 1 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {characterName} is proud of you.
        </p>
        <p
          className={`text-lg font-rounded text-gray-500 transition-opacity duration-1000 ${
            fadePhase >= 2 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          You did something brave today.
        </p>
      </div>

      {/* Return button */}
      {petalsClosed && (
        <button
          onClick={handleComplete}
          className={`mt-8 px-8 py-4 rounded-full ${color} text-white font-rounded font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg animate-fade-in`}
        >
          Back to Garden
        </button>
      )}
    </div>
  );
};

export default GoodbyeRitual;
