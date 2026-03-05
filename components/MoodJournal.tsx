import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar, Pencil, Check, Sparkles } from 'lucide-react';
import DrawingCanvas from './DrawingCanvas';
import { BadgeUnlockNotification, StreakDisplay } from './BadgeDisplay';
import { BadgeDefinition, calculateStreak, checkNewBadges, BADGE_DEFINITIONS } from './badgeConfig';

interface JournalEntry {
  id?: string;
  entry_date: string;
  mood: string;
  drawing_data?: string;
  notes?: string;
}

interface MoodJournalProps {
  onClose: () => void;
  onSaveEntry: (entry: Omit<JournalEntry, 'id'>) => Promise<void>;
  entries: JournalEntry[];
  childName?: string | null;
  earnedBadgeIds?: string[];
  onBadgeEarned?: (badge: BadgeDefinition, streak: number) => void;
}

const MOODS = [
  { id: 'happy', label: 'Happy', emoji: '😊', color: 'bg-yellow-100 border-yellow-400 text-yellow-700' },
  { id: 'calm', label: 'Calm', emoji: '😌', color: 'bg-green-100 border-green-400 text-green-700' },
  { id: 'excited', label: 'Excited', emoji: '🤩', color: 'bg-orange-100 border-orange-400 text-orange-700' },
  { id: 'tired', label: 'Tired', emoji: '😴', color: 'bg-blue-100 border-blue-400 text-blue-700' },
  { id: 'worried', label: 'Worried', emoji: '😟', color: 'bg-purple-100 border-purple-400 text-purple-700' },
  { id: 'sad', label: 'Sad', emoji: '😢', color: 'bg-indigo-100 border-indigo-400 text-indigo-700' },
  { id: 'angry', label: 'Angry', emoji: '😠', color: 'bg-red-100 border-red-400 text-red-700' },
  { id: 'shy', label: 'Shy', emoji: '🙈', color: 'bg-pink-100 border-pink-400 text-pink-700' },
];

