import React, { useState, useEffect } from 'react';
import { ArrowLeft, PenLine, Palette, Pocket, Sparkles, Heart, Eye, X, ChevronRight, Lock, Wrench } from 'lucide-react';
import DrawingCanvas from './DrawingCanvas';
import CopingToolbox, { CopingTool, CopingToolUsage } from './CopingToolbox';

export interface Worry {
  id: string;
  type: 'text' | 'drawing';
  content: string;
  createdAt: string;
  putAway: boolean;
  category?: string;
  intensity?: number; // 1-5 scale: 1=tiny, 2=small, 3=medium, 4=big, 5=huge
  reviewedWithParent?: boolean;
  parentNotes?: string;
  copingToolsUsed?: string[]; // IDs of coping tools used for this worry
}

interface WorryPocketProps {
  onClose: () => void;
  worries: Worry[];
  onAddWorry: (worry: Omit<Worry, 'id'>) => void;
  onUpdateWorry: (id: string, updates: Partial<Worry>) => void;
  childName?: string | null;
  onNavigateToBreathing?: () => void;
  onNavigateToQuietCorner?: () => void;
  onNavigateToDrawing?: () => void;
  onNavigateToJournal?: () => void;
  // Coping tool tracking
  copingToolUsage?: CopingToolUsage[];
  onRecordCopingToolUsage?: (usage: Omit<CopingToolUsage, 'usedAt'>) => void;
}

const affirmations = [
  "You are brave for sharing your feelings",
  "It's okay to have worries - everyone does",
  "You are safe and loved",
  "Your feelings matter",
  "Tomorrow is a new day full of possibilities",
  "You are stronger than you know",
  "It's okay to ask for help",
  "You are doing your best, and that's enough",
  "Worries come and go, like clouds in the sky",
  "You have people who care about you",
  "Every problem has a solution",
  "You are not alone",
];

const worryCategories = [
  { id: 'school', label: 'School', icon: '📚', color: 'bg-blue-100 text-blue-700' },
  { id: 'friends', label: 'Friends', icon: '👫', color: 'bg-green-100 text-green-700' },
  { id: 'family', label: 'Family', icon: '🏠', color: 'bg-purple-100 text-purple-700' },
  { id: 'scary', label: 'Scary Things', icon: '👻', color: 'bg-orange-100 text-orange-700' },
  { id: 'health', label: 'Health', icon: '🩹', color: 'bg-red-100 text-red-700' },
  { id: 'other', label: 'Other', icon: '💭', color: 'bg-gray-100 text-gray-700' },
];

// Child-friendly intensity levels with visual representations
const intensityLevels = [
  { value: 1, label: 'Tiny', description: 'Just a little bit', color: 'bg-green-100 border-green-400 text-green-700', size: 'w-6 h-6' },
  { value: 2, label: 'Small', description: 'A small worry', color: 'bg-lime-100 border-lime-400 text-lime-700', size: 'w-8 h-8' },
  { value: 3, label: 'Medium', description: 'Kind of big', color: 'bg-yellow-100 border-yellow-400 text-yellow-700', size: 'w-10 h-10' },
  { value: 4, label: 'Big', description: 'Pretty big', color: 'bg-orange-100 border-orange-400 text-orange-700', size: 'w-12 h-12' },
  { value: 5, label: 'Huge', description: 'Really really big', color: 'bg-red-100 border-red-400 text-red-700', size: 'w-14 h-14' },
];

// Visual worry cloud component for intensity selection
const WorryCloud: React.FC<{ intensity: number; selected: boolean; onClick: () => void }> = ({ intensity, selected, onClick }) => {
  const level = intensityLevels[intensity - 1];
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
        selected 
          ? `${level.color} border-2 shadow-md scale-105` 
          : 'bg-white border-2 border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Cloud shape that grows with intensity */}
      <div className={`${level.size} rounded-full flex items-center justify-center transition-all ${
        selected ? level.color.split(' ')[0] : 'bg-gray-100'
      }`}>
        <svg 
          viewBox="0 0 24 24" 
          className={`${selected ? level.color.split(' ')[2] : 'text-gray-400'}`}
          style={{ width: '70%', height: '70%' }}
          fill="currentColor"
        >
          <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
        </svg>
      </div>
      <div className="text-center">
        <p className={`text-sm font-semibold ${selected ? level.color.split(' ')[2] : 'text-gray-600'}`}>
          {level.label}
        </p>
        <p className="text-xs text-gray-400">{level.description}</p>
      </div>
    </button>
  );
};

