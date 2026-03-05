import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Music } from 'lucide-react';
import FeelingsFinder from './FeelingsFinder';
import BreathingExercise from './BreathingExercise';
import PhraseButton from './PhraseButton';
import TinyPlan from './TinyPlan';
import GoodbyeRitual from './GoodbyeRitual';
import SoundPicker from './SoundPicker';
import { useSpeech } from '@/hooks/useSpeech';
import { useBackgroundSound } from '@/hooks/useBackgroundSound';
import { SoundSettings, defaultSoundSettings, defaultCharacterSounds } from './soundConfig';

interface MoodConfig {
  id: string;
  name: string;
  character: string;
  characterImage: string;
  color: string;
  bgColor: string;
  colorClass: string;
  feelings: { label: string; bodyPart: string }[];
  breathingType: 'cactus-arms' | 'root-breaths' | 'blow-petals' | 'warm-hands' | 'brave-breath' | 'slow-hands';
  breathingCycles: number;
  phrases: string[];
  planOptions: { label: string; icon: React.ReactNode }[];
  goodbyeMessage: string;
}

interface PetalPathProps {
  mood: MoodConfig;
  onComplete: () => void;
  onBack: () => void;
  settings?: {
    narrationSpeed: number;
    audioEnabled: boolean;
  };
  soundSettings?: SoundSettings;
}

