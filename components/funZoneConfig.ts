// Fun Zone Configuration - Shared types and data for all mini-games

export interface GameReward {
  stickers: number;
  gardenItems: string[];
}

export interface GameConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bgGradient: string;
  minAge: number;
  maxAge: number;
  sessionLength: string;
}

export const gameConfigs: GameConfig[] = [
  {
    id: 'hide-seek',
    name: 'Garden Hide & Seek',
    description: 'Find hidden friends in the garden!',
    icon: '🔍',
    color: 'bg-green-500',
    bgGradient: 'from-green-400 to-emerald-500',
    minAge: 3,
    maxAge: 7,
    sessionLength: '30-60s',
  },
  {
    id: 'seed-sort',
    name: 'Seed Sorting',
    description: 'Sort colorful seeds into bins!',
    icon: '🌱',
    color: 'bg-amber-500',
    bgGradient: 'from-amber-400 to-orange-500',
    minAge: 3,
    maxAge: 7,
    sessionLength: '45-90s',
  },
  {
    id: 'memory-match',
    name: 'Memory Match',
    description: 'Match garden friend pairs!',
    icon: '🃏',
    color: 'bg-purple-500',
    bgGradient: 'from-purple-400 to-pink-500',
    minAge: 3,
    maxAge: 7,
    sessionLength: '60-120s',
  },
  {
    id: 'bug-builder',
    name: 'Bug Builder',
    description: 'Create your own cute bugs!',
    icon: '🐛',
    color: 'bg-pink-500',
    bgGradient: 'from-pink-400 to-rose-500',
    minAge: 3,
    maxAge: 7,
    sessionLength: '60-120s',
  },
  {
    id: 'ladybird-launch',
    name: 'Ladybird Launch',
    description: 'Help ladybird reach the leaves!',
    icon: '🐞',
    color: 'bg-red-500',
    bgGradient: 'from-red-400 to-orange-500',
    minAge: 4,
    maxAge: 7,
    sessionLength: '30-60s',
  },
];

// Hide and Seek - Scene configurations with difficulty variants
export interface HideSeekItem {
  id: string;
  name: string;
  emoji: string;
  x: number;
  y: number;
  size: 'sm' | 'md' | 'lg';
}

export interface SceneDecoration {
  emoji: string;
  x: number;
  y: number;
  size: 'sm' | 'md' | 'lg' | 'xl';
  zIndex: number; // 0 = behind items, 1 = in front of items
  opacity?: number;
}

export interface HideSeekScene {
  id: string;
  name: string;
  background: string;
  groundColor: string;
  decorations: SceneDecoration[];
  items: {
    easy: HideSeekItem[];
    medium: HideSeekItem[];
    hard: HideSeekItem[];
  };
}


