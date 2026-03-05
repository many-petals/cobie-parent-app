import React from 'react';
import { BadgeDefinition, BADGE_DEFINITIONS, getBadgeById } from './badgeConfig';

interface BadgeDisplayProps {
  earnedBadgeIds: string[];
  showLocked?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onBadgeClick?: (badge: BadgeDefinition) => void;
}

// SVG icons for each badge type
const BadgeIcon: React.FC<{ type: string; color: string; size: number }> = ({ type, color, size }) => {
  switch (type) {
    case 'seedling':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 22V12M12 12C12 12 12 8 8 6C4 4 4 2 4 2C4 2 4 8 8 10C10.5 11.25 12 12 12 12ZM12 12C12 12 12 8 16 6C20 4 20 2 20 2C20 2 20 8 16 10C13.5 11.25 12 12 12 12Z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'sprout':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 22V8M12 8C12 8 12 4 8 2C4 0 2 2 2 2C2 2 4 6 8 6C10 6 12 8 12 8ZM12 8C12 8 12 4 16 2C20 0 22 2 22 2C22 2 20 6 16 6C14 6 12 8 12 8Z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 14C12 14 14 12 16 12C18 12 20 14 20 14"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 14C12 14 10 12 8 12C6 12 4 14 4 14"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'flower':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="3" fill={color} />
          <ellipse cx="12" cy="6" rx="2.5" ry="4" fill={color} fillOpacity="0.7" />
          <ellipse cx="12" cy="18" rx="2.5" ry="4" fill={color} fillOpacity="0.7" />
          <ellipse cx="6" cy="12" rx="4" ry="2.5" fill={color} fillOpacity="0.7" />
          <ellipse cx="18" cy="12" rx="4" ry="2.5" fill={color} fillOpacity="0.7" />
          <ellipse cx="7.76" cy="7.76" rx="2.5" ry="4" transform="rotate(-45 7.76 7.76)" fill={color} fillOpacity="0.5" />
          <ellipse cx="16.24" cy="16.24" rx="2.5" ry="4" transform="rotate(-45 16.24 16.24)" fill={color} fillOpacity="0.5" />
          <ellipse cx="16.24" cy="7.76" rx="2.5" ry="4" transform="rotate(45 16.24 7.76)" fill={color} fillOpacity="0.5" />
          <ellipse cx="7.76" cy="16.24" rx="2.5" ry="4" transform="rotate(45 7.76 16.24)" fill={color} fillOpacity="0.5" />
        </svg>
      );
    case 'star':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 2L14.09 8.26L21 9.27L16 14.14L17.18 21.02L12 17.77L6.82 21.02L8 14.14L3 9.27L9.91 8.26L12 2Z"
            fill={color}
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="2" />
        </svg>
      );
  }
};

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({
  earnedBadgeIds,
  showLocked = false,
  size = 'md',
  onBadgeClick,
}) => {
  const sizeMap = {
    sm: { icon: 24, container: 'w-12 h-12' },
    md: { icon: 32, container: 'w-16 h-16' },
    lg: { icon: 48, container: 'w-24 h-24' },
  };

  const badgesToShow = showLocked
    ? BADGE_DEFINITIONS
    : BADGE_DEFINITIONS.filter(b => earnedBadgeIds.includes(b.id));

  if (badgesToShow.length === 0 && !showLocked) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {badgesToShow.map((badge) => {
        const isEarned = earnedBadgeIds.includes(badge.id);
        
        return (
          <button
            key={badge.id}
            onClick={() => onBadgeClick?.(badge)}
            disabled={!onBadgeClick}
            className={`
              ${sizeMap[size].container}
              rounded-full flex items-center justify-center
              transition-all duration-300
              ${isEarned 
                ? `${badge.bgColor} shadow-lg hover:scale-110 cursor-pointer` 
                : 'bg-gray-100 opacity-40 cursor-default'
              }
              ${onBadgeClick && isEarned ? 'hover:shadow-xl' : ''}
            `}
            title={isEarned ? badge.name : `${badge.name} - ${badge.description}`}
          >
            <BadgeIcon
              type={badge.icon}
              color={isEarned ? badge.color : '#9CA3AF'}
              size={sizeMap[size].icon}
            />
          </button>
        );
      })}
    </div>
  );
};

export default BadgeDisplay;

// Badge unlock notification component
export const BadgeUnlockNotification: React.FC<{
  badge: BadgeDefinition;
  onClose: () => void;
}> = ({ badge, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[100] animate-fadeIn">
      <div className="bg-white rounded-3xl p-8 max-w-sm mx-4 text-center shadow-2xl animate-bounceIn">
        {/* Confetti effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-confetti"
              style={{
                backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][i % 5],
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>

        {/* Badge */}
        <div className={`w-24 h-24 mx-auto rounded-full ${badge.bgColor} flex items-center justify-center mb-4 shadow-lg`}>
          <BadgeIcon type={badge.icon} color={badge.color} size={56} />
        </div>

        {/* Text */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          New Badge!
        </h2>
        <p className="text-xl font-semibold mb-2" style={{ color: badge.color }}>
          {badge.name}
        </p>
        <p className="text-gray-600 mb-4">
          {badge.description}
        </p>

        {/* Unlocked colors preview */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">New colors unlocked!</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {badge.unlockedColors.slice(0, 6).map((color, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full border-2 border-white shadow"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          Yay!
        </button>
      </div>
    </div>
  );
};

// Streak display component
export const StreakDisplay: React.FC<{
  currentStreak: number;
  nextBadgeAt?: number;
}> = ({ currentStreak, nextBadgeAt }) => {
  const progress = nextBadgeAt ? (currentStreak / nextBadgeAt) * 100 : 100;

  return (
    <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-bold text-gray-800">
            {currentStreak} Day{currentStreak !== 1 ? 's' : ''} Streak!
          </p>
          {nextBadgeAt && currentStreak < nextBadgeAt && (
            <div className="mt-1">
              <div className="h-2 bg-white rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {nextBadgeAt - currentStreak} more day{nextBadgeAt - currentStreak !== 1 ? 's' : ''} until next badge!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