const PetalPath: React.FC<PetalPathProps> = ({ 
  mood, 
  onComplete, 
  onBack,
  settings = { narrationSpeed: 0.8, audioEnabled: true },
  soundSettings = defaultSoundSettings,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [breathingComplete, setBreathingComplete] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(settings.audioEnabled);
  const [showSoundPicker, setShowSoundPicker] = useState(false);

  // Initialize speech with character voice
  const { speak, stop: stopSpeech, isSpeaking, isSupported } = useSpeech({
    character: mood.character,
    speedMultiplier: settings.narrationSpeed,
    enabled: audioEnabled,
  });

  // Initialize background sound
  const {
    currentSound,
    isPlaying: isSoundPlaying,
    volume: soundVolume,
    isMuted: isSoundMuted,
    play: playSound,
    stop: stopSound,
    pause: pauseSound,
    resume: resumeSound,
    setVolume: setSoundVolume,
    fadeOut: fadeOutSound,
    fadeIn: fadeInSound,
    toggleMute: toggleSoundMute,
  } = useBackgroundSound({ settings: soundSettings });

  const steps = [
    { name: 'Feelings Finder', duration: '30-45s' },
    { name: 'Body Helper', duration: '90-120s' },
    { name: 'Words to Use', duration: '30-45s' },
    { name: 'Tiny Plan', duration: '30-45s' },
    { name: 'Goodbye', duration: '15-30s' },
  ];

  // Step narration content
  const stepNarrations: Record<number, string> = {
    0: `Hi friend, I'm ${mood.character}. Let's find out where you feel it in your body. Tap the one that feels most like you right now.`,
    1: `Great job! Now let's help your body feel better with some special breathing. Press start when you're ready.`,
    2: `You're doing so well! Here are some words you can use. Tap each one to practice saying it out loud.`,
    3: `Almost there! What would help you feel better right now? Pick one thing we can try.`,
    4: mood.goodbyeMessage,
  };

  // Start default sound for character on mount
  useEffect(() => {
    if (soundSettings.enabled) {
      const defaultSoundId = soundSettings.characterDefaults[mood.character] || defaultCharacterSounds[mood.character];
      if (defaultSoundId) {
        playSound(defaultSoundId);
      }
    }
    
    return () => {
      stopSound();
    };
  }, []);

  // Auto-fade sound when narration plays
  useEffect(() => {
    if (isSpeaking && soundSettings.autoFadeOnNarration) {
      fadeOutSound();
    } else if (!isSpeaking && soundSettings.autoFadeOnNarration) {
      fadeInSound();
    }
  }, [isSpeaking, soundSettings.autoFadeOnNarration]);

  // Speak step narration when step changes
  useEffect(() => {
    if (audioEnabled && isSupported) {
      // Small delay to let the UI settle
      const timer = setTimeout(() => {
        speak(stepNarrations[currentStep], { immediate: true });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentStep, audioEnabled, isSupported]);

  // Stop speech when leaving the path
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, [stopSpeech]);

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return selectedFeeling !== null;
      case 1:
        return breathingComplete;
      case 2:
        return true; // Can always proceed from phrases
      case 3:
        return selectedPlan !== null;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      stopSpeech(); // Stop current narration
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      stopSpeech(); // Stop current narration
      setCurrentStep(currentStep - 1);
    }
  };

  const handleBack = () => {
    stopSpeech();
    stopSound();
    onBack();
  };

  const handleComplete = () => {
    stopSpeech();
    stopSound();
    onComplete();
  };

  const toggleAudio = () => {
    if (audioEnabled) {
      stopSpeech();
    }
    setAudioEnabled(!audioEnabled);
  };

  const handleFeelingSelect = (feeling: string) => {
    setSelectedFeeling(feeling);
    if (audioEnabled && isSupported) {
      speak(`That's okay. Feeling ${feeling.toLowerCase()} is normal. Let's help your body feel better.`);
    }
  };

  const handlePlanSelect = (plan: string) => {
    setSelectedPlan(plan);
    if (audioEnabled && isSupported) {
      speak(`Great choice! Let's try: ${plan}`);
    }
  };

  const handleSelectSound = (soundId: string) => {
    playSound(soundId);
  };

  const handleToggleSoundPlay = () => {
    if (isSoundPlaying) {
      pauseSound();
    } else {
      resumeSound();
    }
  };

  return (
    <div className={`min-h-screen ${mood.bgColor}`}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            <div className="flex items-center gap-3">
              <img
                src={mood.characterImage}
                alt={mood.character}
                className="w-10 h-10 rounded-full object-contain bg-white shadow-sm"
              />
              <span className="font-rounded font-semibold text-gray-700">
                {mood.character}'s Path
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Sound toggle button */}
              {soundSettings.enabled && (
                <button
                  onClick={() => setShowSoundPicker(true)}
                  className={`p-2 rounded-full transition-all ${
                    currentSound && isSoundPlaying
                      ? `${mood.colorClass} text-white shadow-md`
                      : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                  }`}
                  title="Background sounds"
                >
                  <Music className={`w-5 h-5 ${currentSound && isSoundPlaying ? 'animate-pulse' : ''}`} />
                </button>
              )}
              {/* Audio toggle button */}
              {isSupported && (
                <button
                  onClick={toggleAudio}
                  className={`p-2 rounded-full transition-all ${
                    audioEnabled 
                      ? `${mood.colorClass} text-white shadow-md` 
                      : 'bg-gray-200 text-gray-500'
                  } ${isSpeaking ? 'animate-pulse' : ''}`}
                  title={audioEnabled ? 'Turn off narration' : 'Turn on narration'}
                >
                  {audioEnabled ? (
                    <Volume2 className="w-5 h-5" />
                  ) : (
                    <VolumeX className="w-5 h-5" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex gap-2">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex-1 h-2 rounded-full transition-colors duration-300 ${
                  index <= currentStep ? mood.colorClass : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-sm text-gray-500">{steps[currentStep].name}</span>
            <span className="text-sm text-gray-400">{steps[currentStep].duration}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Step 1: Feelings Finder */}
        {currentStep === 0 && (
          <FeelingsFinder
            options={mood.feelings}
            characterName={mood.character}
            color={mood.colorClass}
            onSelect={handleFeelingSelect}
          />
        )}

        {/* Step 2: Body Helper (Breathing) */}
        {currentStep === 1 && (
          <BreathingExercise
            type={mood.breathingType}
            cycles={mood.breathingCycles}
            onComplete={() => setBreathingComplete(true)}
            characterColor={mood.colorClass}
            audioEnabled={audioEnabled}
            character={mood.character}
            narrationSpeed={settings.narrationSpeed}
          />
        )}

        {/* Step 3: Words to Use */}
        {currentStep === 2 && (
          <div className="flex flex-col items-center py-6">
            <h3 className="text-2xl font-rounded font-bold text-gray-700 mb-2">
              Words to Use
            </h3>
            <p className="text-gray-500 mb-6 text-center">
              Tap each phrase to practice saying it
            </p>
            <div className="flex flex-col gap-4 w-full max-w-md">
              {mood.phrases.map((phrase, index) => (
                <PhraseButton 
                  key={index} 
                  phrase={phrase} 
                  color={mood.colorClass}
                  audioEnabled={audioEnabled}
                  character={mood.character}
                  narrationSpeed={settings.narrationSpeed}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Tiny Plan */}
        {currentStep === 3 && (
          <TinyPlan
            options={mood.planOptions}
            onSelect={handlePlanSelect}
            color={mood.colorClass}
          />
        )}

        {/* Step 5: Goodbye Ritual */}
        {currentStep === 4 && (
          <GoodbyeRitual
            characterName={mood.character}
            characterImage={mood.characterImage}
            color={mood.colorClass}
            message={mood.goodbyeMessage}
            onComplete={handleComplete}
            audioEnabled={audioEnabled}
            narrationSpeed={settings.narrationSpeed}
          />
        )}
      </div>

      {/* Navigation buttons */}
      {currentStep < 4 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-100 p-4">
          <div className="max-w-2xl mx-auto flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                currentStep === 0
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all ${
                canProceed()
                  ? `${mood.colorClass} text-white hover:scale-105 shadow-lg`
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Sound Picker Modal */}
      <SoundPicker
        approvedSoundIds={soundSettings.approvedSounds}
        currentSoundId={currentSound?.id || null}
        isPlaying={isSoundPlaying}
        volume={soundVolume}
        isMuted={isSoundMuted}
        onSelectSound={handleSelectSound}
        onStop={stopSound}
        onTogglePlay={handleToggleSoundPlay}
        onVolumeChange={setSoundVolume}
        onToggleMute={toggleSoundMute}
        colorClass={mood.colorClass}
        isOpen={showSoundPicker}
        onClose={() => setShowSoundPicker(false)}
      />
    </div>
  );
};

export default PetalPath;