export const hideSeekScenes: HideSeekScene[] = [
  {
    id: 'garden',
    name: 'Sunny Garden',
    background: 'bg-gradient-to-b from-sky-300 to-green-400',
    groundColor: 'bg-green-600',
    decorations: [
      // Background flowers and bushes
      { emoji: '🌿', x: 5, y: 60, size: 'xl', zIndex: 0 },
      { emoji: '🌿', x: 95, y: 55, size: 'xl', zIndex: 0 },
      { emoji: '🌳', x: 8, y: 35, size: 'xl', zIndex: 0 },
      { emoji: '🌳', x: 92, y: 30, size: 'xl', zIndex: 0 },
      // Foreground flowers that hide items
      { emoji: '🌻', x: 12, y: 28, size: 'lg', zIndex: 1 },
      { emoji: '🌺', x: 18, y: 68, size: 'lg', zIndex: 1 },
      { emoji: '🌸', x: 32, y: 52, size: 'lg', zIndex: 1 },
      { emoji: '🌷', x: 48, y: 72, size: 'lg', zIndex: 1 },
      { emoji: '🌼', x: 58, y: 38, size: 'lg', zIndex: 1 },
      { emoji: '🌺', x: 72, y: 62, size: 'lg', zIndex: 1 },
      { emoji: '🌻', x: 82, y: 22, size: 'lg', zIndex: 1 },
      { emoji: '🌿', x: 88, y: 48, size: 'lg', zIndex: 1 },
      // Grass patches
      { emoji: '🌾', x: 25, y: 80, size: 'md', zIndex: 1 },
      { emoji: '🌾', x: 55, y: 82, size: 'md', zIndex: 1 },
      { emoji: '🌾', x: 75, y: 78, size: 'md', zIndex: 1 },
    ],
    items: {
      easy: [
        { id: 'butterfly', name: 'Butterfly', emoji: '🦋', x: 15, y: 25, size: 'lg' },
        { id: 'ladybug', name: 'Ladybug', emoji: '🐞', x: 75, y: 65, size: 'lg' },
        { id: 'snail', name: 'Snail', emoji: '🐌', x: 45, y: 75, size: 'lg' },
        { id: 'bee', name: 'Bee', emoji: '🐝', x: 85, y: 20, size: 'lg' },
        { id: 'flower1', name: 'Flower', emoji: '🌸', x: 30, y: 55, size: 'lg' },
        { id: 'caterpillar', name: 'Caterpillar', emoji: '🐛', x: 60, y: 40, size: 'lg' },
      ],
      medium: [
        { id: 'butterfly', name: 'Butterfly', emoji: '🦋', x: 15, y: 25, size: 'md' },
        { id: 'ladybug', name: 'Ladybug', emoji: '🐞', x: 75, y: 65, size: 'md' },
        { id: 'snail', name: 'Snail', emoji: '🐌', x: 45, y: 78, size: 'md' },
        { id: 'bee', name: 'Bee', emoji: '🐝', x: 85, y: 18, size: 'sm' },
        { id: 'flower1', name: 'Flower', emoji: '🌸', x: 30, y: 55, size: 'md' },
        { id: 'caterpillar', name: 'Caterpillar', emoji: '🐛', x: 60, y: 40, size: 'md' },
        { id: 'tulip', name: 'Tulip', emoji: '🌷', x: 20, y: 70, size: 'md' },
        { id: 'sunflower', name: 'Sunflower', emoji: '🌻', x: 90, y: 45, size: 'md' },
        { id: 'ant', name: 'Ant', emoji: '🐜', x: 55, y: 85, size: 'sm' },
        { id: 'worm', name: 'Worm', emoji: '🪱', x: 70, y: 80, size: 'sm' },
      ],
      hard: [
        { id: 'butterfly', name: 'Butterfly', emoji: '🦋', x: 12, y: 22, size: 'sm' },
        { id: 'ladybug', name: 'Ladybug', emoji: '🐞', x: 78, y: 68, size: 'sm' },
        { id: 'snail', name: 'Snail', emoji: '🐌', x: 42, y: 82, size: 'sm' },
        { id: 'bee', name: 'Bee', emoji: '🐝', x: 88, y: 15, size: 'sm' },
        { id: 'flower1', name: 'Flower', emoji: '🌸', x: 28, y: 52, size: 'sm' },
        { id: 'caterpillar', name: 'Caterpillar', emoji: '🐛', x: 62, y: 38, size: 'sm' },
        { id: 'tulip', name: 'Tulip', emoji: '🌷', x: 18, y: 72, size: 'sm' },
        { id: 'sunflower', name: 'Sunflower', emoji: '🌻', x: 92, y: 42, size: 'sm' },
        { id: 'ant', name: 'Ant', emoji: '🐜', x: 52, y: 88, size: 'sm' },
        { id: 'worm', name: 'Worm', emoji: '🪱', x: 72, y: 78, size: 'sm' },
        { id: 'cricket', name: 'Cricket', emoji: '🦗', x: 35, y: 30, size: 'sm' },
        { id: 'spider', name: 'Spider', emoji: '🕷️', x: 8, y: 45, size: 'sm' },
        { id: 'rose', name: 'Rose', emoji: '🌹', x: 48, y: 60, size: 'sm' },
        { id: 'leaf', name: 'Leaf', emoji: '🍃', x: 82, y: 55, size: 'sm' },
      ],
    },
  },
  {
    id: 'pond',
    name: 'Peaceful Pond',
    background: 'bg-gradient-to-b from-sky-400 to-blue-500',
    groundColor: 'bg-blue-700',
    decorations: [
      // Reeds and cattails around the pond
      { emoji: '🌾', x: 5, y: 45, size: 'xl', zIndex: 0 },
      { emoji: '🌾', x: 8, y: 55, size: 'lg', zIndex: 0 },
      { emoji: '🌾', x: 95, y: 50, size: 'xl', zIndex: 0 },
      { emoji: '🌾', x: 92, y: 60, size: 'lg', zIndex: 0 },
      // Lily pads that hide items
      { emoji: '🪷', x: 22, y: 68, size: 'lg', zIndex: 1 },
      { emoji: '🪷', x: 35, y: 75, size: 'lg', zIndex: 1 },
      { emoji: '🪷', x: 48, y: 62, size: 'lg', zIndex: 1 },
      { emoji: '🪷', x: 65, y: 72, size: 'lg', zIndex: 1 },
      { emoji: '🪷', x: 78, y: 65, size: 'lg', zIndex: 1 },
      // Rocks
      { emoji: '🪨', x: 12, y: 78, size: 'md', zIndex: 1 },
      { emoji: '🪨', x: 88, y: 75, size: 'md', zIndex: 1 },
      // Foreground reeds
      { emoji: '🌿', x: 18, y: 35, size: 'lg', zIndex: 1 },
      { emoji: '🌿', x: 82, y: 42, size: 'lg', zIndex: 1 },
      // Clouds for sky hiding
      { emoji: '☁️', x: 25, y: 18, size: 'lg', zIndex: 1, opacity: 0.7 },
      { emoji: '☁️', x: 70, y: 22, size: 'lg', zIndex: 1, opacity: 0.7 },
    ],
    items: {
      easy: [
        { id: 'frog', name: 'Frog', emoji: '🐸', x: 30, y: 70, size: 'lg' },
        { id: 'fish', name: 'Fish', emoji: '🐟', x: 55, y: 80, size: 'lg' },
        { id: 'duck', name: 'Duck', emoji: '🦆', x: 70, y: 40, size: 'lg' },
        { id: 'turtle', name: 'Turtle', emoji: '🐢', x: 80, y: 70, size: 'lg' },
        { id: 'lily', name: 'Lily', emoji: '🪷', x: 45, y: 60, size: 'lg' },
        { id: 'dragonfly', name: 'Dragonfly', emoji: '🪰', x: 20, y: 25, size: 'lg' },
      ],
      medium: [
        { id: 'frog', name: 'Frog', emoji: '🐸', x: 28, y: 72, size: 'md' },
        { id: 'fish', name: 'Fish', emoji: '🐟', x: 52, y: 82, size: 'md' },
        { id: 'duck', name: 'Duck', emoji: '🦆', x: 72, y: 38, size: 'md' },
        { id: 'turtle', name: 'Turtle', emoji: '🐢', x: 82, y: 68, size: 'md' },
        { id: 'lily', name: 'Lily', emoji: '🪷', x: 42, y: 58, size: 'md' },
        { id: 'dragonfly', name: 'Dragonfly', emoji: '🪰', x: 18, y: 22, size: 'sm' },
        { id: 'swan', name: 'Swan', emoji: '🦢', x: 60, y: 50, size: 'md' },
        { id: 'crab', name: 'Crab', emoji: '🦀', x: 88, y: 85, size: 'md' },
        { id: 'shell', name: 'Shell', emoji: '🐚', x: 35, y: 88, size: 'sm' },
        { id: 'wave', name: 'Wave', emoji: '🌊', x: 15, y: 65, size: 'md' },
      ],
      hard: [
        { id: 'frog', name: 'Frog', emoji: '🐸', x: 25, y: 75, size: 'sm' },
        { id: 'fish', name: 'Fish', emoji: '🐟', x: 50, y: 85, size: 'sm' },
        { id: 'duck', name: 'Duck', emoji: '🦆', x: 75, y: 35, size: 'sm' },
        { id: 'turtle', name: 'Turtle', emoji: '🐢', x: 85, y: 65, size: 'sm' },
        { id: 'lily', name: 'Lily', emoji: '🪷', x: 40, y: 55, size: 'sm' },
        { id: 'dragonfly', name: 'Dragonfly', emoji: '🪰', x: 15, y: 20, size: 'sm' },
        { id: 'swan', name: 'Swan', emoji: '🦢', x: 62, y: 48, size: 'sm' },
        { id: 'crab', name: 'Crab', emoji: '🦀', x: 90, y: 88, size: 'sm' },
        { id: 'shell', name: 'Shell', emoji: '🐚', x: 32, y: 90, size: 'sm' },
        { id: 'wave', name: 'Wave', emoji: '🌊', x: 12, y: 62, size: 'sm' },
        { id: 'octopus', name: 'Octopus', emoji: '🐙', x: 68, y: 78, size: 'sm' },
        { id: 'dolphin', name: 'Dolphin', emoji: '🐬', x: 45, y: 30, size: 'sm' },
        { id: 'starfish', name: 'Starfish', emoji: '⭐', x: 8, y: 80, size: 'sm' },
        { id: 'seaweed', name: 'Seaweed', emoji: '🌿', x: 92, y: 45, size: 'sm' },
      ],
    },
  },
  {
    id: 'forest',
    name: 'Friendly Forest',
    background: 'bg-gradient-to-b from-emerald-600 to-green-800',
    groundColor: 'bg-amber-900',
    decorations: [
      // Background trees
      { emoji: '🌲', x: 5, y: 25, size: 'xl', zIndex: 0 },
      { emoji: '🌲', x: 15, y: 30, size: 'xl', zIndex: 0 },
      { emoji: '🌳', x: 85, y: 22, size: 'xl', zIndex: 0 },
      { emoji: '🌲', x: 95, y: 28, size: 'xl', zIndex: 0 },
      // Foreground trees and bushes that hide items
      { emoji: '🌳', x: 22, y: 45, size: 'xl', zIndex: 1 },
      { emoji: '🌲', x: 38, y: 35, size: 'lg', zIndex: 1 },
      { emoji: '🌳', x: 55, y: 50, size: 'xl', zIndex: 1 },
      { emoji: '🌲', x: 72, y: 40, size: 'lg', zIndex: 1 },
      { emoji: '🌳', x: 88, y: 48, size: 'xl', zIndex: 1 },
      // Bushes
      { emoji: '🌿', x: 12, y: 65, size: 'lg', zIndex: 1 },
      { emoji: '🌿', x: 32, y: 72, size: 'lg', zIndex: 1 },
      { emoji: '🌿', x: 58, y: 68, size: 'lg', zIndex: 1 },
      { emoji: '🌿', x: 78, y: 75, size: 'lg', zIndex: 1 },
      // Logs and stumps
      { emoji: '🪵', x: 45, y: 82, size: 'md', zIndex: 1 },
      { emoji: '🪵', x: 68, y: 85, size: 'md', zIndex: 1 },
    ],
    items: {
      easy: [
        { id: 'owl', name: 'Owl', emoji: '🦉', x: 25, y: 20, size: 'lg' },
        { id: 'squirrel', name: 'Squirrel', emoji: '🐿️', x: 70, y: 35, size: 'lg' },
        { id: 'mushroom', name: 'Mushroom', emoji: '🍄', x: 15, y: 75, size: 'lg' },
        { id: 'rabbit', name: 'Rabbit', emoji: '🐰', x: 55, y: 70, size: 'lg' },
        { id: 'bird', name: 'Bird', emoji: '🐦', x: 85, y: 15, size: 'lg' },
        { id: 'hedgehog', name: 'Hedgehog', emoji: '🦔', x: 40, y: 55, size: 'lg' },
      ],
      medium: [
        { id: 'owl', name: 'Owl', emoji: '🦉', x: 22, y: 18, size: 'md' },
        { id: 'squirrel', name: 'Squirrel', emoji: '🐿️', x: 72, y: 32, size: 'md' },
        { id: 'mushroom', name: 'Mushroom', emoji: '🍄', x: 12, y: 78, size: 'md' },
        { id: 'rabbit', name: 'Rabbit', emoji: '🐰', x: 52, y: 72, size: 'md' },
        { id: 'bird', name: 'Bird', emoji: '🐦', x: 88, y: 12, size: 'sm' },
        { id: 'hedgehog', name: 'Hedgehog', emoji: '🦔', x: 38, y: 52, size: 'md' },
        { id: 'deer', name: 'Deer', emoji: '🦌', x: 60, y: 45, size: 'md' },
        { id: 'acorn', name: 'Acorn', emoji: '🌰', x: 82, y: 65, size: 'sm' },
        { id: 'pinecone', name: 'Pinecone', emoji: '🌲', x: 30, y: 85, size: 'md' },
        { id: 'fox', name: 'Fox', emoji: '🦊', x: 90, y: 80, size: 'md' },
      ],
      hard: [
        { id: 'owl', name: 'Owl', emoji: '🦉', x: 20, y: 15, size: 'sm' },
        { id: 'squirrel', name: 'Squirrel', emoji: '🐿️', x: 75, y: 30, size: 'sm' },
        { id: 'mushroom', name: 'Mushroom', emoji: '🍄', x: 10, y: 80, size: 'sm' },
        { id: 'rabbit', name: 'Rabbit', emoji: '🐰', x: 50, y: 75, size: 'sm' },
        { id: 'bird', name: 'Bird', emoji: '🐦', x: 90, y: 10, size: 'sm' },
        { id: 'hedgehog', name: 'Hedgehog', emoji: '🦔', x: 35, y: 50, size: 'sm' },
        { id: 'deer', name: 'Deer', emoji: '🦌', x: 62, y: 42, size: 'sm' },
        { id: 'acorn', name: 'Acorn', emoji: '🌰', x: 85, y: 62, size: 'sm' },
        { id: 'pinecone', name: 'Pinecone', emoji: '🌲', x: 28, y: 88, size: 'sm' },
        { id: 'fox', name: 'Fox', emoji: '🦊', x: 92, y: 82, size: 'sm' },
        { id: 'bear', name: 'Bear', emoji: '🐻', x: 45, y: 25, size: 'sm' },
        { id: 'wolf', name: 'Wolf', emoji: '🐺', x: 8, y: 55, size: 'sm' },
        { id: 'bee', name: 'Bee', emoji: '🐝', x: 68, y: 18, size: 'sm' },
        { id: 'butterfly', name: 'Butterfly', emoji: '🦋', x: 55, y: 58, size: 'sm' },
      ],
    },
  },
  {
    id: 'beach',
    name: 'Sandy Beach',
    background: 'bg-gradient-to-b from-sky-300 to-amber-200',
    groundColor: 'bg-amber-400',
    decorations: [
      // Palm trees
      { emoji: '🌴', x: 8, y: 35, size: 'xl', zIndex: 0 },
      { emoji: '🌴', x: 92, y: 32, size: 'xl', zIndex: 0 },
      // Beach umbrellas that hide items
      { emoji: '⛱️', x: 25, y: 48, size: 'xl', zIndex: 1 },
      { emoji: '⛱️', x: 65, y: 52, size: 'xl', zIndex: 1 },
      // Sand dunes (using rocks as dunes)
      { emoji: '🪨', x: 18, y: 72, size: 'lg', zIndex: 1 },
      { emoji: '🪨', x: 42, y: 78, size: 'lg', zIndex: 1 },
      { emoji: '🪨', x: 75, y: 75, size: 'lg', zIndex: 1 },
      // Beach items
      { emoji: '🏖️', x: 35, y: 65, size: 'lg', zIndex: 1 },
      { emoji: '🪣', x: 55, y: 70, size: 'md', zIndex: 1 },
      { emoji: '🏄', x: 85, y: 58, size: 'lg', zIndex: 1 },
      // Waves
      { emoji: '🌊', x: 15, y: 88, size: 'lg', zIndex: 1 },
      { emoji: '🌊', x: 50, y: 90, size: 'lg', zIndex: 1 },
      { emoji: '🌊', x: 80, y: 88, size: 'lg', zIndex: 1 },
      // Clouds
      { emoji: '☁️', x: 30, y: 15, size: 'lg', zIndex: 1, opacity: 0.6 },
      { emoji: '☁️', x: 60, y: 12, size: 'md', zIndex: 1, opacity: 0.6 },
    ],
    items: {
      easy: [
        { id: 'crab', name: 'Crab', emoji: '🦀', x: 25, y: 75, size: 'lg' },
        { id: 'starfish', name: 'Starfish', emoji: '⭐', x: 70, y: 80, size: 'lg' },
        { id: 'shell', name: 'Shell', emoji: '🐚', x: 45, y: 70, size: 'lg' },
        { id: 'palm', name: 'Palm', emoji: '🌴', x: 15, y: 30, size: 'lg' },
        { id: 'sun', name: 'Sun', emoji: '☀️', x: 85, y: 15, size: 'lg' },
        { id: 'umbrella', name: 'Umbrella', emoji: '⛱️', x: 55, y: 45, size: 'lg' },
      ],
      medium: [
        { id: 'crab', name: 'Crab', emoji: '🦀', x: 22, y: 78, size: 'md' },
        { id: 'starfish', name: 'Starfish', emoji: '⭐', x: 72, y: 82, size: 'md' },
        { id: 'shell', name: 'Shell', emoji: '🐚', x: 42, y: 72, size: 'md' },
        { id: 'palm', name: 'Palm', emoji: '🌴', x: 12, y: 28, size: 'md' },
        { id: 'sun', name: 'Sun', emoji: '☀️', x: 88, y: 12, size: 'md' },
        { id: 'umbrella', name: 'Umbrella', emoji: '⛱️', x: 52, y: 42, size: 'md' },
        { id: 'bucket', name: 'Bucket', emoji: '🪣', x: 35, y: 60, size: 'md' },
        { id: 'ball', name: 'Ball', emoji: '🏐', x: 80, y: 55, size: 'md' },
        { id: 'seagull', name: 'Seagull', emoji: '🐦', x: 65, y: 20, size: 'sm' },
        { id: 'sandcastle', name: 'Castle', emoji: '🏰', x: 90, y: 70, size: 'md' },
      ],
      hard: [
        { id: 'crab', name: 'Crab', emoji: '🦀', x: 20, y: 80, size: 'sm' },
        { id: 'starfish', name: 'Starfish', emoji: '⭐', x: 75, y: 85, size: 'sm' },
        { id: 'shell', name: 'Shell', emoji: '🐚', x: 40, y: 75, size: 'sm' },
        { id: 'palm', name: 'Palm', emoji: '🌴', x: 10, y: 25, size: 'sm' },
        { id: 'sun', name: 'Sun', emoji: '☀️', x: 90, y: 10, size: 'sm' },
        { id: 'umbrella', name: 'Umbrella', emoji: '⛱️', x: 50, y: 40, size: 'sm' },
        { id: 'bucket', name: 'Bucket', emoji: '🪣', x: 32, y: 58, size: 'sm' },
        { id: 'ball', name: 'Ball', emoji: '🏐', x: 82, y: 52, size: 'sm' },
        { id: 'seagull', name: 'Seagull', emoji: '🐦', x: 62, y: 18, size: 'sm' },
        { id: 'sandcastle', name: 'Castle', emoji: '🏰', x: 92, y: 68, size: 'sm' },
        { id: 'coconut', name: 'Coconut', emoji: '🥥', x: 18, y: 45, size: 'sm' },
        { id: 'fish', name: 'Fish', emoji: '🐠', x: 55, y: 88, size: 'sm' },
        { id: 'whale', name: 'Whale', emoji: '🐳', x: 70, y: 35, size: 'sm' },
        { id: 'anchor', name: 'Anchor', emoji: '⚓', x: 8, y: 70, size: 'sm' },
      ],
    },
  },
  {
    id: 'meadow',
    name: 'Flower Meadow',
    background: 'bg-gradient-to-b from-pink-200 to-green-300',
    groundColor: 'bg-green-500',
    decorations: [
      // Tall flowers in the background
      { emoji: '🌻', x: 5, y: 45, size: 'xl', zIndex: 0 },
      { emoji: '🌻', x: 95, y: 42, size: 'xl', zIndex: 0 },
      // Foreground flowers that hide items
      { emoji: '🌸', x: 12, y: 55, size: 'lg', zIndex: 1 },
      { emoji: '🌺', x: 22, y: 48, size: 'lg', zIndex: 1 },
      { emoji: '🌷', x: 35, y: 62, size: 'lg', zIndex: 1 },
      { emoji: '🌼', x: 48, y: 52, size: 'lg', zIndex: 1 },
      { emoji: '🌹', x: 62, y: 58, size: 'lg', zIndex: 1 },
      { emoji: '🌺', x: 75, y: 48, size: 'lg', zIndex: 1 },
      { emoji: '🌸', x: 88, y: 55, size: 'lg', zIndex: 1 },
      // Tall grass
      { emoji: '🌾', x: 18, y: 78, size: 'lg', zIndex: 1 },
      { emoji: '🌾', x: 42, y: 82, size: 'lg', zIndex: 1 },
      { emoji: '🌾', x: 68, y: 80, size: 'lg', zIndex: 1 },
      { emoji: '🌾', x: 85, y: 78, size: 'lg', zIndex: 1 },
      // Bushes
      { emoji: '🌿', x: 28, y: 72, size: 'md', zIndex: 1 },
      { emoji: '🌿', x: 55, y: 75, size: 'md', zIndex: 1 },
      { emoji: '🌿', x: 78, y: 72, size: 'md', zIndex: 1 },
    ],
    items: {
      easy: [
        { id: 'butterfly', name: 'Butterfly', emoji: '🦋', x: 30, y: 25, size: 'lg' },
        { id: 'bee', name: 'Bee', emoji: '🐝', x: 70, y: 30, size: 'lg' },
        { id: 'tulip', name: 'Tulip', emoji: '🌷', x: 20, y: 65, size: 'lg' },
        { id: 'daisy', name: 'Daisy', emoji: '🌼', x: 50, y: 70, size: 'lg' },
        { id: 'rose', name: 'Rose', emoji: '🌹', x: 80, y: 60, size: 'lg' },
        { id: 'rainbow', name: 'Rainbow', emoji: '🌈', x: 85, y: 15, size: 'lg' },
      ],
      medium: [
        { id: 'butterfly', name: 'Butterfly', emoji: '🦋', x: 28, y: 22, size: 'md' },
        { id: 'bee', name: 'Bee', emoji: '🐝', x: 72, y: 28, size: 'md' },
        { id: 'tulip', name: 'Tulip', emoji: '🌷', x: 18, y: 68, size: 'md' },
        { id: 'daisy', name: 'Daisy', emoji: '🌼', x: 48, y: 72, size: 'md' },
        { id: 'rose', name: 'Rose', emoji: '🌹', x: 82, y: 58, size: 'md' },
        { id: 'rainbow', name: 'Rainbow', emoji: '🌈', x: 88, y: 12, size: 'md' },
        { id: 'sunflower', name: 'Sunflower', emoji: '🌻', x: 38, y: 45, size: 'md' },
        { id: 'clover', name: 'Clover', emoji: '🍀', x: 62, y: 80, size: 'sm' },
        { id: 'ladybug', name: 'Ladybug', emoji: '🐞', x: 90, y: 75, size: 'sm' },
        { id: 'caterpillar', name: 'Caterpillar', emoji: '🐛', x: 10, y: 85, size: 'md' },
      ],
      hard: [
        { id: 'butterfly', name: 'Butterfly', emoji: '🦋', x: 25, y: 20, size: 'sm' },
        { id: 'bee', name: 'Bee', emoji: '🐝', x: 75, y: 25, size: 'sm' },
        { id: 'tulip', name: 'Tulip', emoji: '🌷', x: 15, y: 70, size: 'sm' },
        { id: 'daisy', name: 'Daisy', emoji: '🌼', x: 45, y: 75, size: 'sm' },
        { id: 'rose', name: 'Rose', emoji: '🌹', x: 85, y: 55, size: 'sm' },
        { id: 'rainbow', name: 'Rainbow', emoji: '🌈', x: 90, y: 10, size: 'sm' },
        { id: 'sunflower', name: 'Sunflower', emoji: '🌻', x: 35, y: 42, size: 'sm' },
        { id: 'clover', name: 'Clover', emoji: '🍀', x: 60, y: 82, size: 'sm' },
        { id: 'ladybug', name: 'Ladybug', emoji: '🐞', x: 92, y: 78, size: 'sm' },
        { id: 'caterpillar', name: 'Caterpillar', emoji: '🐛', x: 8, y: 88, size: 'sm' },
        { id: 'dragonfly', name: 'Dragonfly', emoji: '🪰', x: 55, y: 15, size: 'sm' },
        { id: 'snail', name: 'Snail', emoji: '🐌', x: 30, y: 85, size: 'sm' },
        { id: 'mushroom', name: 'Mushroom', emoji: '🍄', x: 70, y: 65, size: 'sm' },
        { id: 'blossom', name: 'Blossom', emoji: '🌸', x: 50, y: 50, size: 'sm' },
      ],
    },
  },
  {
    id: 'farm',
    name: 'Happy Farm',
    background: 'bg-gradient-to-b from-sky-200 to-amber-100',
    groundColor: 'bg-amber-600',
    decorations: [
      // Barn and silo in background
      { emoji: '🏠', x: 8, y: 32, size: 'xl', zIndex: 0 },
      { emoji: '🏠', x: 92, y: 35, size: 'xl', zIndex: 0 },
      // Hay bales that hide items
      { emoji: '🟫', x: 22, y: 58, size: 'lg', zIndex: 1 },
      { emoji: '🟫', x: 45, y: 62, size: 'lg', zIndex: 1 },
      { emoji: '🟫', x: 72, y: 55, size: 'lg', zIndex: 1 },
      // Fences
      { emoji: '🚧', x: 15, y: 72, size: 'md', zIndex: 1 },
      { emoji: '🚧', x: 35, y: 75, size: 'md', zIndex: 1 },
      { emoji: '🚧', x: 65, y: 72, size: 'md', zIndex: 1 },
      { emoji: '🚧', x: 85, y: 75, size: 'md', zIndex: 1 },
      // Corn stalks
      { emoji: '🌽', x: 28, y: 48, size: 'lg', zIndex: 1 },
      { emoji: '🌽', x: 55, y: 45, size: 'lg', zIndex: 1 },
      { emoji: '🌽', x: 78, y: 48, size: 'lg', zIndex: 1 },
      // Bushes
      { emoji: '🌿', x: 12, y: 82, size: 'md', zIndex: 1 },
      { emoji: '🌿', x: 48, y: 85, size: 'md', zIndex: 1 },
      { emoji: '🌿', x: 88, y: 82, size: 'md', zIndex: 1 },
      // Sunflowers
      { emoji: '🌻', x: 38, y: 28, size: 'lg', zIndex: 1 },
      { emoji: '🌻', x: 62, y: 25, size: 'lg', zIndex: 1 },
    ],
    items: {
      easy: [
        { id: 'cow', name: 'Cow', emoji: '🐄', x: 25, y: 60, size: 'lg' },
        { id: 'pig', name: 'Pig', emoji: '🐷', x: 70, y: 70, size: 'lg' },
        { id: 'chicken', name: 'Chicken', emoji: '🐔', x: 45, y: 75, size: 'lg' },
        { id: 'horse', name: 'Horse', emoji: '🐴', x: 80, y: 45, size: 'lg' },
        { id: 'barn', name: 'Barn', emoji: '🏠', x: 15, y: 30, size: 'lg' },
        { id: 'tractor', name: 'Tractor', emoji: '🚜', x: 55, y: 40, size: 'lg' },
      ],
      medium: [
        { id: 'cow', name: 'Cow', emoji: '🐄', x: 22, y: 62, size: 'md' },
        { id: 'pig', name: 'Pig', emoji: '🐷', x: 72, y: 72, size: 'md' },
        { id: 'chicken', name: 'Chicken', emoji: '🐔', x: 42, y: 78, size: 'md' },
        { id: 'horse', name: 'Horse', emoji: '🐴', x: 82, y: 42, size: 'md' },
        { id: 'barn', name: 'Barn', emoji: '🏠', x: 12, y: 28, size: 'md' },
        { id: 'tractor', name: 'Tractor', emoji: '🚜', x: 52, y: 38, size: 'md' },
        { id: 'sheep', name: 'Sheep', emoji: '🐑', x: 35, y: 55, size: 'md' },
        { id: 'duck', name: 'Duck', emoji: '🦆', x: 88, y: 80, size: 'sm' },
        { id: 'corn', name: 'Corn', emoji: '🌽', x: 60, y: 85, size: 'md' },
        { id: 'carrot', name: 'Carrot', emoji: '🥕', x: 90, y: 60, size: 'sm' },
      ],
      hard: [
        { id: 'cow', name: 'Cow', emoji: '🐄', x: 20, y: 65, size: 'sm' },
        { id: 'pig', name: 'Pig', emoji: '🐷', x: 75, y: 75, size: 'sm' },
        { id: 'chicken', name: 'Chicken', emoji: '🐔', x: 40, y: 80, size: 'sm' },
        { id: 'horse', name: 'Horse', emoji: '🐴', x: 85, y: 40, size: 'sm' },
        { id: 'barn', name: 'Barn', emoji: '🏠', x: 10, y: 25, size: 'sm' },
        { id: 'tractor', name: 'Tractor', emoji: '🚜', x: 50, y: 35, size: 'sm' },
        { id: 'sheep', name: 'Sheep', emoji: '🐑', x: 32, y: 52, size: 'sm' },
        { id: 'duck', name: 'Duck', emoji: '🦆', x: 90, y: 82, size: 'sm' },
        { id: 'corn', name: 'Corn', emoji: '🌽', x: 58, y: 88, size: 'sm' },
        { id: 'carrot', name: 'Carrot', emoji: '🥕', x: 92, y: 58, size: 'sm' },
        { id: 'goat', name: 'Goat', emoji: '🐐', x: 65, y: 55, size: 'sm' },
        { id: 'rooster', name: 'Rooster', emoji: '🐓', x: 28, y: 85, size: 'sm' },
        { id: 'egg', name: 'Egg', emoji: '🥚', x: 8, y: 70, size: 'sm' },
        { id: 'sunflower', name: 'Sunflower', emoji: '🌻', x: 45, y: 20, size: 'sm' },
      ],
    },
  },
];



