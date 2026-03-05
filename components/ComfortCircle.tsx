import React, { useState } from 'react';
import { Heart, Pencil, MessageCircle } from 'lucide-react';

interface ComfortCircleProps {
  onComplete: (choice: string) => void;
  color: string;
}

const ComfortCircle: React.FC<ComfortCircleProps> = ({ onComplete, color }) => {
  const [selectedComfort, setSelectedComfort] = useState<string | null>(null);
  const [feelingBetter, setFeelingBetter] = useState(false);

  const comfortOptions = [
    {
      id: 'cuddle',
      label: 'Cuddle',
      description: 'A warm hug makes things better',
      icon: Heart,
    },
    {
      id: 'draw',
      label: 'Draw it',
      description: 'Put your feelings on paper',
      icon: Pencil,
    },
    {
      id: 'tell',
      label: 'Tell the story',
      description: 'Talk about what happened',
      icon: MessageCircle,
    },
  ];

  const handleSelect = (comfortId: string) => {
    setSelectedComfort(comfortId);
  };

  const handleFeelingBetter = () => {
    setFeelingBetter(true);
  };

  const handleComplete = () => {
    if (selectedComfort) {
      onComplete(selectedComfort);
    }
  };

  const selectedComfortData = comfortOptions.find(c => c.id === selectedComfort);

  return (
    <div className="flex flex-col items-center py-6">
      <h3 className="text-2xl font-rounded font-bold text-gray-700 mb-2">
        Comfort Circle
      </h3>
      <p className="text-gray-500 mb-6 text-center max-w-md">
        It's okay to feel sad. Sad feelings need comfort.
        <br />
        What would help you feel a little better?
      </p>

      {/* Comfort options */}
      {!selectedComfort && (
        <div className="flex flex-col gap-4 w-full max-w-md">
          {comfortOptions.map((comfort) => {
            const Icon = comfort.icon;
            
            return (
              <button
                key={comfort.id}
                onClick={() => handleSelect(comfort.id)}
                className="flex items-center gap-4 p-5 rounded-2xl bg-white border-2 border-gray-200 text-gray-700 hover:border-pink-300 hover:scale-101 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-full bg-pink-50 flex items-center justify-center">
                  <Icon className="w-7 h-7 text-pink-500" />
                </div>
                <div className="text-left">
                  <p className="font-rounded font-semibold">{comfort.label}</p>
                  <p className="text-sm text-gray-500">{comfort.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Cuddle activity */}
      {selectedComfort === 'cuddle' && !feelingBetter && (
        <div className="bg-pink-50 rounded-2xl p-6 max-w-md text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-pink-100 flex items-center justify-center animate-gentle-pulse">
            <Heart className="w-12 h-12 text-pink-500" />
          </div>
          <p className="text-gray-700 font-rounded mb-4">
            Go get a cuddle from someone you love.
            <br />
            Take your time. Hugs help.
          </p>
          <button
            onClick={handleFeelingBetter}
            className={`px-8 py-3 rounded-full ${color} text-white font-semibold hover:scale-105 transition-transform shadow-lg`}
          >
            I got a cuddle
          </button>
        </div>
      )}

      {/* Draw activity */}
      {selectedComfort === 'draw' && !feelingBetter && (
        <div className="bg-pink-50 rounded-2xl p-6 max-w-md text-center">
          <div className="w-full h-40 mb-4 rounded-xl bg-white border-2 border-dashed border-pink-300 flex items-center justify-center">
            <div className="text-center">
              <Pencil className="w-8 h-8 text-pink-400 mx-auto mb-2" />
              <p className="text-pink-400 text-sm">Draw your feelings here</p>
              <p className="text-gray-400 text-xs">(or on paper)</p>
            </div>
          </div>
          <p className="text-gray-700 font-rounded mb-4">
            Draw how you feel. Any colors, any shapes.
            <br />
            There's no wrong way to draw feelings.
          </p>
          <button
            onClick={handleFeelingBetter}
            className={`px-8 py-3 rounded-full ${color} text-white font-semibold hover:scale-105 transition-transform shadow-lg`}
          >
            I drew it
          </button>
        </div>
      )}

      {/* Tell story activity */}
      {selectedComfort === 'tell' && !feelingBetter && (
        <div className="bg-pink-50 rounded-2xl p-6 max-w-md text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-pink-100 flex items-center justify-center">
            <MessageCircle className="w-12 h-12 text-pink-500" />
          </div>
          <p className="text-gray-700 font-rounded mb-2">
            Tell someone what happened.
          </p>
          <p className="text-gray-500 text-sm mb-4">
            Start with: "I feel sad because..."
          </p>
          <div className="bg-white rounded-xl p-4 mb-4 text-left">
            <p className="text-gray-600 text-sm">
              <span className="font-semibold">Helpful words:</span>
            </p>
            <ul className="text-gray-500 text-sm mt-2 space-y-1">
              <li>• "I wanted..."</li>
              <li>• "It made me feel..."</li>
              <li>• "I wish..."</li>
            </ul>
          </div>
          <button
            onClick={handleFeelingBetter}
            className={`px-8 py-3 rounded-full ${color} text-white font-semibold hover:scale-105 transition-transform shadow-lg`}
          >
            I told my story
          </button>
        </div>
      )}

      {/* Feeling better confirmation */}
      {feelingBetter && (
        <div className="bg-green-50 rounded-2xl p-6 max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-gray-700 font-rounded mb-2">
            Sad feelings are okay.
          </p>
          <p className="text-gray-500 text-sm mb-4">
            They come and they go. You are loved, always.
          </p>
          <button
            onClick={handleComplete}
            className={`px-8 py-3 rounded-full ${color} text-white font-semibold hover:scale-105 transition-transform shadow-lg`}
          >
            I feel a bit better
          </button>
        </div>
      )}

      {/* Back button */}
      {selectedComfort && !feelingBetter && (
        <button
          onClick={() => setSelectedComfort(null)}
          className="mt-4 text-gray-500 hover:text-gray-700 font-rounded"
        >
          Try something else
        </button>
      )}
    </div>
  );
};

export default ComfortCircle;
