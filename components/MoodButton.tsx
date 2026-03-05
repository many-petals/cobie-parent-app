import React from 'react';

interface MoodButtonProps {
  mood: string;
  label: string;
  character: string;
  characterImage: string;
  color: string;
  bgColor: string;
  onClick: () => void;
}

const MoodButton: React.FC<MoodButtonProps> = ({
  mood,
  label,
  character,
  characterImage,
  color,
  bgColor,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col items-center p-4 rounded-3xl transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-opacity-50 ${bgColor} ${color}`}
      style={{ minHeight: '180px', minWidth: '140px' }}
      aria-label={`I feel ${label}`}
    >
      <div className="relative w-24 h-24 mb-3 overflow-hidden rounded-2xl bg-white/50 flex items-center justify-center">
        <img
          src={characterImage}
          alt={character}
          className="w-20 h-20 object-contain transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <span className="text-center font-rounded font-semibold text-lg leading-tight">
        {label}
      </span>
      <span className="text-center text-sm opacity-70 mt-1">
        with {character}
      </span>
    </button>
  );
};

export default MoodButton;