// Seed Sorting - Enhanced with shapes, sizes, and patterns
export interface SeedType {
  id: string;
  color: string;
  colorName: string;
  shape: 'circle' | 'square' | 'triangle' | 'star';
  size: 'small' | 'medium' | 'large';
  pattern: 'none' | 'dots' | 'stripes';
}

export const seedColors = [
  { id: 'red', name: 'Red', class: 'bg-red-400', border: 'border-red-500' },
  { id: 'blue', name: 'Blue', class: 'bg-blue-400', border: 'border-blue-500' },
  { id: 'yellow', name: 'Yellow', class: 'bg-yellow-400', border: 'border-yellow-500' },
  { id: 'green', name: 'Green', class: 'bg-green-400', border: 'border-green-500' },
  { id: 'purple', name: 'Purple', class: 'bg-purple-400', border: 'border-purple-500' },
];

export const seedShapes = [
  { id: 'circle', name: 'Circle', class: 'rounded-full' },
  { id: 'square', name: 'Square', class: 'rounded-lg' },
  { id: 'triangle', name: 'Triangle', class: 'triangle' },
];

export const seedSizes = [
  { id: 'small', name: 'Small', class: 'w-8 h-8' },
  { id: 'medium', name: 'Medium', class: 'w-12 h-12' },
  { id: 'large', name: 'Large', class: 'w-16 h-16' },
];

