import React, { useState } from 'react';

interface FeelingsFinderProps {
  options: { label: string; bodyPart: string }[];
  characterName: string;
  color: string;
  onSelect: (feeling: string) => void;
}

const FeelingsFinder: React.FC<FeelingsFinderProps> = ({
  options,
  characterName,
  color,
  onSelect,
}) => {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (label: string) => {
    setSelected(label);
    onSelect(label);
  };

  const bodyIcons: Record<string, React.ReactNode> = {
    head: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="8" r="5" strokeWidth={2} />
        <path strokeLinecap="round" strokeWidth={2} d="M12 13v3" />
      </svg>
    ),
    tummy: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <ellipse cx="12" cy="12" rx="6" ry="8" strokeWidth={2} />
      </svg>
    ),
    hands: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeWidth={2} d="M7 11V7a5 5 0 0110 0v4M5 11h14v8a2 2 0 01-2 2H7a2 2 0 01-2-2v-8z" />
      </svg>
    ),
    chest: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeWidth={2} d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    ),
    legs: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeWidth={2} d="M8 8v12M16 8v12M8 14h8" />
      </svg>
    ),
  };

  return (
    <div className="flex flex-col items-center py-6">
      <p className="text-lg text-gray-600 mb-2 font-rounded">
        {characterName} wants to know...
      </p>
      <h3 className="text-2xl font-rounded font-bold text-gray-700 mb-6">
        Where do you feel it in your body?
      </h3>
      <div className="grid grid-cols-2 gap-4 max-w-md">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleSelect(option.label)}
            className={`flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 ${
              selected === option.label
                ? `${color} text-white shadow-lg scale-105`
                : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              selected === option.label ? 'bg-white/20' : 'bg-gray-100'
            }`}>
              {bodyIcons[option.bodyPart] || bodyIcons.chest}
            </div>
            <span className="font-rounded font-medium">{option.label}</span>
          </button>
        ))}
      </div>
      {selected && (
        <div className={`mt-6 p-4 rounded-2xl ${color} bg-opacity-10`}>
          <p className="text-gray-700 font-rounded">
            That's okay. Feeling <strong>{selected.toLowerCase()}</strong> is normal.
            <br />
            Let's help your body feel better.
          </p>
        </div>
      )}
    </div>
  );
};

export default FeelingsFinder;
