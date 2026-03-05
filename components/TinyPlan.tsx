import React, { useState } from 'react';

interface TinyPlanProps {
  options: { label: string; icon: React.ReactNode }[];
  onSelect: (option: string) => void;
  color: string;
}

const TinyPlan: React.FC<TinyPlanProps> = ({ options, onSelect, color }) => {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (label: string) => {
    setSelected(label);
    onSelect(label);
  };

  return (
    <div className="flex flex-col items-center py-6">
      <h3 className="text-xl font-rounded font-bold text-gray-700 mb-6">
        What would help right now?
      </h3>
      <div className="flex flex-wrap justify-center gap-4">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleSelect(option.label)}
            className={`flex flex-col items-center gap-3 p-6 rounded-3xl min-w-[140px] transition-all duration-300 ${
              selected === option.label
                ? `${color} text-white shadow-lg scale-105`
                : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:scale-102'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              selected === option.label ? 'bg-white/20' : 'bg-gray-100'
            }`}>
              {option.icon}
            </div>
            <span className="font-rounded font-medium text-center">
              {option.label}
            </span>
          </button>
        ))}
      </div>
      {selected && (
        <div className="mt-6 p-4 bg-green-50 rounded-2xl border border-green-200">
          <p className="text-green-700 font-rounded">
            Great choice! Let's try: <strong>{selected}</strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default TinyPlan;
