// Sound Library Configuration
// Categories: Nature, Music, White Noise

export interface Sound {
  id: string;
  name: string;
  category: 'nature' | 'music' | 'whitenoise';
  icon: string; // Emoji or icon identifier
  description: string;
  audioUrl: string;
  defaultVolume: number; // 0-1
}

export interface SoundSettings {
  enabled: boolean;
  volume: number;
  autoFadeOnNarration: boolean;
  fadeDuration: number; // ms
  approvedSounds: string[]; // Sound IDs that children can access
  characterDefaults: Record<string, string>; // character name -> sound ID
}

// Sound library with calming ambient sounds
export const soundLibrary: Sound[] = [
  // Nature Sounds
  {
    id: 'rain-gentle',
    name: 'Gentle Rain',
    category: 'nature',
    icon: 'rain',
    description: 'Soft rain on leaves',
    audioUrl: '/sounds/quiet-corner/rain-gentle.wav',
    defaultVolume: 0.4,
  },
  {
    id: 'ocean-waves',
    name: 'Ocean Waves',
    category: 'nature',
    icon: 'waves',
    description: 'Gentle beach waves',
    audioUrl: '/sounds/quiet-corner/ocean-waves.wav',
    defaultVolume: 0.35,
  },
  {
    id: 'forest-birds',
    name: 'Forest Birds',
    category: 'nature',
    icon: 'forest',
    description: 'Soft birds and a breezy garden morning',
    audioUrl: '/sounds/quiet-corner/forest-birds.wav',
    defaultVolume: 0.3,
  },
  {
    id: 'stream-water',
    name: 'Flowing Stream',
    category: 'nature',
    icon: 'stream',
    description: 'Water over smooth rocks',
    audioUrl: '/sounds/quiet-corner/stream-water.wav',
    defaultVolume: 0.35,
  },
  {
    id: 'wind-trees',
    name: 'Wind in Trees',
    category: 'nature',
    icon: 'wind',
    description: 'Breezy leaves overhead',
    audioUrl: '/sounds/quiet-corner/wind-trees.wav',
    defaultVolume: 0.3,
  },
  {
    id: 'night-crickets',
    name: 'Night Crickets',
    category: 'nature',
    icon: 'night',
    description: 'Gentle nighttime chirps with soft evening air',
    audioUrl: '/sounds/quiet-corner/night-crickets.wav',
    defaultVolume: 0.22,
  },
  
  // Gentle Music
  {
    id: 'music-lullaby',
    name: 'Soft Lullaby',
    category: 'music',
    icon: 'music',
    description: 'Gentle lullaby melody',
    audioUrl: '/sounds/quiet-corner/music-lullaby.wav',
    defaultVolume: 0.3,
  },
  {
    id: 'music-peaceful',
    name: 'Peaceful Piano',
    category: 'music',
    icon: 'piano',
    description: 'Soft piano notes',
    audioUrl: '/sounds/quiet-corner/music-peaceful.wav',
    defaultVolume: 0.3,
  },
  {
    id: 'music-dreamy',
    name: 'Dreamy Melody',
    category: 'music',
    icon: 'stars',
    description: 'Slow floating notes for a starry sky',
    audioUrl: '/sounds/quiet-corner/music-dreamy.wav',
    defaultVolume: 0.25,
  },
  
  // White Noise
  {
    id: 'whitenoise-soft',
    name: 'Soft White Noise',
    category: 'whitenoise',
    icon: 'noise',
    description: 'Smooth steady hiss',
    audioUrl: '/sounds/quiet-corner/whitenoise-soft.wav',
    defaultVolume: 0.2,
  },
  {
    id: 'whitenoise-pink',
    name: 'Pink Noise',
    category: 'whitenoise',
    icon: 'pink',
    description: 'Softer warm noise',
    audioUrl: '/sounds/quiet-corner/whitenoise-pink.wav',
    defaultVolume: 0.2,
  },
  {
    id: 'whitenoise-fan',
    name: 'Gentle Fan',
    category: 'whitenoise',
    icon: 'fan',
    description: 'Gentle fan hum',
    audioUrl: '/sounds/quiet-corner/whitenoise-fan.wav',
    defaultVolume: 0.25,
  },
];

// Default approved sounds for children (all sounds by default)
export const defaultApprovedSounds = soundLibrary.map(s => s.id);

// Default character sound mappings
export const defaultCharacterSounds: Record<string, string> = {
  'Cobie': 'forest-birds',      // Gentle, quiet - forest birds
  'Tree': 'wind-trees',         // Calm, grounding - wind in trees
  'Tilda': 'stream-water',      // Cooling down - flowing water
  'Livleen': 'rain-gentle',     // Comforting - gentle rain
  'Harper': 'music-peaceful',   // Encouraging - peaceful music
  'Dulcy': 'ocean-waves',       // Patient - ocean waves
};

// Default sound settings
export const defaultSoundSettings: SoundSettings = {
  enabled: true,
  volume: 0.5,
  autoFadeOnNarration: true,
  fadeDuration: 500,
  approvedSounds: defaultApprovedSounds,
  characterDefaults: defaultCharacterSounds,
};

// Get sound by ID
export const getSoundById = (id: string): Sound | undefined => {
  return soundLibrary.find(s => s.id === id);
};

// Get sounds by category
export const getSoundsByCategory = (category: Sound['category']): Sound[] => {
  return soundLibrary.filter(s => s.category === category);
};

// Get approved sounds for children
export const getApprovedSounds = (approvedIds: string[]): Sound[] => {
  return soundLibrary.filter(s => approvedIds.includes(s.id));
};

// Category display info
export const categoryInfo: Record<Sound['category'], { name: string; icon: string; color: string }> = {
  nature: { name: 'Nature', icon: 'leaf', color: 'green' },
  music: { name: 'Music', icon: 'music', color: 'purple' },
  whitenoise: { name: 'White Noise', icon: 'waves', color: 'blue' },
};
