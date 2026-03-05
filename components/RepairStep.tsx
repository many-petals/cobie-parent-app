import React, { useState } from 'react';
import { Heart, HandHeart, RefreshCw } from 'lucide-react';

interface RepairStepProps {
  onComplete: (choice: string) => void;
  color: string;
}

const RepairStep: React.FC<RepairStepProps> = ({ onComplete, color }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const repairOptions = [
    {
      id: 'try-again',
      label: 'Try again with softer hands',
      description: 'Use gentle touches instead',
      icon: RefreshCw,
    },
    {
      id: 'say-sorry',
      label: 'Say sorry',
      description: '"I\'m sorry. I was cross."',
      icon: Heart,
    },
    {
      id: 'show-sorry',
      label: 'Show sorry',
      description: 'A hug or helping hand',
      icon: HandHeart,
    },
  ];

  const handleSelect = (optionId: string) => {
    setSelectedOption(optionId);
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    if (selectedOption) {
      onComplete(selectedOption);
    }
  };

  return (
    <div className="flex flex-col items-center py-6">
      <h3 className="text-2xl font-rounded font-bold text-gray-700 mb-2">
        Making it Better
      </h3>
      <p className="text-gray-500 mb-6 text-center max-w-md">
        When we're cross, sometimes we do things we don't mean.
        <br />
        That's okay. We can always try to make it better.
      </p>

      {/* Repair options */}
      <div className="flex flex-col gap-4 w-full max-w-md mb-6">
        {repairOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedOption === option.id;
          
          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className={`flex items-center gap-4 p-5 rounded-2xl transition-all duration-300 ${
                isSelected
                  ? `${color} text-white shadow-lg scale-102`
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:scale-101'
              }`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                isSelected ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                <Icon className={`w-7 h-7 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
              </div>
              <div className="text-left">
                <p className="font-rounded font-semibold">{option.label}</p>
                <p className={`text-sm ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                  {option.description}
                </p>
              </div>
              {isSelected && (
                <div className="ml-auto">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Confirmation */}
      {showConfirmation && selectedOption && (
        <div className="bg-green-50 rounded-2xl p-6 max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <Heart className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-gray-700 font-rounded mb-4">
            That's a kind choice.
            <br />
            <span className="font-semibold">Repair helps everyone feel better.</span>
          </p>
          <button
            onClick={handleConfirm}
            className={`px-8 py-3 rounded-full ${color} text-white font-semibold hover:scale-105 transition-transform shadow-lg`}
          >
            I'm ready
          </button>
        </div>
      )}

      {/* Reminder */}
      <div className="mt-8 p-4 bg-yellow-50 rounded-xl max-w-md">
        <p className="text-yellow-800 text-sm font-rounded text-center">
          <span className="font-semibold">Remember:</span> Strong feelings are okay.
          <br />
          Hurting is not okay. But we can always repair.
        </p>
      </div>
    </div>
  );
};

export default RepairStep;
