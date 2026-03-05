import React, { useState } from 'react';
import { Hand, Users, MessageCircle, Eye } from 'lucide-react';

interface BraveStepsProps {
  onComplete: (step: string) => void;
  color: string;
}

const BraveSteps: React.FC<BraveStepsProps> = ({ onComplete, color }) => {
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [practiced, setPracticed] = useState(false);

  const braveSteps = [
    {
      id: 'wave',
      label: 'Wave',
      description: 'A small wave says hello',
      icon: Hand,
      difficulty: 1,
    },
    {
      id: 'stand-near',
      label: 'Stand near',
      description: 'Just be close, no words needed',
      icon: Users,
      difficulty: 1,
    },
    {
      id: 'one-word',
      label: 'One word',
      description: 'Say "hi" or "hello"',
      icon: MessageCircle,
      difficulty: 2,
    },
    {
      id: 'watch-first',
      label: 'Watch first',
      description: 'See what they\'re doing',
      icon: Eye,
      difficulty: 1,
    },
  ];

  const handleSelect = (stepId: string) => {
    setSelectedStep(stepId);
  };

  const handlePractice = () => {
    setPracticed(true);
  };

  const handleComplete = () => {
    if (selectedStep) {
      onComplete(selectedStep);
    }
  };

  const selectedStepData = braveSteps.find(s => s.id === selectedStep);

  return (
    <div className="flex flex-col items-center py-6">
      <h3 className="text-2xl font-rounded font-bold text-gray-700 mb-2">
        Tiny Brave Steps
      </h3>
      <p className="text-gray-500 mb-6 text-center max-w-md">
        You don't have to do everything at once.
        <br />
        Pick one tiny step that feels okay.
      </p>

      {/* Step options */}
      <div className="grid grid-cols-2 gap-4 max-w-md mb-6">
        {braveSteps.map((step) => {
          const Icon = step.icon;
          const isSelected = selectedStep === step.id;
          
          return (
            <button
              key={step.id}
              onClick={() => handleSelect(step.id)}
              className={`flex flex-col items-center gap-3 p-5 rounded-2xl transition-all duration-300 ${
                isSelected
                  ? `${color} text-white shadow-lg scale-105`
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                isSelected ? 'bg-white/20' : 'bg-purple-50'
              }`}>
                <Icon className={`w-7 h-7 ${isSelected ? 'text-white' : 'text-purple-500'}`} />
              </div>
              <div className="text-center">
                <p className="font-rounded font-semibold">{step.label}</p>
                <p className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                  {step.description}
                </p>
              </div>
              {/* Difficulty indicator */}
              <div className="flex gap-1">
                {[1, 2, 3].map((level) => (
                  <div
                    key={level}
                    className={`w-2 h-2 rounded-full ${
                      level <= step.difficulty
                        ? isSelected ? 'bg-white' : 'bg-purple-400'
                        : isSelected ? 'bg-white/30' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Practice section */}
      {selectedStep && !practiced && (
        <div className="bg-purple-50 rounded-2xl p-6 max-w-md text-center">
          <p className="text-gray-700 font-rounded mb-4">
            Let's practice <span className="font-semibold">{selectedStepData?.label}</span>
          </p>
          
          {selectedStep === 'wave' && (
            <div className="mb-4">
              <p className="text-gray-500 text-sm mb-3">Raise your hand and wave gently</p>
              <div className="w-20 h-20 mx-auto rounded-full bg-purple-100 flex items-center justify-center animate-gentle-pulse">
                <Hand className="w-10 h-10 text-purple-500" />
              </div>
            </div>
          )}
          
          {selectedStep === 'one-word' && (
            <div className="mb-4">
              <p className="text-gray-500 text-sm mb-3">Try saying it out loud:</p>
              <button
                className={`px-6 py-3 rounded-full ${color} text-white font-semibold text-lg`}
                onClick={() => {
                  if ('speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance('Hello');
                    utterance.rate = 0.8;
                    window.speechSynthesis.speak(utterance);
                  }
                }}
              >
                "Hello"
              </button>
            </div>
          )}
          
          {(selectedStep === 'stand-near' || selectedStep === 'watch-first') && (
            <div className="mb-4">
              <p className="text-gray-500 text-sm mb-3">
                {selectedStep === 'stand-near' 
                  ? 'Imagine standing near someone. You\'re there, and that\'s enough.'
                  : 'Watch what others are doing. You can join when you\'re ready.'}
              </p>
              <div className="flex justify-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-200" />
                <div className="w-12 h-12 rounded-full bg-purple-300 ring-4 ring-purple-400 ring-opacity-50" />
                <div className="w-12 h-12 rounded-full bg-purple-200" />
              </div>
            </div>
          )}

          <button
            onClick={handlePractice}
            className={`px-8 py-3 rounded-full ${color} text-white font-semibold hover:scale-105 transition-transform shadow-lg`}
          >
            I practiced!
          </button>
        </div>
      )}

      {/* Completion */}
      {practiced && (
        <div className="bg-green-50 rounded-2xl p-6 max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-gray-700 font-rounded mb-2">
            <span className="font-bold text-green-600">Brave Petal earned!</span>
          </p>
          <p className="text-gray-500 text-sm mb-4">
            Every tiny step counts. You're braver than you know.
          </p>
          <button
            onClick={handleComplete}
            className={`px-8 py-3 rounded-full ${color} text-white font-semibold hover:scale-105 transition-transform shadow-lg`}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
};

export default BraveSteps;
