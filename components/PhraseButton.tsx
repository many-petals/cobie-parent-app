import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { useSpeech } from '@/hooks/useSpeech';

interface PhraseButtonProps {
  phrase: string;
  color: string;
  audioEnabled?: boolean;
  character?: string;
  narrationSpeed?: number;
}

const PhraseButton: React.FC<PhraseButtonProps> = ({ 
  phrase, 
  color,
  audioEnabled = false,
  character = 'Cobie',
  narrationSpeed = 0.8,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [hasBeenPracticed, setHasBeenPracticed] = useState(false);

  const { speak, isSpeaking, isSupported } = useSpeech({
    character,
    speedMultiplier: narrationSpeed,
    enabled: audioEnabled,
  });

  const handlePress = () => {
    setIsPressed(true);
    setHasBeenPracticed(true);
    
    // Speak the phrase
    if (audioEnabled && isSupported) {
      speak(phrase, { immediate: true });
    }
    
    setTimeout(() => setIsPressed(false), 200);
  };

  return (
    <button
      onClick={handlePress}
      className={`relative flex items-center justify-between gap-3 p-5 rounded-2xl text-lg font-rounded font-medium transition-all duration-200 ${
        isPressed
          ? `${color} text-white scale-95 shadow-inner`
          : hasBeenPracticed
          ? `${color} bg-opacity-20 text-gray-700 border-2 border-current`
          : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300'
      }`}
    >
      <span className="text-left flex-1">"{phrase}"</span>
      
      {/* Speaker icon indicator */}
      {audioEnabled && isSupported && (
        <div className={`flex-shrink-0 p-2 rounded-full transition-all ${
          isSpeaking ? 'bg-white/30 animate-pulse' : 'bg-white/10'
        }`}>
          <Volume2 className={`w-5 h-5 ${isPressed ? 'text-white' : 'text-gray-400'}`} />
        </div>
      )}
      
      {/* Practiced checkmark */}
      {hasBeenPracticed && !isPressed && (
        <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full ${color} flex items-center justify-center`}>
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
};

export default PhraseButton;
