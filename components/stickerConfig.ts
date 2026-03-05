// Sticker configuration for the reward system

export interface Sticker {
  id: string;
  name: string;
  image: string;
  theme: 'animals' | 'nature' | 'space';
  rarity: 'common' | 'rare' | 'legendary';
}

export interface EarnedSticker {
  stickerId: string;
  earnedAt: string;
  earnedFrom: 'breathing' | 'journaling' | 'coping' | 'path' | 'streak' | 'special';
}

export interface PlacedSticker {
  stickerId: string;
  pageIndex: number;
  x: number; // percentage position
  y: number; // percentage position
  rotation: number;
  scale: number;
}

export const STICKER_THEMES = [
  { id: 'animals', name: 'Animals', icon: '🐾', color: 'bg-amber-100 text-amber-700' },
  { id: 'nature', name: 'Nature', icon: '🌸', color: 'bg-green-100 text-green-700' },
  { id: 'space', name: 'Space', icon: '✨', color: 'bg-purple-100 text-purple-700' },
] as const;

export const ALL_STICKERS: Sticker[] = [
  // Animals theme (8 stickers)
  {
    id: 'animal-1',
    name: 'Happy Bunny',
    image: 'https://d64gsuwffb70l.cloudfront.net/6942a5c631a68cd8823490d2_1766002335894_7c35e475.jpg',
    theme: 'animals',
    rarity: 'common',
  },
  {
    id: 'animal-2',
    name: 'Friendly Fox',
    image: 'https://d64gsuwffb70l.cloudfront.net/6942a5c631a68cd8823490d2_1766002341323_c9ec507f.png',
    theme: 'animals',
    rarity: 'common',
  },
  {
    id: 'animal-3',
    name: 'Sleepy Cat',
    image: 'https://d64gsuwffb70l.cloudfront.net/6942a5c631a68cd8823490d2_1766002342477_ce8b8996.png',
    theme: 'animals',
    rarity: 'common',
  },
  {
    id: 'animal-4',
    name: 'Playful Puppy',
    image: 'https://d64gsuwffb70l.cloudfront.net/6942a5c631a68cd8823490d2_1766002338310_b43ce307.jpg',
    theme: 'animals',
    rarity: 'rare',
  },
  {
    id: 'animal-5',
    name: 'Wise Owl',
    image: 'https://d64gsuwffb70l.cloudfront.net/6942a5c631a68cd8823490d2_1766002342661_26aac54b.png',
    theme: 'animals',
    rarity: 'common',
  },
  {
    id: 'animal-6',
    name: 'Gentle Bear',
    image: 'https://d64gsuwffb70l.cloudfront.net/6942a5c631a68cd8823490d2_1766002403452_936c42ad.jpg',
    theme: 'animals',
    rarity: 'rare',
  },
  {
    id: 'animal-7',
    name: 'Sweet Deer',
    image: 'https://d64gsuwffb70l.cloudfront.net/6942a5c631a68cd8823490d2_1766002401933_3ae7a8e9.jpg',
    theme: 'animals',
    rarity: 'common',
  },
  {
    id: 'animal-8',
    name: 'Magic Unicorn',
    image: 'https://d64gsuwffb70l.cloudfront.net/6942a5c631a68cd8823490d2_1766002344249_b0953ba2.jpg',
    theme: 'animals',
    rarity: 'legendary',
  },

  // Nature theme (8 stickers)
  {
    id: 'nature-1',
    name: 'Happy Flower',
    image: 'https://d64gsuwffb70l.cloudfront.net/6942a5c631a68cd8823490d2_1766002414771_bf664541.jpg',
    theme: 'nature',
    rarity: 'common',
  },
  {
    id: 'nature-2',
    name: 'Sunny Sunflower',
    image: 'https://d64gsuwffb70l.cloudfront.net/6942a5c631a68cd8823490d2_1766002417346_6eade9d7.jpg',
    theme: 'nature',
    rarity: 'common',
  },
  {
    id: 'nature-3',
    name: 'Rainbow Rose',
    image: 'https://d64gsuwffb70l.cloudfront.net/6942a5c631a68cd8823490d2_1766002418563_2d5ee399.jpg',
    theme: 'nature',
    rarity: 'rare',
  },
  {
    id: 'nature-4',
    name: 'Dancing Daisy',
    image: 'https://d64gsuwffb70l.cloudfront.net/6942a5c631a68cd8823490d2_1766002423014_5998f0d5.png',
    theme: 'nature',
    rarity: 'common',
  },
  {
    id: 'nature-5',
    name: 'Peaceful Tulip',
    image: 'https://d64gsuwffb70l.cloudfront.net/6942a5c631a68cd8823490d2_1766002425023_2d58a607.jpg',
    theme: 'nature',
    rarity: 'common',
  },
  {
    id: 'nature-6',
    name: 'Lucky Clover',
    image: 'https://d64gsuwffb70l.cloudfront.net/6942a5c631a68cd8823490d2_1766002423069_8a912c33.png',
    theme: 'nature',
    rarity: 'rare',
  },
  {
    id: 'nature-7',
    name: 'Blooming Blossom',
    image: 'https://d64gsuwffb70l.cloudfront.net/6942a5c631a68cd8823490d2_1766002427709_4aa6d807.png',
    theme: 'nature',
    rarity: 'common',
  },
  {
    id: 'nature-8',
    name: 'Golden Lotus',
    image: 'https://d64gsuwffb70l.cloudfront.net/6942a5c631a68cd8823490d2_1766002483851_114be21c.jpg',
    theme: 'nature',
    rarity: 'legendary',
  },

  // Space theme (8 stickers)
  {
    id: 'space-1',
    name: 'Twinkle Star',
    image: 'https://d64gsuwffb70l.cloudfront.net/6942a5c631a68cd8823490d2_1766002496371_f250df42.jpg',
    theme: 'space',
    rarity: 'common',
  },
  {
    id: 'space-2',
    name: 'Happy Moon',
    image: 'https://d64gsuwffb70l.cloudfront.net/6942a5c631a68cd8823490d2_1766002499309_f4dcc5e2.jpg',
    theme: 'space',
    rarity: 'common',
  },
  {
    id: 'space-3',
    name: 'Friendly Planet',
    image: 'https://d64gsuwffb70l.cloudfront.net/6942a5c631a68cd8823490d2_1766002498473_df22bba5.jpg',
    theme: 'space',
    rarity: 'rare',
  },
  {
    id: 'space-4',
    name: 'Shooting Star',
    image: 'https://d64gsuwffb70l.cloudfront.net/6942a5c631a68cd8823490d2_1766002501750_a9092f76.jpg',
    theme: 'space',
    rarity: 'common',
  },
  {
    id: 'space-5',
    name: 'Cozy Cloud',
    image: 'https://d64gsuwffb70l.cloudfront.net/6942a5c631a68cd8823490d2_1766002501705_21af0a43.jpg',
    theme: 'space',
    rarity: 'common',
  },
  {
    id: 'space-6',
    name: 'Sparkle Sun',
    image: 'https://d64gsuwffb70l.cloudfront.net/6942a5c631a68cd8823490d2_1766002501996_a2546e7b.jpg',
    theme: 'space',
    rarity: 'rare',
  },
  {
    id: 'space-7',
    name: 'Little Rocket',
    image: 'https://d64gsuwffb70l.cloudfront.net/6942a5c631a68cd8823490d2_1766002509171_d1d15a87.png',
    theme: 'space',
    rarity: 'common',
  },
  {
    id: 'space-8',
    name: 'Galaxy Rainbow',
    image: 'https://d64gsuwffb70l.cloudfront.net/6942a5c631a68cd8823490d2_1766002508435_6825bfdc.png',
    theme: 'space',
    rarity: 'legendary',
  },
];