export const seedPatterns = [
  { id: 'none', name: 'Plain' },
  { id: 'dots', name: 'Dots' },
  { id: 'stripes', name: 'Stripes' },
];

export interface SortingLevel {
  id: number;
  name: string;
  description: string;
  sortBy: 'color' | 'size' | 'pattern' | 'shape';
  seedCount: number;
  binCount: number;
}

export const sortingLevels: SortingLevel[] = [
  { id: 1, name: 'Color Sort', description: 'Sort by color!', sortBy: 'color', seedCount: 6, binCount: 3 },
  { id: 2, name: 'More Colors', description: 'More colors to sort!', sortBy: 'color', seedCount: 8, binCount: 4 },
  { id: 3, name: 'Size Sort', description: 'Sort by size!', sortBy: 'size', seedCount: 6, binCount: 3 },
  { id: 4, name: 'Pattern Sort', description: 'Sort by pattern!', sortBy: 'pattern', seedCount: 6, binCount: 3 },
  { id: 5, name: 'Shape Sort', description: 'Sort by shape!', sortBy: 'shape', seedCount: 6, binCount: 3 },
];

// Memory Match - Multiple decks
export const memoryDecks = {
  animals: [
    { id: 'cat', emoji: '🐱', name: 'Cat' },
    { id: 'dog', emoji: '🐶', name: 'Dog' },
    { id: 'rabbit', emoji: '🐰', name: 'Rabbit' },
    { id: 'bear', emoji: '🐻', name: 'Bear' },
    { id: 'fox', emoji: '🦊', name: 'Fox' },
    { id: 'panda', emoji: '🐼', name: 'Panda' },
    { id: 'koala', emoji: '🐨', name: 'Koala' },
    { id: 'lion', emoji: '🦁', name: 'Lion' },
    { id: 'tiger', emoji: '🐯', name: 'Tiger' },
    { id: 'monkey', emoji: '🐵', name: 'Monkey' },
    { id: 'elephant', emoji: '🐘', name: 'Elephant' },
    { id: 'giraffe', emoji: '🦒', name: 'Giraffe' },
  ],
  nature: [
    { id: 'sun', emoji: '☀️', name: 'Sun' },
    { id: 'moon', emoji: '🌙', name: 'Moon' },
    { id: 'star', emoji: '⭐', name: 'Star' },
    { id: 'rainbow', emoji: '🌈', name: 'Rainbow' },
    { id: 'flower', emoji: '🌸', name: 'Flower' },
    { id: 'tree', emoji: '🌳', name: 'Tree' },
    { id: 'cloud', emoji: '☁️', name: 'Cloud' },
    { id: 'rain', emoji: '🌧️', name: 'Rain' },
    { id: 'leaf', emoji: '🍃', name: 'Leaf' },
    { id: 'mushroom', emoji: '🍄', name: 'Mushroom' },
    { id: 'butterfly', emoji: '🦋', name: 'Butterfly' },
    { id: 'ladybug', emoji: '🐞', name: 'Ladybug' },
  ],
  food: [
    { id: 'apple', emoji: '🍎', name: 'Apple' },
    { id: 'banana', emoji: '🍌', name: 'Banana' },
    { id: 'strawberry', emoji: '🍓', name: 'Strawberry' },
    { id: 'orange', emoji: '🍊', name: 'Orange' },
    { id: 'grape', emoji: '🍇', name: 'Grapes' },
    { id: 'watermelon', emoji: '🍉', name: 'Watermelon' },
    { id: 'cherry', emoji: '🍒', name: 'Cherry' },
    { id: 'peach', emoji: '🍑', name: 'Peach' },
    { id: 'carrot', emoji: '🥕', name: 'Carrot' },
    { id: 'corn', emoji: '🌽', name: 'Corn' },
    { id: 'cookie', emoji: '🍪', name: 'Cookie' },
    { id: 'cake', emoji: '🎂', name: 'Cake' },
  ],
  expressions: [
    { id: 'happy', emoji: '😊', name: 'Happy' },
    { id: 'laugh', emoji: '😂', name: 'Laugh' },
    { id: 'love', emoji: '😍', name: 'Love' },
    { id: 'cool', emoji: '😎', name: 'Cool' },
    { id: 'silly', emoji: '😜', name: 'Silly' },
    { id: 'sleepy', emoji: '😴', name: 'Sleepy' },
    { id: 'surprised', emoji: '😮', name: 'Surprised' },
    { id: 'thinking', emoji: '🤔', name: 'Thinking' },
    { id: 'star-eyes', emoji: '🤩', name: 'Star Eyes' },
    { id: 'hug', emoji: '🤗', name: 'Hug' },
    { id: 'party', emoji: '🥳', name: 'Party' },
    { id: 'angel', emoji: '😇', name: 'Angel' },
  ],
};

