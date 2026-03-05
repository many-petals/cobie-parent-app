import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Volume2, VolumeX, Star, Sparkles, RotateCcw, Play, Check, Shuffle, Save, ChevronLeft, ChevronRight, Home, Trophy, Flower2, X, BookOpen, Palette, Cloud, CloudOff } from 'lucide-react';
import { 
  gameConfigs, 
  hideSeekScenes, 
  memoryDecks, 
  memoryGridSizes, 
  bugParts, 
  bugBackgrounds,
  ladybirdLevels, 
  gardenItems, 
  calculateReward,
  seedColors,
  sortingLevels,
  HideSeekScene,
  HideSeekItem,
  SceneDecoration
} from './funZoneConfig';
import { useFunZoneSounds, SoundEffect } from '../hooks/useFunZoneSounds';
import { SavedBug, PlacedGardenItem } from '@/lib/gameProgressService';


interface FunZoneProps {
  onClose: () => void;
  onEarnReward: (stickers: number, gardenItems: string[]) => void;
  earnedGardenItems: string[];
  placedGardenItems: PlacedGardenItem[];
  onPlaceGardenItem: (item: PlacedGardenItem) => void;
  onRemoveGardenItem: (index: number) => void;
  // New props for persistent progress
  completedLevels: number[];
  onLevelComplete: (levelIndex: number) => void;
  savedBugs: SavedBug[];
  onSaveBug: (bug: Omit<SavedBug, 'id' | 'createdAt'>) => void;
  familyId: string | null;
}

type GameScreen = 'home' | 'garden' | 'hide-seek' | 'seed-sort' | 'memory-match' | 'bug-builder' | 'ladybird-launch';

