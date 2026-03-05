import React, { useState } from 'react';
import { Volume2, VolumeX, Pause, Play, X, Music, Leaf, Waves } from 'lucide-react';
import { Sound, getApprovedSounds, categoryInfo } from './soundConfig';

interface SoundPickerProps {
  approvedSoundIds: string[];
  currentSoundId: string | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  onSelectSound: (soundId: string) => void;
  onStop: () => void;
  onTogglePlay: () => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  colorClass: string;
  isOpen: boolean;
  onClose: () => void;
}

// Icon components for sound types
const SoundIcon: React.FC<{ icon: string; className?: string }> = ({ icon, className = 'w-5 h-5' }) => {
  switch (icon) {
    case 'rain':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 19v2M8 13v2M16 19v2M16 13v2M12 21v2M12 15v2M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" />
        </svg>
      );
    case 'waves':
      return <Waves className={className} />;
    case 'forest':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22v-7M9 22h6M12 15l-4-6h8l-4 6zM12 9l-3-5h6l-3 5z" />
        </svg>
      );
    case 'stream':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 7c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
        </svg>
      );
    case 'wind':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
        </svg>
      );
    case 'night':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      );
    case 'music':
    case 'piano':
      return <Music className={className} />;
    case 'stars':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case 'noise':
    case 'pink':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="2" height="6" rx="1" />
          <rect x="7" y="8" width="2" height="12" rx="1" />
          <rect x="11" y="5" width="2" height="14" rx="1" />
          <rect x="15" y="9" width="2" height="10" rx="1" />
          <rect x="19" y="12" width="2" height="4" rx="1" />
        </svg>
      );
    case 'fan':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 9a9 9 0 0 1 9-6M12 9a9 9 0 0 0-9-6M12 15a9 9 0 0 0 9 6M12 15a9 9 0 0 1-9 6" />
        </svg>
      );
    case 'leaf':
      return <Leaf className={className} />;
    default:
      return <Music className={className} />;
  }
};

// Category icon component
const CategoryIcon: React.FC<{ category: Sound['category']; className?: string }> = ({ category, className }) => {
  const info = categoryInfo[category];
  return <SoundIcon icon={info.icon} className={className} />;
};

const SoundPicker: React.FC<SoundPickerProps> = ({
  approvedSoundIds,
  currentSoundId,
  isPlaying,
  volume,
  isMuted,
  onSelectSound,
  onStop,
  onTogglePlay,
  onVolumeChange,
  onToggleMute,
  colorClass,
  isOpen,
  onClose,
}) => {
  const [activeCategory, setActiveCategory] = useState<Sound['category'] | 'all'>('all');
  
  const approvedSounds = getApprovedSounds(approvedSoundIds);
  const currentSound = approvedSounds.find(s => s.id === currentSoundId);

  const filteredSounds = activeCategory === 'all' 
    ? approvedSounds 
    : approvedSounds.filter(s => s.category === activeCategory);

  const categories: (Sound['category'] | 'all')[] = ['all', 'nature', 'music', 'whitenoise'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center`}>
              <Music className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-rounded font-bold text-gray-800">Calming Sounds</h3>
              <p className="text-sm text-gray-500">Pick a sound to help you relax</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Now Playing */}
        {currentSound && (
          <div className={`mx-4 mt-4 p-4 rounded-2xl ${colorClass} bg-opacity-10`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center`}>
                  <SoundIcon icon={currentSound.icon} className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{currentSound.name}</p>
                  <p className="text-sm text-gray-500">Now playing</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onTogglePlay}
                  className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center text-white shadow-md hover:scale-105 transition-transform`}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                <button
                  onClick={onStop}
                  className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3">
              <button
                onClick={onToggleMute}
                className="p-2 rounded-lg hover:bg-white/50 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-gray-600" />
                ) : (
                  <Volume2 className="w-5 h-5 text-gray-600" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume * 100}
                onChange={(e) => onVolumeChange(parseInt(e.target.value) / 100)}
                className="flex-1 h-2 rounded-full appearance-none bg-gray-300 cursor-pointer"
                style={{
                  background: `linear-gradient(to right, currentColor ${isMuted ? 0 : volume * 100}%, #d1d5db ${isMuted ? 0 : volume * 100}%)`,
                }}
              />
              <span className="text-sm text-gray-600 w-10 text-right">
                {isMuted ? '0' : Math.round(volume * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex gap-2 px-4 py-3 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? `${colorClass} text-white`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat === 'all' ? 'All' : categoryInfo[cat].name}
            </button>
          ))}
        </div>

        {/* Sound List */}
        <div className="px-4 pb-4 overflow-y-auto max-h-[40vh]">
          <div className="grid grid-cols-2 gap-3">
            {filteredSounds.map((sound) => (
              <button
                key={sound.id}
                onClick={() => onSelectSound(sound.id)}
                className={`p-4 rounded-2xl text-left transition-all ${
                  currentSoundId === sound.id
                    ? `${colorClass} text-white shadow-lg scale-[1.02]`
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl mb-2 flex items-center justify-center ${
                  currentSoundId === sound.id
                    ? 'bg-white/20'
                    : 'bg-white shadow-sm'
                }`}>
                  <SoundIcon 
                    icon={sound.icon} 
                    className={`w-5 h-5 ${currentSoundId === sound.id ? 'text-white' : 'text-gray-600'}`} 
                  />
                </div>
                <p className="font-medium text-sm">{sound.name}</p>
                <p className={`text-xs mt-0.5 ${
                  currentSoundId === sound.id ? 'text-white/70' : 'text-gray-400'
                }`}>
                  {categoryInfo[sound.category].name}
                </p>
              </button>
            ))}
          </div>

          {filteredSounds.length === 0 && (
            <div className="text-center py-8">
              <Music className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No sounds available in this category</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SoundPicker;
