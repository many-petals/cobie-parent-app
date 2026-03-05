import React from 'react';
import MoodButton from './MoodButton';
import { Settings, Cloud, CloudOff, BookOpen, Award, Moon, Pocket, Sparkles, Gamepad2, Crown, ShoppingBag } from 'lucide-react';

interface HomeScreenProps {
  onSelectMood: (moodId: string) => void;
  onOpenGarden: () => void;
  onOpenParentMode: () => void;
  onOpenJournal: () => void;
  onOpenQuietCorner: () => void;
  onOpenWorryPocket: () => void;
  onOpenStickerBook: () => void;
  onOpenFunZone: () => void;
  onOpenPremium?: () => void;
  onOpenStore?: () => void;
  petalsCount: number;
  isLoggedIn?: boolean;
  isPremium?: boolean;
  onOpenAuth?: () => void;
  childName?: string | null;
  badgeCount?: number;
  currentStreak?: number;
  worryCount?: number;
  stickerCount?: number;
}


const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectMood,
  onOpenGarden,
  onOpenParentMode,
  onOpenJournal,
  onOpenQuietCorner,
  onOpenWorryPocket,
  onOpenStickerBook,
  onOpenFunZone,
  onOpenPremium,
  onOpenStore,
  petalsCount,
  isLoggedIn = false,
  isPremium = false,
  onOpenAuth,
  childName,
  badgeCount = 0,
  currentStreak = 0,
  worryCount = 0,
  stickerCount = 0,
}) => {




  const moods = [
    {
      id: 'too-noisy',
      label: 'Too Noisy',
      sublabel: 'Too Much',
      character: 'Cobie',
      characterImage: 'https://d64gsuwffb70l.cloudfront.net/6942a5c631a68cd8823490d2_1766413386700_7aa124ca.png',


      color: 'text-green-700',
      bgColor: 'bg-green-100 hover:bg-green-200',
    },
    {
      id: 'worried',
      label: 'Worried',
      sublabel: 'Tummy',
      character: 'Tree',
      characterImage: 'https://d64gsuwffb70l.cloudfront.net/69357762fff8f7f4abcd8985_1765975725971_e2da54c5.jpeg',
      color: 'text-amber-700',
      bgColor: 'bg-amber-100 hover:bg-amber-200',
    },
    {
      id: 'cross',
      label: 'Cross',
      sublabel: 'and Fizzy',
      character: 'Tilda',
      characterImage: 'https://d64gsuwffb70l.cloudfront.net/69357762fff8f7f4abcd8985_1765975726826_0beec93f.jpeg',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100 hover:bg-yellow-200',
    },
    {
      id: 'sad',
      label: 'Sad',
      sublabel: 'and Small',
      character: 'Livleen',
      characterImage: 'https://d64gsuwffb70l.cloudfront.net/69357762fff8f7f4abcd8985_1765975729555_36acf577.jpeg',
      color: 'text-pink-700',
      bgColor: 'bg-pink-100 hover:bg-pink-200',
    },
    {
      id: 'shy',
      label: 'Shy',
      sublabel: 'and Stuck',
      character: 'Harper',
      characterImage: 'https://d64gsuwffb70l.cloudfront.net/69357762fff8f7f4abcd8985_1765975728735_367c8d09.jpeg',
      color: 'text-purple-700',
      bgColor: 'bg-purple-100 hover:bg-purple-200',
    },
    {
      id: 'mine',
      label: 'Mine',
      sublabel: 'for Now',
      character: 'Dulcy',
      characterImage: 'https://d64gsuwffb70l.cloudfront.net/69357762fff8f7f4abcd8985_1765975729135_7fcfd120.jpeg',
      color: 'text-gray-700',
      bgColor: 'bg-gray-100 hover:bg-gray-200',
    },
  ];


  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-green-50 to-green-100 relative">
      {/* Background image */}
      <div 
        className="fixed inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'url(https://d64gsuwffb70l.cloudfront.net/6942a5c631a68cd8823490d2_1765976570055_39870a6a.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
        }}
      />

      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-green-200/30 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-40 h-40 bg-pink-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-1/4 w-48 h-48 bg-yellow-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/3 w-36 h-36 bg-purple-200/30 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg overflow-hidden">
              <img 
                src="https://d64gsuwffb70l.cloudfront.net/69357762fff8f7f4abcd8985_1766001587793_82b1f0df.png" 
                alt="Many Petals Books Logo" 
                className="w-12 h-12 object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 font-rounded">Many Petals</h1>
              <p className="text-sm text-gray-500">Calm Garden Moments</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cloud sync indicator / Sign in button */}
            {isLoggedIn ? (
              <div className="flex items-center gap-1 px-3 py-1.5 bg-green-100 rounded-full">
                <Cloud className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-700 font-medium hidden sm:inline">Synced</span>
              </div>
            ) : onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-gray-600 hover:text-gray-800"
              >
                <CloudOff className="w-4 h-4" />
                <span className="text-xs font-medium hidden sm:inline">Sign in</span>
              </button>
            )}

            {/* Journal button with streak indicator */}
            <button
              onClick={onOpenJournal}
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 rounded-full shadow-sm hover:shadow-md transition-all text-purple-700"
            >
              <BookOpen className="w-5 h-5" />
              <span className="font-medium text-sm hidden sm:inline">Journal</span>
              {currentStreak > 0 && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-orange-500 rounded-full">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  </svg>
                  <span className="text-white text-xs font-bold">{currentStreak}</span>
                </div>
              )}
            </button>
            
            {/* Sticker Book button */}
            <button
              onClick={onOpenStickerBook}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-100 to-purple-100 hover:from-pink-200 hover:to-purple-200 rounded-full shadow-sm hover:shadow-md transition-all text-pink-700"
            >
              <Sparkles className="w-5 h-5" />
              <span className="font-medium text-sm hidden sm:inline">Stickers</span>
              {stickerCount > 0 && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-pink-500 rounded-full">
                  <span className="text-white text-xs font-bold">{stickerCount}</span>
                </div>
              )}
            </button>
            
            {/* Garden button with badge count */}
            <button
              onClick={onOpenGarden}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-gray-700"
            >
              <div className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center">
                <span className="text-white text-xs font-bold">{petalsCount}</span>
              </div>
              <span className="font-medium text-sm hidden sm:inline">My Garden</span>
              {badgeCount > 0 && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-yellow-500 rounded-full">
                  <Award className="w-3 h-3 text-white" />
                  <span className="text-white text-xs font-bold">{badgeCount}</span>
                </div>
              )}
            </button>


            {/* Parent settings button */}
            <button
              onClick={onOpenParentMode}
              className="p-3 bg-white rounded-full shadow-sm hover:shadow-md transition-all"
              aria-label="Parent settings"
            >
              <Settings className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome message */}
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 font-rounded mb-3">
              {childName ? `Hi ${childName}!` : 'How are you feeling?'}
            </h2>
            <p className="text-lg text-gray-600 font-rounded">
              {childName ? 'How are you feeling today?' : 'Tap the one that feels right'}
            </p>
          </div>

          {/* Quick access buttons - Quiet Corner and Worry Pocket */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            {/* Quiet Corner button */}
            <button
              onClick={onOpenQuietCorner}
              className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <Moon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-bold text-lg">Quiet Corner</div>
                <div className="text-sm text-white/80">A calm space just for you</div>
              </div>
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Worry Pocket button */}
            <button
              onClick={onOpenWorryPocket}
              className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <div className="relative w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <Pocket className="w-5 h-5" />
                {worryCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full flex items-center justify-center">
                    {worryCount}
                  </span>
                )}
              </div>
              <div className="text-left">
                <div className="font-bold text-lg">Worry Pocket</div>
                <div className="text-sm text-white/80">Put your worries away</div>
              </div>
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Fun Zone button */}
            <button
              onClick={onOpenFunZone}
              className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-bold text-lg">Fun Zone</div>
                <div className="text-sm text-white/80">Play fun mini-games!</div>
              </div>
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>


          {/* Mood buttons grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto">
            {moods.map((mood) => (
              <MoodButton
                key={mood.id}
                mood={mood.id}
                label={`${mood.label} ${mood.sublabel}`}
                character={mood.character}
                characterImage={mood.characterImage}
                color={mood.color}
                bgColor={mood.bgColor}
                onClick={() => onSelectMood(mood.id)}
              />
            ))}
          </div>

          {/* Helpful tip or sign in prompt */}
          <div className="mt-12 max-w-md mx-auto">
            {!isLoggedIn ? (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Cloud className="w-5 h-5 text-green-500" />
                  <span className="font-semibold text-gray-700">Save your progress</span>
                </div>
                <p className="text-gray-600 font-rounded text-sm mb-3">
                  Sign in to sync your garden across all your devices
                </p>
                {onOpenAuth && (
                  <button
                    onClick={onOpenAuth}
                    className="px-6 py-2 bg-green-500 text-white rounded-full font-medium text-sm hover:bg-green-600 transition-colors"
                  >
                    Create Free Account
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center">
                <p className="text-gray-600 font-rounded">
                  <span className="font-semibold text-gray-700">Tip for grown-ups:</span>
                  <br />
                  Sit with your child during their first few paths.
                  <br />
                  Your calm presence helps them learn.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Decorative grass at bottom */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-green-200 to-transparent pointer-events-none" />
    </div>
  );
};

export default HomeScreen;
