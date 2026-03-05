import React, { useEffect, useState } from 'react';
import { Sparkles, Star, X } from 'lucide-react';
import { Sticker, getStickerById } from './stickerConfig';

interface StickerRewardModalProps {
  stickerId: string;
  earnedFrom: string;
  onClose: () => void;
  onViewCollection: () => void;
}

const StickerRewardModal: React.FC<StickerRewardModalProps> = ({
  stickerId,
  earnedFrom,
  onClose,
  onViewCollection,
}) => {
  const [showSticker, setShowSticker] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const sticker = getStickerById(stickerId);

  useEffect(() => {
    // Animate the sticker appearing
    const timer1 = setTimeout(() => setShowConfetti(true), 100);
    const timer2 = setTimeout(() => setShowSticker(true), 300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  if (!sticker) return null;

  const getEarnedMessage = () => {
    switch (earnedFrom) {
      case 'breathing':
        return 'for completing a breathing exercise!';
      case 'journaling':
        return 'for writing in your journal!';
      case 'coping':
        return 'for using a coping tool!';
      case 'path':
        return 'for completing a calming path!';
      case 'streak':
        return 'for your amazing streak!';
      default:
        return 'for being awesome!';
    }
  };

  const getRarityGlow = () => {
    switch (sticker.rarity) {
      case 'legendary':
        return 'shadow-[0_0_60px_rgba(234,179,8,0.6)]';
      case 'rare':
        return 'shadow-[0_0_40px_rgba(168,85,247,0.5)]';
      default:
        return 'shadow-[0_0_30px_rgba(59,130,246,0.4)]';
    }
  };

  const getRarityBadge = () => {
    switch (sticker.rarity) {
      case 'legendary':
        return (
          <div className="flex items-center gap-1 px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-sm font-bold">
            <Star className="w-4 h-4" fill="currentColor" />
            Legendary!
          </div>
        );
      case 'rare':
        return (
          <div className="flex items-center gap-1 px-3 py-1 bg-purple-400 text-white rounded-full text-sm font-bold">
            <Sparkles className="w-4 h-4" />
            Rare!
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Confetti effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-20px',
                backgroundColor: ['#f472b6', '#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f87171'][
                  Math.floor(Math.random() * 6)
                ],
                borderRadius: Math.random() > 0.5 ? '50%' : '0',
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Modal content */}
      <div
        className={`relative bg-gradient-to-b from-white to-purple-50 rounded-3xl p-8 max-w-sm w-full transform transition-all duration-500 ${
          showSticker ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-800 font-rounded">
              New Sticker!
            </h2>
            <Sparkles className="w-6 h-6 text-yellow-500" />
          </div>
          <p className="text-gray-600">You earned this {getEarnedMessage()}</p>
        </div>

        {/* Sticker display */}
        <div className="flex flex-col items-center mb-6">
          <div
            className={`relative w-40 h-40 rounded-3xl overflow-hidden ${getRarityGlow()} transform hover:scale-105 transition-transform`}
          >
            <img
              src={sticker.image}
              alt={sticker.name}
              className="w-full h-full object-cover"
            />
            {sticker.rarity === 'legendary' && (
              <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/30 to-transparent" />
            )}
          </div>
          <h3 className="mt-4 text-xl font-bold text-gray-800">{sticker.name}</h3>
          <div className="mt-2">{getRarityBadge()}</div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onViewCollection}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
          >
            View My Collection
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Keep Going
          </button>
        </div>
      </div>

      {/* CSS for confetti animation */}
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
      `}</style>
    </div>
  );
};

export default StickerRewardModal;
