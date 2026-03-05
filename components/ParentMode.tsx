import React, { useState, useMemo } from 'react';
import { X, Settings, BookOpen, Clock, Heart, Info, Lock, Cloud, LogOut, User, BarChart3, Volume2, Music, Check, Pocket, MessageSquare, TrendingUp, TrendingDown, Calendar, Trash2, AlertTriangle, Download, FileText, FileSpreadsheet, Minus, Activity, Target } from 'lucide-react';
import EmotionInsights from './EmotionInsights';
import { SoundSettings, soundLibrary, categoryInfo, defaultCharacterSounds, defaultApprovedSounds } from './soundConfig';
import { Worry, IntensityIndicator } from './WorryPocket';
import { generateWorryExportData, generateWorryCSV, generateWorryPDFHTML, generateLocalWorryExportData, WorryExportData } from '../lib/familyService';
import WeeklyGoals, { WeeklyGoal } from './WeeklyGoals';

const intensityLevels = [
  { value: 1, label: 'Tiny', color: 'bg-green-400', textColor: 'text-green-700', bgLight: 'bg-green-100', hex: '#22C55E' },
  { value: 2, label: 'Small', color: 'bg-lime-400', textColor: 'text-lime-700', bgLight: 'bg-lime-100', hex: '#84CC16' },
  { value: 3, label: 'Medium', color: 'bg-yellow-400', textColor: 'text-yellow-700', bgLight: 'bg-yellow-100', hex: '#EAB308' },
  { value: 4, label: 'Big', color: 'bg-orange-400', textColor: 'text-orange-700', bgLight: 'bg-orange-100', hex: '#F97316' },
  { value: 5, label: 'Huge', color: 'bg-red-400', textColor: 'text-red-700', bgLight: 'bg-red-100', hex: '#EF4444' },
];

const calculateIntensityTrend = (worries: Worry[]): {
  direction: 'increasing' | 'decreasing' | 'stable' | 'insufficient_data';
  recentAvg: number;
  olderAvg: number;
  weeklyData: { week: string; avgIntensity: number; count: number }[];
  intensityDistribution: Record<number, number>;
  averageIntensity: number;
} => {
  const sortedWorries = [...worries]
    .filter(w => w.putAway && w.intensity)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const intensityDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalIntensity = 0;
  sortedWorries.forEach(w => {
    const intensity = w.intensity || 3;
    intensityDistribution[intensity] = (intensityDistribution[intensity] || 0) + 1;
    totalIntensity += intensity;
  });
  const averageIntensity = sortedWorries.length > 0 ? totalIntensity / sortedWorries.length : 0;

  if (sortedWorries.length < 3) {
    return { 
      direction: 'insufficient_data', 
      recentAvg: 0, 
      olderAvg: 0, 
      weeklyData: [],
      intensityDistribution,
      averageIntensity: Math.round(averageIntensity * 10) / 10,
    };
  }

  const weeklyData: { week: string; avgIntensity: number; count: number }[] = [];
  const now = new Date();
  
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - i * 7);
    
    const weekWorries = sortedWorries.filter(w => {
      const date = new Date(w.createdAt);
      return date >= weekStart && date < weekEnd;
    });
    
    const avgIntensity = weekWorries.length > 0
      ? weekWorries.reduce((sum, w) => sum + (w.intensity || 3), 0) / weekWorries.length
      : 0;
    
    weeklyData.push({
      week: `Week ${4 - i}`,
      avgIntensity: Math.round(avgIntensity * 10) / 10,
      count: weekWorries.length,
    });
  }

  const midpoint = Math.floor(sortedWorries.length / 2);
  const olderHalf = sortedWorries.slice(0, midpoint);
  const recentHalf = sortedWorries.slice(midpoint);

  const olderAvg = olderHalf.reduce((sum, w) => sum + (w.intensity || 3), 0) / olderHalf.length;
  const recentAvg = recentHalf.reduce((sum, w) => sum + (w.intensity || 3), 0) / recentHalf.length;

  let direction: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (recentAvg > olderAvg + 0.5) {
    direction = 'increasing';
  } else if (recentAvg < olderAvg - 0.5) {
    direction = 'decreasing';
  }

  return {
    direction,
    recentAvg: Math.round(recentAvg * 10) / 10,
    olderAvg: Math.round(olderAvg * 10) / 10,
    weeklyData,
    intensityDistribution,
    averageIntensity: Math.round(averageIntensity * 10) / 10,
  };
};

