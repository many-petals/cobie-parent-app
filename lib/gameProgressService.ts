import { supabase } from './supabase';

// Types for game progress data
export interface SavedBug {
  id: string;
  bodyColor: string;
  headType: string;
  wingType: string;
  antennaType: string;
  pattern: string;
  prop: string;
  createdAt: string;
}

export interface PlacedGardenItem {
  id: string;
  x: number;
  y: number;
}

export interface GameProgressData {
  // Ladybird Launch
  completedLevels?: number[];
  
  // Bug Builder
  savedBugs?: SavedBug[];
  
  // Garden
  earnedGardenItems?: string[];
  placedGardenItems?: PlacedGardenItem[];
  
  // General stats
  totalStickersEarned?: number;
  gamesPlayed?: number;
  lastPlayedAt?: string;
}

export interface GameProgress {
  id: string;
  family_id: string;
  game_type: string;
  progress_data: GameProgressData;
  last_synced_at: string;
  created_at: string;
  updated_at: string;
}

// Local storage keys
const LOCAL_STORAGE_KEY = 'funzone_progress';
const PENDING_SYNC_KEY = 'funzone_pending_sync';

// Get local progress from localStorage
export function getLocalProgress(): GameProgressData {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading local progress:', error);
  }
  return {
    completedLevels: [],
    savedBugs: [],
    earnedGardenItems: [],
    placedGardenItems: [],
    totalStickersEarned: 0,
    gamesPlayed: 0,
  };
}

// Save progress to localStorage
export function saveLocalProgress(progress: GameProgressData): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving local progress:', error);
  }
}

// Mark progress as needing sync
export function markPendingSync(familyId: string): void {
  try {
    const pending = JSON.parse(localStorage.getItem(PENDING_SYNC_KEY) || '{}');
    pending[familyId] = Date.now();
    localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(pending));
  } catch (error) {
    console.error('Error marking pending sync:', error);
  }
}

// Check if there's pending sync for a family
export function hasPendingSync(familyId: string): boolean {
  try {
    const pending = JSON.parse(localStorage.getItem(PENDING_SYNC_KEY) || '{}');
    return !!pending[familyId];
  } catch (error) {
    return false;
  }
}

// Clear pending sync flag
export function clearPendingSync(familyId: string): void {
  try {
    const pending = JSON.parse(localStorage.getItem(PENDING_SYNC_KEY) || '{}');
    delete pending[familyId];
    localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(pending));
  } catch (error) {
    console.error('Error clearing pending sync:', error);
  }
}

// Fetch progress from database
export async function fetchCloudProgress(familyId: string): Promise<GameProgressData | null> {
  try {
    const { data, error } = await supabase
      .from('game_progress')
      .select('*')
      .eq('family_id', familyId)
      .eq('game_type', 'funzone')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching cloud progress:', error);
      return null;
    }

    return data?.progress_data || null;
  } catch (error) {
    console.error('Error fetching cloud progress:', error);
    return null;
  }
}

// Save progress to database
export async function saveCloudProgress(
  familyId: string,
  progress: GameProgressData
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('game_progress')
      .upsert({
        family_id: familyId,
        game_type: 'funzone',
        progress_data: progress,
        last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'family_id,game_type',
      });

    if (error) {
      console.error('Error saving cloud progress:', error);
      return false;
    }

    clearPendingSync(familyId);
    return true;
  } catch (error) {
    console.error('Error saving cloud progress:', error);
    return false;
  }
}

// Merge local and cloud progress (cloud wins for conflicts, but we keep all unique items)
export function mergeProgress(
  local: GameProgressData,
  cloud: GameProgressData
): GameProgressData {
  // Merge completed levels (union of both)
  const completedLevels = [...new Set([
    ...(local.completedLevels || []),
    ...(cloud.completedLevels || []),
  ])].sort((a, b) => a - b);

  // Merge saved bugs (keep all unique by id)
  const localBugs = local.savedBugs || [];
  const cloudBugs = cloud.savedBugs || [];
  const bugMap = new Map<string, SavedBug>();
  [...cloudBugs, ...localBugs].forEach(bug => {
    if (!bugMap.has(bug.id)) {
      bugMap.set(bug.id, bug);
    }
  });
  const savedBugs = Array.from(bugMap.values())
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Merge earned garden items (keep all)
  const earnedGardenItems = [...(local.earnedGardenItems || []), ...(cloud.earnedGardenItems || [])];

  // For placed items, prefer cloud version if it exists, otherwise use local
  const placedGardenItems = (cloud.placedGardenItems && cloud.placedGardenItems.length > 0)
    ? cloud.placedGardenItems
    : local.placedGardenItems || [];

  // Take the max of stats
  const totalStickersEarned = Math.max(
    local.totalStickersEarned || 0,
    cloud.totalStickersEarned || 0
  );
  const gamesPlayed = Math.max(
    local.gamesPlayed || 0,
    cloud.gamesPlayed || 0
  );

  // Use most recent lastPlayedAt
  const localTime = local.lastPlayedAt ? new Date(local.lastPlayedAt).getTime() : 0;
  const cloudTime = cloud.lastPlayedAt ? new Date(cloud.lastPlayedAt).getTime() : 0;
  const lastPlayedAt = localTime > cloudTime ? local.lastPlayedAt : cloud.lastPlayedAt;

  return {
    completedLevels,
    savedBugs,
    earnedGardenItems,
    placedGardenItems,
    totalStickersEarned,
    gamesPlayed,
    lastPlayedAt,
  };
}

