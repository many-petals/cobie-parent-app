import React, { useState, useEffect, useCallback } from 'react';
import HomeScreen from './HomeScreen';
import PetalPath from './PetalPath';
import ProgressGarden from './ProgressGarden';
import ParentMode from './ParentMode';
import WelcomeScreen from './WelcomeScreen';
import AuthModal from './AuthModal';
import ParentPinModal from './ParentPinModal';
import MoodJournal from './MoodJournal';
import QuietCorner from './QuietCorner';
import WorryPocket, { Worry } from './WorryPocket';
import StickerBook from './StickerBook';
import StickerRewardModal from './StickerRewardModal';
import FunZone from './FunZone';
import PremiumModal from './PremiumModal';
import { WeeklyGoal } from './WeeklyGoals';
import { moodConfigs } from './moodConfigs';
import { calculateStreak, BadgeDefinition } from './badgeConfig';
import { SoundSettings, defaultSoundSettings } from './soundConfig';
import {
  EarnedSticker,
  PlacedSticker,
  getRandomStickerWeighted,
  ACTIVITY_REWARDS,
} from './stickerConfig';
import { usePremium } from '@/contexts/PremiumContext';

import {
  Family,
  loginFamily,
  getPetals,
  addPetal,
  getSessionHistory,
  addSession,
  getSettings,
  saveSettings,
  setParentPin,
  verifyParentPin,
  hasParentPin,
  updateChildName,
  syncLocalToCloud,
  getJournalEntries,
  saveJournalEntry,
  getBadges,
  awardBadge,
  syncBadgesToCloud,
  getWorries,
  addWorry as addWorryToCloud,
  updateWorry as updateWorryInCloud,
  deleteWorry as deleteWorryFromCloud,
  bulkDeleteWorries,
  syncWorriesToCloud,
} from '@/lib/familyService';

import {
  GameProgressData,
  SavedBug,
  PlacedGardenItem,
  syncProgress,
  updateProgress,
  addCompletedLevel,
  addSavedBug,
  addEarnedGardenItems,
  updatePlacedGardenItems,
  addStickersEarned,
  setupSyncListeners,
  getLocalProgress,
} from '@/lib/gameProgressService';




interface LocalPetal {
  mood: string;
  color: string;
  date: string;
}

interface LocalSession {
  mood: string;
  date: string;
  duration: number;
}

interface Settings {
  narrationSpeed: number;
  highContrast: boolean;
  animationsEnabled: boolean;
  audioEnabled: boolean;
}

interface LocalJournalEntry {
  id?: string;
  entry_date: string;
  mood: string;
  drawing_data?: string;
  notes?: string;
}

interface LocalBadge {
  badge_type: string;
  streak_count: number;
  earned_date: string;
}

interface PendingStickerReward {
  stickerId: string;
  earnedFrom: 'breathing' | 'journaling' | 'coping' | 'path' | 'streak' | 'special';
}

// Helper function to get the start of the current week
const getWeekStart = (date: Date): string => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
};