const FunZone: React.FC<FunZoneProps> = ({
  onClose,
  onEarnReward,
  earnedGardenItems,
  placedGardenItems,
  onPlaceGardenItem,
  onRemoveGardenItem,
  completedLevels,
  onLevelComplete,
  savedBugs,
  onSaveBug,
  familyId,
}) => {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('home');
  const [showReward, setShowReward] = useState(false);
  const [rewardData, setRewardData] = useState<{ stickers: number; gardenItems: string[] } | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Sound effects hook with persistent mute state
  const { playSound, isMuted, toggleMute, initAudioContext } = useFunZoneSounds();

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize audio context on first interaction
  const handleFirstInteraction = useCallback(() => {
    initAudioContext();
  }, [initAudioContext]);

  const handleGameComplete = (gameId: string, score: number, difficulty: string = 'easy') => {
    const reward = calculateReward(gameId, score, difficulty);
    setRewardData(reward);
    setShowReward(true);
    playSound('reward');
    onEarnReward(reward.stickers, reward.gardenItems);
  };

  const closeReward = () => {
    setShowReward(false);
    setRewardData(null);
    playSound('click');
  };

  const handleScreenChange = (screen: GameScreen) => {
    playSound('click');
    setCurrentScreen(screen);
  };

  return (
    <div 
      className="fixed inset-0 bg-gradient-to-b from-sky-400 via-sky-300 to-green-300 z-50 overflow-hidden"
      onClick={handleFirstInteraction}
      onTouchStart={handleFirstInteraction}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-3 sm:p-4 flex items-center justify-between z-20 bg-gradient-to-b from-black/10 to-transparent">
        <button
          onClick={() => {
            playSound('click');
            currentScreen === 'home' ? onClose() : setCurrentScreen('home');
          }}
          className="w-11 h-11 sm:w-12 sm:h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          {currentScreen === 'home' ? <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" /> : <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />}
        </button>
        
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg">
            {currentScreen === 'home' ? 'Fun Zone' : 
             currentScreen === 'garden' ? 'My Garden' :
             gameConfigs.find(g => g.id === currentScreen)?.name || 'Fun Zone'}
          </h1>
          {/* Online/Offline indicator */}
          {familyId && (
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`}>
              {isOnline ? <Cloud className="w-3 h-3 text-white" /> : <CloudOff className="w-3 h-3 text-white" />}
            </div>
          )}
        </div>
        
        <button
          onClick={() => {
            toggleMute();
          }}
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform ${
            isMuted ? 'bg-red-100' : 'bg-white/90'
          }`}
        >
          {isMuted ? <VolumeX className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" /> : <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />}
        </button>
      </div>

      {/* Main Content */}
      <div className="pt-16 sm:pt-20 pb-4 px-3 sm:px-4 h-full overflow-y-auto">
        {currentScreen === 'home' && (
          <FunZoneHome 
            onSelectGame={handleScreenChange} 
            onOpenGarden={() => handleScreenChange('garden')}
            playSound={playSound}
          />
        )}
        
        {currentScreen === 'garden' && (
          <StickerGarden
            earnedItems={earnedGardenItems}
            placedItems={placedGardenItems}
            onPlaceItem={onPlaceGardenItem}
            onRemoveItem={onRemoveGardenItem}
            playSound={playSound}
          />
        )}
        
        {currentScreen === 'hide-seek' && (
          <HideAndSeekGame 
            onComplete={(score, diff) => handleGameComplete('hide-seek', score, diff)} 
            playSound={playSound}
          />
        )}
        
        {currentScreen === 'seed-sort' && (
          <SeedSortingGame 
            onComplete={(score, diff) => handleGameComplete('seed-sort', score, diff)} 
            playSound={playSound}
          />
        )}
        
        {currentScreen === 'memory-match' && (
          <MemoryMatchGame 
            onComplete={(score, diff) => handleGameComplete('memory-match', score, diff)} 
            playSound={playSound}
          />
        )}
        
        {currentScreen === 'bug-builder' && (
          <BugBuilderGame 
            onComplete={(score) => handleGameComplete('bug-builder', score)} 
            playSound={playSound}
            savedBugs={savedBugs}
            onSaveBug={onSaveBug}
          />
        )}
        
        {currentScreen === 'ladybird-launch' && (
          <LadybirdLaunchGame 
            onComplete={(score) => handleGameComplete('ladybird-launch', score)} 
            playSound={playSound}
            completedLevels={completedLevels}
            onLevelComplete={onLevelComplete}
          />
        )}
      </div>

      {/* Reward Modal */}
      {showReward && rewardData && (
        <RewardModal reward={rewardData} onClose={closeReward} playSound={playSound} />
      )}
    </div>
  );
};



// Sound prop type for components
interface SoundProps {
  playSound: (effect: SoundEffect) => void;
}

// Fun Zone Home Screen
const FunZoneHome: React.FC<{ onSelectGame: (game: GameScreen) => void; onOpenGarden: () => void } & SoundProps> = ({ 
  onSelectGame, 
  onOpenGarden,
  playSound 
}) => {
  return (
    <div className="space-y-4 sm:space-y-6 max-w-lg mx-auto">
      {/* Garden Button */}
      <button
        onClick={() => {
          playSound('click');
          onOpenGarden();
        }}
        className="w-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/30 rounded-xl sm:rounded-2xl flex items-center justify-center">
            <Flower2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <div className="text-left flex-1">
            <h3 className="text-lg sm:text-xl font-bold text-white">My Garden</h3>
            <p className="text-white/80 text-xs sm:text-sm">Place your stickers & items!</p>
          </div>
          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300" />
        </div>
      </button>

      {/* Game Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {gameConfigs.map((game) => (
          <button
            key={game.id}
            onClick={() => {
              playSound('click');
              onSelectGame(game.id as GameScreen);
            }}
            className={`bg-gradient-to-br ${game.bgGradient} rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl active:scale-95 transition-transform`}
          >
            <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">{game.icon}</div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-0.5 sm:mb-1">{game.name}</h3>
            <p className="text-white/80 text-[10px] sm:text-xs">{game.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

// Sticker Garden
const StickerGarden: React.FC<{
  earnedItems: string[];
  placedItems: { id: string; x: number; y: number }[];
  onPlaceItem: (item: { id: string; x: number; y: number }) => void;
  onRemoveItem: (index: number) => void;
} & SoundProps> = ({ earnedItems, placedItems, onPlaceItem, onRemoveItem, playSound }) => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const gardenRef = useRef<HTMLDivElement>(null);

  const handleGardenClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (!selectedItem || !gardenRef.current) return;
    
    const rect = gardenRef.current.getBoundingClientRect();
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    
    onPlaceItem({ id: selectedItem, x, y });
    playSound('seedPop');
    setSelectedItem(null);
  };

  const uniqueEarned = [...new Set(earnedItems)];

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      {/* Garden Area */}
      <div
        ref={gardenRef}
        onClick={handleGardenClick}
        onTouchStart={handleGardenClick}
        className="relative w-full aspect-[4/3] bg-gradient-to-b from-sky-300 to-green-400 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl cursor-pointer"
      >
        {/* Sky decorations */}
        <div className="absolute top-4 right-8 text-3xl">☀️</div>
        <div className="absolute top-8 left-12 text-2xl opacity-80">☁️</div>
        
        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-green-600 to-green-500" />
        
        {/* Placed Items */}
        {placedItems.map((item, index) => {
          const itemData = gardenItems.find(g => g.id === item.id);
          return (
            <div
              key={index}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform"
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
              onClick={(e) => {
                e.stopPropagation();
                playSound('click');
                onRemoveItem(index);
              }}
            >
              <span className="text-3xl sm:text-4xl drop-shadow-md">{itemData?.emoji || '🌸'}</span>
            </div>
          );
        })}
        
        {selectedItem && (
          <div className="absolute inset-0 bg-white/20 flex items-center justify-center pointer-events-none">
            <p className="text-white font-bold text-base sm:text-lg bg-black/30 px-4 py-2 rounded-full">
              Tap to place!
            </p>
          </div>
        )}
      </div>

      {/* Item Palette */}
      <div className="bg-white/90 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
        <h3 className="font-bold text-gray-700 mb-2 sm:mb-3 text-sm sm:text-base">Your Items ({uniqueEarned.length})</h3>
        {uniqueEarned.length === 0 ? (
          <p className="text-gray-500 text-center py-4 text-sm">Play games to earn items!</p>
        ) : (
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 sm:gap-2">
            {uniqueEarned.map((itemId) => {
              const item = gardenItems.find(g => g.id === itemId);
              const count = earnedItems.filter(e => e === itemId).length;
              return (
                <button
                  key={itemId}
                  onClick={() => {
                    playSound('click');
                    setSelectedItem(selectedItem === itemId ? null : itemId);
                  }}
                  className={`relative p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all ${
                    selectedItem === itemId 
                      ? 'bg-green-200 ring-2 ring-green-500' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-xl sm:text-2xl">{item?.emoji}</span>
                  {count > 1 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Hide and Seek Game with Difficulty Selection
const HideAndSeekGame: React.FC<{ onComplete: (score: number, difficulty: string) => void } & SoundProps> = ({ onComplete, playSound }) => {
  const [gameState, setGameState] = useState<'select-difficulty' | 'select-scene' | 'playing'>('select-difficulty');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [sceneIndex, setSceneIndex] = useState(0);
  const [foundItems, setFoundItems] = useState<string[]>([]);
  const [showComplete, setShowComplete] = useState(false);
  const [showHint, setShowHint] = useState<string | null>(null);
  
  const scene = hideSeekScenes[sceneIndex];
  const items = scene.items[difficulty];
  const allFound = foundItems.length === items.length;

  useEffect(() => {
    if (allFound && !showComplete) {
      setShowComplete(true);
      playSound('allFound');
      setTimeout(() => onComplete(foundItems.length * 50, difficulty), 1500);
    }
  }, [allFound, showComplete, foundItems.length, onComplete, difficulty, playSound]);

  const handleItemClick = (itemId: string) => {
    if (!foundItems.includes(itemId)) {
      setFoundItems([...foundItems, itemId]);
      playSound('found');
      setShowHint(null);
    }
  };

  const resetGame = () => {
    setFoundItems([]);
    setShowComplete(false);
    setShowHint(null);
    playSound('click');
  };

  const nextScene = () => {
    setSceneIndex((sceneIndex + 1) % hideSeekScenes.length);
    resetGame();
  };

  const showItemHint = () => {
    const unfound = items.filter(item => !foundItems.includes(item.id));
    if (unfound.length > 0) {
      playSound('hint');
      setShowHint(unfound[0].id);
      setTimeout(() => setShowHint(null), 2000);
    }
  };

  if (gameState === 'select-difficulty') {
    return (
      <div className="space-y-4 sm:space-y-6 max-w-lg mx-auto">
        <div className="bg-white/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl text-center">
          <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🔍</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Choose Difficulty</h2>
          <div className="space-y-2 sm:space-y-3">
            {(['easy', 'medium', 'hard'] as const).map((diff) => {
              const itemCount = diff === 'easy' ? 6 : diff === 'medium' ? 10 : 14;
              return (
                <button
                  key={diff}
                  onClick={() => { 
                    playSound('click');
                    setDifficulty(diff); 
                    setGameState('select-scene'); 
                  }}
                  className={`w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all ${
                    diff === 'easy' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                    diff === 'medium' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' :
                    'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  {diff.charAt(0).toUpperCase() + diff.slice(1)} ({itemCount} items)
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'select-scene') {
    return (
      <div className="space-y-4 sm:space-y-6 max-w-lg mx-auto">
        <div className="bg-white/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">Choose a Scene</h2>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {hideSeekScenes.map((s, index) => (
              <button
                key={s.id}
                onClick={() => { 
                  playSound('click');
                  setSceneIndex(index); 
                  setGameState('playing'); 
                  resetGame(); 
                }}
                className={`${s.background} rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg active:scale-95 transition-transform`}
              >
                <p className="text-white font-bold text-sm sm:text-base drop-shadow">{s.name}</p>
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              playSound('click');
              setGameState('select-difficulty');
            }}
            className="w-full mt-4 py-2 text-gray-500 text-sm"
          >
            ← Back to difficulty
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 max-w-lg mx-auto">
      {/* Scene */}
      <div className={`relative w-full aspect-[4/3] ${scene.background} rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl`}>
        {/* Ground */}
        <div className={`absolute bottom-0 left-0 right-0 h-1/4 ${scene.groundColor} opacity-50`} />
        
        {/* Background Decorations (zIndex: 0) */}
        {scene.decorations
          .filter(dec => dec.zIndex === 0)
          .map((dec, index) => {
            const sizeClass = dec.size === 'sm' ? 'text-xl sm:text-2xl' : 
                             dec.size === 'md' ? 'text-2xl sm:text-3xl' : 
                             dec.size === 'lg' ? 'text-3xl sm:text-4xl' : 
                             'text-4xl sm:text-5xl';
            return (
              <div
                key={`bg-dec-${index}`}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none ${sizeClass}`}
                style={{ 
                  left: `${dec.x}%`, 
                  top: `${dec.y}%`,
                  opacity: dec.opacity ?? 1
                }}
              >
                {dec.emoji}
              </div>
            );
          })}
        
        {/* Hidden Items */}
        {items.map((item) => {
          const isFound = foundItems.includes(item.id);
          const isHinted = showHint === item.id;
          const sizeClass = item.size === 'sm' ? 'text-lg sm:text-xl' : item.size === 'lg' ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl';
          
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              disabled={isFound}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center ${
                isFound ? 'scale-125 opacity-100 z-20' : isHinted ? 'opacity-100 animate-pulse scale-110 z-10' : 'opacity-80 hover:opacity-100 hover:scale-110 z-10'

              }`}
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
            >
              <span className={sizeClass}>{item.emoji}</span>
              {isFound && (
                <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
              )}
            </button>
          );
        })}

        {/* Foreground Decorations (zIndex: 1) - These hide the items */}
        {scene.decorations
          .filter(dec => dec.zIndex === 1)
          .map((dec, index) => {
            const sizeClass = dec.size === 'sm' ? 'text-xl sm:text-2xl' : 
                             dec.size === 'md' ? 'text-2xl sm:text-3xl' : 
                             dec.size === 'lg' ? 'text-3xl sm:text-4xl' : 
                             'text-4xl sm:text-5xl';
            return (
              <div
                key={`fg-dec-${index}`}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[15] ${sizeClass}`}
                style={{ 
                  left: `${dec.x}%`, 
                  top: `${dec.y}%`,
                  opacity: dec.opacity ?? 1
                }}
              >
                {dec.emoji}
              </div>
            );
          })}

        {/* Complete Overlay */}
        {showComplete && (
          <div className="absolute inset-0 bg-green-500/80 flex flex-col items-center justify-center z-30">
            <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-300 mb-3 sm:mb-4 animate-bounce" />
            <p className="text-2xl sm:text-3xl font-bold text-white">Great Job!</p>
          </div>
        )}
      </div>


      {/* Checklist */}
      <div className="bg-white/90 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <h3 className="font-bold text-gray-700 text-sm sm:text-base">Find these friends:</h3>
          <span className="text-green-600 font-bold text-sm sm:text-base">{foundItems.length}/{items.length}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {items.map((item) => {
            const isFound = foundItems.includes(item.id);
            return (
              <div
                key={item.id}
                className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  isFound ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <span>{item.emoji}</span>
                <span className="hidden sm:inline">{item.name}</span>
                {isFound && <Check className="w-3 h-3 sm:w-4 sm:h-4" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 sm:gap-3">
        <button
          onClick={showItemHint}
          disabled={allFound}
          className="flex-1 py-2.5 sm:py-3 bg-yellow-100 rounded-xl sm:rounded-2xl font-bold text-yellow-700 shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-1 sm:gap-2 disabled:opacity-50 text-sm sm:text-base"
        >
          💡 Hint
        </button>
        <button
          onClick={resetGame}
          className="flex-1 py-2.5 sm:py-3 bg-white/90 rounded-xl sm:rounded-2xl font-bold text-gray-700 shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
        >
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          Reset
        </button>
        <button
          onClick={nextScene}
          className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl sm:rounded-2xl font-bold text-white shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
        >
          Next
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};

// Seed Sorting Game with Multiple Sorting Rules
const SeedSortingGame: React.FC<{ onComplete: (score: number, difficulty: string) => void } & SoundProps> = ({ onComplete, playSound }) => {
  const [levelIndex, setLevelIndex] = useState(0);
  const [seeds, setSeeds] = useState<{ id: number; color: string; colorName: string; sorted: boolean }[]>([]);
  const [score, setScore] = useState(0);
  const [draggedSeed, setDraggedSeed] = useState<number | null>(null);
  const [showComplete, setShowComplete] = useState(false);
  const [showRule, setShowRule] = useState(true);

  const level = sortingLevels[levelIndex];
  const activeColors = seedColors.slice(0, level.binCount);

  useEffect(() => {
    generateSeeds();
    setShowRule(true);
    const timer = setTimeout(() => setShowRule(false), 2000);
    return () => clearTimeout(timer);
  }, [levelIndex]);

  const generateSeeds = () => {
    const newSeeds = Array.from({ length: level.seedCount }, (_, i) => {
      const color = activeColors[Math.floor(Math.random() * activeColors.length)];
      return {
        id: i,
        color: color.class,
        colorName: color.id,
        sorted: false,
      };
    });
    setSeeds(newSeeds);
    setScore(0);
    setShowComplete(false);
  };

  const handleDrop = (binColor: string) => {
    if (draggedSeed === null) return;
    
    const seed = seeds.find(s => s.id === draggedSeed);
    if (seed && seed.colorName === binColor && !seed.sorted) {
      // Correct match - play pop sound
      playSound('seedPop');
      const newSeeds = seeds.map(s => s.id === draggedSeed ? { ...s, sorted: true } : s);
      setSeeds(newSeeds);
      setScore(score + 10);
      
      // Check if all sorted
      const remaining = newSeeds.filter(s => !s.sorted);
      if (remaining.length === 0) {
        setShowComplete(true);
        playSound('binFull');
        const difficulty = levelIndex < 2 ? 'easy' : levelIndex < 4 ? 'medium' : 'hard';
        setTimeout(() => onComplete((score + 10) * 10, difficulty), 1000);
      }
    } else if (seed && seed.colorName !== binColor) {
      // Wrong bin - play bounce sound
      playSound('seedBounce');
    }
    setDraggedSeed(null);
  };

  const unsortedSeeds = seeds.filter(s => !s.sorted);
  const sortedCount = seeds.filter(s => s.sorted).length;

  return (
    <div className="space-y-3 sm:space-y-4 max-w-lg mx-auto">
      {/* Rule Display */}
      {showRule && (
        <div className="bg-white/95 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg text-center animate-pulse">
          <p className="text-base sm:text-lg font-bold text-gray-800">{level.description}</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Match seeds to their color bins!</p>
        </div>
      )}

      {/* Conveyor Belt */}
      <div className="bg-gray-700 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xl">
        <div className="flex items-center justify-center gap-2 sm:gap-3 min-h-[70px] sm:min-h-[80px] flex-wrap">
          {unsortedSeeds.map((seed) => (
            <button
              key={seed.id}
              onMouseDown={() => {
                playSound('click');
                setDraggedSeed(seed.id);
              }}
              onTouchStart={() => {
                playSound('click');
                setDraggedSeed(seed.id);
              }}
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-lg active:scale-90 transition-transform cursor-grab ${seed.color} ${
                draggedSeed === seed.id ? 'ring-4 ring-white scale-110' : ''
              }`}
            />
          ))}
          {unsortedSeeds.length === 0 && !showComplete && (
            <div className="text-white font-bold text-lg sm:text-xl flex items-center gap-2">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300" />
              All Sorted!
            </div>
          )}
          {showComplete && (
            <div className="text-white font-bold text-lg sm:text-xl flex items-center gap-2">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300" />
              Great Job!
            </div>
          )}
        </div>
      </div>

      {/* Sorting Bins */}
      <div className={`grid gap-2 sm:gap-3`} style={{ gridTemplateColumns: `repeat(${Math.min(level.binCount, 4)}, 1fr)` }}>
        {activeColors.map((color) => (
          <button
            key={color.id}
            onMouseUp={() => handleDrop(color.id)}
            onTouchEnd={() => handleDrop(color.id)}
            className={`aspect-square rounded-xl sm:rounded-2xl shadow-lg flex flex-col items-center justify-center gap-1 sm:gap-2 transition-transform ${
              draggedSeed !== null ? 'scale-105' : ''
            } bg-opacity-30 ${color.class.replace('bg-', 'bg-opacity-30 bg-')} border-4 ${color.border}`}
          >
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${color.class}`} />
            <span className="text-[10px] sm:text-xs font-bold text-gray-600 capitalize">{color.name}</span>
          </button>
        ))}
      </div>

      {/* Progress & Controls */}
      <div className="bg-white/90 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm text-gray-500">Level {levelIndex + 1}: {level.name}</p>
          <p className="text-xl sm:text-2xl font-bold text-green-600">{sortedCount}/{seeds.length}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              playSound('click');
              generateSeeds();
            }}
            className="px-3 sm:px-4 py-2 bg-amber-100 text-amber-700 rounded-lg sm:rounded-xl font-bold flex items-center gap-1 sm:gap-2 text-sm"
          >
            <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
            Reset
          </button>
          {levelIndex < sortingLevels.length - 1 && (
            <button
              onClick={() => {
                playSound('click');
                setLevelIndex(levelIndex + 1);
              }}
              className="px-3 sm:px-4 py-2 bg-green-100 text-green-700 rounded-lg sm:rounded-xl font-bold flex items-center gap-1 sm:gap-2 text-sm"
            >
              Next
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Memory Match Game with Deck Selection
const MemoryMatchGame: React.FC<{ onComplete: (score: number, difficulty: string) => void } & SoundProps> = ({ onComplete, playSound }) => {
  const [gameState, setGameState] = useState<'select-deck' | 'select-difficulty' | 'playing'>('select-deck');
  const [selectedDeck, setSelectedDeck] = useState<'animals' | 'nature' | 'food' | 'expressions'>('animals');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [cards, setCards] = useState<{ id: number; emoji: string; flipped: boolean; matched: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  const gridConfig = memoryGridSizes.find(g => g.id === difficulty)!;
  const deck = memoryDecks[selectedDeck];

  const startGame = () => {
    const pairs = gridConfig.pairs;
    const selectedCards = deck.slice(0, pairs);
    const gameCards = [...selectedCards, ...selectedCards]
      .sort(() => Math.random() - 0.5)
      .map((card, index) => ({
        id: index,
        emoji: card.emoji,
        flipped: false,
        matched: false,
      }));
    setCards(gameCards);
    setFlippedCards([]);
    setMoves(0);
    setGameState('playing');
  };

  const handleCardClick = (cardId: number) => {
    if (flippedCards.length >= 2) return;
    if (cards[cardId].matched || cards[cardId].flipped) return;

    // Play card flip sound
    playSound('cardFlip');

    const newCards = [...cards];
    newCards[cardId].flipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      const [first, second] = newFlipped;
      
      if (cards[first].emoji === cards[second].emoji) {
        // Match found!
        setTimeout(() => {
          playSound('cardMatch');
          const matchedCards = [...cards];
          matchedCards[first].matched = true;
          matchedCards[second].matched = true;
          setCards(matchedCards);
          setFlippedCards([]);
          
          // Check win
          if (matchedCards.every(c => c.matched)) {
            setTimeout(() => onComplete((gridConfig.pairs * 50) - (moves * 5), difficulty), 500);
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          playSound('cardMismatch');
          const resetCards = [...cards];
          resetCards[first].flipped = false;
          resetCards[second].flipped = false;
          setCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  if (gameState === 'select-deck') {
    const deckOptions = [
      { id: 'animals', name: 'Animals', emoji: '🐱', color: 'bg-orange-100 text-orange-700' },
      { id: 'nature', name: 'Nature', emoji: '🌸', color: 'bg-green-100 text-green-700' },
      { id: 'food', name: 'Food', emoji: '🍎', color: 'bg-red-100 text-red-700' },
      { id: 'expressions', name: 'Faces', emoji: '😊', color: 'bg-yellow-100 text-yellow-700' },
    ];

    return (
      <div className="space-y-4 sm:space-y-6 max-w-lg mx-auto">
        <div className="bg-white/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl text-center">
          <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🃏</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Choose a Deck</h2>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {deckOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => { 
                  playSound('click');
                  setSelectedDeck(opt.id as any); 
                  setGameState('select-difficulty'); 
                }}
                className={`${opt.color} rounded-xl sm:rounded-2xl p-3 sm:p-4 font-bold text-sm sm:text-lg transition-all hover:scale-105`}
              >
                <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">{opt.emoji}</div>
                {opt.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'select-difficulty') {
    return (
      <div className="space-y-4 sm:space-y-6 max-w-lg mx-auto">
        <div className="bg-white/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Choose Difficulty</h2>
          <div className="space-y-2 sm:space-y-3">
            {(['easy', 'medium', 'hard'] as const).map((diff) => {
              const config = memoryGridSizes.find(g => g.id === diff)!;
              return (
                <button
                  key={diff}
                  onClick={() => { 
                    playSound('click');
                    setDifficulty(diff); 
                    startGame(); 
                  }}
                  className={`w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all ${
                    diff === 'easy' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                    diff === 'medium' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' :
                    'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  {config.name} ({config.cols}x{config.rows})
                </button>
              );
            })}
          </div>
          <button
            onClick={() => {
              playSound('click');
              setGameState('select-deck');
            }}
            className="w-full mt-4 py-2 text-gray-500 text-sm"
          >
            ← Back to decks
          </button>
        </div>
      </div>
    );
  }

  const matchedCount = cards.filter(c => c.matched).length / 2;

  return (
    <div className="space-y-3 sm:space-y-4 max-w-lg mx-auto">
      {/* Game Grid */}
      <div 
        className="grid gap-1.5 sm:gap-2 bg-purple-100 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-xl"
        style={{ gridTemplateColumns: `repeat(${gridConfig.cols}, 1fr)` }}
      >
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            disabled={card.matched || card.flipped}
            className={`aspect-square rounded-lg sm:rounded-xl text-2xl sm:text-3xl flex items-center justify-center transition-all transform min-w-[44px] min-h-[44px] ${
              card.flipped || card.matched
                ? 'bg-white'
                : 'bg-gradient-to-br from-purple-400 to-pink-500'
            } ${card.matched ? 'opacity-50' : 'shadow-lg active:scale-95'}`}
          >
            {(card.flipped || card.matched) ? card.emoji : '?'}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="bg-white/90 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm text-gray-500">Pairs Found</p>
          <p className="text-xl sm:text-2xl font-bold text-purple-600">{matchedCount}/{gridConfig.pairs}</p>
        </div>
        <div>
          <p className="text-xs sm:text-sm text-gray-500">Moves</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-700">{moves}</p>
        </div>
        <button
          onClick={() => {
            playSound('click');
            setGameState('select-deck');
          }}
          className="px-3 sm:px-4 py-2 bg-purple-100 text-purple-700 rounded-lg sm:rounded-xl font-bold flex items-center gap-1 sm:gap-2 text-sm"
        >
          <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
          New
        </button>
      </div>
    </div>
  );
};

// Bug Builder Game with Bug Book
const BugBuilderGame: React.FC<{ onComplete: (score: number) => void } & SoundProps> = ({ onComplete, playSound }) => {
  const [bug, setBug] = useState({
    bodyColor: 'bg-green-400',
    headType: '🟢',
    wingType: 'round',
    antennaType: 'ball',
    pattern: 'none',
    prop: 'none',
  });
  const [savedBugs, setSavedBugs] = useState<typeof bug[]>([]);
  const [showBugBook, setShowBugBook] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);

  const randomize = () => {
    playSound('bugRandomize');
    setBug({
      bodyColor: bugParts.colors[Math.floor(Math.random() * bugParts.colors.length)].class,
      headType: bugParts.heads[Math.floor(Math.random() * bugParts.heads.length)].emoji,
      wingType: bugParts.wings[Math.floor(Math.random() * (bugParts.wings.length - 1))].id,
      antennaType: bugParts.antennae[Math.floor(Math.random() * (bugParts.antennae.length - 1))].id,
      pattern: bugParts.patterns[Math.floor(Math.random() * bugParts.patterns.length)].id,
      prop: bugParts.props[Math.floor(Math.random() * bugParts.props.length)].id,
    });
  };

  const saveBug = () => {
    playSound('bugSave');
    setSavedBugs([...savedBugs, bug]);
    onComplete(100);
  };

  const updateBugPart = (part: string, value: string) => {
    playSound('bugPart');
    setBug({ ...bug, [part]: value });
  };

  const currentBg = bugBackgrounds[bgIndex];

  return (
    <div className="space-y-3 sm:space-y-4 max-w-lg mx-auto">
      {/* Bug Preview */}
      <div className={`${currentBg.class} rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl flex items-center justify-center relative`}>
        {/* Background toggle */}
        <button
          onClick={() => {
            playSound('click');
            setBgIndex((bgIndex + 1) % bugBackgrounds.length);
          }}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-10 sm:h-10 bg-white/50 rounded-full flex items-center justify-center"
        >
          <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
        </button>

        <div className="relative">
          {/* Prop */}
          {bug.prop !== 'none' && (
            <div className="absolute -top-8 sm:-top-10 left-1/2 -translate-x-1/2 text-2xl sm:text-3xl">
              {bugParts.props.find(p => p.id === bug.prop)?.emoji}
            </div>
          )}

          {/* Antennae */}
          {bug.antennaType !== 'none' && (
            <>
              <div className="absolute -top-10 sm:-top-12 left-1/3 w-1 h-6 sm:h-8 bg-gray-700 -rotate-12 rounded-full">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-400 rounded-full" />
              </div>
              <div className="absolute -top-10 sm:-top-12 right-1/3 w-1 h-6 sm:h-8 bg-gray-700 rotate-12 rounded-full">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-400 rounded-full" />
              </div>
            </>
          )}

          {/* Wings */}
          {bug.wingType !== 'none' && (
            <>
              <div className={`absolute -left-6 sm:-left-8 top-1/2 -translate-y-1/2 w-6 h-10 sm:w-8 sm:h-12 bg-blue-200/50 rounded-full border-2 border-blue-300 -rotate-12`} />
              <div className={`absolute -right-6 sm:-right-8 top-1/2 -translate-y-1/2 w-6 h-10 sm:w-8 sm:h-12 bg-blue-200/50 rounded-full border-2 border-blue-300 rotate-12`} />
            </>
          )}
          
          {/* Body */}
          <div className={`w-20 h-28 sm:w-24 sm:h-32 ${bug.bodyColor} rounded-full shadow-lg relative`}>
            {/* Pattern */}
            {bug.pattern === 'dots' && (
              <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 p-3 sm:p-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-black/30 rounded-full" />
                ))}
              </div>
            )}
            {bug.pattern === 'stripes' && (
              <div className="absolute inset-0 flex flex-col justify-center gap-1.5 sm:gap-2 p-3 sm:p-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-1.5 sm:h-2 bg-black/20 rounded-full" />
                ))}
              </div>
            )}
            {bug.pattern === 'hearts' && (
              <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-1 p-2">
                {[...Array(4)].map((_, i) => (
                  <span key={i} className="text-sm sm:text-base opacity-50">💕</span>
                ))}
              </div>
            )}
            {bug.pattern === 'stars' && (
              <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-1 p-2">
                {[...Array(4)].map((_, i) => (
                  <span key={i} className="text-sm sm:text-base opacity-50">⭐</span>
                ))}
              </div>
            )}
          </div>
          
          {/* Head */}
          <div className="absolute -top-5 sm:-top-6 left-1/2 -translate-x-1/2 text-3xl sm:text-4xl">
            {bug.headType}
          </div>
          
          {/* Eyes */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-black rounded-full" />
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-black rounded-full" />
          </div>
          
          {/* Smile */}
          <div className="absolute top-8 sm:top-10 left-1/2 -translate-x-1/2 w-6 sm:w-8 h-3 sm:h-4 border-b-2 border-black/40 rounded-b-full" />
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white/90 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg space-y-3 sm:space-y-4">
        {/* Colors */}
        <div>
          <p className="text-xs sm:text-sm font-bold text-gray-600 mb-1.5 sm:mb-2">Body Color</p>
          <div className="flex gap-1.5 sm:gap-2 flex-wrap">
            {bugParts.colors.map((color) => (
              <button
                key={color.id}
                onClick={() => updateBugPart('bodyColor', color.class)}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${color.class} ${
                  bug.bodyColor === color.class ? 'ring-4 ring-gray-800' : ''
                }`}
              />
            ))}
          </div>
        </div>

        {/* Heads */}
        <div>
          <p className="text-xs sm:text-sm font-bold text-gray-600 mb-1.5 sm:mb-2">Head</p>
          <div className="flex gap-1.5 sm:gap-2 flex-wrap">
            {bugParts.heads.map((head) => (
              <button
                key={head.id}
                onClick={() => updateBugPart('headType', head.emoji)}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gray-100 text-lg sm:text-xl flex items-center justify-center ${
                  bug.headType === head.emoji ? 'ring-2 ring-pink-500' : ''
                }`}
              >
                {head.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Patterns */}
        <div>
          <p className="text-xs sm:text-sm font-bold text-gray-600 mb-1.5 sm:mb-2">Pattern</p>
          <div className="flex gap-1.5 sm:gap-2 flex-wrap">
            {bugParts.patterns.map((pattern) => (
              <button
                key={pattern.id}
                onClick={() => updateBugPart('pattern', pattern.id)}
                className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium ${
                  bug.pattern === pattern.id 
                    ? 'bg-pink-500 text-white' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {pattern.name}
              </button>
            ))}
          </div>
        </div>

        {/* Props */}
        <div>
          <p className="text-xs sm:text-sm font-bold text-gray-600 mb-1.5 sm:mb-2">Accessory</p>
          <div className="flex gap-1.5 sm:gap-2 flex-wrap">
            {bugParts.props.map((prop) => (
              <button
                key={prop.id}
                onClick={() => updateBugPart('prop', prop.id)}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gray-100 text-lg sm:text-xl flex items-center justify-center ${
                  bug.prop === prop.id ? 'ring-2 ring-pink-500' : ''
                }`}
              >
                {prop.emoji || '✕'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 sm:gap-3">
        <button
          onClick={randomize}
          className="flex-1 py-2.5 sm:py-3 bg-white/90 rounded-xl sm:rounded-2xl font-bold text-gray-700 shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
        >
          <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
          Surprise!
        </button>
        <button
          onClick={() => {
            playSound('click');
            setShowBugBook(true);
          }}
          className="flex-1 py-2.5 sm:py-3 bg-purple-100 rounded-xl sm:rounded-2xl font-bold text-purple-700 shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
        >
          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
          Book ({savedBugs.length})
        </button>
        <button
          onClick={saveBug}
          className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-pink-400 to-rose-500 rounded-xl sm:rounded-2xl font-bold text-white shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
        >
          <Save className="w-4 h-4 sm:w-5 sm:h-5" />
          Save
        </button>
      </div>

      {/* Bug Book Modal */}
      {showBugBook && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Bug Book</h2>
              <button onClick={() => {
                playSound('click');
                setShowBugBook(false);
              }} className="p-2">
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
              </button>
            </div>
            {savedBugs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No bugs saved yet!</p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {savedBugs.map((savedBug, i) => (
                  <div key={i} className="bg-gradient-to-b from-sky-100 to-green-100 rounded-xl p-2 sm:p-3 flex items-center justify-center">
                    <div className={`w-10 h-14 sm:w-12 sm:h-16 ${savedBug.bodyColor} rounded-full relative`}>
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-lg sm:text-xl">{savedBug.headType}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Ladybird Launch Game with Level Selection
const LadybirdLaunchGame: React.FC<{ onComplete: (score: number) => void } & SoundProps> = ({ onComplete, playSound }) => {
  const [showLevelSelect, setShowLevelSelect] = useState(true);
  const [levelIndex, setLevelIndex] = useState(0);
  const [ladybird, setLadybird] = useState({ x: 10, y: 85, vx: 0, vy: 0 });
  const [isFlying, setIsFlying] = useState(false);
  const [aimAngle, setAimAngle] = useState(-45);
  const [aimPower, setAimPower] = useState(50);
  const [collectedStars, setCollectedStars] = useState<number[]>([]);
  const [levelComplete, setLevelComplete] = useState(false);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [lastBounceTime, setLastBounceTime] = useState(0);
  const animationRef = useRef<number>();

  const level = ladybirdLevels[levelIndex];

  const resetLevel = useCallback(() => {
    setLadybird({ x: level.startX, y: level.startY, vx: 0, vy: 0 });
    setIsFlying(false);
    setCollectedStars([]);
    setLevelComplete(false);
  }, [level]);

  useEffect(() => {
    resetLevel();
  }, [levelIndex, resetLevel]);

  const launch = () => {
    if (isFlying) return;
    
    playSound('launch');
    const radians = (aimAngle * Math.PI) / 180;
    const power = aimPower / 10;
    
    setLadybird({
      ...ladybird,
      vx: Math.cos(radians) * power,
      vy: Math.sin(radians) * power,
    });
    setIsFlying(true);
  };

  useEffect(() => {
    if (!isFlying) return;

    const animate = () => {
      setLadybird((prev) => {
        let newX = prev.x + prev.vx;
        let newY = prev.y + prev.vy;
        let newVx = prev.vx;
        let newVy = prev.vy + 0.3; // Gravity
        let didBounce = false;

        // Wind effect
        if (level.wind) {
          newVx += level.wind.direction === 'right' ? level.wind.strength : -level.wind.strength;
        }

        // Check platform collisions
        for (const platform of level.platforms) {
          const platLeft = platform.x - platform.width / 2;
          const platRight = platform.x + platform.width / 2;
          
          if (newX >= platLeft && newX <= platRight && 
              newY >= platform.y - 5 && newY <= platform.y + 5 &&
              prev.vy > 0) {
            
            if (platform.type === 'mushroom') {
              newVy = -Math.abs(newVy) * 1.2; // Bounce
              newY = platform.y - 5;
              didBounce = true;
            } else if (platform.type === 'goal') {
              setLevelComplete(true);
              setIsFlying(false);
              setCompletedLevels(prev => [...new Set([...prev, levelIndex])]);
              playSound('levelComplete');
              setTimeout(() => {
                onComplete(100 + collectedStars.length * 20);
              }, 1000);
              return prev;
            } else {
              newVy = -Math.abs(newVy) * 0.5;
              newY = platform.y - 5;
              didBounce = true;
            }
          }
        }

        // Play bounce sound (throttled)
        if (didBounce) {
          const now = Date.now();
          if (now - lastBounceTime > 200) {
            playSound('bounce');
            setLastBounceTime(now);
          }
        }

        // Check star collection
        if (level.stars) {
          level.stars.forEach((star, i) => {
            if (!collectedStars.includes(i)) {
              const dist = Math.sqrt((newX - star.x) ** 2 + (newY - star.y) ** 2);
              if (dist < 8) {
                playSound('starCollect');
                setCollectedStars((prev) => [...prev, i]);
              }
            }
          });
        }

        // Bounds check
        if (newX < 0 || newX > 100 || newY > 100) {
          resetLevel();
          return { x: level.startX, y: level.startY, vx: 0, vy: 0 };
        }

        return { x: newX, y: newY, vx: newVx * 0.99, vy: newVy };
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isFlying, level, collectedStars, resetLevel, onComplete, levelIndex, playSound, lastBounceTime]);

  const nextLevel = () => {
    if (levelIndex < ladybirdLevels.length - 1) {
      playSound('click');
      setLevelIndex(levelIndex + 1);
    }
  };

  if (showLevelSelect) {
    return (
      <div className="space-y-4 max-w-lg mx-auto">
        <div className="bg-white/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 text-center">Select Level</h2>
          <div className="grid grid-cols-5 gap-2">
            {ladybirdLevels.map((lvl, index) => (
              <button
                key={lvl.id}
                onClick={() => { 
                  playSound('click');
                  setLevelIndex(index); 
                  setShowLevelSelect(false); 
                }}
                className={`aspect-square rounded-lg sm:rounded-xl font-bold text-base sm:text-lg flex flex-col items-center justify-center gap-0.5 ${
                  completedLevels.includes(index)
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {index + 1}
                {completedLevels.includes(index) && <Check className="w-3 h-3 sm:w-4 sm:h-4" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 max-w-lg mx-auto">
      {/* Game Area */}
      <div className="relative w-full aspect-[4/3] bg-gradient-to-b from-sky-300 to-sky-100 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl">
        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-[10%] bg-gradient-to-t from-green-600 to-green-500" />

        {/* Platforms */}
        {level.platforms.map((platform, i) => (
          <div
            key={i}
            className={`absolute transform -translate-x-1/2 ${
              platform.type === 'mushroom' ? 'text-2xl sm:text-3xl' :
              platform.type === 'goal' ? 'text-2xl sm:text-3xl' :
              'text-xl sm:text-2xl'
            }`}
            style={{ left: `${platform.x}%`, top: `${platform.y}%` }}
          >
            {platform.type === 'mushroom' ? '🍄' :
             platform.type === 'goal' ? '🏆' :
             '🍃'}
          </div>
        ))}

        {/* Stars */}
        {level.stars?.map((star, i) => (
          !collectedStars.includes(i) && (
            <div
              key={i}
              className="absolute text-xl sm:text-2xl animate-pulse"
              style={{ left: `${star.x}%`, top: `${star.y}%` }}
            >
              ⭐
            </div>
          )
        ))}

        {/* Wind Indicator */}
        {level.wind && (
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/80 rounded-full px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm font-medium">
            {level.wind.direction === 'right' ? '💨→' : '←💨'}
          </div>
        )}

        {/* Ladybird */}
        <div
          className="absolute text-2xl sm:text-3xl transform -translate-x-1/2 -translate-y-1/2 transition-transform"
          style={{ 
            left: `${ladybird.x}%`, 
            top: `${ladybird.y}%`,
            transform: `translate(-50%, -50%) rotate(${isFlying ? Math.atan2(ladybird.vy, ladybird.vx) * 180 / Math.PI : aimAngle}deg)`
          }}
        >
          🐞
        </div>

        {/* Aim Line */}
        {!isFlying && (
          <div
            className="absolute w-16 sm:w-20 h-1 bg-red-400/50 origin-left"
            style={{
              left: `${ladybird.x}%`,
              top: `${ladybird.y}%`,
              transform: `rotate(${aimAngle}deg)`,
            }}
          />
        )}

        {/* Level Complete Overlay */}
        {levelComplete && (
          <div className="absolute inset-0 bg-green-500/80 flex flex-col items-center justify-center">
            <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-300 mb-3 sm:mb-4 animate-bounce" />
            <p className="text-2xl sm:text-3xl font-bold text-white mb-2">Level Complete!</p>
            <p className="text-white text-sm sm:text-base">Stars: {collectedStars.length}/{level.stars?.length || 0}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-white/90 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              playSound('click');
              setShowLevelSelect(true);
            }}
            className="text-xs sm:text-sm text-gray-500 underline"
          >
            ← Levels
          </button>
          <span className="font-bold text-gray-700 text-sm sm:text-base">Level {levelIndex + 1}: {level.name}</span>
          <div className="flex items-center gap-0.5 sm:gap-1">
            {[...Array(level.stars?.length || 0)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 sm:w-5 sm:h-5 ${collectedStars.includes(i) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
              />
            ))}
          </div>
        </div>

        {!isFlying && !levelComplete && (
          <>
            <div>
              <p className="text-xs sm:text-sm text-gray-500 mb-1">Angle: {aimAngle}°</p>
              <input
                type="range"
                min="-80"
                max="0"
                value={aimAngle}
                onChange={(e) => setAimAngle(parseInt(e.target.value))}
                className="w-full h-8 cursor-pointer"
              />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500 mb-1">Power: {aimPower}%</p>
              <input
                type="range"
                min="20"
                max="100"
                value={aimPower}
                onChange={(e) => setAimPower(parseInt(e.target.value))}
                className="w-full h-8 cursor-pointer"
              />
            </div>
          </>
        )}

        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={() => {
              playSound('click');
              resetLevel();
            }}
            className="flex-1 py-2.5 sm:py-3 bg-gray-100 rounded-xl sm:rounded-2xl font-bold text-gray-700 active:scale-95 transition-transform flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            Reset
          </button>
          {levelComplete ? (
            <button
              onClick={nextLevel}
              disabled={levelIndex >= ladybirdLevels.length - 1}
              className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl sm:rounded-2xl font-bold text-white active:scale-95 transition-transform flex items-center justify-center gap-1 sm:gap-2 disabled:opacity-50 text-sm sm:text-base"
            >
              Next
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          ) : (
            <button
              onClick={launch}
              disabled={isFlying}
              className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-red-400 to-orange-500 rounded-xl sm:rounded-2xl font-bold text-white active:scale-95 transition-transform flex items-center justify-center gap-1 sm:gap-2 disabled:opacity-50 text-sm sm:text-base"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5" />
              Launch!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Reward Modal
const RewardModal: React.FC<{ reward: { stickers: number; gardenItems: string[] }; onClose: () => void } & SoundProps> = ({ reward, onClose, playSound }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center">
        <div className="mb-4 sm:mb-6">
          <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-400 mx-auto mb-3 sm:mb-4 animate-spin" style={{ animationDuration: '3s' }} />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Great Job!</h2>
          <p className="text-gray-600 text-sm sm:text-base">You earned rewards!</p>
        </div>

        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          {reward.stickers > 0 && (
            <div className="bg-yellow-100 rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <p className="text-base sm:text-lg font-bold text-yellow-700">+{reward.stickers} Stickers!</p>
            </div>
          )}
          
          {reward.gardenItems.length > 0 && (
            <div className="bg-green-100 rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <p className="text-base sm:text-lg font-bold text-green-700 mb-2">New Garden Item!</p>
              <div className="flex justify-center gap-2">
                {reward.gardenItems.map((itemId, i) => {
                  const item = gardenItems.find(g => g.id === itemId);
                  return (
                    <span key={i} className="text-3xl sm:text-4xl">{item?.emoji}</span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl font-bold text-white text-base sm:text-lg active:scale-95 transition-transform"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
};

export default FunZone;