export const memoryGridSizes = [
  { id: 'easy', name: 'Easy', cols: 3, rows: 2, pairs: 3 },
  { id: 'medium', name: 'Medium', cols: 4, rows: 3, pairs: 6 },
  { id: 'hard', name: 'Hard', cols: 4, rows: 4, pairs: 8 },
];

// Bug Builder - Enhanced parts
export const bugParts = {
  bodies: [
    { id: 'round', name: 'Round' },
    { id: 'oval', name: 'Oval' },
    { id: 'long', name: 'Long' },
    { id: 'heart', name: 'Heart' },
    { id: 'star', name: 'Star' },
    { id: 'cloud', name: 'Cloud' },
  ],
  heads: [
    { id: 'circle', emoji: '🟢', name: 'Circle' },
    { id: 'triangle', emoji: '🔺', name: 'Triangle' },
    { id: 'square', emoji: '🟧', name: 'Square' },
    { id: 'star', emoji: '⭐', name: 'Star' },
    { id: 'heart', emoji: '💚', name: 'Heart' },
    { id: 'diamond', emoji: '💎', name: 'Diamond' },
    { id: 'moon', emoji: '🌙', name: 'Moon' },
    { id: 'flower', emoji: '🌸', name: 'Flower' },
  ],
  eyes: [
    { id: 'round', name: 'Round' },
    { id: 'big', name: 'Big' },
    { id: 'sleepy', name: 'Sleepy' },
    { id: 'happy', name: 'Happy' },
    { id: 'star', name: 'Star' },
    { id: 'heart', name: 'Heart' },
  ],
  antennae: [
    { id: 'straight', name: 'Straight' },
    { id: 'curly', name: 'Curly' },
    { id: 'ball', name: 'Ball' },
    { id: 'star', name: 'Star' },
    { id: 'heart', name: 'Heart' },
    { id: 'none', name: 'None' },
  ],
  wings: [
    { id: 'round', name: 'Round' },
    { id: 'pointed', name: 'Pointed' },
    { id: 'butterfly', name: 'Butterfly' },
    { id: 'tiny', name: 'Tiny' },
    { id: 'sparkle', name: 'Sparkle' },
    { id: 'none', name: 'None' },
  ],
  patterns: [
    { id: 'none', name: 'None' },
    { id: 'dots', name: 'Dots' },
    { id: 'stripes', name: 'Stripes' },
    { id: 'hearts', name: 'Hearts' },
    { id: 'stars', name: 'Stars' },
    { id: 'flowers', name: 'Flowers' },
  ],
  colors: [
    { id: 'red', name: 'Red', class: 'bg-red-400' },
    { id: 'orange', name: 'Orange', class: 'bg-orange-400' },
    { id: 'yellow', name: 'Yellow', class: 'bg-yellow-400' },
    { id: 'green', name: 'Green', class: 'bg-green-400' },
    { id: 'blue', name: 'Blue', class: 'bg-blue-400' },
    { id: 'purple', name: 'Purple', class: 'bg-purple-400' },
    { id: 'pink', name: 'Pink', class: 'bg-pink-400' },
    { id: 'rainbow', name: 'Rainbow', class: 'bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400' },
  ],
  props: [
    { id: 'none', name: 'None', emoji: '' },
    { id: 'hat', name: 'Hat', emoji: '🎩' },
    { id: 'crown', name: 'Crown', emoji: '👑' },
    { id: 'bow', name: 'Bow', emoji: '🎀' },
    { id: 'flower', name: 'Flower', emoji: '🌸' },
    { id: 'glasses', name: 'Glasses', emoji: '🕶️' },
  ],
};