// Get sticker by ID
export const getStickerById = (id: string): Sticker | undefined => {
  return ALL_STICKERS.find(s => s.id === id);
};

// Get stickers by theme
export const getStickersByTheme = (theme: string): Sticker[] => {
  return ALL_STICKERS.filter(s => s.theme === theme);
};

// Get random sticker from a theme
export const getRandomStickerFromTheme = (theme: string, excludeIds: string[] = []): Sticker | null => {
  const available = ALL_STICKERS.filter(s => s.theme === theme && !excludeIds.includes(s.id));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
};

// Get random sticker weighted by rarity
export const getRandomStickerWeighted = (excludeIds: string[] = []): Sticker | null => {
  const available = ALL_STICKERS.filter(s => !excludeIds.includes(s.id));
  if (available.length === 0) return null;

  // Weight by rarity: common = 60%, rare = 30%, legendary = 10%
  const weighted: Sticker[] = [];
  available.forEach(s => {
    const weight = s.rarity === 'common' ? 6 : s.rarity === 'rare' ? 3 : 1;
    for (let i = 0; i < weight; i++) {
      weighted.push(s);
    }
  });

  return weighted[Math.floor(Math.random() * weighted.length)];
};

// Activity rewards configuration
export const ACTIVITY_REWARDS: Record<string, { minStickers: number; maxStickers: number; chance: number }> = {
  breathing: { minStickers: 1, maxStickers: 1, chance: 0.7 }, // 70% chance to earn 1 sticker
  journaling: { minStickers: 1, maxStickers: 2, chance: 0.8 }, // 80% chance to earn 1-2 stickers
  coping: { minStickers: 1, maxStickers: 1, chance: 0.6 }, // 60% chance to earn 1 sticker
  path: { minStickers: 1, maxStickers: 2, chance: 0.9 }, // 90% chance to earn 1-2 stickers
  streak: { minStickers: 2, maxStickers: 3, chance: 1.0 }, // 100% chance for streak rewards
};