const AppLayout: React.FC = () => {
  const [currentView, setCurrentView] = useState<'welcome' | 'home' | 'path' | 'garden' | 'parent' | 'journal' | 'quietcorner' | 'worrypocket' | 'stickerbook' | 'funzone'>('welcome');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [petals, setPetals] = useState<LocalPetal[]>([]);

  const [sessionHistory, setSessionHistory] = useState<LocalSession[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    narrationSpeed: 0.8,
    highContrast: false,
    animationsEnabled: true,
    audioEnabled: true,
  });

  // Sound settings state
  const [soundSettings, setSoundSettings] = useState<SoundSettings>(defaultSoundSettings);

  // Journal state
  const [journalEntries, setJournalEntries] = useState<LocalJournalEntry[]>([]);

  // Badge state
  const [badges, setBadges] = useState<LocalBadge[]>([]);
  const earnedBadgeIds = badges.map(b => b.badge_type);
  const currentStreak = calculateStreak(journalEntries);

  // Worry Pocket state
  const [worries, setWorries] = useState<Worry[]>([]);

  // Weekly Goals state
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>([]);

  // Sticker state
  const [earnedStickers, setEarnedStickers] = useState<EarnedSticker[]>([]);
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([]);
  const [pendingStickerReward, setPendingStickerReward] = useState<PendingStickerReward | null>(null);

  // Fun Zone game progress state
  const [gameProgress, setGameProgress] = useState<GameProgressData>({
    completedLevels: [],
    savedBugs: [],
    earnedGardenItems: [],
    placedGardenItems: [],
    totalStickersEarned: 0,
    gamesPlayed: 0,
  });

  // Auth state
  const [family, setFamily] = useState<Family | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinModalMode, setPinModalMode] = useState<'verify' | 'set' | 'change'>('verify');
  const [hasFamilyPin, setHasFamilyPin] = useState(false);
  const [pendingParentAccess, setPendingParentAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Premium state
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const { premium, checkPremiumStatus } = usePremium();

  const cloudWorriesToLocal = (cloudWorries: any[]): Worry[] => {
    return cloudWorries.map(w => ({
      id: w.id,
      type: w.type as 'text' | 'drawing',
      content: w.content,
      createdAt: w.created_at,
      putAway: w.put_away,
      category: w.category,
      reviewedWithParent: w.reviewed_with_parent,
      parentNotes: w.parent_notes,
    }));
  };



  // Load game progress and set up sync listeners
  useEffect(() => {
    const loadGameProgress = async () => {
      const progress = await syncProgress(family?.id || null);
      setGameProgress(progress);
    };
    
    loadGameProgress();
    
    // Set up online/offline sync listeners
    const cleanup = setupSyncListeners(family?.id || null);
    return cleanup;
  }, [family?.id]);

  // Load saved data from localStorage and check for existing session
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      const savedFamilyId = localStorage.getItem('petalPaths_familyId');
      const savedFamilyEmail = localStorage.getItem('petalPaths_familyEmail');

      if (savedFamilyId && savedFamilyEmail) {
        const familyData = await loginFamily(savedFamilyEmail);
        if (familyData) {
          setFamily(familyData);
          
          const cloudPetals = await getPetals(familyData.id);
          const cloudSessions = await getSessionHistory(familyData.id);
          const cloudSettings = await getSettings(familyData.id);
          const hasPin = await hasParentPin(familyData.id);
          const cloudJournal = await getJournalEntries(familyData.id);
          const cloudBadges = await getBadges(familyData.id);
          const cloudWorries = await getWorries(familyData.id);

          // Sync game progress
          const progress = await syncProgress(familyData.id);
          setGameProgress(progress);

          setPetals(cloudPetals.map(p => ({
            mood: p.mood,
            color: p.color,
            date: p.earned_date,
          })));

          setSessionHistory(cloudSessions.map(s => ({
            mood: s.mood,
            date: s.session_date,
            duration: s.duration_seconds,
          })));

          if (cloudSettings) {
            setSettings({
              narrationSpeed: cloudSettings.narration_speed,
              highContrast: cloudSettings.high_contrast,
              animationsEnabled: cloudSettings.animations_enabled,
              audioEnabled: cloudSettings.audio_enabled ?? true,
            });
            
            // Load sound settings from cloud if available
            if (cloudSettings.sound_enabled !== undefined) {
              setSoundSettings({
                enabled: cloudSettings.sound_enabled,
                volume: cloudSettings.sound_volume ?? 0.5,
                autoFadeOnNarration: cloudSettings.sound_auto_fade ?? true,
                fadeDuration: 500,
                approvedSounds: cloudSettings.sound_approved ?? defaultSoundSettings.approvedSounds,
                characterDefaults: cloudSettings.sound_character_defaults ?? defaultSoundSettings.characterDefaults,
              });
            }
          }

          setJournalEntries(cloudJournal.map(j => ({
            id: j.id,
            entry_date: j.entry_date,
            mood: j.mood,
            drawing_data: j.drawing_data,
            notes: j.notes,
          })));

          setBadges(cloudBadges.map(b => ({
            badge_type: b.badge_type,
            streak_count: b.streak_count,
            earned_date: b.earned_date,
          })));

          // Load cloud worries
          setWorries(cloudWorriesToLocal(cloudWorries));

          setHasFamilyPin(hasPin);
          setHasSeenWelcome(true);
          setCurrentView('home');
        }
      } else {
        const savedPetals = localStorage.getItem('petalPaths_petals');
        const savedHistory = localStorage.getItem('petalPaths_history');
        const savedSettings = localStorage.getItem('petalPaths_settings');
        const savedWelcome = localStorage.getItem('petalPaths_hasSeenWelcome');
        const savedJournal = localStorage.getItem('petalPaths_journal');
        const savedBadges = localStorage.getItem('petalPaths_badges');
        const savedSoundSettings = localStorage.getItem('petalPaths_soundSettings');
        const savedWorries = localStorage.getItem('petalPaths_worries');

        // Load local game progress
        const localProgress = getLocalProgress();
        setGameProgress(localProgress);

        if (savedPetals) setPetals(JSON.parse(savedPetals));
        if (savedHistory) setSessionHistory(JSON.parse(savedHistory));
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSettings({
            ...parsed,
            audioEnabled: parsed.audioEnabled ?? true,
          });
        }
        if (savedJournal) setJournalEntries(JSON.parse(savedJournal));
        if (savedBadges) setBadges(JSON.parse(savedBadges));
        if (savedSoundSettings) {
          const parsed = JSON.parse(savedSoundSettings);
          setSoundSettings({
            ...defaultSoundSettings,
            ...parsed,
          });
        }
        if (savedWorries) setWorries(JSON.parse(savedWorries));
        
        // Load stickers from localStorage
        const savedEarnedStickers = localStorage.getItem('petalPaths_earnedStickers');
        const savedPlacedStickers = localStorage.getItem('petalPaths_placedStickers');
        if (savedEarnedStickers) setEarnedStickers(JSON.parse(savedEarnedStickers));
        if (savedPlacedStickers) setPlacedStickers(JSON.parse(savedPlacedStickers));
        
        // Load weekly goals from localStorage
        const savedGoals = localStorage.getItem('petalPaths_weeklyGoals');
        if (savedGoals) setWeeklyGoals(JSON.parse(savedGoals));
        
        if (savedWelcome === 'true') {
          setHasSeenWelcome(true);
          setCurrentView('home');
        }
      }

      setIsLoading(false);
    };

    loadData();
  }, []);



  // Save stickers to localStorage
  useEffect(() => {
    if (!family) {
      localStorage.setItem('petalPaths_earnedStickers', JSON.stringify(earnedStickers));
    }
  }, [earnedStickers, family]);

  useEffect(() => {
    if (!family) {
      localStorage.setItem('petalPaths_placedStickers', JSON.stringify(placedStickers));
    }
  }, [placedStickers, family]);


  useEffect(() => {
    if (!family) {
      localStorage.setItem('petalPaths_petals', JSON.stringify(petals));
    }
  }, [petals, family]);

  useEffect(() => {
    if (!family) {
      localStorage.setItem('petalPaths_history', JSON.stringify(sessionHistory));
    }
  }, [sessionHistory, family]);

  useEffect(() => {
    if (!family) {
      localStorage.setItem('petalPaths_settings', JSON.stringify(settings));
    }
  }, [settings, family]);

  useEffect(() => {
    if (!family) {
      localStorage.setItem('petalPaths_journal', JSON.stringify(journalEntries));
    }
  }, [journalEntries, family]);

  useEffect(() => {
    if (!family) {
      localStorage.setItem('petalPaths_badges', JSON.stringify(badges));
    }
  }, [badges, family]);

  useEffect(() => {
    if (!family) {
      localStorage.setItem('petalPaths_soundSettings', JSON.stringify(soundSettings));
    }
  }, [soundSettings, family]);

  useEffect(() => {
    if (!family) {
      localStorage.setItem('petalPaths_worries', JSON.stringify(worries));
    }
  }, [worries, family]);

  // Save weekly goals to localStorage
  useEffect(() => {
    localStorage.setItem('petalPaths_weeklyGoals', JSON.stringify(weeklyGoals));
  }, [weeklyGoals]);

  // Apply high contrast mode
  useEffect(() => {
    if (settings.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [settings.highContrast]);


  // Handle successful auth
  const handleAuthSuccess = async (familyData: Family) => {
    setFamily(familyData);
    localStorage.setItem('petalPaths_familyId', familyData.id);
    localStorage.setItem('petalPaths_familyEmail', familyData.email);

    const localPetals = localStorage.getItem('petalPaths_petals');
    const localHistory = localStorage.getItem('petalPaths_history');
    const localBadges = localStorage.getItem('petalPaths_badges');
    const localWorries = localStorage.getItem('petalPaths_worries');

    if (localPetals || localHistory) {
      const petalsToSync = localPetals ? JSON.parse(localPetals) : [];
      const sessionsToSync = localHistory ? JSON.parse(localHistory) : [];

      if (petalsToSync.length > 0 || sessionsToSync.length > 0) {
        await syncLocalToCloud(
          familyData.id,
          petalsToSync,
          sessionsToSync.map((s: LocalSession) => ({
            mood: s.mood,
            duration: s.duration,
            date: s.date,
          }))
        );
      }
    }

    if (localBadges) {
      const badgesToSync = JSON.parse(localBadges);
      if (badgesToSync.length > 0) {
        await syncBadgesToCloud(familyData.id, badgesToSync);
      }
    }

    // Sync local worries to cloud
    if (localWorries) {
      const worriesToSync = JSON.parse(localWorries);
      if (worriesToSync.length > 0) {
        await syncWorriesToCloud(familyData.id, worriesToSync);
      }
    }

    const cloudPetals = await getPetals(familyData.id);
    const cloudSessions = await getSessionHistory(familyData.id);
    const cloudSettings = await getSettings(familyData.id);
    const hasPin = await hasParentPin(familyData.id);
    const cloudJournal = await getJournalEntries(familyData.id);
    const cloudBadges = await getBadges(familyData.id);
    const cloudWorries = await getWorries(familyData.id);

    setPetals(cloudPetals.map(p => ({
      mood: p.mood,
      color: p.color,
      date: p.earned_date,
    })));

    setSessionHistory(cloudSessions.map(s => ({
      mood: s.mood,
      date: s.session_date,
      duration: s.duration_seconds,
    })));

    if (cloudSettings) {
      setSettings({
        narrationSpeed: cloudSettings.narration_speed,
        highContrast: cloudSettings.high_contrast,
        animationsEnabled: cloudSettings.animations_enabled,
        audioEnabled: cloudSettings.audio_enabled ?? true,
      });
      
      // Load sound settings from cloud
      if (cloudSettings.sound_enabled !== undefined) {
        setSoundSettings({
          enabled: cloudSettings.sound_enabled,
          volume: cloudSettings.sound_volume ?? 0.5,
          autoFadeOnNarration: cloudSettings.sound_auto_fade ?? true,
          fadeDuration: 500,
          approvedSounds: cloudSettings.sound_approved ?? defaultSoundSettings.approvedSounds,
          characterDefaults: cloudSettings.sound_character_defaults ?? defaultSoundSettings.characterDefaults,
        });
      }
    }

    setJournalEntries(cloudJournal.map(j => ({
      id: j.id,
      entry_date: j.entry_date,
      mood: j.mood,
      drawing_data: j.drawing_data,
      notes: j.notes,
    })));

    setBadges(cloudBadges.map(b => ({
      badge_type: b.badge_type,
      streak_count: b.streak_count,
      earned_date: b.earned_date,
    })));

    // Load cloud worries after sync
    setWorries(cloudWorriesToLocal(cloudWorries));

    setHasFamilyPin(hasPin);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setFamily(null);
    localStorage.removeItem('petalPaths_familyId');
    localStorage.removeItem('petalPaths_familyEmail');
    setHasFamilyPin(false);
    setCurrentView('home');
  };

  const handleStartFromWelcome = () => {
    setHasSeenWelcome(true);
    localStorage.setItem('petalPaths_hasSeenWelcome', 'true');
    setCurrentView('home');
  };

  const handleSelectMood = (moodId: string) => {
    setSelectedMood(moodId);
    setSessionStartTime(Date.now());
    setCurrentView('path');
  };

  const handleBackToHome = () => {
    setSelectedMood(null);
    setSessionStartTime(null);
    setCurrentView('home');
  };

  const handlePathComplete = async () => {
    if (selectedMood && sessionStartTime) {
      const duration = Math.round((Date.now() - sessionStartTime) / 1000);
      const today = new Date().toDateString();
      const color = moodConfigs[selectedMood]?.color || 'gray';

      const newPetal: LocalPetal = {
        mood: selectedMood,
        color,
        date: today,
      };
      setPetals((prev) => [...prev, newPetal]);

      const newSession: LocalSession = {
        mood: selectedMood,
        date: today,
        duration,
      };
      setSessionHistory((prev) => [...prev, newSession]);

      if (family) {
        await addPetal(family.id, selectedMood, color);
        await addSession(family.id, selectedMood, duration);
      }

      // Award a sticker for completing a path
      tryAwardSticker('path');
    }

    setSelectedMood(null);
    setSessionStartTime(null);
    setCurrentView('home');
  };


  const handleSettingsChange = async (newSettings: Settings) => {
    setSettings(newSettings);
    
    if (family) {
      await saveSettings(family.id, {
        narration_speed: newSettings.narrationSpeed,
        high_contrast: newSettings.highContrast,
        animations_enabled: newSettings.animationsEnabled,
        audio_enabled: newSettings.audioEnabled,
      });
    }
  };

  const handleSoundSettingsChange = async (newSoundSettings: SoundSettings) => {
    setSoundSettings(newSoundSettings);
    
    if (family) {
      // Save sound settings to cloud (would need to extend saveSettings)
      // For now, we'll save to localStorage and it will sync on next login
    }
  };

  const handleOpenParentMode = async () => {
    if (family && hasFamilyPin) {
      setPendingParentAccess(true);
      setPinModalMode('verify');
      setShowPinModal(true);
    } else {
      setCurrentView('parent');
    }
  };

  const handlePinVerify = async (pin: string): Promise<boolean> => {
    if (!family) return false;
    return await verifyParentPin(family.id, pin);
  };

  const handlePinSuccess = async (pin?: string) => {
    if (pin && family) {
      await setParentPin(family.id, pin);
      setHasFamilyPin(true);
    }
    
    setShowPinModal(false);
    
    if (pendingParentAccess) {
      setPendingParentAccess(false);
      setCurrentView('parent');
    }
  };

  const handleUpdateChildName = async (name: string) => {
    if (family) {
      await updateChildName(family.id, name);
      setFamily({ ...family, child_name: name });
    }
  };

  const handleSaveJournalEntry = async (entry: Omit<LocalJournalEntry, 'id'>) => {
    if (family) {
      const savedEntry = await saveJournalEntry(family.id, entry);
      if (savedEntry) {
        setJournalEntries(prev => {
          const existingIndex = prev.findIndex(e => e.entry_date === entry.entry_date);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = {
              id: savedEntry.id,
              entry_date: savedEntry.entry_date,
              mood: savedEntry.mood,
              drawing_data: savedEntry.drawing_data,
              notes: savedEntry.notes,
            };
            return updated;
          } else {
            return [...prev, {
              id: savedEntry.id,
              entry_date: savedEntry.entry_date,
              mood: savedEntry.mood,
              drawing_data: savedEntry.drawing_data,
              notes: savedEntry.notes,
            }];
          }
        });
      }
    } else {
      setJournalEntries(prev => {
        const existingIndex = prev.findIndex(e => e.entry_date === entry.entry_date);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = entry;
          return updated;
        } else {
          return [...prev, entry];
        }
      });
    }
  };

  const handleBadgeEarned = async (badge: BadgeDefinition, streak: number) => {
    const newBadge: LocalBadge = {
      badge_type: badge.id,
      streak_count: streak,
      earned_date: new Date().toISOString().split('T')[0],
    };

    setBadges(prev => [...prev, newBadge]);

    if (family) {
      await awardBadge(family.id, badge.id, streak);
    }
  };

  // Worry Pocket handlers with cloud sync
  const handleAddWorry = async (worry: Omit<Worry, 'id'>) => {
    if (family) {
      // Save to cloud first
      const cloudWorry = await addWorryToCloud(family.id, {
        type: worry.type,
        content: worry.content,
        category: worry.category,
        put_away: worry.putAway,
        reviewed_with_parent: worry.reviewedWithParent,
        parent_notes: worry.parentNotes,
      });

      if (cloudWorry) {
        // Use the cloud ID
        const newWorry: Worry = {
          id: cloudWorry.id,
          type: cloudWorry.type,
          content: cloudWorry.content,
          createdAt: cloudWorry.created_at,
          putAway: cloudWorry.put_away,
          category: cloudWorry.category,
          reviewedWithParent: cloudWorry.reviewed_with_parent,
          parentNotes: cloudWorry.parent_notes,
        };
        setWorries(prev => [...prev, newWorry]);
      }
    } else {
      // Local only - generate local ID
      const newWorry: Worry = {
        ...worry,
        id: `worry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      setWorries(prev => [...prev, newWorry]);
    }
  };

  const handleUpdateWorry = async (id: string, updates: Partial<Worry>) => {
    if (family) {
      // Update in cloud
      const cloudUpdates: any = {};
      if (updates.putAway !== undefined) cloudUpdates.put_away = updates.putAway;
      if (updates.reviewedWithParent !== undefined) cloudUpdates.reviewed_with_parent = updates.reviewedWithParent;
      if (updates.parentNotes !== undefined) cloudUpdates.parent_notes = updates.parentNotes;
      if (updates.category !== undefined) cloudUpdates.category = updates.category;

      await updateWorryInCloud(id, cloudUpdates);
    }
    // Update local state
    setWorries(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  // Delete a single worry
  const handleDeleteWorry = async (id: string) => {
    if (family) {
      // Delete from cloud
      await deleteWorryFromCloud(id);
    }
    // Remove from local state
    setWorries(prev => prev.filter(w => w.id !== id));
  };

  // Bulk delete worries older than a certain date
  const handleBulkDeleteWorries = async (beforeDate: string): Promise<number> => {
    if (family) {
      // Delete from cloud
      const result = await bulkDeleteWorries(family.id, beforeDate);
      if (result.success) {
        // Update local state to match
        setWorries(prev => prev.filter(w => new Date(w.createdAt) >= new Date(beforeDate)));
        return result.deletedCount;
      }
      return 0;
    } else {
      // Local only - filter worries
      const beforeDateObj = new Date(beforeDate);
      const worriesBeforeDelete = worries.length;
      setWorries(prev => prev.filter(w => new Date(w.createdAt) >= beforeDateObj));
      return worriesBeforeDelete - worries.filter(w => new Date(w.createdAt) >= beforeDateObj).length;
    }
  };

  // Sticker handlers
  const tryAwardSticker = (activityType: 'breathing' | 'journaling' | 'coping' | 'path' | 'streak' | 'special') => {
    const reward = ACTIVITY_REWARDS[activityType];
    if (!reward) return;

    // Check if we should award a sticker based on chance
    if (Math.random() > reward.chance) return;

    // Get already earned sticker IDs
    const earnedIds = earnedStickers.map(s => s.stickerId);

    // Try to get a random sticker that hasn't been earned yet
    const newSticker = getRandomStickerWeighted(earnedIds);
    if (!newSticker) return; // All stickers already earned

    // Award the sticker
    const newEarnedSticker: EarnedSticker = {
      stickerId: newSticker.id,
      earnedAt: new Date().toISOString(),
      earnedFrom: activityType,
    };

    setEarnedStickers(prev => [...prev, newEarnedSticker]);
    setPendingStickerReward({ stickerId: newSticker.id, earnedFrom: activityType });
  };

  const handlePlaceSticker = (sticker: PlacedSticker) => {
    setPlacedStickers(prev => [...prev, sticker]);
  };

  const handleRemoveSticker = (stickerId: string, pageIndex: number) => {
    setPlacedStickers(prev =>
      prev.filter(s => !(s.stickerId === stickerId && s.pageIndex === pageIndex))
    );
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-100 via-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-rounded">Loading your garden...</p>
        </div>
      </div>
    );
  }

  // Render welcome screen for first-time users
  if (currentView === 'welcome' && !hasSeenWelcome) {
    return <WelcomeScreen onStart={handleStartFromWelcome} />;
  }

  // Render based on current view
  if (currentView === 'path' && selectedMood && moodConfigs[selectedMood]) {
    return (
      <div className={!settings.animationsEnabled ? 'no-animations' : ''}>
        <PetalPath
          mood={moodConfigs[selectedMood]}
          onComplete={handlePathComplete}
          onBack={handleBackToHome}
          settings={{
            narrationSpeed: settings.narrationSpeed,
            audioEnabled: settings.audioEnabled,
          }}
          soundSettings={soundSettings}
        />
      </div>
    );
  }

  if (currentView === 'garden') {
    return (
      <ProgressGarden
        petals={petals}
        onClose={() => setCurrentView('home')}
        earnedBadgeIds={earnedBadgeIds}
        currentStreak={currentStreak}
      />
    );
  }

  if (currentView === 'journal') {
    return (
      <MoodJournal
        onClose={() => setCurrentView('home')}
        onSaveEntry={handleSaveJournalEntry}
        entries={journalEntries}
        childName={family?.child_name}
        earnedBadgeIds={earnedBadgeIds}
        onBadgeEarned={handleBadgeEarned}
      />
    );
  }

  if (currentView === 'quietcorner') {
    return (
      <QuietCorner
        onClose={() => setCurrentView('home')}
        soundSettings={soundSettings}
      />
    );
  }
  if (currentView === 'worrypocket') {
    return (
      <WorryPocket
        onClose={() => setCurrentView('home')}
        worries={worries}
        onAddWorry={handleAddWorry}
        onUpdateWorry={handleUpdateWorry}
        childName={family?.child_name}
      />
    );
  }

  if (currentView === 'stickerbook') {
    return (
      <StickerBook
        onClose={() => setCurrentView('home')}
        earnedStickers={earnedStickers}
        placedStickers={placedStickers}
        onPlaceSticker={handlePlaceSticker}
        onRemoveSticker={handleRemoveSticker}
        childName={family?.child_name}
      />
    );
  }

  if (currentView === 'funzone') {
    return (
      <FunZone
        onClose={() => setCurrentView('home')}
        onEarnReward={async (stickers, items) => {
          // Award stickers from Fun Zone games
          for (let i = 0; i < stickers; i++) {
            tryAwardSticker('special');
          }
          // Add earned garden items and save to progress
          const newProgress = await addEarnedGardenItems(family?.id || null, items);
          setGameProgress(newProgress);
        }}
        earnedGardenItems={gameProgress.earnedGardenItems || []}
        placedGardenItems={gameProgress.placedGardenItems || []}
        onPlaceGardenItem={async (item) => {
          const newPlaced = [...(gameProgress.placedGardenItems || []), item];
          const newProgress = await updatePlacedGardenItems(family?.id || null, newPlaced);
          setGameProgress(newProgress);
        }}
        onRemoveGardenItem={async (index) => {
          const newPlaced = (gameProgress.placedGardenItems || []).filter((_, i) => i !== index);
          const newProgress = await updatePlacedGardenItems(family?.id || null, newPlaced);
          setGameProgress(newProgress);
        }}
        completedLevels={gameProgress.completedLevels || []}
        onLevelComplete={async (levelIndex) => {
          const newProgress = await addCompletedLevel(family?.id || null, levelIndex);
          setGameProgress(newProgress);
        }}
        savedBugs={gameProgress.savedBugs || []}
        onSaveBug={async (bug) => {
          const newProgress = await addSavedBug(family?.id || null, bug);
          setGameProgress(newProgress);
        }}
        familyId={family?.id || null}
      />
    );
  }

  const pocketWorryCount = worries.filter(w => w.putAway).length;




  return (
    <div className={!settings.animationsEnabled ? 'no-animations' : ''}>

      <HomeScreen
        onSelectMood={handleSelectMood}
        onOpenGarden={() => setCurrentView('garden')}
        onOpenParentMode={handleOpenParentMode}
        onOpenJournal={() => setCurrentView('journal')}
        onOpenQuietCorner={() => setCurrentView('quietcorner')}
        onOpenWorryPocket={() => setCurrentView('worrypocket')}
        onOpenStickerBook={() => setCurrentView('stickerbook')}
        onOpenFunZone={() => setCurrentView('funzone')}
        onOpenPremium={() => setShowPremiumModal(true)}
        petalsCount={petals.length}
        isLoggedIn={!!family}
        isPremium={premium.isPremium}
        onOpenAuth={() => setShowAuthModal(true)}
        childName={family?.child_name}
        badgeCount={earnedBadgeIds.length}
        currentStreak={currentStreak}
        worryCount={pocketWorryCount}
        stickerCount={earnedStickers.length}
      />



      {/* Sticker Reward Modal */}
      {pendingStickerReward && (
        <StickerRewardModal
          stickerId={pendingStickerReward.stickerId}
          earnedFrom={pendingStickerReward.earnedFrom}
          onClose={() => setPendingStickerReward(null)}
          onViewCollection={() => {
            setPendingStickerReward(null);
            setCurrentView('stickerbook');
          }}
        />
      )}



      {currentView === 'parent' && (
        <ParentMode
          onClose={() => setCurrentView('home')}
          sessionHistory={sessionHistory}
          settings={settings}
          onSettingsChange={handleSettingsChange}
          soundSettings={soundSettings}
          onSoundSettingsChange={handleSoundSettingsChange}
          family={family}
          onLogout={handleLogout}
          onSetPin={() => {
            setPinModalMode('set');
            setShowPinModal(true);
          }}
          onChangePin={() => {
            setPinModalMode('change');
            setShowPinModal(true);
          }}
          hasPin={hasFamilyPin}
          childName={family?.child_name}
          onUpdateChildName={handleUpdateChildName}
          worries={worries}
          onUpdateWorry={handleUpdateWorry}
          onDeleteWorry={handleDeleteWorry}
          onBulkDeleteWorries={handleBulkDeleteWorries}
        />
      )}

      {showPremiumModal && (
        <PremiumModal
          onClose={() => setShowPremiumModal(false)}
          familyId={family?.id || null}
          email={family?.email || null}
          onSuccess={() => {
            if (family?.id) {
              checkPremiumStatus(family.id);
            }
          }}
        />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {showPinModal && (
        <ParentPinModal
          mode={pinModalMode}
          onClose={() => {
            setShowPinModal(false);
            setPendingParentAccess(false);
          }}
          onSuccess={handlePinSuccess}
          onVerify={handlePinVerify}
        />
      )}
    </div>
  );
};

export default AppLayout;
