import { supabase } from './supabase';

export interface Family {
  id: string;
  email: string;
  child_name: string | null;
  parent_pin: string | null;
  created_at: string;
}

export interface Petal {
  id: string;
  family_id: string;
  mood: string;
  color: string;
  earned_date: string;
}

export interface SessionRecord {
  id: string;
  family_id: string;
  mood: string;
  duration_seconds: number;
  session_date: string;
}

export interface FamilySettings {
  id: string;
  family_id: string;
  narration_speed: number;
  high_contrast: boolean;
  animations_enabled: boolean;
  audio_enabled?: boolean;
  sound_enabled?: boolean;
  sound_volume?: number;
  sound_auto_fade?: boolean;
  sound_approved?: string[];
  sound_character_defaults?: Record<string, string>;
}



// Family authentication
export async function loginFamily(email: string): Promise<Family | null> {
  const { data, error } = await supabase
    .from('families')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error || !data) {
    return null;
  }
  return data;
}

export async function registerFamily(email: string, childName?: string): Promise<Family | null> {
  const { data, error } = await supabase
    .from('families')
    .insert([{ 
      email: email.toLowerCase(), 
      child_name: childName || null 
    }])
    .select()
    .single();

  if (error) {
    console.error('Error registering family:', error);
    return null;
  }
  return data;
}

export async function updateChildName(familyId: string, childName: string): Promise<boolean> {
  const { error } = await supabase
    .from('families')
    .update({ child_name: childName, updated_at: new Date().toISOString() })
    .eq('id', familyId);

  return !error;
}

// Parent PIN management
export async function setParentPin(familyId: string, pin: string): Promise<boolean> {
  const { error } = await supabase
    .from('families')
    .update({ parent_pin: pin, updated_at: new Date().toISOString() })
    .eq('id', familyId);

  return !error;
}

export async function verifyParentPin(familyId: string, pin: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('families')
    .select('parent_pin')
    .eq('id', familyId)
    .single();

  if (error || !data) return false;
  return data.parent_pin === pin;
}

export async function hasParentPin(familyId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('families')
    .select('parent_pin')
    .eq('id', familyId)
    .single();

  if (error || !data) return false;
  return data.parent_pin !== null && data.parent_pin !== '';
}

// Petals management
export async function getPetals(familyId: string): Promise<Petal[]> {
  const { data, error } = await supabase
    .from('petals')
    .select('*')
    .eq('family_id', familyId)
    .order('earned_date', { ascending: false });

  if (error) {
    console.error('Error fetching petals:', error);
    return [];
  }
  return data || [];
}

