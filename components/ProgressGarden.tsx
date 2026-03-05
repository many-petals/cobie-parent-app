import React, { useState } from 'react';
import BadgeDisplay, { StreakDisplay } from './BadgeDisplay';
import { BADGE_DEFINITIONS, BadgeDefinition } from './badgeConfig';

interface ProgressGardenProps {
  petals: { mood: string; color: string; date: string }[];
  onClose: () => void;
  earnedBadgeIds?: string[];
  currentStreak?: number;
}

const ProgressGarden: React.FC<ProgressGardenProps> = ({ 
  petals, 
  onClose, 
  earnedBadgeIds = [],
  currentStreak = 0,
}) => {
  const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(null);

  const colorClasses: Record<string, string> = {
    'too-noisy': 'bg-green-400',
    'worried': 'bg-amber-600',
    'cross': 'bg-yellow-400',
    'sad': 'bg-pink-400',
    'shy': 'bg-purple-400',
    'mine': 'bg-white border-2 border-gray-300',
  };

  // Find next badge milestone
  const nextBadge = BADGE_DEFINITIONS.find(b => 
    !earnedBadgeIds.includes(b.id) && b.streakRequired > currentStreak
  );

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-sky-100 to-green-100 z-50 overflow-auto">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-rounded font-bold text-gray-700">
            Your Petal Garden
          </h2>
          <button
            onClick={onClose}
            className="p-3 rounded-full bg-white shadow-md hover:shadow-lg transition-all"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Streak Display */}
        {currentStreak > 0 && (
          <div className="mb-6">
            <StreakDisplay 
              currentStreak={currentStreak} 
              nextBadgeAt={nextBadge?.streakRequired}
            />
          </div>
        )}

        {/* Badges Section */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
          <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Your Badges
          </h3>
          
          {earnedBadgeIds.length > 0 ? (
            <BadgeDisplay 
              earnedBadgeIds={earnedBadgeIds} 
              showLocked={true}
              size="lg"
              onBadgeClick={setSelectedBadge}
            />
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-gray-500 font-rounded">
                Keep journaling to earn badges!
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Journal for 3 days in a row to earn your first badge
              </p>
              
              {/* Show locked badges */}
              <div className="mt-4">
                <BadgeDisplay 
                  earnedBadgeIds={[]} 
                  showLocked={true}
                  size="md"
                  onBadgeClick={setSelectedBadge}
                />
              </div>
            </div>
          )}
        </div>

        {/* Garden visualization */}
        <div className="relative bg-green-200/50 rounded-3xl p-8 min-h-[400px]">
          {/* Ground */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-green-300 to-transparent rounded-b-3xl" />

          {/* Petals scattered in garden */}
          {petals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-24 h-24 rounded-full bg-white/50 flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-gray-500 font-rounded text-lg text-center">
                Your garden is waiting!
                <br />
                Complete a Petal Path to add your first petal.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 justify-center">
              {petals.map((petal, index) => (
                <div
                  key={index}
                  className="relative group"
                  style={{
                    transform: `rotate(${Math.random() * 30 - 15}deg)`,
                  }}
                >
                  <div
                    className={`w-12 h-12 rounded-full ${colorClasses[petal.mood] || 'bg-gray-300'} shadow-md transition-transform duration-300 group-hover:scale-125`}
                  />
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white px-2 py-1 rounded text-xs whitespace-nowrap shadow">
                    {petal.date}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Decorative elements */}
          <div className="absolute bottom-4 left-8">
            <div className="w-8 h-16 bg-green-500 rounded-t-full" />
          </div>
          <div className="absolute bottom-4 right-12">
            <div className="w-6 h-12 bg-green-600 rounded-t-full" />
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-green-500">{petals.length}</p>
            <p className="text-gray-500 font-rounded">Total Petals</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-purple-500">
              {new Set(petals.map(p => p.mood)).size}
            </p>
            <p className="text-gray-500 font-rounded">Feelings Explored</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-yellow-500">
              {earnedBadgeIds.length}
            </p>
            <p className="text-gray-500 font-rounded">Badges Earned</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-orange-500">
              {currentStreak}
            </p>
            <p className="text-gray-500 font-rounded">Day Streak</p>
          </div>
        </div>

        {/* Badge detail modal */}
        {selectedBadge && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
            onClick={() => setSelectedBadge(null)}
          >
            <div 
              className="bg-white rounded-3xl p-6 max-w-sm mx-4 text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className={`w-20 h-20 mx-auto rounded-full ${selectedBadge.bgColor} flex items-center justify-center mb-4`}>
                <BadgeDisplay 
                  earnedBadgeIds={earnedBadgeIds.includes(selectedBadge.id) ? [selectedBadge.id] : []} 
                  showLocked={false}
                  size="lg"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedBadge.name}</h3>
              <p className="text-gray-600 mb-4">{selectedBadge.description}</p>
              
              {earnedBadgeIds.includes(selectedBadge.id) ? (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Unlocked colors:</p>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {selectedBadge.unlockedColors.map((color, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full border-2 border-white shadow"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-purple-500">
                  Journal for {selectedBadge.streakRequired} days in a row to unlock!
                </p>
              )}
              
              <button
                onClick={() => setSelectedBadge(null)}
                className="mt-4 px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressGarden;
