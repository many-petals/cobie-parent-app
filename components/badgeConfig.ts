// Badge definitions with streak requirements and rewards
export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  streakRequired: number;
  icon: string; // SVG path or identifier
  color: string;
  bgColor: string;
  unlockedColors: string[];
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'seedling',
    name: 'Seedling',
    description: 'Journal for 3 days in a row!',
    streakRequired: 3,
    icon: 'seedling',
    color: '#22C55E',
    bgColor: 'bg-green-100',
    unlockedColors: ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA'], // Pastel colors
  },
  {
    id: 'sprout',
    name: 'Sprout',
    description: 'Journal for 7 days in a row!',
    streakRequired: 7,
    icon: 'sprout',
    color: '#10B981',
    bgColor: 'bg-emerald-100',
    unlockedColors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'], // Rainbow
  },
  {
    id: 'blooming',
    name: 'Blooming',
    description: 'Journal for 14 days in a row!',
    streakRequired: 14,
    icon: 'flower',
    color: '#EC4899',
    bgColor: 'bg-pink-100',
    unlockedColors: ['#FFD700', '#C0C0C0', '#E6E6FA', '#F0E68C', '#DDA0DD', '#98FB98'], // Sparkle
  },
  {
    id: 'garden-star',
    name: 'Garden Star',
    description: 'Journal for 30 days in a row!',
    streakRequired: 30,
    icon: 'star',
    color: '#F59E0B',
    bgColor: 'bg-amber-100',
    unlockedColors: ['#FF1493', '#00CED1', '#9400D3', '#FF4500', '#1E90FF', '#32CD32', '#FFD700', '#FF69B4'], // All special
  },
];

// Base colors available to everyone
export const BASE_COLORS = [
  '#EF4444', // red
  '#F97316', // orange
  '#EAB308', // yellow
  '#22C55E', // green
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#78716C', // brown
  '#000000', // black
];

// Get all unlocked colors based on earned badges
export function getUnlockedColors(earnedBadgeIds: string[]): string[] {
  const unlockedSet = new Set(BASE_COLORS);
  
  BADGE_DEFINITIONS.forEach(badge => {
    if (earnedBadgeIds.includes(badge.id)) {
      badge.unlockedColors.forEach(color => unlockedSet.add(color));
    }
  });
  
  return Array.from(unlockedSet);
}

// Get badge definition by ID
export function getBadgeById(badgeId: string): BadgeDefinition | undefined {
  return BADGE_DEFINITIONS.find(b => b.id === badgeId);
}

// Calculate current streak from journal entries
export function calculateStreak(entries: { entry_date: string }[]): number {
  if (entries.length === 0) return 0;
  
  // Sort entries by date descending
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
  );
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Check if the most recent entry is today or yesterday
  const mostRecentDate = new Date(sortedEntries[0].entry_date);
  mostRecentDate.setHours(0, 0, 0, 0);
  
  // If most recent entry is not today or yesterday, streak is broken
  if (mostRecentDate < yesterday) {
    return 0;
  }
  
  let streak = 1;
  let currentDate = mostRecentDate;
  
  for (let i = 1; i < sortedEntries.length; i++) {
    const entryDate = new Date(sortedEntries[i].entry_date);
    entryDate.setHours(0, 0, 0, 0);
    
    const expectedDate = new Date(currentDate);
    expectedDate.setDate(expectedDate.getDate() - 1);
    
    if (entryDate.getTime() === expectedDate.getTime()) {
      streak++;
      currentDate = entryDate;
    } else if (entryDate.getTime() < expectedDate.getTime()) {
      // Gap in entries, streak ends
      break;
    }
    // If same date, skip (duplicate entry)
  }
  
  return streak;
}

// Check which badges should be awarded based on streak
export function checkNewBadges(currentStreak: number, earnedBadgeIds: string[]): BadgeDefinition[] {
  const newBadges: BadgeDefinition[] = [];
  
  BADGE_DEFINITIONS.forEach(badge => {
    if (currentStreak >= badge.streakRequired && !earnedBadgeIds.includes(badge.id)) {
      newBadges.push(badge);
    }
  });
  
  return newBadges;
}
