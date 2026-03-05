import React, { useState, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Book, Grid3X3, Sparkles, Lock, Star, Trash2 } from 'lucide-react';
import {
  ALL_STICKERS,
  STICKER_THEMES,
  Sticker,
  EarnedSticker,
  PlacedSticker,
  getStickerById,
} from './stickerConfig';

interface StickerBookProps {
  onClose: () => void;
  earnedStickers: EarnedSticker[];
  placedStickers: PlacedSticker[];
  onPlaceSticker: (sticker: PlacedSticker) => void;
  onRemoveSticker: (stickerId: string, pageIndex: number) => void;
  childName?: string | null;
}

const StickerBook: React.FC<StickerBookProps> = ({
  onClose,
  earnedStickers,
  placedStickers,
  onPlaceSticker,
  onRemoveSticker,
  childName,
}) => {
  const [view, setView] = useState<'collection' | 'book'>('collection');
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [draggedSticker, setDraggedSticker] = useState<string | null>(null);
  const bookPageRef = useRef<HTMLDivElement>(null);

  const totalPages = 5;
  const earnedStickerIds = earnedStickers.map(s => s.stickerId);

  // Get stickers for current page
  const getPageStickers = (pageIndex: number) => {
    return placedStickers.filter(s => s.pageIndex === pageIndex);
  };

  // Handle placing a sticker on the book page
  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedSticker || !bookPageRef.current) return;

    const rect = bookPageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Check if this sticker is already placed on this page
    const existingOnPage = placedStickers.find(
      s => s.stickerId === selectedSticker && s.pageIndex === currentPage
    );

    if (!existingOnPage) {
      onPlaceSticker({
        stickerId: selectedSticker,
        pageIndex: currentPage,
        x: Math.max(5, Math.min(95, x)),
        y: Math.max(5, Math.min(95, y)),
        rotation: Math.random() * 20 - 10,
        scale: 0.8 + Math.random() * 0.4,
      });
    }

    setSelectedSticker(null);
  };

  // Get rarity color
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'ring-4 ring-yellow-400 shadow-yellow-200';
      case 'rare':
        return 'ring-2 ring-purple-400 shadow-purple-200';
      default:
        return 'ring-1 ring-gray-200';
    }
  };

  // Get rarity label
  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-yellow-400 text-yellow-900 text-[10px] font-bold rounded-full flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5" fill="currentColor" />
          </span>
        );
      case 'rare':
        return (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-purple-400 text-white text-[10px] font-bold rounded-full">
            <Sparkles className="w-2.5 h-2.5" />
          </span>
        );
      default:
        return null;
    }
  };

  // Filter stickers by theme
  const filteredStickers = selectedTheme
    ? ALL_STICKERS.filter(s => s.theme === selectedTheme)
    : ALL_STICKERS;

  // Count earned stickers by theme
  const getThemeProgress = (theme: string) => {
    const themeStickers = ALL_STICKERS.filter(s => s.theme === theme);
    const earned = themeStickers.filter(s => earnedStickerIds.includes(s.id)).length;
    return { earned, total: themeStickers.length };
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-pink-100 via-purple-50 to-blue-100 z-50 overflow-hidden">
      {/* Header */}
      <header className="relative z-10 px-4 py-4 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800 font-rounded">
                {childName ? `${childName}'s Sticker Book` : 'My Sticker Book'}
              </h1>
              <p className="text-sm text-gray-500">
                {earnedStickerIds.length} of {ALL_STICKERS.length} stickers collected
              </p>
            </div>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setView('collection')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                view === 'collection'
                  ? 'bg-white shadow-sm text-purple-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Collection</span>
            </button>
            <button
              onClick={() => setView('book')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                view === 'book'
                  ? 'bg-white shadow-sm text-purple-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Book className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">My Book</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 h-[calc(100vh-80px)] overflow-y-auto">
        {view === 'collection' ? (
          <div className="max-w-6xl mx-auto px-4 py-6">
            {/* Theme filters */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={() => setSelectedTheme(null)}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                  selectedTheme === null
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50 shadow'
                }`}
              >
                All ({earnedStickerIds.length}/{ALL_STICKERS.length})
              </button>
              {STICKER_THEMES.map(theme => {
                const progress = getThemeProgress(theme.id);
                return (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`px-4 py-2 rounded-full font-medium text-sm transition-all flex items-center gap-2 ${
                      selectedTheme === theme.id
                        ? 'bg-purple-500 text-white shadow-lg'
                        : `${theme.color} shadow hover:shadow-md`
                    }`}
                  >
                    <span>{theme.icon}</span>
                    <span>{theme.name}</span>
                    <span className="text-xs opacity-75">
                      ({progress.earned}/{progress.total})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="mb-6 bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Collection Progress</span>
                <span className="text-sm font-bold text-purple-600">
                  {Math.round((earnedStickerIds.length / ALL_STICKERS.length) * 100)}%
                </span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-500"
                  style={{ width: `${(earnedStickerIds.length / ALL_STICKERS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Sticker grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {filteredStickers.map(sticker => {
                const isEarned = earnedStickerIds.includes(sticker.id);
                const earnedInfo = earnedStickers.find(e => e.stickerId === sticker.id);

                return (
                  <div
                    key={sticker.id}
                    className={`relative group ${
                      isEarned ? 'cursor-pointer' : 'cursor-not-allowed'
                    }`}
                    onClick={() => {
                      if (isEarned) {
                        setSelectedSticker(sticker.id);
                        setView('book');
                      }
                    }}
                  >
                    <div
                      className={`aspect-square rounded-2xl overflow-hidden shadow-lg transition-all duration-300 ${
                        isEarned
                          ? `${getRarityColor(sticker.rarity)} hover:scale-110 hover:shadow-xl`
                          : 'grayscale opacity-50'
                      }`}
                    >
                      <img
                        src={sticker.image}
                        alt={sticker.name}
                        className="w-full h-full object-cover"
                      />
                      {!isEarned && (
                        <div className="absolute inset-0 bg-gray-900/40 flex items-center justify-center">
                          <Lock className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                    {isEarned && getRarityLabel(sticker.rarity)}
                    <p
                      className={`mt-2 text-xs font-medium text-center truncate ${
                        isEarned ? 'text-gray-700' : 'text-gray-400'
                      }`}
                    >
                      {sticker.name}
                    </p>
                    {isEarned && earnedInfo && (
                      <p className="text-[10px] text-center text-gray-400">
                        {new Date(earnedInfo.earnedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Empty state */}
            {earnedStickerIds.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Start Collecting!</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Complete breathing exercises, journal entries, and calming activities to earn
                  stickers for your collection!
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto px-4 py-6">
            {/* Selected sticker indicator */}
            {selectedSticker && (
              <div className="mb-4 bg-yellow-100 rounded-xl p-3 flex items-center gap-3">
                <img
                  src={getStickerById(selectedSticker)?.image}
                  alt=""
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800">
                    Tap anywhere on the page to place your sticker!
                  </p>
                  <p className="text-xs text-yellow-600">
                    {getStickerById(selectedSticker)?.name}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSticker(null)}
                  className="p-2 hover:bg-yellow-200 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-yellow-700" />
                </button>
              </div>
            )}

            {/* Book page */}
            <div className="relative">
              {/* Page navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="text-sm font-medium hidden sm:inline">Previous</span>
                </button>
                <span className="text-sm font-medium text-gray-600">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-sm font-medium hidden sm:inline">Next</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* The book page */}
              <div
                ref={bookPageRef}
                onClick={handlePageClick}
                className={`relative aspect-[4/3] bg-white rounded-3xl shadow-2xl overflow-hidden ${
                  selectedSticker ? 'cursor-crosshair ring-4 ring-yellow-300' : ''
                }`}
                style={{
                  backgroundImage: `
                    linear-gradient(90deg, transparent 79px, #abced4 79px, #abced4 81px, transparent 81px),
                    linear-gradient(#eee .1em, transparent .1em)
                  `,
                  backgroundSize: '100% 1.2em',
                }}
              >
                {/* Page decoration */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-medium">
                    {childName ? `${childName}'s` : 'My'} Sticker Page
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>

                {/* Placed stickers */}
                {getPageStickers(currentPage).map((placed, index) => {
                  const sticker = getStickerById(placed.stickerId);
                  if (!sticker) return null;

                  return (
                    <div
                      key={`${placed.stickerId}-${index}`}
                      className="absolute group"
                      style={{
                        left: `${placed.x}%`,
                        top: `${placed.y}%`,
                        transform: `translate(-50%, -50%) rotate(${placed.rotation}deg) scale(${placed.scale})`,
                      }}
                    >
                      <img
                        src={sticker.image}
                        alt={sticker.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                        draggable={false}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveSticker(placed.stickerId, currentPage);
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}

                {/* Empty page hint */}
                {getPageStickers(currentPage).length === 0 && !selectedSticker && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-gray-300">
                      <Book className="w-16 h-16 mx-auto mb-2" />
                      <p className="text-sm">
                        Select a sticker from your collection to place it here!
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick sticker picker */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-600 mb-3">
                  Quick Pick - Your Stickers
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {earnedStickers.map(earned => {
                    const sticker = getStickerById(earned.stickerId);
                    if (!sticker) return null;

                    return (
                      <button
                        key={earned.stickerId}
                        onClick={() => setSelectedSticker(earned.stickerId)}
                        className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden shadow transition-all ${
                          selectedSticker === earned.stickerId
                            ? 'ring-4 ring-yellow-400 scale-110'
                            : 'hover:scale-105'
                        }`}
                      >
                        <img
                          src={sticker.image}
                          alt={sticker.name}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                  {earnedStickers.length === 0 && (
                    <p className="text-sm text-gray-400 py-4">
                      Complete activities to earn stickers!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StickerBook;