export const bugBackgrounds = [
  { id: 'garden', name: 'Garden', class: 'bg-gradient-to-b from-sky-200 to-green-200' },
  { id: 'sunset', name: 'Sunset', class: 'bg-gradient-to-b from-orange-200 to-pink-200' },
  { id: 'night', name: 'Night', class: 'bg-gradient-to-b from-indigo-900 to-purple-800' },
  { id: 'rainbow', name: 'Rainbow', class: 'bg-gradient-to-r from-red-200 via-yellow-200 to-blue-200' },
];

// Ladybird Launch - 15 levels
export interface LadybirdLevel {
  id: number;
  name: string;
  platforms: {
    x: number;
    y: number;
    width: number;
    type: 'leaf' | 'mushroom' | 'goal';
  }[];
  stars?: { x: number; y: number }[];
  wind?: { direction: 'left' | 'right'; strength: number };
  startX: number;
  startY: number;
}

export const ladybirdLevels: LadybirdLevel[] = [
  {
    id: 1,
    name: 'First Flight',
    platforms: [
      { x: 20, y: 70, width: 15, type: 'leaf' },
      { x: 50, y: 50, width: 15, type: 'leaf' },
      { x: 80, y: 30, width: 15, type: 'goal' },
    ],
    stars: [{ x: 35, y: 60 }, { x: 65, y: 40 }],
    startX: 10,
    startY: 85,
  },
  {
    id: 2,
    name: 'Bouncy Mushroom',
    platforms: [
      { x: 30, y: 75, width: 12, type: 'mushroom' },
      { x: 60, y: 55, width: 15, type: 'leaf' },
      { x: 85, y: 35, width: 15, type: 'goal' },
    ],
    stars: [{ x: 45, y: 65 }, { x: 72, y: 45 }],
    startX: 10,
    startY: 85,
  },
  {
    id: 3,
    name: 'Star Collector',
    platforms: [
      { x: 25, y: 65, width: 12, type: 'leaf' },
      { x: 45, y: 45, width: 12, type: 'leaf' },
      { x: 65, y: 65, width: 12, type: 'leaf' },
      { x: 85, y: 40, width: 15, type: 'goal' },
    ],
    stars: [
      { x: 35, y: 55 },
      { x: 55, y: 55 },
      { x: 75, y: 50 },
    ],
    startX: 10,
    startY: 80,
  },
  {
    id: 4,
    name: 'Windy Day',
    platforms: [
      { x: 30, y: 70, width: 15, type: 'leaf' },
      { x: 55, y: 50, width: 15, type: 'leaf' },
      { x: 80, y: 30, width: 15, type: 'goal' },
    ],
    wind: { direction: 'right', strength: 0.15 },
    stars: [{ x: 42, y: 60 }, { x: 67, y: 40 }],
    startX: 10,
    startY: 85,
  },
  {
    id: 5,
    name: 'Double Bounce',
    platforms: [
      { x: 25, y: 75, width: 12, type: 'mushroom' },
      { x: 50, y: 55, width: 12, type: 'mushroom' },
      { x: 80, y: 35, width: 15, type: 'goal' },
    ],
    stars: [{ x: 37, y: 65 }, { x: 65, y: 45 }],
    startX: 10,
    startY: 85,
  },
  {
    id: 6,
    name: 'Zigzag Path',
    platforms: [
      { x: 20, y: 70, width: 12, type: 'leaf' },
      { x: 45, y: 50, width: 12, type: 'leaf' },
      { x: 20, y: 30, width: 12, type: 'leaf' },
      { x: 50, y: 15, width: 15, type: 'goal' },
    ],
    stars: [{ x: 32, y: 60 }, { x: 32, y: 40 }],
    startX: 10,
    startY: 85,
  },
  {
    id: 7,
    name: 'High Jump',
    platforms: [
      { x: 30, y: 80, width: 12, type: 'mushroom' },
      { x: 70, y: 25, width: 15, type: 'goal' },
    ],
    stars: [{ x: 50, y: 50 }],
    startX: 10,
    startY: 90,
  },
  {
    id: 8,
    name: 'Star Trail',
    platforms: [
      { x: 25, y: 70, width: 12, type: 'leaf' },
      { x: 50, y: 50, width: 12, type: 'leaf' },
      { x: 75, y: 30, width: 15, type: 'goal' },
    ],
    stars: [
      { x: 35, y: 60 },
      { x: 50, y: 40 },
      { x: 65, y: 35 },
    ],
    startX: 10,
    startY: 85,
  },
  {
    id: 9,
    name: 'Mushroom Maze',
    platforms: [
      { x: 20, y: 75, width: 10, type: 'mushroom' },
      { x: 40, y: 60, width: 10, type: 'mushroom' },
      { x: 60, y: 45, width: 10, type: 'mushroom' },
      { x: 85, y: 25, width: 15, type: 'goal' },
    ],
    stars: [{ x: 30, y: 67 }, { x: 50, y: 52 }, { x: 72, y: 35 }],
    startX: 10,
    startY: 90,
  },
  {
    id: 10,
    name: 'Gentle Breeze',
    platforms: [
      { x: 30, y: 65, width: 15, type: 'leaf' },
      { x: 60, y: 45, width: 15, type: 'leaf' },
      { x: 85, y: 25, width: 15, type: 'goal' },
    ],
    wind: { direction: 'left', strength: 0.1 },
    stars: [
      { x: 45, y: 55 },
      { x: 72, y: 35 },
    ],
    startX: 10,
    startY: 80,
  },
  {
    id: 11,
    name: 'Leaf Ladder',
    platforms: [
      { x: 20, y: 80, width: 12, type: 'leaf' },
      { x: 35, y: 65, width: 12, type: 'leaf' },
      { x: 50, y: 50, width: 12, type: 'leaf' },
      { x: 65, y: 35, width: 12, type: 'leaf' },
      { x: 85, y: 20, width: 15, type: 'goal' },
    ],
    stars: [{ x: 27, y: 72 }, { x: 42, y: 57 }, { x: 57, y: 42 }],
    startX: 10,
    startY: 90,
  },
  {
    id: 12,
    name: 'Big Bounce',
    platforms: [
      { x: 25, y: 85, width: 15, type: 'mushroom' },
      { x: 75, y: 20, width: 15, type: 'goal' },
    ],
    stars: [
      { x: 40, y: 50 },
      { x: 55, y: 35 },
    ],
    startX: 10,
    startY: 92,
  },
  {
    id: 13,
    name: 'Windy Heights',
    platforms: [
      { x: 25, y: 70, width: 12, type: 'leaf' },
      { x: 50, y: 50, width: 12, type: 'leaf' },
      { x: 75, y: 30, width: 12, type: 'leaf' },
      { x: 90, y: 15, width: 12, type: 'goal' },
    ],
    wind: { direction: 'right', strength: 0.2 },
    stars: [{ x: 37, y: 60 }, { x: 62, y: 40 }],
    startX: 5,
    startY: 85,
  },
  {
    id: 14,
    name: 'Bounce & Collect',
    platforms: [
      { x: 20, y: 75, width: 12, type: 'mushroom' },
      { x: 45, y: 55, width: 12, type: 'leaf' },
      { x: 70, y: 40, width: 12, type: 'mushroom' },
      { x: 90, y: 20, width: 12, type: 'goal' },
    ],
    stars: [
      { x: 32, y: 65 },
      { x: 57, y: 47 },
      { x: 80, y: 30 },
    ],
    startX: 8,
    startY: 88,
  },
  {
    id: 15,
    name: 'Final Challenge',
    platforms: [
      { x: 15, y: 80, width: 10, type: 'mushroom' },
      { x: 35, y: 60, width: 10, type: 'leaf' },
      { x: 55, y: 75, width: 10, type: 'mushroom' },
      { x: 75, y: 45, width: 10, type: 'leaf' },
      { x: 90, y: 20, width: 12, type: 'goal' },
    ],
    wind: { direction: 'right', strength: 0.12 },
    stars: [
      { x: 25, y: 70 },
      { x: 45, y: 67 },
      { x: 65, y: 60 },
      { x: 82, y: 32 },
    ],
    startX: 5,
    startY: 92,
  },
];