export async function addPetal(familyId: string, mood: string, color: string): Promise<Petal | null> {
  const { data, error } = await supabase
    .from('petals')
    .insert([{
      family_id: familyId,
      mood,
      color,
      earned_date: new Date().toISOString().split('T')[0]
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding petal:', error);
    return null;
  }
  return data;
}

// Session history management
export async function getSessionHistory(familyId: string): Promise<SessionRecord[]> {
  const { data, error } = await supabase
    .from('session_history')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching session history:', error);
    return [];
  }
  return data || [];
}

export async function addSession(familyId: string, mood: string, durationSeconds: number): Promise<SessionRecord | null> {
  const { data, error } = await supabase
    .from('session_history')
    .insert([{
      family_id: familyId,
      mood,
      duration_seconds: durationSeconds,
      session_date: new Date().toISOString().split('T')[0]
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding session:', error);
    return null;
  }
  return data;
}

// Settings management
export async function getSettings(familyId: string): Promise<FamilySettings | null> {
  const { data, error } = await supabase
    .from('family_settings')
    .select('*')
    .eq('family_id', familyId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching settings:', error);
  }
  return data || null;
}

export async function saveSettings(
  familyId: string, 
  settings: { narration_speed: number; high_contrast: boolean; animations_enabled: boolean; audio_enabled?: boolean }
): Promise<boolean> {
  // Try to update first
  const { data: existing } = await supabase
    .from('family_settings')
    .select('id')
    .eq('family_id', familyId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('family_settings')
      .update({ ...settings, updated_at: new Date().toISOString() })
      .eq('family_id', familyId);
    return !error;
  } else {
    const { error } = await supabase
      .from('family_settings')
      .insert([{ family_id: familyId, ...settings }]);
    return !error;
  }
}


// Sync local data to cloud (for migration)
export async function syncLocalToCloud(
  familyId: string,
  localPetals: { mood: string; color: string; date: string }[],
  localSessions: { mood: string; duration: number; date: string }[]
): Promise<boolean> {
  try {
    // Sync petals
    if (localPetals.length > 0) {
      const petalsToInsert = localPetals.map(p => ({
        family_id: familyId,
        mood: p.mood,
        color: p.color,
        earned_date: p.date
      }));

      await supabase.from('petals').insert(petalsToInsert);
    }

    // Sync sessions
    if (localSessions.length > 0) {
      const sessionsToInsert = localSessions.map(s => ({
        family_id: familyId,
        mood: s.mood,
        duration_seconds: s.duration,
        session_date: s.date
      }));

      await supabase.from('session_history').insert(sessionsToInsert);
    }

    return true;
  } catch (error) {
    console.error('Error syncing local data:', error);
    return false;
  }
}


// Mood Journal management
export interface JournalEntry {
  id: string;
  family_id: string;
  entry_date: string;
  mood: string;
  drawing_data?: string;
  notes?: string;
  created_at: string;
}

export async function getJournalEntries(familyId: string): Promise<JournalEntry[]> {
  const { data, error } = await supabase
    .from('mood_journal')
    .select('*')
    .eq('family_id', familyId)
    .order('entry_date', { ascending: false });

  if (error) {
    console.error('Error fetching journal entries:', error);
    return [];
  }
  return data || [];
}

export async function getJournalEntry(familyId: string, date: string): Promise<JournalEntry | null> {
  const { data, error } = await supabase
    .from('mood_journal')
    .select('*')
    .eq('family_id', familyId)
    .eq('entry_date', date)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching journal entry:', error);
  }
  return data || null;
}

export async function saveJournalEntry(
  familyId: string,
  entry: { entry_date: string; mood: string; drawing_data?: string; notes?: string }
): Promise<JournalEntry | null> {
  // Check if entry exists for this date
  const existing = await getJournalEntry(familyId, entry.entry_date);

  if (existing) {
    // Update existing entry
    const { data, error } = await supabase
      .from('mood_journal')
      .update({
        mood: entry.mood,
        drawing_data: entry.drawing_data,
        notes: entry.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating journal entry:', error);
      return null;
    }
    return data;
  } else {
    // Create new entry
    const { data, error } = await supabase
      .from('mood_journal')
      .insert([{
        family_id: familyId,
        entry_date: entry.entry_date,
        mood: entry.mood,
        drawing_data: entry.drawing_data,
        notes: entry.notes,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating journal entry:', error);
      return null;
    }
    return data;
  }
}

export async function deleteJournalEntry(entryId: string): Promise<boolean> {
  const { error } = await supabase
    .from('mood_journal')
    .delete()
    .eq('id', entryId);

  return !error;
}

// Analytics for parent insights
export interface MoodAnalytics {
  moodCounts: Record<string, number>;
  pathCounts: Record<string, number>;
  totalSessions: number;
  totalJournalEntries: number;
  averageSessionDuration: number;
  mostFrequentMood: string | null;
  mostHelpfulPath: string | null;
  weeklyTrend: { date: string; mood: string }[];
}

export async function getMoodAnalytics(
  familyId: string,
  startDate: string,
  endDate: string
): Promise<MoodAnalytics> {
  // Get journal entries for date range
  const { data: journalData } = await supabase
    .from('mood_journal')
    .select('*')
    .eq('family_id', familyId)
    .gte('entry_date', startDate)
    .lte('entry_date', endDate)
    .order('entry_date', { ascending: true });

  // Get session history for date range
  const { data: sessionData } = await supabase
    .from('session_history')
    .select('*')
    .eq('family_id', familyId)
    .gte('session_date', startDate)
    .lte('session_date', endDate);

  const journalEntries = journalData || [];
  const sessions = sessionData || [];

  // Calculate mood counts from journal
  const moodCounts: Record<string, number> = {};
  journalEntries.forEach(entry => {
    moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
  });

  // Calculate path counts from sessions
  const pathCounts: Record<string, number> = {};
  sessions.forEach(session => {
    pathCounts[session.mood] = (pathCounts[session.mood] || 0) + 1;
  });

  // Find most frequent mood
  let mostFrequentMood: string | null = null;
  let maxMoodCount = 0;
  Object.entries(moodCounts).forEach(([mood, count]) => {
    if (count > maxMoodCount) {
      maxMoodCount = count;
      mostFrequentMood = mood;
    }
  });

  // Find most helpful path (most used)
  let mostHelpfulPath: string | null = null;
  let maxPathCount = 0;
  Object.entries(pathCounts).forEach(([path, count]) => {
    if (count > maxPathCount) {
      maxPathCount = count;
      mostHelpfulPath = path;
    }
  });

  // Calculate average session duration
  const totalDuration = sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
  const averageSessionDuration = sessions.length > 0 ? totalDuration / sessions.length : 0;

  // Weekly trend
  const weeklyTrend = journalEntries.map(e => ({
    date: e.entry_date,
    mood: e.mood,
  }));

  return {
    moodCounts,
    pathCounts,
    totalSessions: sessions.length,
    totalJournalEntries: journalEntries.length,
    averageSessionDuration,
    mostFrequentMood,
    mostHelpfulPath,
    weeklyTrend,
  };
}


// Badge management
export interface Badge {
  id: string;
  family_id: string;
  badge_type: string;
  earned_date: string;
  streak_count: number;
  created_at: string;
}

export async function getBadges(familyId: string): Promise<Badge[]> {
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .eq('family_id', familyId)
    .order('earned_date', { ascending: true });

  if (error) {
    console.error('Error fetching badges:', error);
    return [];
  }
  return data || [];
}

export async function awardBadge(
  familyId: string,
  badgeType: string,
  streakCount: number
): Promise<Badge | null> {
  // Check if badge already exists
  const { data: existing } = await supabase
    .from('badges')
    .select('id')
    .eq('family_id', familyId)
    .eq('badge_type', badgeType)
    .single();

  if (existing) {
    // Badge already earned
    return null;
  }

  const { data, error } = await supabase
    .from('badges')
    .insert([{
      family_id: familyId,
      badge_type: badgeType,
      streak_count: streakCount,
      earned_date: new Date().toISOString().split('T')[0],
    }])
    .select()
    .single();

  if (error) {
    console.error('Error awarding badge:', error);
    return null;
  }
  return data;
}
export async function syncBadgesToCloud(
  familyId: string,
  localBadges: { badge_type: string; streak_count: number; earned_date: string }[]
): Promise<boolean> {
  try {
    for (const badge of localBadges) {
      await supabase
        .from('badges')
        .upsert({
          family_id: familyId,
          badge_type: badge.badge_type,
          streak_count: badge.streak_count,
          earned_date: badge.earned_date,
        }, {
          onConflict: 'family_id,badge_type',
        });
    }
    return true;
  } catch (error) {
    console.error('Error syncing badges:', error);
    return false;
  }
}


// ==========================================
// Worry Pocket Management
// ==========================================

export interface CloudWorry {
  id: string;
  family_id: string;
  type: 'text' | 'drawing';
  content: string;
  category?: string;
  intensity?: number; // 1-5 scale: 1=tiny, 2=small, 3=medium, 4=big, 5=huge
  created_at: string;
  put_away: boolean;
  reviewed_with_parent: boolean;
  parent_notes?: string;
  updated_at: string;
}

// Get all worries for a family
export async function getWorries(familyId: string): Promise<CloudWorry[]> {
  const { data, error } = await supabase
    .from('worries')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching worries:', error);
    return [];
  }
  return data || [];
}

// Add a new worry
export async function addWorry(
  familyId: string,
  worry: {
    type: 'text' | 'drawing';
    content: string;
    category?: string;
    intensity?: number;
    put_away?: boolean;
    reviewed_with_parent?: boolean;
    parent_notes?: string;
  }
): Promise<CloudWorry | null> {
  const { data, error } = await supabase
    .from('worries')
    .insert([{
      family_id: familyId,
      type: worry.type,
      content: worry.content,
      category: worry.category || 'other',
      intensity: worry.intensity || 3,
      put_away: worry.put_away ?? false,
      reviewed_with_parent: worry.reviewed_with_parent ?? false,
      parent_notes: worry.parent_notes,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding worry:', error);
    return null;
  }
  return data;
}

// Update an existing worry
export async function updateWorry(
  worryId: string,
  updates: {
    put_away?: boolean;
    reviewed_with_parent?: boolean;
    parent_notes?: string;
    category?: string;
    intensity?: number;
  }
): Promise<CloudWorry | null> {
  const { data, error } = await supabase
    .from('worries')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', worryId)
    .select()
    .single();

  if (error) {
    console.error('Error updating worry:', error);
    return null;
  }
  return data;
}

// Delete a single worry

export async function deleteWorry(worryId: string): Promise<boolean> {
  const { error } = await supabase
    .from('worries')
    .delete()
    .eq('id', worryId);

  return !error;
}

// Bulk delete worries older than a certain date
export async function bulkDeleteWorries(
  familyId: string,
  beforeDate: string
): Promise<{ success: boolean; deletedCount: number }> {
  try {
    // First, count how many will be deleted
    const { data: toDelete, error: countError } = await supabase
      .from('worries')
      .select('id')
      .eq('family_id', familyId)
      .lt('created_at', beforeDate);

    if (countError) {
      console.error('Error counting worries to delete:', countError);
      return { success: false, deletedCount: 0 };
    }

    const deletedCount = toDelete?.length || 0;

    if (deletedCount === 0) {
      return { success: true, deletedCount: 0 };
    }

    // Delete the worries
    const { error: deleteError } = await supabase
      .from('worries')
      .delete()
      .eq('family_id', familyId)
      .lt('created_at', beforeDate);

    if (deleteError) {
      console.error('Error bulk deleting worries:', deleteError);
      return { success: false, deletedCount: 0 };
    }

    return { success: true, deletedCount };
  } catch (error) {
    console.error('Error in bulk delete:', error);
    return { success: false, deletedCount: 0 };
  }
}

// Delete multiple worries by IDs
export async function deleteWorries(worryIds: string[]): Promise<boolean> {
  if (worryIds.length === 0) return true;

  const { error } = await supabase
    .from('worries')
    .delete()
    .in('id', worryIds);

  return !error;
}


// Sync local worries to cloud (for migration when user logs in)
export async function syncWorriesToCloud(
  familyId: string,
  localWorries: {
    id?: string;
    type: 'text' | 'drawing';
    content: string;
    category?: string;
    intensity?: number;
    createdAt: string;
    putAway: boolean;
    reviewedWithParent?: boolean;
    parentNotes?: string;
  }[]
): Promise<boolean> {
  try {
    // Get existing cloud worries to avoid duplicates
    const existingWorries = await getWorries(familyId);
    const existingContents = new Set(existingWorries.map(w => w.content));

    // Filter out worries that already exist (by content match)
    const newWorries = localWorries.filter(w => !existingContents.has(w.content));

    if (newWorries.length === 0) {
      return true; // Nothing to sync
    }

    const worriesToInsert = newWorries.map(w => ({
      family_id: familyId,
      type: w.type,
      content: w.content,
      category: w.category || 'other',
      intensity: w.intensity || 3,
      created_at: w.createdAt,
      put_away: w.putAway,
      reviewed_with_parent: w.reviewedWithParent ?? false,
      parent_notes: w.parentNotes,
    }));

    const { error } = await supabase
      .from('worries')
      .insert(worriesToInsert);

    if (error) {
      console.error('Error syncing worries to cloud:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error syncing worries:', error);
    return false;
  }
}

// Get worry statistics for parent dashboard
export interface WorryAnalytics {
  totalWorries: number;
  reviewedCount: number;
  categoryCounts: Record<string, number>;
  intensityCounts: Record<number, number>;
  averageIntensity: number;
  weeklyTrend: { date: string; count: number }[];
  intensityTrend: { date: string; avgIntensity: number }[];
  recentWorries: CloudWorry[];
}

export async function getWorryAnalytics(
  familyId: string,
  startDate?: string,
  endDate?: string
): Promise<WorryAnalytics> {
  let query = supabase
    .from('worries')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false });

  if (startDate) {
    query = query.gte('created_at', startDate);
  }
  if (endDate) {
    query = query.lte('created_at', endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching worry analytics:', error);
    return {
      totalWorries: 0,
      reviewedCount: 0,
      categoryCounts: {},
      intensityCounts: {},
      averageIntensity: 0,
      weeklyTrend: [],
      intensityTrend: [],
      recentWorries: [],
    };
  }

  const worries = data || [];

  // Calculate category counts
  const categoryCounts: Record<string, number> = {};
  worries.forEach(w => {
    const cat = w.category || 'other';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  // Calculate intensity counts
  const intensityCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalIntensity = 0;
  let intensityCount = 0;
  worries.forEach(w => {
    const intensity = w.intensity || 3;
    intensityCounts[intensity] = (intensityCounts[intensity] || 0) + 1;
    totalIntensity += intensity;
    intensityCount++;
  });
  const averageIntensity = intensityCount > 0 ? totalIntensity / intensityCount : 0;

  // Calculate weekly trend (last 7 days)
  const weeklyTrend: { date: string; count: number }[] = [];
  const intensityTrend: { date: string; avgIntensity: number }[] = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayWorries = worries.filter(w => w.created_at.split('T')[0] === dateStr);
    const count = dayWorries.length;
    weeklyTrend.push({ date: dateStr, count });
    
    // Calculate average intensity for this day
    if (dayWorries.length > 0) {
      const dayIntensity = dayWorries.reduce((sum, w) => sum + (w.intensity || 3), 0) / dayWorries.length;
      intensityTrend.push({ date: dateStr, avgIntensity: Math.round(dayIntensity * 10) / 10 });
    } else {
      intensityTrend.push({ date: dateStr, avgIntensity: 0 });
    }
  }

  return {
    totalWorries: worries.length,
    reviewedCount: worries.filter(w => w.reviewed_with_parent).length,
    categoryCounts,
    intensityCounts,
    averageIntensity: Math.round(averageIntensity * 10) / 10,
    weeklyTrend,
    intensityTrend,
    recentWorries: worries.slice(0, 10),
  };
}


// ==========================================
// Worry Export Functions
// ==========================================

export interface WorryExportData {
  childName: string | null;
  exportDate: string;
  dateRange: { start: string; end: string };
  summary: {
    totalWorries: number;
    reviewedWithParent: number;
    unreviewedCount: number;
    categoryCounts: Record<string, number>;
    topCategory: { name: string; count: number } | null;
    intensityCounts: Record<number, number>;
    averageIntensity: number;
  };
  patterns: {
    weeklyTrend: { date: string; count: number }[];
    intensityTrend: { date: string; avgIntensity: number }[];
    averageWorriesPerWeek: number;
    mostActiveDay: string | null;
    intensityDirection: 'increasing' | 'decreasing' | 'stable' | 'insufficient_data';
  };
  worries: {
    id: string;
    date: string;
    type: 'text' | 'drawing';
    content: string;
    category: string;
    intensity: number;
    reviewedWithParent: boolean;
    parentNotes: string | null;
  }[];
}

export async function generateWorryExportData(
  familyId: string,
  childName: string | null,
  startDate?: string,
  endDate?: string
): Promise<WorryExportData> {
  // Get worries within date range
  let query = supabase
    .from('worries')
    .select('*')
    .eq('family_id', familyId)
    .eq('put_away', true)
    .order('created_at', { ascending: false });

  const now = new Date();
  const defaultStartDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const effectiveStartDate = startDate || defaultStartDate;
  const effectiveEndDate = endDate || now.toISOString();

  query = query.gte('created_at', effectiveStartDate);
  query = query.lte('created_at', effectiveEndDate);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching worries for export:', error);
  }

  const worries = data || [];

  // Calculate category counts
  const categoryCounts: Record<string, number> = {};
  worries.forEach(w => {
    const cat = w.category || 'other';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  // Find top category
  let topCategory: { name: string; count: number } | null = null;
  let maxCount = 0;
  Object.entries(categoryCounts).forEach(([name, count]) => {
    if (count > maxCount) {
      maxCount = count;
      topCategory = { name, count };
    }
  });

  // Calculate intensity stats
  const intensityCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalIntensity = 0;
  worries.forEach(w => {
    const intensity = w.intensity || 3;
    intensityCounts[intensity] = (intensityCounts[intensity] || 0) + 1;
    totalIntensity += intensity;
  });
  const averageIntensity = worries.length > 0 ? totalIntensity / worries.length : 0;

  // Calculate weekly trend
  const weeklyTrend: { date: string; count: number }[] = [];
  const intensityTrend: { date: string; avgIntensity: number }[] = [];
  const dayCounts: Record<string, number> = {};
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    
    const dayWorries = worries.filter(w => w.created_at.split('T')[0] === dateStr);
    const count = dayWorries.length;
    weeklyTrend.push({ date: dateStr, count });
    dayCounts[dayName] = (dayCounts[dayName] || 0) + count;
    
    // Calculate average intensity for this day
    if (dayWorries.length > 0) {
      const dayIntensity = dayWorries.reduce((sum, w) => sum + (w.intensity || 3), 0) / dayWorries.length;
      intensityTrend.push({ date: dateStr, avgIntensity: Math.round(dayIntensity * 10) / 10 });
    } else {
      intensityTrend.push({ date: dateStr, avgIntensity: 0 });
    }
  }

  // Calculate intensity direction (trend)
  let intensityDirection: 'increasing' | 'decreasing' | 'stable' | 'insufficient_data' = 'insufficient_data';
  const validIntensityDays = intensityTrend.filter(d => d.avgIntensity > 0);
  if (validIntensityDays.length >= 3) {
    const firstHalf = validIntensityDays.slice(0, Math.floor(validIntensityDays.length / 2));
    const secondHalf = validIntensityDays.slice(Math.floor(validIntensityDays.length / 2));
    const firstAvg = firstHalf.reduce((sum, d) => sum + d.avgIntensity, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.avgIntensity, 0) / secondHalf.length;
    
    if (secondAvg > firstAvg + 0.5) {
      intensityDirection = 'increasing';
    } else if (secondAvg < firstAvg - 0.5) {
      intensityDirection = 'decreasing';
    } else {
      intensityDirection = 'stable';
    }
  }

  // Find most active day
  let mostActiveDay: string | null = null;
  let maxDayCount = 0;
  Object.entries(dayCounts).forEach(([day, count]) => {
    if (count > maxDayCount) {
      maxDayCount = count;
      mostActiveDay = day;
    }
  });

  // Calculate average worries per week
  const totalWeeks = Math.max(1, Math.ceil(
    (new Date(effectiveEndDate).getTime() - new Date(effectiveStartDate).getTime()) / 
    (7 * 24 * 60 * 60 * 1000)
  ));
  const averageWorriesPerWeek = worries.length / totalWeeks;

  // Format worries for export
  const formattedWorries = worries.map(w => ({
    id: w.id,
    date: new Date(w.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    type: w.type as 'text' | 'drawing',
    content: w.content,
    category: w.category || 'other',
    intensity: w.intensity || 3,
    reviewedWithParent: w.reviewed_with_parent,
    parentNotes: w.parent_notes || null,
  }));

  return {
    childName,
    exportDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    dateRange: {
      start: new Date(effectiveStartDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      end: new Date(effectiveEndDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    },
    summary: {
      totalWorries: worries.length,
      reviewedWithParent: worries.filter(w => w.reviewed_with_parent).length,
      unreviewedCount: worries.filter(w => !w.reviewed_with_parent).length,
      categoryCounts,
      topCategory,
      intensityCounts,
      averageIntensity: Math.round(averageIntensity * 10) / 10,
    },
    patterns: {
      weeklyTrend,
      intensityTrend,
      averageWorriesPerWeek: Math.round(averageWorriesPerWeek * 10) / 10,
      mostActiveDay,
      intensityDirection,
    },
    worries: formattedWorries,
  };
}

// Intensity labels for display
const intensityLabels: Record<number, string> = {
  1: 'Tiny',
  2: 'Small',
  3: 'Medium',
  4: 'Big',
  5: 'Huge',
};

// Generate CSV content from worry data
export function generateWorryCSV(data: WorryExportData): string {
  const categoryLabels: Record<string, string> = {
    school: 'School',
    friends: 'Friends',
    family: 'Family',
    scary: 'Scary Things',
    health: 'Health',
    other: 'Other',
  };

  const lines: string[] = [];
  
  // Header section
  lines.push('WORRY POCKET REPORT');
  lines.push(`Child: ${data.childName || 'Not specified'}`);
  lines.push(`Report Generated: ${data.exportDate}`);
  lines.push(`Date Range: ${data.dateRange.start} - ${data.dateRange.end}`);
  lines.push('');
  
  // Summary section
  lines.push('SUMMARY');
  lines.push(`Total Worries: ${data.summary.totalWorries}`);
  lines.push(`Reviewed with Parent: ${data.summary.reviewedWithParent}`);
  lines.push(`Not Yet Reviewed: ${data.summary.unreviewedCount}`);
  lines.push(`Average Intensity: ${data.summary.averageIntensity} (${intensityLabels[Math.round(data.summary.averageIntensity)] || 'Medium'})`);
  if (data.summary.topCategory) {
    lines.push(`Most Common Category: ${categoryLabels[data.summary.topCategory.name] || data.summary.topCategory.name} (${data.summary.topCategory.count})`);
  }
  lines.push('');
  
  // Category breakdown
  lines.push('CATEGORY BREAKDOWN');
  Object.entries(data.summary.categoryCounts).forEach(([cat, count]) => {
    lines.push(`${categoryLabels[cat] || cat}: ${count}`);
  });
  lines.push('');

  // Intensity breakdown
  lines.push('INTENSITY BREAKDOWN');
  Object.entries(data.summary.intensityCounts).forEach(([intensity, count]) => {
    lines.push(`${intensityLabels[parseInt(intensity)] || intensity}: ${count}`);
  });
  lines.push('');
  
  // Patterns
  lines.push('PATTERNS');
  lines.push(`Average Worries Per Week: ${data.patterns.averageWorriesPerWeek}`);
  if (data.patterns.mostActiveDay) {
    lines.push(`Most Active Day: ${data.patterns.mostActiveDay}`);
  }
  lines.push(`Intensity Trend: ${data.patterns.intensityDirection.replace('_', ' ')}`);
  lines.push('');
  
  // Weekly trend
  lines.push('WEEKLY TREND (Last 7 Days)');
  lines.push('Date,Count,Avg Intensity');
  data.patterns.weeklyTrend.forEach(({ date, count }, i) => {
    const avgIntensity = data.patterns.intensityTrend[i]?.avgIntensity || 0;
    lines.push(`${date},${count},${avgIntensity}`);
  });
  lines.push('');
  
  // Detailed worry list
  lines.push('DETAILED WORRY LIST');
  lines.push('Date,Category,Intensity,Type,Reviewed,Parent Notes,Content');
  
  data.worries.forEach(worry => {
    // Escape content for CSV (handle commas and quotes)
    const escapedContent = worry.type === 'drawing' 
      ? '[Drawing]' 
      : `"${worry.content.replace(/"/g, '""').replace(/\n/g, ' ')}"`;
    const escapedNotes = worry.parentNotes 
      ? `"${worry.parentNotes.replace(/"/g, '""').replace(/\n/g, ' ')}"` 
      : '';
    
    lines.push([
      worry.date,
      categoryLabels[worry.category] || worry.category,
      `${worry.intensity} (${intensityLabels[worry.intensity] || 'Medium'})`,
      worry.type,
      worry.reviewedWithParent ? 'Yes' : 'No',
      escapedNotes,
      escapedContent,
    ].join(','));
  });
  
  return lines.join('\n');
}

// Generate HTML content for PDF export (printable format)
export function generateWorryPDFHTML(data: WorryExportData): string {
  const categoryLabels: Record<string, string> = {
    school: 'School',
    friends: 'Friends',
    family: 'Family',
    scary: 'Scary Things',
    health: 'Health',
    other: 'Other',
  };

  const categoryColors: Record<string, string> = {
    school: '#3B82F6',
    friends: '#22C55E',
    family: '#A855F7',
    scary: '#F97316',
    health: '#EF4444',
    other: '#6B7280',
  };

  const intensityColors: Record<number, string> = {
    1: '#22C55E',
    2: '#84CC16',
    3: '#EAB308',
    4: '#F97316',
    5: '#EF4444',
  };

  const intensityDirectionText: Record<string, string> = {
    increasing: 'Worries are becoming more intense over time',
    decreasing: 'Worries are becoming less intense over time',
    stable: 'Worry intensity has remained stable',
    insufficient_data: 'Not enough data to determine trend',
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Worry Pocket Report - ${data.childName || 'Child'}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      color: #1F2937;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #E5E7EB;
    }
    .header h1 {
      font-size: 28px;
      color: #EC4899;
      margin-bottom: 8px;
    }
    .header .subtitle {
      font-size: 18px;
      color: #6B7280;
    }
    .header .meta {
      font-size: 14px;
      color: #9CA3AF;
      margin-top: 12px;
    }
    .section {
      margin-bottom: 32px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #E5E7EB;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .summary-card {
      background: #F9FAFB;
      border-radius: 12px;
      padding: 16px;
      text-align: center;
    }
    .summary-card .number {
      font-size: 28px;
      font-weight: 700;
      color: #EC4899;
    }
    .summary-card .label {
      font-size: 12px;
      color: #6B7280;
    }
    .category-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .category-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
    }
    .intensity-bar {
      display: flex;
      gap: 4px;
      margin-bottom: 16px;
    }
    .intensity-segment {
      flex: 1;
      height: 24px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 600;
      color: white;
    }
    .pattern-item {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #F3F4F6;
    }
    .pattern-item:last-child {
      border-bottom: none;
    }
    .trend-indicator {
      padding: 8px 16px;
      border-radius: 8px;
      margin-top: 16px;
      font-size: 14px;
    }
    .trend-increasing { background: #FEF2F2; color: #991B1B; }
    .trend-decreasing { background: #D1FAE5; color: #065F46; }
    .trend-stable { background: #FEF3C7; color: #92400E; }
    .trend-insufficient_data { background: #F3F4F6; color: #6B7280; }
    .worry-card {
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
      page-break-inside: avoid;
    }
    .worry-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .worry-date {
      font-size: 14px;
      color: #6B7280;
    }
    .worry-badges {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .badge {
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 12px;
    }
    .badge-reviewed {
      background: #D1FAE5;
      color: #065F46;
    }
    .badge-pending {
      background: #FEF3C7;
      color: #92400E;
    }
    .intensity-dots {
      display: flex;
      gap: 3px;
      align-items: center;
    }
    .intensity-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .worry-content {
      background: #F9FAFB;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 12px;
      white-space: pre-wrap;
    }
    .worry-drawing {
      background: #F9FAFB;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
      color: #6B7280;
      font-style: italic;
    }
    .parent-note {
      background: #EFF6FF;
      border-left: 3px solid #3B82F6;
      padding: 12px;
      border-radius: 0 8px 8px 0;
      margin-top: 12px;
    }
    .parent-note-label {
      font-size: 12px;
      font-weight: 600;
      color: #1D4ED8;
      margin-bottom: 4px;
    }
    .parent-note-text {
      font-size: 14px;
      color: #374151;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #E5E7EB;
      text-align: center;
      font-size: 12px;
      color: #9CA3AF;
    }
    .confidential {
      background: #FEF2F2;
      color: #991B1B;
      padding: 12px;
      border-radius: 8px;
      text-align: center;
      margin-bottom: 24px;
      font-size: 14px;
    }
    @media print {
      body {
        padding: 20px;
      }
      .worry-card {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Worry Pocket Report</h1>
    <div class="subtitle">${data.childName ? `${data.childName}'s Worry Journal` : 'Child Worry Journal'}</div>
    <div class="meta">
      Report Generated: ${data.exportDate}<br>
      Date Range: ${data.dateRange.start} - ${data.dateRange.end}
    </div>
  </div>

  <div class="confidential">
    CONFIDENTIAL - For therapeutic and parental use only
  </div>

  <div class="section">
    <h2 class="section-title">Summary</h2>
    <div class="summary-grid">
      <div class="summary-card">
        <div class="number">${data.summary.totalWorries}</div>
        <div class="label">Total Worries</div>
      </div>
      <div class="summary-card">
        <div class="number" style="color: #22C55E;">${data.summary.reviewedWithParent}</div>
        <div class="label">Reviewed Together</div>
      </div>
      <div class="summary-card">
        <div class="number" style="color: #F59E0B;">${data.summary.unreviewedCount}</div>
        <div class="label">Pending Review</div>
      </div>
      <div class="summary-card">
        <div class="number" style="color: ${intensityColors[Math.round(data.summary.averageIntensity)] || '#EAB308'};">${data.summary.averageIntensity}</div>
        <div class="label">Avg Intensity</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">Intensity Distribution</h2>
    <div class="intensity-bar">
      ${[1, 2, 3, 4, 5].map(i => {
        const count = data.summary.intensityCounts[i] || 0;
        const percentage = data.summary.totalWorries > 0 ? Math.round((count / data.summary.totalWorries) * 100) : 0;
        return `
          <div class="intensity-segment" style="background: ${intensityColors[i]}; flex: ${Math.max(count, 0.5)};">
            ${intensityLabels[i]}: ${count}
          </div>
        `;
      }).join('')}
    </div>
    <p style="font-size: 14px; color: #6B7280;">
      Scale: 1 (Tiny) to 5 (Huge) - Higher numbers indicate more intense worries
    </p>
  </div>

  <div class="section">
    <h2 class="section-title">Category Breakdown</h2>
    <div class="category-list">
      ${Object.entries(data.summary.categoryCounts).map(([cat, count]) => `
        <span class="category-badge" style="background: ${categoryColors[cat] || '#6B7280'}20; color: ${categoryColors[cat] || '#6B7280'};">
          ${categoryLabels[cat] || cat}: ${count}
        </span>
      `).join('')}
    </div>
    ${data.summary.topCategory ? `
      <p style="margin-top: 16px; color: #6B7280; font-size: 14px;">
        <strong>Most common concern:</strong> ${categoryLabels[data.summary.topCategory.name] || data.summary.topCategory.name}
      </p>
    ` : ''}
  </div>

  <div class="section">
    <h2 class="section-title">Patterns & Insights</h2>
    <div class="pattern-item">
      <span>Average worries per week</span>
      <strong>${data.patterns.averageWorriesPerWeek}</strong>
    </div>
    ${data.patterns.mostActiveDay ? `
      <div class="pattern-item">
        <span>Most active day</span>
        <strong>${data.patterns.mostActiveDay}</strong>
      </div>
    ` : ''}
    <div class="pattern-item">
      <span>Review rate</span>
      <strong>${data.summary.totalWorries > 0 ? Math.round((data.summary.reviewedWithParent / data.summary.totalWorries) * 100) : 0}%</strong>
    </div>
    <div class="trend-indicator trend-${data.patterns.intensityDirection}">
      <strong>Intensity Trend:</strong> ${intensityDirectionText[data.patterns.intensityDirection]}
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">Weekly Trend (Last 7 Days)</h2>
    <div style="display: flex; align-items: flex-end; gap: 8px; height: 80px; margin-top: 16px;">
      ${data.patterns.weeklyTrend.map(({ date, count }, i) => {
        const maxCount = Math.max(...data.patterns.weeklyTrend.map(t => t.count), 1);
        const height = (count / maxCount) * 100;
        const dayLabel = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
        const avgIntensity = data.patterns.intensityTrend[i]?.avgIntensity || 0;
        return `
          <div style="flex: 1; text-align: center;">
            <div style="background: ${intensityColors[Math.round(avgIntensity)] || '#EC4899'}; height: ${Math.max(height, 4)}%; min-height: 4px; border-radius: 4px 4px 0 0;"></div>
            <div style="font-size: 10px; color: #6B7280; margin-top: 4px;">${dayLabel}</div>
            <div style="font-size: 12px; font-weight: 600;">${count}</div>
          </div>
        `;
      }).join('')}
    </div>
    <p style="font-size: 12px; color: #9CA3AF; margin-top: 8px; text-align: center;">
      Bar colors indicate average intensity for each day
    </p>
  </div>

  <div class="section">
    <h2 class="section-title">Detailed Worry List (${data.worries.length} entries)</h2>
    ${data.worries.length === 0 ? `
      <p style="color: #6B7280; text-align: center; padding: 24px;">No worries recorded in this date range.</p>
    ` : data.worries.map(worry => `
      <div class="worry-card">
        <div class="worry-header">
          <span class="worry-date">${worry.date}</span>
          <div class="worry-badges">
            <div class="intensity-dots" title="Intensity: ${worry.intensity} (${intensityLabels[worry.intensity]})">
              ${[1, 2, 3, 4, 5].map(i => `
                <div class="intensity-dot" style="background: ${i <= worry.intensity ? intensityColors[worry.intensity] : '#E5E7EB'};"></div>
              `).join('')}
            </div>
            <span class="category-badge" style="background: ${categoryColors[worry.category] || '#6B7280'}20; color: ${categoryColors[worry.category] || '#6B7280'}; font-size: 12px; padding: 4px 8px;">
              ${categoryLabels[worry.category] || worry.category}
            </span>
            <span class="badge ${worry.reviewedWithParent ? 'badge-reviewed' : 'badge-pending'}">
              ${worry.reviewedWithParent ? 'Reviewed' : 'Pending'}
            </span>
          </div>
        </div>
        ${worry.type === 'text' ? `
          <div class="worry-content">${worry.content}</div>
        ` : `
          <div class="worry-drawing">[Drawing - see original in app]</div>
        `}
        ${worry.parentNotes ? `
          <div class="parent-note">
            <div class="parent-note-label">Parent Note</div>
            <div class="parent-note-text">${worry.parentNotes}</div>
          </div>
        ` : ''}
      </div>
    `).join('')}
  </div>

  <div class="footer">
    <p>This report was generated from the Worry Pocket feature.</p>
    <p>For use in therapeutic settings, please discuss findings with a qualified professional.</p>
  </div>
</body>
</html>
  `.trim();
}


// Generate export data from local worries (for non-logged-in users)
export function generateLocalWorryExportData(
  worries: {
    id: string;
    type: 'text' | 'drawing';
    content: string;
    createdAt: string;
    putAway: boolean;
    category?: string;
    intensity?: number;
    reviewedWithParent?: boolean;
    parentNotes?: string;
  }[],
  childName: string | null,
  startDate?: string,
  endDate?: string
): WorryExportData {
  const now = new Date();
  const defaultStartDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const effectiveStartDate = startDate || defaultStartDate;
  const effectiveEndDate = endDate || now.toISOString();

  // Filter worries by date range and put_away status
  const filteredWorries = worries.filter(w => {
    if (!w.putAway) return false;
    const worryDate = new Date(w.createdAt);
    return worryDate >= new Date(effectiveStartDate) && worryDate <= new Date(effectiveEndDate);
  });

  // Calculate category counts
  const categoryCounts: Record<string, number> = {};
  filteredWorries.forEach(w => {
    const cat = w.category || 'other';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  // Find top category
  let topCategory: { name: string; count: number } | null = null;
  let maxCount = 0;
  Object.entries(categoryCounts).forEach(([name, count]) => {
    if (count > maxCount) {
      maxCount = count;
      topCategory = { name, count };
    }
  });

  // Calculate intensity stats
  const intensityCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalIntensity = 0;
  filteredWorries.forEach(w => {
    const intensity = w.intensity || 3;
    intensityCounts[intensity] = (intensityCounts[intensity] || 0) + 1;
    totalIntensity += intensity;
  });
  const averageIntensity = filteredWorries.length > 0 ? totalIntensity / filteredWorries.length : 0;

  // Calculate weekly trend
  const weeklyTrend: { date: string; count: number }[] = [];
  const intensityTrend: { date: string; avgIntensity: number }[] = [];
  const dayCounts: Record<string, number> = {};
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    
    const dayWorries = filteredWorries.filter(w => w.createdAt.split('T')[0] === dateStr);
    const count = dayWorries.length;
    weeklyTrend.push({ date: dateStr, count });
    dayCounts[dayName] = (dayCounts[dayName] || 0) + count;
    
    // Calculate average intensity for this day
    if (dayWorries.length > 0) {
      const dayIntensity = dayWorries.reduce((sum, w) => sum + (w.intensity || 3), 0) / dayWorries.length;
      intensityTrend.push({ date: dateStr, avgIntensity: Math.round(dayIntensity * 10) / 10 });
    } else {
      intensityTrend.push({ date: dateStr, avgIntensity: 0 });
    }
  }

  // Calculate intensity direction (trend)
  let intensityDirection: 'increasing' | 'decreasing' | 'stable' | 'insufficient_data' = 'insufficient_data';
  const validIntensityDays = intensityTrend.filter(d => d.avgIntensity > 0);
  if (validIntensityDays.length >= 3) {
    const firstHalf = validIntensityDays.slice(0, Math.floor(validIntensityDays.length / 2));
    const secondHalf = validIntensityDays.slice(Math.floor(validIntensityDays.length / 2));
    const firstAvg = firstHalf.reduce((sum, d) => sum + d.avgIntensity, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.avgIntensity, 0) / secondHalf.length;
    
    if (secondAvg > firstAvg + 0.5) {
      intensityDirection = 'increasing';
    } else if (secondAvg < firstAvg - 0.5) {
      intensityDirection = 'decreasing';
    } else {
      intensityDirection = 'stable';
    }
  }

  // Find most active day
  let mostActiveDay: string | null = null;
  let maxDayCount = 0;
  Object.entries(dayCounts).forEach(([day, count]) => {
    if (count > maxDayCount) {
      maxDayCount = count;
      mostActiveDay = day;
    }
  });

  // Calculate average worries per week
  const totalWeeks = Math.max(1, Math.ceil(
    (new Date(effectiveEndDate).getTime() - new Date(effectiveStartDate).getTime()) / 
    (7 * 24 * 60 * 60 * 1000)
  ));
  const averageWorriesPerWeek = filteredWorries.length / totalWeeks;

  // Format worries for export
  const formattedWorries = filteredWorries
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(w => ({
      id: w.id,
      date: new Date(w.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      type: w.type as 'text' | 'drawing',
      content: w.content,
      category: w.category || 'other',
      intensity: w.intensity || 3,
      reviewedWithParent: w.reviewedWithParent || false,
      parentNotes: w.parentNotes || null,
    }));

  return {
    childName,
    exportDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    dateRange: {
      start: new Date(effectiveStartDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      end: new Date(effectiveEndDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    },
    summary: {
      totalWorries: filteredWorries.length,
      reviewedWithParent: filteredWorries.filter(w => w.reviewedWithParent).length,
      unreviewedCount: filteredWorries.filter(w => !w.reviewedWithParent).length,
      categoryCounts,
      topCategory,
      intensityCounts,
      averageIntensity: Math.round(averageIntensity * 10) / 10,
    },
    patterns: {
      weeklyTrend,
      intensityTrend,
      averageWorriesPerWeek: Math.round(averageWorriesPerWeek * 10) / 10,
      mostActiveDay,
      intensityDirection,
    },
    worries: formattedWorries,
  };
}