// Sync progress - handles offline/online scenarios
export async function syncProgress(familyId: string | null): Promise<GameProgressData> {
  const localProgress = getLocalProgress();

  // If no family ID, just return local progress
  if (!familyId) {
    return localProgress;
  }

  // Check if we're online
  const isOnline = navigator.onLine;

  if (!isOnline) {
    // Offline - mark for later sync and return local
    markPendingSync(familyId);
    return localProgress;
  }

  try {
    // Fetch cloud progress
    const cloudProgress = await fetchCloudProgress(familyId);

    if (!cloudProgress) {
      // No cloud data - upload local data
      await saveCloudProgress(familyId, localProgress);
      return localProgress;
    }

    // Merge local and cloud
    const mergedProgress = mergeProgress(localProgress, cloudProgress);

    // Save merged progress to both local and cloud
    saveLocalProgress(mergedProgress);
    await saveCloudProgress(familyId, mergedProgress);

    return mergedProgress;
  } catch (error) {
    console.error('Error syncing progress:', error);
    markPendingSync(familyId);
    return localProgress;
  }
}

// Update specific progress fields and sync
export async function updateProgress(
  familyId: string | null,
  updates: Partial<GameProgressData>
): Promise<GameProgressData> {
  const currentProgress = getLocalProgress();
  
  const newProgress: GameProgressData = {
    ...currentProgress,
    ...updates,
    lastPlayedAt: new Date().toISOString(),
  };

  // Save locally first
  saveLocalProgress(newProgress);

  // Try to sync to cloud if we have a family ID and are online
  if (familyId && navigator.onLine) {
    try {
      await saveCloudProgress(familyId, newProgress);
    } catch (error) {
      console.error('Error saving to cloud:', error);
      markPendingSync(familyId);
    }
  } else if (familyId) {
    markPendingSync(familyId);
  }

  return newProgress;
}

// Add a completed level
export async function addCompletedLevel(
  familyId: string | null,
  levelIndex: number
): Promise<GameProgressData> {
  const currentProgress = getLocalProgress();
  const completedLevels = [...new Set([...(currentProgress.completedLevels || []), levelIndex])];
  
  return updateProgress(familyId, {
    completedLevels,
    gamesPlayed: (currentProgress.gamesPlayed || 0) + 1,
  });
}

// Add a saved bug
export async function addSavedBug(
  familyId: string | null,
  bug: Omit<SavedBug, 'id' | 'createdAt'>
): Promise<GameProgressData> {
  const currentProgress = getLocalProgress();
  const newBug: SavedBug = {
    ...bug,
    id: `bug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  
  const savedBugs = [...(currentProgress.savedBugs || []), newBug];
  
  return updateProgress(familyId, { savedBugs });
}

// Add earned garden items
export async function addEarnedGardenItems(
  familyId: string | null,
  items: string[]
): Promise<GameProgressData> {
  const currentProgress = getLocalProgress();
  const earnedGardenItems = [...(currentProgress.earnedGardenItems || []), ...items];
  
  return updateProgress(familyId, { earnedGardenItems });
}

// Update placed garden items
export async function updatePlacedGardenItems(
  familyId: string | null,
  items: PlacedGardenItem[]
): Promise<GameProgressData> {
  return updateProgress(familyId, { placedGardenItems: items });
}

// Add stickers earned
export async function addStickersEarned(
  familyId: string | null,
  stickers: number
): Promise<GameProgressData> {
  const currentProgress = getLocalProgress();
  const totalStickersEarned = (currentProgress.totalStickersEarned || 0) + stickers;
  
  return updateProgress(familyId, { totalStickersEarned });
}

// Listen for online/offline events and sync when coming back online
export function setupSyncListeners(familyId: string | null): () => void {
  const handleOnline = async () => {
    if (familyId && hasPendingSync(familyId)) {
      console.log('Back online - syncing pending progress...');
      await syncProgress(familyId);
    }
  };

  window.addEventListener('online', handleOnline);

  return () => {
    window.removeEventListener('online', handleOnline);
  };
}

// Clear all local progress (for testing/reset)
export function clearLocalProgress(): void {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  localStorage.removeItem(PENDING_SYNC_KEY);
}