// Compact intensity indicator for displaying in lists
export const IntensityIndicator: React.FC<{ intensity?: number; showLabel?: boolean; size?: 'sm' | 'md' }> = ({ 
  intensity, 
  showLabel = false,
  size = 'sm'
}) => {
  if (!intensity) return null;
  
  const level = intensityLevels[intensity - 1];
  const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-3 h-3';
  
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`${dotSize} rounded-full transition-all ${
              i <= intensity 
                ? level.color.split(' ')[0].replace('100', '400')
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      {showLabel && (
        <span className={`text-xs font-medium ml-1 ${level.color.split(' ')[2]}`}>
          {level.label}
        </span>
      )}
    </div>
  );
};

const WorryPocket: React.FC<WorryPocketProps> = ({
  onClose,
  worries,
  onAddWorry,
  onUpdateWorry,
  childName,
  onNavigateToBreathing,
  onNavigateToQuietCorner,
  onNavigateToDrawing,
  onNavigateToJournal,
  copingToolUsage = [],
  onRecordCopingToolUsage,
}) => {
  const [currentView, setCurrentView] = useState<'main' | 'write' | 'draw' | 'intensity' | 'coping' | 'putaway' | 'pocket' | 'affirmation'>('main');
  const [worryText, setWorryText] = useState('');
  const [worryDrawing, setWorryDrawing] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('other');
  const [selectedIntensity, setSelectedIntensity] = useState<number>(3);
  const [pendingWorryType, setPendingWorryType] = useState<'text' | 'drawing'>('text');
  const [currentAffirmation, setCurrentAffirmation] = useState('');
  const [putAwayAnimation, setPutAwayAnimation] = useState(false);
  const [selectedWorry, setSelectedWorry] = useState<Worry | null>(null);
  const [currentWorryId, setCurrentWorryId] = useState<string | null>(null);
  const [showCopingFromPocket, setShowCopingFromPocket] = useState(false);
  const [copingIntensity, setCopingIntensity] = useState<number>(3);


  // Get a random affirmation
  const getRandomAffirmation = () => {
    const randomIndex = Math.floor(Math.random() * affirmations.length);
    setCurrentAffirmation(affirmations[randomIndex]);
  };

  useEffect(() => {
    getRandomAffirmation();
  }, []);

  const handleProceedToIntensity = (type: 'text' | 'drawing') => {
    const content = type === 'text' ? worryText : worryDrawing;
    if (!content.trim()) return;
    
    setPendingWorryType(type);
    setSelectedIntensity(3); // Reset to medium
    setCurrentView('intensity');
  };

  const handleSaveWorry = () => {
    const content = pendingWorryType === 'text' ? worryText : worryDrawing;
    if (!content.trim()) return;

    onAddWorry({
      type: pendingWorryType,
      content,
      createdAt: new Date().toISOString(),
      putAway: false,
      category: selectedCategory,
      intensity: selectedIntensity,
      reviewedWithParent: false,
    });

    // Show put away animation
    setPutAwayAnimation(true);
    setCurrentView('putaway');
  };

  const handlePutAway = () => {
    // Get the most recent worry that hasn't been put away
    const recentWorry = [...worries].reverse().find(w => !w.putAway);
    if (recentWorry) {
      onUpdateWorry(recentWorry.id, { putAway: true });
    }

    // Show affirmation
    getRandomAffirmation();
    setTimeout(() => {
      setCurrentView('affirmation');
      setPutAwayAnimation(false);
    }, 1500);
  };

  const handleViewWorry = (worry: Worry) => {
    setSelectedWorry(worry);
  };

  const pocketWorries = worries.filter(w => w.putAway);
  const activeWorries = worries.filter(w => !w.putAway);

  // Main menu view
  if (currentView === 'main') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-100 via-purple-50 to-pink-100">
        {/* Header */}
        <header className="px-4 py-6">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 font-rounded">Worry Pocket</h1>
              <p className="text-sm text-gray-500">A safe place for your worries</p>
            </div>
            <button
              onClick={() => setCurrentView('pocket')}
              className="relative p-3 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all"
            >
              <Pocket className="w-6 h-6 text-purple-600" />
              {pocketWorries.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center">
                  {pocketWorries.length}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="px-4 py-8">
          <div className="max-w-md mx-auto">
            {/* Welcome message */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-lg">
                <Pocket className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {childName ? `Hi ${childName}!` : 'Hello!'}
              </h2>
              <p className="text-gray-600 font-rounded">
                Everyone has worries sometimes. You can share yours here, then put them safely away.
              </p>
            </div>

            {/* Action buttons */}
            <div className="space-y-4">
              <button
                onClick={() => {
                  setWorryText('');
                  setSelectedCategory('other');
                  setCurrentView('write');
                }}
                className="w-full flex items-center gap-4 p-5 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all group"
              >
                <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <PenLine className="w-7 h-7 text-blue-600" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-semibold text-gray-800 text-lg">Write About It</h3>
                  <p className="text-sm text-gray-500">Use words to describe your worry</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  setWorryDrawing('');
                  setSelectedCategory('other');
                  setCurrentView('draw');
                }}
                className="w-full flex items-center gap-4 p-5 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all group"
              >
                <div className="w-14 h-14 rounded-xl bg-pink-100 flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                  <Palette className="w-7 h-7 text-pink-600" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-semibold text-gray-800 text-lg">Draw About It</h3>
                  <p className="text-sm text-gray-500">Draw a picture of your worry</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setCurrentView('pocket')}
                className="w-full flex items-center gap-4 p-5 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all group"
              >
                <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Eye className="w-7 h-7 text-purple-600" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-semibold text-gray-800 text-lg">Look in My Pocket</h3>
                  <p className="text-sm text-gray-500">
                    {pocketWorries.length === 0
                      ? 'Your pocket is empty'
                      : `${pocketWorries.length} ${pocketWorries.length === 1 ? 'worry' : 'worries'} stored`}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Daily affirmation */}
            <div className="mt-8 p-6 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl">
              <div className="flex items-start gap-3">
                <Sparkles className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-1">Today's Reminder</h4>
                  <p className="text-yellow-700 font-rounded">{currentAffirmation}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Write view
  if (currentView === 'write') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 via-indigo-50 to-purple-100">
        <header className="px-4 py-6">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <button
              onClick={() => setCurrentView('main')}
              className="p-2 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Write Your Worry</h1>
            <div className="w-10" />
          </div>
        </header>

        <main className="px-4 py-6">
          <div className="max-w-md mx-auto">
            {/* Category selection */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-600 mb-3">What is it about?</p>
              <div className="flex flex-wrap gap-2">
                {worryCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === cat.id
                        ? cat.color + ' ring-2 ring-offset-2 ring-gray-300'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-1">{cat.icon}</span> {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Text input */}
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <textarea
                value={worryText}
                onChange={(e) => setWorryText(e.target.value)}
                placeholder="What's worrying you? You can write as much or as little as you want..."
                className="w-full h-48 p-4 text-lg font-rounded border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none resize-none"
                autoFocus
              />
            </div>

            {/* Next button - goes to intensity selection */}
            <button
              onClick={() => handleProceedToIntensity('text')}
              disabled={!worryText.trim()}
              className="mt-6 w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <ChevronRight className="w-5 h-5" />
              Next: How Big Is It?
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Draw view
  if (currentView === 'draw') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-100 via-purple-50 to-indigo-100">
        <header className="px-4 py-6">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <button
              onClick={() => setCurrentView('main')}
              className="p-2 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Draw Your Worry</h1>
            <div className="w-10" />
          </div>
        </header>

        <main className="px-4 py-6">
          <div className="max-w-md mx-auto">
            {/* Category selection */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-600 mb-3">What is it about?</p>
              <div className="flex flex-wrap gap-2">
                {worryCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === cat.id
                        ? cat.color + ' ring-2 ring-offset-2 ring-gray-300'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-1">{cat.icon}</span> {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Drawing canvas */}
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <DrawingCanvas
                onDrawingChange={setWorryDrawing}
                width={400}
                height={300}
              />
            </div>

            {/* Next button - goes to intensity selection */}
            <button
              onClick={() => handleProceedToIntensity('drawing')}
              disabled={!worryDrawing}
              className="mt-6 w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <ChevronRight className="w-5 h-5" />
              Next: How Big Is It?
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Intensity selection view
  if (currentView === 'intensity') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-100 via-yellow-50 to-orange-100">
        <header className="px-4 py-6">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <button
              onClick={() => setCurrentView(pendingWorryType === 'text' ? 'write' : 'draw')}
              className="p-2 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">How Big Is Your Worry?</h1>
            <div className="w-10" />
          </div>
        </header>

        <main className="px-4 py-6">
          <div className="max-w-md mx-auto">
            {/* Instruction */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shadow-lg">
                <svg viewBox="0 0 24 24" className="w-10 h-10 text-white" fill="currentColor">
                  <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                How big does this worry feel?
              </h2>
              <p className="text-gray-600 font-rounded">
                Tap the cloud that shows how big your worry feels right now
              </p>
            </div>

            {/* Intensity selection */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
              <div className="grid grid-cols-5 gap-2">
                {intensityLevels.map((level) => (
                  <WorryCloud
                    key={level.value}
                    intensity={level.value}
                    selected={selectedIntensity === level.value}
                    onClick={() => setSelectedIntensity(level.value)}
                  />
                ))}
              </div>
            </div>

            {/* Selected intensity feedback */}
            <div className={`p-4 rounded-2xl mb-6 ${intensityLevels[selectedIntensity - 1].color}`}>
              <p className="text-center font-semibold">
                {selectedIntensity === 1 && "That's okay! Even tiny worries deserve care."}
                {selectedIntensity === 2 && "Small worries can still feel important."}
                {selectedIntensity === 3 && "Medium worries are very normal."}
                {selectedIntensity === 4 && "Big worries can feel heavy. You're brave for sharing."}
                {selectedIntensity === 5 && "Huge worries are hard. You're doing great by talking about it!"}
              </p>
            </div>

            {/* Save button */}
            <button
              onClick={handleSaveWorry}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <Pocket className="w-5 h-5" />
              Put It In My Pocket
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Put away animation view
  if (currentView === 'putaway') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-200 via-indigo-100 to-purple-200 flex items-center justify-center">
        <div className="text-center px-4">
          <div className={`relative ${putAwayAnimation ? 'animate-bounce' : ''}`}>
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-2xl">
              <Pocket className="w-16 h-16 text-white" />
            </div>
            {putAwayAnimation && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-white rounded-lg animate-ping opacity-75" />
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Putting it away...</h2>
          <p className="text-gray-600 font-rounded">Your worry is going into your pocket</p>
          
          {putAwayAnimation && (
            <button
              onClick={handlePutAway}
              className="mt-8 px-8 py-4 bg-white text-purple-600 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Close the Pocket
            </button>
          )}
        </div>
      </div>
    );
  }

  // Affirmation view
  if (currentView === 'affirmation') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-orange-50 to-pink-100 flex items-center justify-center">
        <div className="text-center px-4 max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center shadow-xl animate-pulse">
            <Heart className="w-12 h-12 text-white" />
          </div>
          
          <div className="bg-white rounded-3xl p-8 shadow-xl mb-8">
            <Sparkles className="w-8 h-8 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your worry is safe now</h2>
            <p className="text-xl text-gray-600 font-rounded leading-relaxed">
              "{currentAffirmation}"
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                setWorryText('');
                setWorryDrawing('');
                setCurrentView('main');
              }}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              I Feel Better
            </button>
            <button
              onClick={() => {
                setWorryText('');
                setWorryDrawing('');
                getRandomAffirmation();
                setCurrentView('write');
              }}
              className="w-full py-3 bg-white text-gray-600 rounded-2xl font-medium shadow hover:shadow-md transition-all"
            >
              I Have Another Worry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pocket view (view stored worries)
  if (currentView === 'pocket') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 via-indigo-50 to-pink-100">
        <header className="px-4 py-6">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <button
              onClick={() => setCurrentView('main')}
              className="p-2 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">My Worry Pocket</h1>
            <div className="w-10" />
          </div>
        </header>

        <main className="px-4 py-6">
          <div className="max-w-md mx-auto">
            {pocketWorries.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Pocket className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Your pocket is empty</h3>
                <p className="text-gray-500 font-rounded">
                  When you put worries away, they'll be stored here safely.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 text-center mb-4">
                  These worries are safely stored. You can look at them with a grown-up if you want.
                </p>

                {pocketWorries.map((worry) => {
                  const category = worryCategories.find(c => c.id === worry.category);
                  return (
                    <div
                      key={worry.id}
                      className="bg-white rounded-2xl p-4 shadow-md"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {category && (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${category.color}`}>
                              {category.icon} {category.label}
                            </span>
                          )}
                          {worry.reviewedWithParent && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              Reviewed
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <IntensityIndicator intensity={worry.intensity} />
                          <span className="text-xs text-gray-400">
                            {new Date(worry.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {worry.type === 'text' ? (
                        <p className="text-gray-700 font-rounded line-clamp-3">{worry.content}</p>
                      ) : (
                        <div className="relative">
                          <img
                            src={worry.content}
                            alt="Worry drawing"
                            className="w-full h-32 object-contain bg-gray-50 rounded-xl"
                          />
                        </div>
                      )}

                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => handleViewWorry(worry)}
                          className="flex-1 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                          title="Review with parent"
                        >
                          <Lock className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {/* Worry detail modal */}
        {selectedWorry && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Worry Details</h3>
                  <button
                    onClick={() => setSelectedWorry(null)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
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
                    <IntensityIndicator intensity={selectedWorry.intensity} showLabel size="md" />
                  )}
                </div>

                {selectedWorry.type === 'text' ? (
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <p className="text-gray-700 font-rounded whitespace-pre-wrap">{selectedWorry.content}</p>
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

                {selectedWorry.parentNotes && (
                  <div className="bg-green-50 rounded-xl p-4 mb-4">
                    <p className="text-sm font-medium text-green-800 mb-1">Parent's Note:</p>
                    <p className="text-green-700 font-rounded">{selectedWorry.parentNotes}</p>
                  </div>
                )}

                <button
                  onClick={() => setSelectedWorry(null)}
                  className="w-full py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default WorryPocket;