const IntensityTrendChart: React.FC<{ weeklyData: { week: string; avgIntensity: number; count: number }[] }> = ({ weeklyData }) => {
  const maxIntensity = 5;
  
  return (
    <div className="flex items-end gap-2 h-28">
      {weeklyData.map((week, i) => {
        const height = week.avgIntensity > 0 ? (week.avgIntensity / maxIntensity) * 100 : 5;
        const level = intensityLevels[Math.round(week.avgIntensity) - 1] || intensityLevels[2];
        
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="relative w-full flex flex-col items-center h-16">
              <span className="text-xs text-gray-500 mb-1">
                {week.avgIntensity > 0 ? week.avgIntensity : '-'}
              </span>
              <div 
                className={`w-full rounded-t-lg transition-all ${week.avgIntensity > 0 ? level.color : 'bg-gray-200'}`}
                style={{ height: `${height}%`, minHeight: '4px' }}
              />
            </div>
            <span className="text-xs text-gray-500 font-medium">{week.week}</span>
            <span className="text-xs text-gray-400">({week.count})</span>
          </div>
        );
      })}
    </div>
  );
};

const IntensityDistributionBar: React.FC<{ distribution: Record<number, number>; total: number }> = ({ distribution, total }) => {
  if (total === 0) return null;
  
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map(level => {
        const count = distribution[level] || 0;
        const percentage = Math.round((count / total) * 100);
        const levelInfo = intensityLevels[level - 1];
        
        return (
          <div key={level} className="flex items-center gap-2">
            <span className={`text-xs font-medium w-14 ${levelInfo.textColor}`}>{levelInfo.label}</span>
            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full ${levelInfo.color} rounded-full transition-all`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
          </div>
        );
      })}
    </div>
  );
};

interface ParentModeProps {
  onClose: () => void;
  sessionHistory: { mood: string; date: string; duration: number }[];
  settings: {
    narrationSpeed: number;
    highContrast: boolean;
    animationsEnabled: boolean;
    audioEnabled: boolean;
  };
  onSettingsChange: (settings: any) => void;
  soundSettings: SoundSettings;
  onSoundSettingsChange: (settings: SoundSettings) => void;
  family?: { id: string; email: string; child_name: string | null } | null;
  onLogout?: () => void;
  onSetPin?: () => void;
  onChangePin?: () => void;
  hasPin?: boolean;
  childName?: string | null;
  onUpdateChildName?: (name: string) => void;
  worries?: Worry[];
  onUpdateWorry?: (id: string, updates: Partial<Worry>) => void;
  onDeleteWorry?: (id: string) => void;
  onBulkDeleteWorries?: (beforeDate: string) => Promise<number>;
  goals?: WeeklyGoal[];
  onAddGoal?: (goal: Omit<WeeklyGoal, 'id' | 'createdAt' | 'weekStartDate' | 'completed' | 'celebratedAt'>) => void;
  onUpdateGoal?: (id: string, updates: Partial<WeeklyGoal>) => void;
  onDeleteGoal?: (id: string) => void;
  onCelebrateGoal?: (id: string) => void;
}

const characters = ['Cobie', 'Tree', 'Tilda', 'Livleen', 'Harper', 'Dulcy'];

const worryCategories = [
  { id: 'school', label: 'School', color: 'bg-blue-100 text-blue-700' },
  { id: 'friends', label: 'Friends', color: 'bg-green-100 text-green-700' },
  { id: 'family', label: 'Family', color: 'bg-purple-100 text-purple-700' },
  { id: 'scary', label: 'Scary Things', color: 'bg-orange-100 text-orange-700' },
  { id: 'health', label: 'Health', color: 'bg-red-100 text-red-700' },
  { id: 'other', label: 'Other', color: 'bg-gray-100 text-gray-700' },
];

const ParentMode: React.FC<ParentModeProps> = ({
  onClose,
  sessionHistory,
  settings,
  onSettingsChange,
  soundSettings,
  onSoundSettingsChange,
  family,
  onLogout,
  onSetPin,
  onChangePin,
  hasPin = false,
  childName,
  onUpdateChildName,
  worries = [],
  onUpdateWorry,
  onDeleteWorry,
  onBulkDeleteWorries,
  goals = [],
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onCelebrateGoal,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'worries' | 'goals' | 'tips' | 'settings' | 'sounds' | 'account'>('overview');
  const [editingName, setEditingName] = useState(false);
  const [newChildName, setNewChildName] = useState(childName || '');
  const [expandedCharacter, setExpandedCharacter] = useState<string | null>(null);
  const [selectedWorry, setSelectedWorry] = useState<Worry | null>(null);
  const [parentNote, setParentNote] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [worryToDelete, setWorryToDelete] = useState<Worry | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleteDays, setBulkDeleteDays] = useState(30);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteResult, setDeleteResult] = useState<{ success: boolean; count: number } | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportDateRange, setExportDateRange] = useState(90);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const intensityTrend = useMemo(() => calculateIntensityTrend(worries), [worries]);

  const testSpeech = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance("Hello! I'm here to help guide you through your feelings.");
      utterance.rate = settings.narrationSpeed;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  const testSound = (soundId: string) => {
    const sound = soundLibrary.find(s => s.id === soundId);
    if (sound) {
      const audio = new Audio(sound.audioUrl);
      audio.volume = soundSettings.volume * sound.defaultVolume;
      audio.play().catch(console.error);
      setTimeout(() => audio.pause(), 3000);
    }
  };

  const moodInfo: Record<string, { title: string; tips: string[] }> = {
    'too-noisy': {
      title: 'Too Noisy / Too Much',
      tips: [
        'Validate their need for quiet without judgment',
        'Create a consistent "quiet corner" at home',
        'Use this path before overwhelming situations when possible',
        'Follow up with: "Your body knew what it needed"',
      ],
    },
    'worried': {
      title: 'Worried Tummy',
      tips: [
        'Avoid dismissing worries with "don\'t worry"',
        'Use the "leaf pocket" metaphor at bedtime',
        'Create predictable routines to reduce uncertainty',
        'Follow up with: "Worries are normal. We can hold them together"',
      ],
    },
    'cross': {
      title: 'Cross and Fizzy',
      tips: [
        'Stay calm yourself - co-regulation matters',
        'Focus on repair, not punishment',
        'Validate the feeling while setting the boundary',
        'Follow up with: "Strong feelings are okay. Hurting is not okay"',
      ],
    },
    'sad': {
      title: 'Sad and Small',
      tips: [
        'Sit with sadness rather than rushing to fix it',
        'Physical comfort (cuddles) often helps more than words',
        'Name the loss or disappointment specifically',
        'Follow up with: "I\'m here. Sad feelings pass"',
      ],
    },
    'shy': {
      title: 'Shy and Stuck',
      tips: [
        'Never force speech or participation',
        'Celebrate micro-steps (standing near, waving)',
        'Prepare for social situations in advance',
        'Follow up with: "You were brave in your own way"',
      ],
    },
    'mine': {
      title: 'Mine for Now',
      tips: [
        'Sharing is developmental - don\'t force it',
        'Help make fair plans rather than demanding sharing',
        'Acknowledge ownership before discussing turns',
        'Follow up with: "Fairness means everyone gets a turn"',
      ],
    },
  };

  const recentMoods = sessionHistory.slice(-10);
  const mostUsedMood = sessionHistory.length > 0
    ? Object.entries(
        sessionHistory.reduce((acc, s) => {
          acc[s.mood] = (acc[s.mood] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).sort((a, b) => b[1] - a[1])[0]?.[0]
    : null;

  const handleSaveChildName = () => {
    if (onUpdateChildName && newChildName.trim()) {
      onUpdateChildName(newChildName.trim());
    }
    setEditingName(false);
  };

  const handleToggleSoundApproval = (soundId: string) => {
    const newApproved = soundSettings.approvedSounds.includes(soundId)
      ? soundSettings.approvedSounds.filter(id => id !== soundId)
      : [...soundSettings.approvedSounds, soundId];
    onSoundSettingsChange({ ...soundSettings, approvedSounds: newApproved });
  };

  const handleSetCharacterDefault = (character: string, soundId: string) => {
    onSoundSettingsChange({
      ...soundSettings,
      characterDefaults: {
        ...soundSettings.characterDefaults,
        [character]: soundId,
      },
    });
  };

  const handleMarkReviewed = (worry: Worry) => {
    if (onUpdateWorry) {
      onUpdateWorry(worry.id, { 
        reviewedWithParent: true,
        parentNotes: parentNote || undefined,
      });
    }
    setSelectedWorry(null);
    setParentNote('');
  };

  const handleDeleteClick = (worry: Worry, e: React.MouseEvent) => {
    e.stopPropagation();
    setWorryToDelete(worry);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (worryToDelete && onDeleteWorry) {
      setIsDeleting(true);
      await onDeleteWorry(worryToDelete.id);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setWorryToDelete(null);
      if (selectedWorry?.id === worryToDelete.id) {
        setSelectedWorry(null);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (!onBulkDeleteWorries) return;
    
    setIsDeleting(true);
    const beforeDate = new Date();
    beforeDate.setDate(beforeDate.getDate() - bulkDeleteDays);
    
    const deletedCount = await onBulkDeleteWorries(beforeDate.toISOString());
    setDeleteResult({ success: true, count: deletedCount });
    setIsDeleting(false);
  };

  const closeBulkDeleteModal = () => {
    setShowBulkDeleteModal(false);
    setDeleteResult(null);
    setBulkDeleteDays(30);
  };

  const getOldWorriesCount = (days: number) => {
    const beforeDate = new Date();
    beforeDate.setDate(beforeDate.getDate() - days);
    return worries.filter(w => new Date(w.createdAt) < beforeDate).length;
  };

  const pocketWorries = worries.filter(w => w.putAway);
  const worryPatterns = pocketWorries.reduce((acc, w) => {
    const cat = w.category || 'other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topWorryCategory = Object.entries(worryPatterns).sort((a, b) => b[1] - a[1])[0];
  
  const getWeeklyWorries = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return pocketWorries.filter(w => new Date(w.createdAt) >= oneWeekAgo);
  };

  const weeklyWorries = getWeeklyWorries();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Heart },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
    { id: 'worries', label: 'Worries', icon: Pocket },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'tips', label: 'Tips', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'sounds', label: 'Sounds', icon: Music },
    ...(family ? [{ id: 'account', label: 'Account', icon: User }] : []),
  ];

  return (
    <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Parent Companion</h2>
            {family && (
              <div className="flex items-center gap-2 mt-1">
                <Cloud className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">Synced to cloud</span>
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="flex border-b border-gray-100 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 transition-colors min-w-[60px] ${
                activeTab === tab.id
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium text-xs sm:text-sm hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {childName && (
                <div className="bg-green-50 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">{childName}'s Garden</p>
                    <p className="text-sm text-green-600">Growing every day!</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-2xl p-4">
                  <p className="text-3xl font-bold text-green-600">{sessionHistory.length}</p>
                  <p className="text-gray-600">Total Sessions</p>
                </div>
                <div className="bg-purple-50 rounded-2xl p-4">
                  <p className="text-3xl font-bold text-purple-600">
                    {Math.round(sessionHistory.reduce((a, s) => a + s.duration, 0) / 60)}
                  </p>
                  <p className="text-gray-600">Minutes Practiced</p>
                </div>
              </div>

              {mostUsedMood && (
                <div className="bg-amber-50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-5 h-5 text-amber-600" />
                    <p className="font-medium text-amber-800">Most Explored Feeling</p>
                  </div>
                  <p className="text-gray-700">{moodInfo[mostUsedMood]?.title || mostUsedMood}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    This might indicate an area where your child needs extra support.
                  </p>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Sessions
                </h3>
                {recentMoods.length === 0 ? (
                  <p className="text-gray-500">No sessions yet</p>
                ) : (
                  <div className="space-y-2">
                    {[...recentMoods].reverse().map((session, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-700">{moodInfo[session.mood]?.title || session.mood}</span>
                        <span className="text-gray-400 text-sm">{session.date}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div>
              {family ? (
                <EmotionInsights familyId={family.id} childName={childName} />
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Sign in to see insights</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Create an account to track mood patterns and see detailed analytics
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'worries' && (
            <div className="space-y-6">
              <div className="bg-pink-50 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Pocket className="w-5 h-5 text-pink-600" />
                  <h3 className="font-semibold text-pink-800">Worry Pocket Overview</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Review your child's worries together. This is a safe space to discuss and provide comfort.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-pink-600">{pocketWorries.length}</p>
                    <p className="text-xs text-gray-500">Total Worries</p>
                  </div>
                  <div className="bg-white rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {pocketWorries.filter(w => w.reviewedWithParent).length}
                    </p>
                    <p className="text-xs text-gray-500">Reviewed Together</p>
                  </div>
                </div>
              </div>

              {pocketWorries.length >= 3 && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Activity className="w-5 h-5 text-amber-600" />
                    <h3 className="font-semibold text-amber-800">Worry Intensity Trends</h3>
                  </div>

                  <div className={`rounded-xl p-4 mb-4 ${
                    intensityTrend.direction === 'increasing' ? 'bg-red-100' :
                    intensityTrend.direction === 'decreasing' ? 'bg-green-100' :
                    'bg-gray-100'
                  }`}>
                    <div className="flex items-center gap-3">
                      {intensityTrend.direction === 'increasing' && (
                        <>
                          <TrendingUp className="w-6 h-6 text-red-600" />
                          <div>
                            <p className="font-semibold text-red-800">Worries Getting More Intense</p>
                            <p className="text-sm text-red-600">
                              Average intensity increased from {intensityTrend.olderAvg} to {intensityTrend.recentAvg}
                            </p>
                          </div>
                        </>
                      )}
                      {intensityTrend.direction === 'decreasing' && (
                        <>
                          <TrendingDown className="w-6 h-6 text-green-600" />
                          <div>
                            <p className="font-semibold text-green-800">Worries Getting Less Intense</p>
                            <p className="text-sm text-green-600">
                              Average intensity decreased from {intensityTrend.olderAvg} to {intensityTrend.recentAvg}
                            </p>
                          </div>
                        </>
                      )}
                      {intensityTrend.direction === 'stable' && (
                        <>
                          <Minus className="w-6 h-6 text-gray-600" />
                          <div>
                            <p className="font-semibold text-gray-800">Worry Intensity Stable</p>
                            <p className="text-sm text-gray-600">
                              Average intensity remains around {intensityTrend.averageIntensity}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {intensityTrend.weeklyData.length > 0 && (
                    <div className="bg-white rounded-xl p-4 mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-3">Weekly Average Intensity</p>
                      <IntensityTrendChart weeklyData={intensityTrend.weeklyData} />
                    </div>
                  )}

                  <div className="bg-white rounded-xl p-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">Intensity Distribution</p>
                    <IntensityDistributionBar 
                      distribution={intensityTrend.intensityDistribution} 
                      total={pocketWorries.length} 
                    />
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Average Intensity:</span>{' '}
                        <span className={intensityLevels[Math.round(intensityTrend.averageIntensity) - 1]?.textColor || 'text-gray-700'}>
                          {intensityTrend.averageIntensity} ({intensityLevels[Math.round(intensityTrend.averageIntensity) - 1]?.label || 'Medium'})
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {pocketWorries.length > 0 && pocketWorries.length < 3 && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-600">Intensity Trends</p>
                      <p className="text-sm text-gray-500">
                        Need at least 3 worries to show trend analysis. Currently have {pocketWorries.length}.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {pocketWorries.length > 0 && onBulkDeleteWorries && (
                <div className="bg-red-50 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Trash2 className="w-5 h-5 text-red-600" />
                    <h3 className="font-semibold text-red-800">Manage Worries</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Clear old worries to keep the list manageable and relevant.
                  </p>
                  
                  <button
                    onClick={() => setShowBulkDeleteModal(true)}
                    className="w-full py-2.5 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Old Worries
                  </button>
                </div>
              )}

              {pocketWorries.length > 0 && (
                <div className="bg-blue-50 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Download className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-800">Export Report</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Generate a report with intensity data to share with therapists or counselors.
                  </p>
                  
                  <button
                    onClick={() => setShowExportModal(true)}
                    className="w-full py-2.5 bg-blue-100 text-blue-700 rounded-xl font-medium hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export Worry Report
                  </button>
                </div>
              )}

              {pocketWorries.length > 0 && (
                <div className="bg-purple-50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-purple-800">Category Patterns</h3>
                  </div>

                  {topWorryCategory && (
                    <div className="bg-white rounded-xl p-3 mb-3">
                      <p className="text-sm text-gray-600">Most common worry category:</p>
                      <p className="font-semibold text-purple-700">
                        {worryCategories.find(c => c.id === topWorryCategory[0])?.label || topWorryCategory[0]}
                        <span className="text-gray-400 font-normal ml-2">({topWorryCategory[1]} worries)</span>
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    <p className="text-sm font-medium text-gray-700">This Week</p>
                  </div>
                  <p className="text-sm text-gray-600">
                    {weeklyWorries.length} {weeklyWorries.length === 1 ? 'worry' : 'worries'} added this week
                  </p>

                  <div className="mt-4 space-y-2">
                    {Object.entries(worryPatterns).map(([cat, count]) => {
                      const category = worryCategories.find(c => c.id === cat);
                      const percentage = Math.round((count / pocketWorries.length) * 100);
                      return (
                        <div key={cat} className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${category?.color || 'bg-gray-100 text-gray-700'}`}>
                            {category?.label || cat}
                          </span>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-purple-400 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  All Worries
                </h3>

                {pocketWorries.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-2xl">
                    <Pocket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No worries stored yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      When your child puts worries in their pocket, they'll appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...pocketWorries].reverse().map((worry) => {
                      const category = worryCategories.find(c => c.id === worry.category);
                      const intensityLevel = worry.intensity ? intensityLevels[worry.intensity - 1] : null;
                      
                      return (
                        <div
                          key={worry.id}
                          className={`bg-white rounded-xl p-4 border-2 transition-colors ${
                            worry.reviewedWithParent ? 'border-green-200' : 'border-pink-200'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              {category && (
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${category.color}`}>
                                  {category.label}
                                </span>
                              )}
                              {intensityLevel && (
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${intensityLevel.bgLight} ${intensityLevel.textColor}`}>
                                  {intensityLevel.label}
                                </span>
                              )}
                              {worry.reviewedWithParent && (
                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                                  Reviewed
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {worry.intensity && (
                                <IntensityIndicator intensity={worry.intensity} />
                              )}
                              <span className="text-xs text-gray-400">
                                {new Date(worry.createdAt).toLocaleDateString()}
                              </span>
                              {onDeleteWorry && (
                                <button
                                  onClick={(e) => handleDeleteClick(worry, e)}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                  title="Delete worry"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>

                          {worry.type === 'text' ? (
                            <p className="text-gray-700 text-sm line-clamp-2">{worry.content}</p>
                          ) : (
                            <div className="bg-gray-50 rounded-lg p-2">
                              <img
                                src={worry.content}
                                alt="Worry drawing"
                                className="w-full h-20 object-contain"
                              />
                            </div>
                          )}

                          {worry.parentNotes && (
                            <div className="mt-2 p-2 bg-green-50 rounded-lg">
                              <p className="text-xs text-green-700">
                                <span className="font-medium">Your note:</span> {worry.parentNotes}
                              </p>
                            </div>
                          )}

                          <button
                            onClick={() => {
                              setSelectedWorry(worry);
                              setParentNote(worry.parentNotes || '');
                            }}
                            className="mt-3 w-full py-2 text-sm font-medium text-pink-600 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
                          >
                            {worry.reviewedWithParent ? 'View Details' : 'Review Together'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-amber-50 rounded-2xl p-4">
                <h3 className="font-semibold text-amber-800 mb-3">Tips for Discussing Worries</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    Choose a calm, quiet moment to look at worries together
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    Validate their feelings: "I can see this worried you"
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    Ask open questions: "Can you tell me more about this?"
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    Pay attention to intensity trends - increasing intensity may need extra support
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'goals' && onAddGoal && onUpdateGoal && onDeleteGoal && onCelebrateGoal && (
            <WeeklyGoals
              goals={goals}
              onAddGoal={onAddGoal}
              onUpdateGoal={onUpdateGoal}
              onDeleteGoal={onDeleteGoal}
              onCelebrate={onCelebrateGoal}
              childName={childName}
            />
          )}

          {activeTab === 'goals' && (!onAddGoal || !onUpdateGoal || !onDeleteGoal || !onCelebrateGoal) && (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Goals feature not available</p>
              <p className="text-sm text-gray-400 mt-1">
                Goal management is being set up
              </p>
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="space-y-6">
              <p className="text-gray-600">
                Evidence-based follow-up language and strategies for each emotional path.
              </p>
              {Object.entries(moodInfo).map(([key, info]) => (
                <div key={key} className="bg-gray-50 rounded-2xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">{info.title}</h3>
                  <ul className="space-y-2">
                    {info.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-purple-50 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Lock className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-800">Parent PIN</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {hasPin 
                    ? 'Your settings are protected with a PIN.'
                    : 'Set a PIN to protect parent settings from little fingers.'}
                </p>
                <button
                  onClick={hasPin ? onChangePin : onSetPin}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                >
                  {hasPin ? 'Change PIN' : 'Set PIN'}
                </button>
              </div>

              <div className="bg-blue-50 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Volume2 className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Audio Narration</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Enable voice guidance to help children follow along with each step.
                </p>
                
                <div className="flex items-center justify-between py-3 border-b border-blue-100">
                  <div>
                    <p className="font-medium text-gray-800">Enable Audio</p>
                    <p className="text-sm text-gray-500">Turn narration on/off by default</p>
                  </div>
                  <button
                    onClick={() => onSettingsChange({ ...settings, audioEnabled: !settings.audioEnabled })}
                    className={`w-14 h-8 rounded-full transition-colors ${
                      settings.audioEnabled ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full bg-white shadow transform transition-transform ${
                      settings.audioEnabled ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-800">Narration Speed</p>
                    <p className="text-sm text-gray-500">Adjust voice playback speed</p>
                  </div>
                  <select
                    value={settings.narrationSpeed}
                    onChange={(e) => onSettingsChange({ ...settings, narrationSpeed: parseFloat(e.target.value) })}
                    className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0.6}>Slow</option>
                    <option value={0.8}>Normal</option>
                    <option value={1.0}>Fast</option>
                  </select>
                </div>

                <button
                  onClick={testSpeech}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                >
                  <Volume2 className="w-4 h-4" />
                  Test Voice
                </button>
              </div>

              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-800">High Contrast Mode</p>
                  <p className="text-sm text-gray-500">Increase visual contrast</p>
                </div>
                <button
                  onClick={() => onSettingsChange({ ...settings, highContrast: !settings.highContrast })}
                  className={`w-14 h-8 rounded-full transition-colors ${
                    settings.highContrast ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full bg-white shadow transform transition-transform ${
                    settings.highContrast ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-800">Animations</p>
                  <p className="text-sm text-gray-500">Enable or disable animations</p>
                </div>
                <button
                  onClick={() => onSettingsChange({ ...settings, animationsEnabled: !settings.animationsEnabled })}
                  className={`w-14 h-8 rounded-full transition-colors ${
                    settings.animationsEnabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full bg-white shadow transform transition-transform ${
                    settings.animationsEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'sounds' && (
            <div className="space-y-6">
              <div className="bg-teal-50 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Music className="w-5 h-5 text-teal-600" />
                  <h3 className="font-semibold text-teal-800">Background Sounds</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Calming background sounds help create a peaceful environment during sessions.
                </p>

                <div className="flex items-center justify-between py-3 border-b border-teal-100">
                  <div>
                    <p className="font-medium text-gray-800">Enable Sounds</p>
                    <p className="text-sm text-gray-500">Allow background sounds</p>
                  </div>
                  <button
                    onClick={() => onSoundSettingsChange({ ...soundSettings, enabled: !soundSettings.enabled })}
                    className={`w-14 h-8 rounded-full transition-colors ${
                      soundSettings.enabled ? 'bg-teal-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full bg-white shadow transform transition-transform ${
                      soundSettings.enabled ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="py-3 border-b border-teal-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-800">Default Volume</p>
                    <span className="text-sm text-gray-500">{Math.round(soundSettings.volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={soundSettings.volume * 100}
                    onChange={(e) => onSoundSettingsChange({ ...soundSettings, volume: parseInt(e.target.value) / 100 })}
                    className="w-full h-2 rounded-full appearance-none bg-gray-300 cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #14b8a6 ${soundSettings.volume * 100}%, #d1d5db ${soundSettings.volume * 100}%)`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-800">Auto-Fade</p>
                    <p className="text-sm text-gray-500">Lower volume when narration plays</p>
                  </div>
                  <button
                    onClick={() => onSoundSettingsChange({ ...soundSettings, autoFadeOnNarration: !soundSettings.autoFadeOnNarration })}
                    className={`w-14 h-8 rounded-full transition-colors ${
                      soundSettings.autoFadeOnNarration ? 'bg-teal-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full bg-white shadow transform transition-transform ${
                      soundSettings.autoFadeOnNarration ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              <div className="bg-purple-50 rounded-2xl p-4">
                <h3 className="font-semibold text-purple-800 mb-3">Default Sounds by Character</h3>
                <div className="space-y-3">
                  {characters.map((character) => (
                    <div key={character} className="bg-white rounded-xl p-3">
                      <button
                        onClick={() => setExpandedCharacter(expandedCharacter === character ? null : character)}
                        className="w-full flex items-center justify-between"
                      >
                        <span className="font-medium text-gray-700">{character}</span>
                        <span className="text-sm text-purple-600">
                          {soundLibrary.find(s => s.id === soundSettings.characterDefaults[character])?.name || 'None'}
                        </span>
                      </button>
                      {expandedCharacter === character && (
                        <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2">
                          {soundLibrary.filter(s => soundSettings.approvedSounds.includes(s.id)).map((sound) => (
                            <button
                              key={sound.id}
                              onClick={() => handleSetCharacterDefault(character, sound.id)}
                              className={`p-2 rounded-lg text-left text-sm transition-colors ${
                                soundSettings.characterDefaults[character] === sound.id
                                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              {sound.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 rounded-2xl p-4">
                <h3 className="font-semibold text-amber-800 mb-3">Approved Sounds</h3>
                
                {Object.entries(categoryInfo).map(([category, info]) => (
                  <div key={category} className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 capitalize">{info.name}</h4>
                    <div className="space-y-2">
                      {soundLibrary.filter(s => s.category === category).map((sound) => (
                        <div
                          key={sound.id}
                          className="flex items-center justify-between bg-white rounded-lg p-3"
                        >
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleToggleSoundApproval(sound.id)}
                              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                                soundSettings.approvedSounds.includes(sound.id)
                                  ? 'bg-amber-500 border-amber-500 text-white'
                                  : 'border-gray-300'
                              }`}
                            >
                              {soundSettings.approvedSounds.includes(sound.id) && (
                                <Check className="w-4 h-4" />
                              )}
                            </button>
                            <div>
                              <p className="font-medium text-gray-700 text-sm">{sound.name}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => testSound(sound.id)}
                            className="p-2 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => onSoundSettingsChange({ ...soundSettings, approvedSounds: defaultApprovedSounds })}
                    className="flex-1 py-2 text-sm font-medium text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => onSoundSettingsChange({ ...soundSettings, approvedSounds: [] })}
                    className="flex-1 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'account' && family && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Account Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Email</span>
                    <span className="text-gray-800 font-medium">{family.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Child's Name</span>
                    {editingName ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newChildName}
                          onChange={(e) => setNewChildName(e.target.value)}
                          className="px-3 py-1 border rounded-lg text-sm w-32"
                          placeholder="Enter name"
                        />
                        <button
                          onClick={handleSaveChildName}
                          className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setNewChildName(childName || '');
                          setEditingName(true);
                        }}
                        className="text-green-600 hover:text-green-700 font-medium"
                      >
                        {childName || 'Add name'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Cloud className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-800">Cloud Sync Active</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Your progress is automatically saved and synced across all your devices.
                </p>
              </div>

              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedWorry && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Review Worry</h3>
                <div className="flex items-center gap-2">
                  {onDeleteWorry && (
                    <button
                      onClick={(e) => handleDeleteClick(selectedWorry, e)}
                      className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete worry"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedWorry(null);
                      setParentNote('');
                    }}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {new Date(selectedWorry.createdAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                {selectedWorry.intensity && (
                  <div className="flex items-center gap-2">
                    <IntensityIndicator intensity={selectedWorry.intensity} showLabel size="md" />
                  </div>
                )}
              </div>

              {selectedWorry.type === 'text' ? (
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedWorry.content}</p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <img
                    src={selectedWorry.content}
                    alt="Worry drawing"
                    className="w-full rounded-lg"
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add a note for your child (optional)
                </label>
                <textarea
                  value={parentNote}
                  onChange={(e) => setParentNote(e.target.value)}
                  placeholder="Write a comforting message..."
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:outline-none resize-none h-24"
                />
              </div>

              <button
                onClick={() => handleMarkReviewed(selectedWorry)}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium hover:from-pink-600 hover:to-rose-600 transition-colors"
              >
                {selectedWorry.reviewedWithParent ? 'Update Note' : 'Mark as Reviewed'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && worryToDelete && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Delete Worry?</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 mb-4">
              {worryToDelete.type === 'text' ? (
                <p className="text-sm text-gray-600 line-clamp-2">{worryToDelete.content}</p>
              ) : (
                <p className="text-sm text-gray-600">Drawing from {new Date(worryToDelete.createdAt).toLocaleDateString()}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setWorryToDelete(null);
                }}
                disabled={isDeleting}
                className="flex-1 py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            {deleteResult ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Worries Deleted</h3>
                <p className="text-gray-600 mb-6">
                  {deleteResult.count === 0 
                    ? 'No worries found older than the selected date.'
                    : `Successfully deleted ${deleteResult.count} ${deleteResult.count === 1 ? 'worry' : 'worries'}.`
                  }
                </p>
                <button
                  onClick={closeBulkDeleteModal}
                  className="w-full py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Delete Old Worries</h3>
                    <p className="text-sm text-gray-500">Remove worries older than a certain date</p>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Delete worries older than:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[7, 14, 30, 60, 90, 180].map((days) => (
                      <button
                        key={days}
                        onClick={() => setBulkDeleteDays(days)}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          bulkDeleteDays === days
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {days < 30 ? `${days} days` : days < 365 ? `${days / 30} months` : '1 year'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">
                        {getOldWorriesCount(bulkDeleteDays)} {getOldWorriesCount(bulkDeleteDays) === 1 ? 'worry' : 'worries'} will be deleted
                      </p>
                      <p className="text-xs text-amber-600 mt-1">
                        This will permanently remove all worries created before {new Date(Date.now() - bulkDeleteDays * 24 * 60 * 60 * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={closeBulkDeleteModal}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    disabled={isDeleting || getOldWorriesCount(bulkDeleteDays) === 0}
                    className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete Worries
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showExportModal && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Download className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Export Worry Report</h3>
                <p className="text-sm text-gray-500">Includes intensity data and trends</p>
              </div>
            </div>

            {exportError && (
              <div className="mb-4 p-3 bg-red-50 rounded-xl text-red-700 text-sm">
                {exportError}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Include worries from the last:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[30, 60, 90, 180, 365].map((days) => (
                  <button
                    key={days}
                    onClick={() => setExportDateRange(days)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      exportDateRange === days
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {days < 365 ? `${days} days` : '1 year'}
                  </button>
                ))}
                <button
                  onClick={() => setExportDateRange(0)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    exportDateRange === 0
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All Time
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-sm font-medium text-gray-700">Export Format:</p>
              
              <button
                onClick={async () => {
                  setIsExporting(true);
                  setExportError(null);
                  try {
                    const startDate = exportDateRange > 0 
                      ? new Date(Date.now() - exportDateRange * 24 * 60 * 60 * 1000).toISOString()
                      : undefined;
                    
                    let data: WorryExportData;
                    if (family) {
                      data = await generateWorryExportData(family.id, childName || null, startDate);
                    } else {
                      data = generateLocalWorryExportData(worries, childName || null, startDate);
                    }
                    
                    const html = generateWorryPDFHTML(data);
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(html);
                      printWindow.document.close();
                      printWindow.focus();
                      setTimeout(() => printWindow.print(), 500);
                    }
                  } catch (err) {
                    setExportError('Failed to generate PDF. Please try again.');
                  }
                  setIsExporting(false);
                }}
                disabled={isExporting}
                className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FileText className="w-5 h-5" />
                Export as PDF (Print)
              </button>

              <button
                onClick={async () => {
                  setIsExporting(true);
                  setExportError(null);
                  try {
                    const startDate = exportDateRange > 0 
                      ? new Date(Date.now() - exportDateRange * 24 * 60 * 60 * 1000).toISOString()
                      : undefined;
                    
                    let data: WorryExportData;
                    if (family) {
                      data = await generateWorryExportData(family.id, childName || null, startDate);
                    } else {
                      data = generateLocalWorryExportData(worries, childName || null, startDate);
                    }
                    
                    const csv = generateWorryCSV(data);
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `worry-report-${childName || 'child'}-${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  } catch (err) {
                    setExportError('Failed to generate CSV. Please try again.');
                  }
                  setIsExporting(false);
                }}
                disabled={isExporting}
                className="w-full py-3 border-2 border-blue-200 text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FileSpreadsheet className="w-5 h-5" />
                Export as CSV
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 mb-4">
              <p className="text-xs text-gray-500">
                <span className="font-medium">What's included:</span> Worry categories, intensity levels, 
                intensity trends, dates, patterns, review status, and your parent notes.
              </p>
            </div>

            {!family && (
              <div className="bg-amber-50 rounded-xl p-3 mb-4">
                <p className="text-xs text-amber-700">
                  <span className="font-medium">Note:</span> Sign in to sync worries across devices.
                </p>
              </div>
            )}

            <button
              onClick={() => {
                setShowExportModal(false);
                setExportError(null);
              }}
              disabled={isExporting}
              className="w-full py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentMode;
