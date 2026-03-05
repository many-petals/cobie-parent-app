import React, { useState, useEffect } from 'react';
import { Target, Plus, Check, Sparkles, X, Edit2, Trash2, Trophy, Star, PartyPopper, ChevronRight, RefreshCw } from 'lucide-react';

export interface WeeklyGoal {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  currentProgress: number;
  type: 'worry_review' | 'breathing' | 'journal' | 'quiet_time' | 'custom';
  createdAt: string;
  weekStartDate: string;
  completed: boolean;
  celebratedAt?: string;
}

interface WeeklyGoalsProps {
  goals: WeeklyGoal[];
  onAddGoal: (goal: Omit<WeeklyGoal, 'id' | 'createdAt' | 'weekStartDate' | 'completed' | 'celebratedAt'>) => void;
  onUpdateGoal: (id: string, updates: Partial<WeeklyGoal>) => void;
  onDeleteGoal: (id: string) => void;
  onCelebrate: (id: string) => void;
  childName?: string | null;
}

// Preset goal templates
const goalTemplates = [
  {
    type: 'worry_review' as const,
    title: 'Review worries together',
    description: 'Look at worries in the pocket with your child',
    suggestedTarget: 3,
    icon: '💭',
    color: 'bg-pink-100 text-pink-700 border-pink-200',
  },
  {
    type: 'breathing' as const,
    title: 'Practice breathing',
    description: 'Use breathing exercises when worries feel big',
    suggestedTarget: 5,
    icon: '🌬️',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  {
    type: 'journal' as const,
    title: 'Journal entries',
    description: 'Write or draw in the mood journal',
    suggestedTarget: 3,
    icon: '📔',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  {
    type: 'quiet_time' as const,
    title: 'Quiet corner visits',
    description: 'Spend time in the quiet corner for calm',
    suggestedTarget: 4,
    icon: '🌙',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  },
];

// Celebration animation component
const CelebrationAnimation: React.FC<{ onComplete: () => void; goalTitle: string }> = ({ onComplete, goalTitle }) => {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string; delay: number }[]>([]);

  useEffect(() => {
    // Generate confetti particles
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
    }));
    setParticles(newParticles);

    // Auto-close after animation
    const timer = setTimeout(onComplete, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      {/* Confetti particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-3 h-3 rounded-full animate-confetti"
            style={{
              left: `${particle.x}%`,
              top: '-10%',
              backgroundColor: particle.color,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Celebration card */}
      <div className="relative bg-white rounded-3xl p-8 max-w-sm mx-4 text-center shadow-2xl animate-bounce-in">
        {/* Trophy icon */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
          <Trophy className="w-12 h-12 text-white" />
        </div>

        {/* Stars decoration */}
        <div className="absolute top-4 left-4 animate-spin-slow">
          <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
        </div>
        <div className="absolute top-8 right-6 animate-pulse">
          <Sparkles className="w-8 h-8 text-pink-400" />
        </div>
        <div className="absolute bottom-12 left-6 animate-bounce">
          <Star className="w-5 h-5 text-purple-400 fill-purple-400" />
        </div>
        <div className="absolute bottom-16 right-4 animate-spin-slow">
          <PartyPopper className="w-7 h-7 text-blue-400" />
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Goal Complete!
        </h2>
        <p className="text-lg text-gray-600 mb-4 font-rounded">
          {goalTitle}
        </p>
        <div className="bg-gradient-to-r from-green-100 to-teal-100 rounded-2xl p-4 mb-6">
          <p className="text-green-700 font-semibold">
            Amazing work! You did it together!
          </p>
        </div>

        <button
          onClick={onComplete}
          className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-teal-600 transition-all shadow-lg"
        >
          Celebrate!
        </button>
      </div>

      {/* Add confetti animation styles */}
      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 3s ease-out forwards;
        }
        @keyframes bounce-in {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

// Progress ring component
const ProgressRing: React.FC<{ progress: number; size?: number; strokeWidth?: number }> = ({ 
  progress, 
  size = 60, 
  strokeWidth = 6 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          className="text-gray-200"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className={progress >= 100 ? 'text-green-500' : 'text-blue-500'}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {progress >= 100 ? (
          <Check className="w-6 h-6 text-green-500" />
        ) : (
          <span className="text-sm font-bold text-gray-700">{Math.round(progress)}%</span>
        )}
      </div>
    </div>
  );
};

const WeeklyGoals: React.FC<WeeklyGoalsProps> = ({
  goals,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onCelebrate,
  childName,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [celebratingGoal, setCelebratingGoal] = useState<WeeklyGoal | null>(null);
  const [editingGoal, setEditingGoal] = useState<WeeklyGoal | null>(null);

  // Custom goal form state
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customTarget, setCustomTarget] = useState(3);

  // Get current week's goals
  const currentWeekStart = getWeekStart(new Date());
  const currentWeekGoals = goals.filter(g => g.weekStartDate === currentWeekStart);
  const completedGoals = currentWeekGoals.filter(g => g.completed);
  const activeGoals = currentWeekGoals.filter(g => !g.completed);

  // Check for newly completed goals that need celebration
  useEffect(() => {
    const uncelebratedGoal = currentWeekGoals.find(
      g => g.completed && !g.celebratedAt && g.currentProgress >= g.targetCount
    );
    if (uncelebratedGoal && !celebratingGoal) {
      setCelebratingGoal(uncelebratedGoal);
    }
  }, [currentWeekGoals, celebratingGoal]);

  const handleAddPresetGoal = (template: typeof goalTemplates[0]) => {
    onAddGoal({
      title: template.title,
      description: template.description,
      targetCount: template.suggestedTarget,
      currentProgress: 0,
      type: template.type,
    });
    setShowAddModal(false);
  };

  const handleAddCustomGoal = () => {
    if (!customTitle.trim()) return;
    
    onAddGoal({
      title: customTitle,
      description: customDescription,
      targetCount: customTarget,
      currentProgress: 0,
      type: 'custom',
    });
    
    setCustomTitle('');
    setCustomDescription('');
    setCustomTarget(3);
    setShowCustomForm(false);
    setShowAddModal(false);
  };

  const handleCelebrationComplete = () => {
    if (celebratingGoal) {
      onCelebrate(celebratingGoal.id);
      setCelebratingGoal(null);
    }
  };

  const handleIncrementProgress = (goal: WeeklyGoal) => {
    if (goal.currentProgress < goal.targetCount) {
      const newProgress = goal.currentProgress + 1;
      const completed = newProgress >= goal.targetCount;
      onUpdateGoal(goal.id, { 
        currentProgress: newProgress,
        completed,
      });
    }
  };

  const handleDecrementProgress = (goal: WeeklyGoal) => {
    if (goal.currentProgress > 0) {
      onUpdateGoal(goal.id, { 
        currentProgress: goal.currentProgress - 1,
        completed: false,
        celebratedAt: undefined,
      });
    }
  };

  const getGoalIcon = (type: WeeklyGoal['type']) => {
    const template = goalTemplates.find(t => t.type === type);
    return template?.icon || '🎯';
  };

  const getGoalColor = (type: WeeklyGoal['type']) => {
    const template = goalTemplates.find(t => t.type === type);
    return template?.color || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Celebration animation */}
      {celebratingGoal && (
        <CelebrationAnimation
          goalTitle={celebratingGoal.title}
          onComplete={handleCelebrationComplete}
        />
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-4 border border-amber-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-800">Weekly Goals</h3>
            <p className="text-sm text-amber-600">
              Week of {formatWeekDate(currentWeekStart)}
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Set goals together with {childName || 'your child'} to build healthy worry management habits.
        </p>
      </div>

      {/* Progress summary */}
      {currentWeekGoals.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-700">This Week's Progress</h4>
            <span className="text-sm text-gray-500">
              {completedGoals.length} of {currentWeekGoals.length} complete
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${(completedGoals.length / currentWeekGoals.length) * 100}%` }}
            />
          </div>
          {completedGoals.length === currentWeekGoals.length && currentWeekGoals.length > 0 && (
            <div className="mt-3 flex items-center gap-2 text-green-600">
              <Trophy className="w-5 h-5" />
              <span className="font-medium">All goals complete! Amazing week!</span>
            </div>
          )}
        </div>
      )}

      {/* Active goals */}
      {activeGoals.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Active Goals
          </h4>
          {activeGoals.map((goal) => {
            const progress = (goal.currentProgress / goal.targetCount) * 100;
            return (
              <div
                key={goal.id}
                className={`bg-white rounded-2xl p-4 border-2 transition-all ${
                  progress >= 100 ? 'border-green-300 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  <ProgressRing progress={progress} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getGoalIcon(goal.type)}</span>
                      <h5 className="font-semibold text-gray-800 truncate">{goal.title}</h5>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{goal.description}</p>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getGoalColor(goal.type)}`}>
                        {goal.currentProgress} / {goal.targetCount}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDecrementProgress(goal)}
                          disabled={goal.currentProgress === 0}
                          className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          -
                        </button>
                        <button
                          onClick={() => handleIncrementProgress(goal)}
                          disabled={goal.currentProgress >= goal.targetCount}
                          className="w-7 h-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteGoal(goal.id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completed goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700 flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            Completed Goals
          </h4>
          {completedGoals.map((goal) => (
            <div
              key={goal.id}
              className="bg-green-50 rounded-2xl p-4 border border-green-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getGoalIcon(goal.type)}</span>
                    <h5 className="font-semibold text-green-800">{goal.title}</h5>
                  </div>
                  <p className="text-sm text-green-600">
                    {goal.targetCount} / {goal.targetCount} complete
                  </p>
                </div>
                {goal.celebratedAt && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 rounded-full">
                    <Trophy className="w-4 h-4 text-yellow-600" />
                    <span className="text-xs text-yellow-700 font-medium">Celebrated!</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {currentWeekGoals.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-2xl">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h4 className="font-semibold text-gray-600 mb-1">No goals set yet</h4>
          <p className="text-sm text-gray-500 mb-4">
            Set weekly goals to help {childName || 'your child'} manage worries
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
          >
            Add First Goal
          </button>
        </div>
      )}

      {/* Add goal button */}
      {currentWeekGoals.length > 0 && currentWeekGoals.length < 5 && (
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 font-medium hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Another Goal
        </button>
      )}

      {/* Add goal modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[85vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Add Weekly Goal</h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowCustomForm(false);
                  }}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {!showCustomForm ? (
                <>
                  {/* Preset goals */}
                  <div className="space-y-3 mb-6">
                    <p className="text-sm font-medium text-gray-600">Suggested Goals</p>
                    {goalTemplates.map((template) => (
                      <button
                        key={template.type}
                        onClick={() => handleAddPresetGoal(template)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${template.color}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{template.icon}</span>
                          <div className="flex-1">
                            <h4 className="font-semibold">{template.title}</h4>
                            <p className="text-sm opacity-80">{template.description}</p>
                            <p className="text-xs mt-1 opacity-60">
                              Suggested: {template.suggestedTarget} times per week
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 opacity-50" />
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Custom goal button */}
                  <button
                    onClick={() => setShowCustomForm(true)}
                    className="w-full py-3 border-2 border-gray-300 rounded-xl text-gray-600 font-medium hover:border-amber-400 hover:text-amber-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Create Custom Goal
                  </button>
                </>
              ) : (
                /* Custom goal form */
                <div className="space-y-4">
                  <button
                    onClick={() => setShowCustomForm(false)}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    Back to suggestions
                  </button>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Goal Title
                    </label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="e.g., Talk about feelings at dinner"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (optional)
                    </label>
                    <textarea
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      placeholder="Add more details about this goal..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:outline-none resize-none h-20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Times per week: {customTarget}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="7"
                      value={customTarget}
                      onChange={(e) => setCustomTarget(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>1</span>
                      <span>7</span>
                    </div>
                  </div>

                  <button
                    onClick={handleAddCustomGoal}
                    disabled={!customTitle.trim()}
                    className="w-full py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Add Goal
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tips section */}
      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
        <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Tips for Goal Setting
        </h4>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
            Set goals together - let {childName || 'your child'} help choose
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
            Start small - 2-3 goals per week is plenty
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
            Celebrate progress, not just completion
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
            Adjust goals based on what works for your family
          </li>
        </ul>
      </div>
    </div>
  );
};

// Helper functions
function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

function formatWeekDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default WeeklyGoals;