const MoodJournal: React.FC<MoodJournalProps> = ({
  onClose,
  onSaveEntry,
  entries,
  childName,
  earnedBadgeIds = [],
  onBadgeEarned,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [drawingData, setDrawingData] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [view, setView] = useState<'calendar' | 'entry'>('calendar');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newBadge, setNewBadge] = useState<BadgeDefinition | null>(null);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const currentDateStr = currentDate.toISOString().split('T')[0];
  const isToday = currentDateStr === todayStr;

  // Calculate current streak
  const currentStreak = calculateStreak(entries);
  
  // Find next badge milestone
  const nextBadge = BADGE_DEFINITIONS.find(b => 
    !earnedBadgeIds.includes(b.id) && b.streakRequired > currentStreak
  );

  // Get entry for current date
  const currentEntry = entries.find(e => e.entry_date === currentDateStr);

  useEffect(() => {
    if (currentEntry) {
      setSelectedMood(currentEntry.mood);
      setDrawingData(currentEntry.drawing_data || null);
      setNotes(currentEntry.notes || '');
    } else {
      setSelectedMood(null);
      setDrawingData(null);
      setNotes('');
    }
  }, [currentDateStr, currentEntry]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);

  const getEntryForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return entries.find(e => e.entry_date === dateStr);
  };

  const getMoodColor = (moodId: string) => {
    const mood = MOODS.find(m => m.id === moodId);
    return mood?.color || 'bg-gray-100';
  };

  const getMoodEmoji = (moodId: string) => {
    const mood = MOODS.find(m => m.id === moodId);
    return mood?.emoji || '❓';
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    if (nextMonth <= today) {
      setCurrentDate(nextMonth);
    }
  };

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    if (clickedDate <= today) {
      setCurrentDate(clickedDate);
      setView('entry');
    }
  };

  const handleSave = async () => {
    if (!selectedMood) return;

    setIsSaving(true);
    try {
      // Check if this is a new entry (not an update)
      const isNewEntry = !currentEntry;
      
      await onSaveEntry({
        entry_date: currentDateStr,
        mood: selectedMood,
        drawing_data: drawingData || undefined,
        notes: notes || undefined,
      });

      // If it's a new entry, check for new badges
      if (isNewEntry) {
        // Calculate new streak (add 1 for the entry we just saved)
        const updatedEntries = [...entries, { entry_date: currentDateStr, mood: selectedMood }];
        const newStreak = calculateStreak(updatedEntries);
        
        // Check for new badges
        const newBadges = checkNewBadges(newStreak, earnedBadgeIds);
        
        if (newBadges.length > 0) {
          // Award the first new badge (usually there's only one)
          const badgeToAward = newBadges[0];
          setNewBadge(badgeToAward);
          onBadgeEarned?.(badgeToAward, newStreak);
        } else {
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            setView('calendar');
          }, 1500);
        }
      } else {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setView('calendar');
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving entry:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBadgeNotificationClose = () => {
    setNewBadge(null);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setView('calendar');
    }, 1500);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-sky-100 via-purple-50 to-pink-100 z-50 overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-4 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {view === 'entry' && (
              <button
                onClick={() => setView('calendar')}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-800 font-rounded flex items-center gap-2">
                <Calendar className="w-6 h-6 text-purple-500" />
                Mood Journal
              </h1>
              <p className="text-sm text-gray-500">
                {childName ? `${childName}'s feelings` : 'How did you feel today?'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {view === 'calendar' ? (
          <div className="space-y-6">
            {/* Streak display */}
            {currentStreak > 0 && (
              <StreakDisplay 
                currentStreak={currentStreak} 
                nextBadgeAt={nextBadge?.streakRequired}
              />
            )}

            {/* Month navigation */}
            <div className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              <h2 className="text-xl font-bold text-gray-800">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button
                onClick={handleNextMonth}
                disabled={new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1) > today}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-30"
              >
                <ChevronRight className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Calendar grid */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              {/* Day names */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before the first of the month */}
                {Array.from({ length: startingDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Days of the month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const entry = getEntryForDay(day);
                  const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                  const isFuture = dayDate > today;
                  const isCurrentDay = dayDate.toDateString() === today.toDateString();

                  return (
                    <button
                      key={day}
                      onClick={() => handleDayClick(day)}
                      disabled={isFuture}
                      className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all ${
                        isFuture
                          ? 'opacity-30 cursor-not-allowed'
                          : 'hover:scale-105 cursor-pointer'
                      } ${
                        isCurrentDay
                          ? 'ring-2 ring-purple-500 ring-offset-2'
                          : ''
                      } ${
                        entry
                          ? getMoodColor(entry.mood)
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <span className={`text-sm font-medium ${entry ? '' : 'text-gray-600'}`}>
                        {day}
                      </span>
                      {entry && (
                        <span className="text-lg">{getMoodEmoji(entry.mood)}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add today's entry button */}
            {!entries.find(e => e.entry_date === todayStr) && (
              <button
                onClick={() => {
                  setCurrentDate(today);
                  setView('entry');
                }}
                className="w-full py-4 bg-purple-500 hover:bg-purple-600 text-white rounded-2xl font-bold text-lg shadow-lg transition-colors flex items-center justify-center gap-2"
              >
                <Pencil className="w-5 h-5" />
                Add Today's Entry
              </button>
            )}

            {/* Legend */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-3">Mood Colors</h3>
              <div className="grid grid-cols-4 gap-2">
                {MOODS.map(mood => (
                  <div key={mood.id} className="flex items-center gap-2">
                    <span className="text-lg">{mood.emoji}</span>
                    <span className="text-xs text-gray-600">{mood.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Date display */}
            <div className="text-center">
              <p className="text-lg text-gray-600">
                {isToday ? 'Today' : currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Success animation */}
            {showSuccess && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
                <div className="bg-white rounded-3xl p-8 text-center animate-bounce">
                  <Sparkles className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                  <p className="text-2xl font-bold text-gray-800">Great job!</p>
                  <p className="text-gray-600">Your feelings are saved</p>
                </div>
              </div>
            )}

            {/* Badge unlock notification */}
            {newBadge && (
              <BadgeUnlockNotification
                badge={newBadge}
                onClose={handleBadgeNotificationClose}
              />
            )}

            {/* Mood selection */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-4 text-center text-lg">
                How did you feel?
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {MOODS.map(mood => (
                  <button
                    key={mood.id}
                    onClick={() => setSelectedMood(mood.id)}
                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                      selectedMood === mood.id
                        ? `${mood.color} border-current scale-105 shadow-md`
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl">{mood.emoji}</span>
                    <span className="text-xs font-medium">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Drawing section */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-4 text-center text-lg">
                Draw how you felt
              </h3>
              <DrawingCanvas
                width={600}
                height={400}
                initialData={drawingData || undefined}
                onDrawingChange={setDrawingData}
                earnedBadgeIds={earnedBadgeIds}
              />
            </div>

            {/* Notes (optional) */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-3">
                Want to say more? (optional)
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What happened today?"
                className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none resize-none h-24 text-gray-700"
              />
            </div>

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={!selectedMood || isSaving}
              className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${
                selectedMood
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSaving ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-6 h-6" />
                  Save My Feelings
                </>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default MoodJournal;
