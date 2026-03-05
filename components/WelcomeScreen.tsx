import React, { useState, useEffect } from 'react';
import { Heart, Sparkles } from 'lucide-react';
interface WelcomeScreenProps {
  onStart: () => void;
}
const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStart
}) => {
  const [showContent, setShowContent] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, []);
  const characters = [{
    name: 'Cobie',
    image: 'https://d64gsuwffb70l.cloudfront.net/6942a5c631a68cd8823490d2_1766413386700_7aa124ca.png',

    color: 'bg-green-100'
  }, {
    name: 'Tree',
    image: 'https://d64gsuwffb70l.cloudfront.net/69357762fff8f7f4abcd8985_1765975725971_e2da54c5.jpeg',
    color: 'bg-amber-100'
  }, {
    name: 'Tilda',
    image: 'https://d64gsuwffb70l.cloudfront.net/69357762fff8f7f4abcd8985_1765975726826_0beec93f.jpeg',
    color: 'bg-yellow-100'
  }, {
    name: 'Harper',
    image: 'https://d64gsuwffb70l.cloudfront.net/69357762fff8f7f4abcd8985_1765975728735_367c8d09.jpeg',
    color: 'bg-purple-100'
  }, {
    name: 'Dulcy',
    image: 'https://d64gsuwffb70l.cloudfront.net/69357762fff8f7f4abcd8985_1765975729135_7fcfd120.jpeg',
    color: 'bg-gray-100'
  }, {
    name: 'Livleen',
    image: 'https://d64gsuwffb70l.cloudfront.net/69357762fff8f7f4abcd8985_1765975729555_36acf577.jpeg',
    color: 'bg-pink-100'
  }];
  return <div className="min-h-screen bg-gradient-to-b from-sky-100 via-green-50 to-green-100 flex flex-col items-center justify-center p-6">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-40 h-40 bg-green-200/40 rounded-full blur-3xl animate-float" />
        <div className="absolute top-20 right-10 w-32 h-32 bg-pink-200/40 rounded-full blur-3xl animate-float" style={{
        animationDelay: '1s'
      }} />
        <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-yellow-200/40 rounded-full blur-3xl animate-float" style={{
        animationDelay: '2s'
      }} />
      </div>

      <div className={`relative z-10 text-center transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center shadow-xl overflow-hidden">
            <img src="https://d64gsuwffb70l.cloudfront.net/69357762fff8f7f4abcd8985_1766001587793_82b1f0df.png" alt="Many Petals Books Logo" className="w-16 h-16 object-contain" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 font-rounded mb-3">
          Many Petals
        </h1>
        <p className="text-xl text-gray-600 font-rounded mb-8">
          Calm Garden Moments
        </p>

        {/* Character parade */}
        <div className="flex justify-center gap-2 mb-8">
          {characters.map((char, index) => <div key={char.name} className={`w-14 h-14 rounded-full ${char.color} overflow-hidden shadow-md transition-transform duration-500 hover:scale-110`} style={{
          animationDelay: `${index * 0.1}s`
        }}>
              <img src={char.image} alt={char.name} className="w-full h-full object-contain" />
            </div>)}
        </div>


        {/* Description */}
        <div className="max-w-md mx-auto mb-8">
          <p className="text-gray-600 font-rounded leading-relaxed">
            Meet your garden friends! They'll help you
            <br />
            <span className="inline-flex items-center gap-1">
              <Heart className="w-4 h-4 text-pink-500" />
              name your feelings
            </span>
            <br />
            <span className="inline-flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              calm your body
            </span>
            <br />
            and find kind next steps.
          </p>
        </div>

        {/* Start button */}
        <button onClick={onStart} className="px-10 py-4 bg-green-500 text-white font-rounded font-bold text-xl rounded-full shadow-xl hover:bg-green-600 hover:scale-105 transition-all duration-300">
          Let's Begin
        </button>

        {/* Age indicator */}
        <p className="mt-6 text-sm text-gray-400 font-rounded">
          For ages 3-7 • Best with a grown-up
        </p>
      </div>
    </div>;
};
export default WelcomeScreen;