// Garden items that can be earned and placed
export const gardenItems = [
  { id: 'flower-red', name: 'Red Flower', emoji: '🌹', category: 'flowers' },
  { id: 'flower-yellow', name: 'Yellow Flower', emoji: '🌻', category: 'flowers' },
  { id: 'flower-pink', name: 'Pink Flower', emoji: '🌸', category: 'flowers' },
  { id: 'flower-purple', name: 'Purple Flower', emoji: '💜', category: 'flowers' },
  { id: 'flower-tulip', name: 'Tulip', emoji: '🌷', category: 'flowers' },
  { id: 'flower-daisy', name: 'Daisy', emoji: '🌼', category: 'flowers' },
  { id: 'tree-small', name: 'Small Tree', emoji: '🌲', category: 'trees' },
  { id: 'tree-big', name: 'Big Tree', emoji: '🌳', category: 'trees' },
  { id: 'tree-palm', name: 'Palm Tree', emoji: '🌴', category: 'trees' },
  { id: 'bush', name: 'Bush', emoji: '🌿', category: 'plants' },
  { id: 'mushroom', name: 'Mushroom', emoji: '🍄', category: 'plants' },
  { id: 'clover', name: 'Clover', emoji: '🍀', category: 'plants' },
  { id: 'butterfly', name: 'Butterfly', emoji: '🦋', category: 'creatures' },
  { id: 'bee', name: 'Bee', emoji: '🐝', category: 'creatures' },
  { id: 'ladybug', name: 'Ladybug', emoji: '🐞', category: 'creatures' },
  { id: 'snail', name: 'Snail', emoji: '🐌', category: 'creatures' },
  { id: 'bird', name: 'Bird', emoji: '🐦', category: 'creatures' },
  { id: 'frog', name: 'Frog', emoji: '🐸', category: 'creatures' },
  { id: 'bunny', name: 'Bunny', emoji: '🐰', category: 'creatures' },
  { id: 'rainbow', name: 'Rainbow', emoji: '🌈', category: 'sky' },
  { id: 'sun', name: 'Sun', emoji: '☀️', category: 'sky' },
  { id: 'cloud', name: 'Cloud', emoji: '☁️', category: 'sky' },
  { id: 'star', name: 'Star', emoji: '⭐', category: 'sky' },
  { id: 'moon', name: 'Moon', emoji: '🌙', category: 'sky' },
  { id: 'pond', name: 'Pond', emoji: '💧', category: 'water' },
  { id: 'rock', name: 'Rock', emoji: '🪨', category: 'nature' },
  { id: 'fence', name: 'Fence', emoji: '🏠', category: 'decor' },
  { id: 'bench', name: 'Bench', emoji: '🪑', category: 'decor' },
];

// Reward calculation
export const calculateReward = (gameId: string, score: number, difficulty: string): GameReward => {
  const baseStickers = 1;
  const bonusStickers = Math.floor(score / 100);
  const difficultyMultiplier = difficulty === 'hard' ? 2 : difficulty === 'medium' ? 1.5 : 1;
  
  const totalStickers = Math.floor((baseStickers + bonusStickers) * difficultyMultiplier);
  
  // Random garden item chance (40% base, higher with difficulty)
  const gardenItemsEarned: string[] = [];
  const itemChance = difficulty === 'hard' ? 0.6 : difficulty === 'medium' ? 0.5 : 0.4;
  
  if (Math.random() < itemChance) {
    const randomItem = gardenItems[Math.floor(Math.random() * gardenItems.length)];
    gardenItemsEarned.push(randomItem.id);
  }
  
  return {
    stickers: Math.min(totalStickers, 5), // Cap at 5 stickers per game
    gardenItems: gardenItemsEarned,
  };
};
