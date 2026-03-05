// Sound Library Configuration
// Categories: Nature, Music, White Noise

export interface Sound {
  id: string;
  name: string;
  category: 'nature' | 'music' | 'whitenoise';
  icon: string; // Emoji or icon identifier
  description: string;
  // Using free ambient sound URLs from freesound.org and similar sources
  // In production, these would be hosted on your own CDN
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
    description: 'Soft rain falling on leaves',
    audioUrl: 'https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3',
    defaultVolume: 0.4,
  },
  {
    id: 'ocean-waves',
    name: 'Ocean Waves',
    category: 'nature',
    icon: 'waves',
    description: 'Calm waves on a peaceful beach',
    audioUrl: 'https://assets.mixkit.co/active_storage/sfx/2432/2432-preview.mp3',
    defaultVolume: 0.35,
  },
  {
    id: 'forest-birds',
    name: 'Forest Birds',
    category: 'nature',
    icon: 'forest',
    description: 'Birds singing in a quiet forest',
    audioUrl: 'https://assets.mixkit.co/active_storage/sfx/2433/2433-preview.mp3',
    defaultVolume: 0.3,
  },
  {
    id: 'stream-water',
    name: 'Flowing Stream',
    category: 'nature',
    icon: 'stream',
    description: 'A gentle stream flowing over rocks',
    audioUrl: 'https://assets.mixkit.co/active_storage/sfx/2515/2515-preview.mp3',
    defaultVolume: 0.35,
  },
  {
    id: 'wind-trees',
    name: 'Wind in Trees',
    category: 'nature',
    icon: 'wind',
    description: 'Soft breeze rustling through leaves',
    audioUrl: 'https://assets.mixkit.co/active_storage/sfx/2434/2434-preview.mp3',
    defaultVolume: 0.3,
  },
  {
    id: 'night-crickets',
    name: 'Night Crickets',
    category: 'nature',
    icon: 'night',
    description: 'Peaceful nighttime cricket sounds',
    audioUrl: 'https://assets.mixkit.co/active_storage/sfx/2436/2436-preview.mp3',
    defaultVolume: 0.25,
  },
  
  // Gentle Music
  {
    id: 'music-lullaby',
    name: 'Soft Lullaby',
    category: 'music',
    icon: 'music',
    description: 'Gentle piano lullaby melody',
    audioUrl: 'https://assets.mixkit.co/active_storage/sfx/2437/2437-preview.mp3',
    defaultVolume: 0.3,
  },
  {
    id: 'music-peaceful',
    name: 'Peaceful Piano',
    category: 'music',
    icon: 'piano',
    description: 'Calm piano music for relaxation',
    audioUrl: 'https://assets.mixkit.co/active_storage/sfx/2438/2438-preview.mp3',
    defaultVolume: 0.3,
  },
  {
    id: 'music-dreamy',
    name: 'Dreamy Melody',
    category: 'music',
    icon: 'stars',
    description: 'Soft, dreamy background music',
    audioUrl: 'https://assets.mixkit.co/active_storage/sfx/2439/2439-preview.mp3',
    defaultVolume: 0.25,
  },
  
  // White Noise
  {
    id: 'whitenoise-soft',
    name: 'Soft White Noise',
    category: 'whitenoise',
    icon: 'noise',
    description: 'Gentle white noise for focus',
    audioUrl: 'https://assets.mixkit.co/active_storage/sfx/2440/2440-preview.mp3',
    defaultVolume: 0.2,
  },
  {
    id: 'whitenoise-pink',
    name: 'Pink Noise',
    category: 'whitenoise',
    icon: 'pink',
    description: 'Soothing pink noise',
    audioUrl: 'https://assets.mixkit.co/active_storage/sfx/2441/2441-preview.mp3',
    defaultVolume: 0.2,
  },
  {
    id: 'whitenoise-fan',
    name: 'Gentle Fan',
    category: 'whitenoise',
    icon: 'fan',
    description: 'Soft fan humming sound',
    audioUrl: 'https://assets.mixkit.co/active_storage/sfx/2442/2442-preview.mp3',
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
