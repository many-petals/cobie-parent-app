import React, { useState, useEffect } from 'react';
import { X, Wind, Heart, Users, Sparkles, Moon, Palette, Music, Star, ChevronRight, Check, ThumbsUp, ThumbsDown, TrendingUp, Lightbulb, Zap, Clock } from 'lucide-react';

// Coping tool types
export interface CopingTool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'quick' | 'guided' | 'connection' | 'creative';
  minIntensity: number;
  maxIntensity: number;
  duration: string;
  steps?: string[];
  linkTo?: 'breathing' | 'quiet-corner' | 'drawing' | 'journal';
}

export interface CopingToolUsage {
  toolId: string;
  worryId: string;
  usedAt: string;
  helpful: boolean | null;
  intensity: number;
}

interface CopingToolboxProps {
  intensity: number;
  worryId?: string;
  onSelectTool?: (tool: CopingTool) => void;
  onNavigate?: (destination: 'breathing' | 'quiet-corner' | 'drawing' | 'journal') => void;
  onClose?: () => void;
  toolUsage?: CopingToolUsage[];
  onRecordUsage?: (usage: Omit<CopingToolUsage, 'usedAt'>) => void;
  childName?: string | null;
}

// Define all coping tools
const copingTools: CopingTool[] = [
  // Quick tools for tiny/small worries (intensity 1-2)
  {
    id: 'belly-breaths',
    name: 'Belly Breaths',
    description: 'Take 3 slow, deep breaths to feel calm',
    icon: <Wind className="w-6 h-6" />,
    category: 'quick',
    minIntensity: 1,
    maxIntensity: 3,
    duration: '30 seconds',
    steps: [
      'Put your hand on your tummy',
      'Breathe in slowly through your nose',
      'Feel your tummy get bigger like a balloon',
      'Breathe out slowly through your mouth',
      'Do this 3 times',
    ],
  },
  {
    id: 'shake-it-out',
    name: 'Shake It Out',
    description: 'Wiggle and shake your body to release worry energy',
    icon: <Zap className="w-6 h-6" />,
    category: 'quick',
    minIntensity: 1,
    maxIntensity: 3,
    duration: '1 minute',
    steps: [
      'Stand up and shake your hands',
      'Shake your arms like noodles',
      'Wiggle your whole body',
      'Jump up and down 5 times',
      'Take a deep breath and feel lighter!',
    ],
  },
  {
    id: 'five-senses',
    name: '5 Senses Check',
    description: 'Notice 5 things you can see, hear, touch, smell, or taste',
    icon: <Star className="w-6 h-6" />,
    category: 'quick',
    minIntensity: 1,
    maxIntensity: 4,
    duration: '2 minutes',
    steps: [
      'Name 5 things you can SEE',
      'Name 4 things you can TOUCH',
      'Name 3 things you can HEAR',
      'Name 2 things you can SMELL',
      'Name 1 thing you can TASTE',
    ],
  },
  {
    id: 'positive-thought',
    name: 'Helpful Thought',
    description: 'Think of something that makes you smile',
    icon: <Lightbulb className="w-6 h-6" />,
    category: 'quick',
    minIntensity: 1,
    maxIntensity: 2,
    duration: '1 minute',
    steps: [
      'Close your eyes',
      'Think of your favorite place',
      'Remember a happy memory',
      'Think of someone who loves you',
      'Smile and feel the warmth',
    ],
  },

  // Guided exercises for medium worries (intensity 3)
  {
    id: 'breathing-exercise',
    name: 'Breathing Bubble',
    description: 'A guided breathing exercise with calming visuals',
    icon: <Wind className="w-6 h-6" />,
    category: 'guided',
    minIntensity: 2,
    maxIntensity: 4,
    duration: '3-5 minutes',
    linkTo: 'breathing',
  },
  {
    id: 'quiet-corner',
    name: 'Quiet Corner',
    description: 'A peaceful space with calming sounds and activities',
    icon: <Moon className="w-6 h-6" />,
    category: 'guided',
    minIntensity: 2,
    maxIntensity: 5,
    duration: '5-10 minutes',
    linkTo: 'quiet-corner',
  },
  {
    id: 'draw-worry',
    name: 'Draw Your Worry',
    description: 'Express your feelings through art',
    icon: <Palette className="w-6 h-6" />,
    category: 'creative',
    minIntensity: 1,
    maxIntensity: 4,
    duration: '5-10 minutes',
    linkTo: 'drawing',
  },
  {
    id: 'journal-feelings',
    name: 'Feelings Journal',
    description: 'Write or draw about how you feel',
    icon: <Music className="w-6 h-6" />,
    category: 'creative',
    minIntensity: 2,
    maxIntensity: 4,
    duration: '5-10 minutes',
    linkTo: 'journal',
  },

  // Connection tools for big/huge worries (intensity 4-5)
  {
    id: 'find-grownup',
    name: 'Find a Grown-Up',
    description: 'Talk to a parent, teacher, or trusted adult',
    icon: <Users className="w-6 h-6" />,
    category: 'connection',
    minIntensity: 3,
    maxIntensity: 5,
    duration: 'As long as needed',
    steps: [
      'Find a grown-up you trust',
      'Say "I need to talk about something"',
      'Share how you\'re feeling',
      'Let them help you',
      'Remember: asking for help is brave!',
    ],
  },
  {
    id: 'comfort-hug',
    name: 'Comfort Hug',
    description: 'Give yourself a big, warm hug',
    icon: <Heart className="w-6 h-6" />,
    category: 'connection',
    minIntensity: 3,
    maxIntensity: 5,
    duration: '1 minute',
    steps: [
      'Wrap your arms around yourself',
      'Give yourself a gentle squeeze',
      'Say "I am safe, I am loved"',
      'Take 3 slow breaths',
      'Feel the comfort of your own hug',
    ],
  },
  {
    id: 'safe-place',
    name: 'Safe Place Imagination',
    description: 'Imagine your favorite safe and cozy place',
    icon: <Sparkles className="w-6 h-6" />,
    category: 'guided',
    minIntensity: 3,
    maxIntensity: 5,
    duration: '3-5 minutes',
    steps: [
      'Close your eyes',
      'Imagine your favorite safe place',
      'What do you see there?',
      'What sounds do you hear?',
      'Feel how calm and safe you are',
      'Stay there as long as you need',
    ],
  },
];

// Get intensity label and color
const getIntensityInfo = (intensity: number) => {
  const levels = [
    { label: 'Tiny', color: 'bg-green-100 text-green-700', bgColor: 'bg-green-500' },
    { label: 'Small', color: 'bg-lime-100 text-lime-700', bgColor: 'bg-lime-500' },
    { label: 'Medium', color: 'bg-yellow-100 text-yellow-700', bgColor: 'bg-yellow-500' },
    { label: 'Big', color: 'bg-orange-100 text-orange-700', bgColor: 'bg-orange-500' },
    { label: 'Huge', color: 'bg-red-100 text-red-700', bgColor: 'bg-red-500' },
  ];
  return levels[Math.min(intensity - 1, 4)] || levels[2];
};

// Get category info
const getCategoryInfo = (category: CopingTool['category']) => {
  const categories = {
    quick: { label: 'Quick & Easy', color: 'bg-blue-100 text-blue-700', icon: <Zap className="w-4 h-4" /> },
    guided: { label: 'Guided Exercise', color: 'bg-purple-100 text-purple-700', icon: <Sparkles className="w-4 h-4" /> },
    connection: { label: 'Connect with Others', color: 'bg-pink-100 text-pink-700', icon: <Heart className="w-4 h-4" /> },
    creative: { label: 'Creative Expression', color: 'bg-teal-100 text-teal-700', icon: <Palette className="w-4 h-4" /> },
  };
  return categories[category];
};

// Tool Card Component
const ToolCard: React.FC<{
  tool: CopingTool;
  onSelect: () => void;
  effectiveness?: number;
  isRecommended?: boolean;
}> = ({ tool, onSelect, effectiveness, isRecommended }) => {
  const categoryInfo = getCategoryInfo(tool.category);

  return (
    <button
      onClick={onSelect}
      className={`w-full p-4 rounded-2xl border-2 text-left transition-all hover:shadow-md ${
        isRecommended 
          ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50' 
          : 'border-gray-200 bg-white hover:border-blue-300'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-xl ${categoryInfo.color}`}>
          {tool.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-800">{tool.name}</h4>
            {isRecommended && (
              <span className="px-2 py-0.5 bg-amber-200 text-amber-800 rounded-full text-xs font-medium">
                Recommended
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">{tool.description}</p>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {tool.duration}
            </span>
            {effectiveness !== undefined && effectiveness > 0 && (
              <span className="flex items-center gap-1 text-green-600">
                <ThumbsUp className="w-3 h-3" />
                {Math.round(effectiveness * 100)}% helpful
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
      </div>
    </button>
  );
};

// Tool Detail View
const ToolDetailView: React.FC<{
  tool: CopingTool;
  onBack: () => void;
  onComplete: (helpful: boolean) => void;
  onNavigate?: (destination: 'breathing' | 'quiet-corner' | 'drawing' | 'journal') => void;
}> = ({ tool, onBack, onComplete, onNavigate }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const categoryInfo = getCategoryInfo(tool.category);

  const handleNext = () => {
    if (tool.steps && currentStep < tool.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // If tool links to another feature
  if (tool.linkTo && onNavigate) {
    return (
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to tools
        </button>

        <div className="text-center py-8">
          <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl ${categoryInfo.color} flex items-center justify-center`}>
            <div className="scale-150">{tool.icon}</div>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">{tool.name}</h3>
          <p className="text-gray-600 mb-6">{tool.description}</p>

          <button
            onClick={() => onNavigate(tool.linkTo!)}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Go to {tool.name}
          </button>
        </div>
      </div>
    );
  }

  // Show completion feedback
  if (isComplete) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Great job!</h3>
          <p className="text-gray-600 mb-6">You completed the {tool.name} exercise.</p>

          <p className="text-sm text-gray-500 mb-4">Did this help you feel better?</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => onComplete(true)}
              className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-xl font-medium hover:bg-green-200 transition-colors"
            >
              <ThumbsUp className="w-5 h-5" />
              Yes, it helped!
            </button>
            <button
              onClick={() => onComplete(false)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              <ThumbsDown className="w-5 h-5" />
              Not really
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show step-by-step guide
  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ChevronRight className="w-4 h-4 rotate-180" />
        Back to tools
      </button>

      <div className="text-center">
        <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl ${categoryInfo.color} flex items-center justify-center`}>
          {tool.icon}
        </div>
        <h3 className="text-lg font-bold text-gray-800">{tool.name}</h3>
      </div>

      {tool.steps && (
        <>
          {/* Progress indicator */}
          <div className="flex gap-1">
            {tool.steps.map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1.5 rounded-full transition-colors ${
                  i <= currentStep ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Current step */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 min-h-[150px] flex items-center justify-center">
            <p className="text-lg text-center text-gray-800 font-medium">
              {tool.steps[currentStep]}
            </p>
          </div>

          {/* Step counter */}
          <p className="text-center text-sm text-gray-500">
            Step {currentStep + 1} of {tool.steps.length}
          </p>

          {/* Navigation buttons */}
          <div className="flex gap-3">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
            >
              {currentStep === tool.steps.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// Main Coping Toolbox Component
const CopingToolbox: React.FC<CopingToolboxProps> = ({
  intensity,
  worryId,
  onSelectTool,
  onNavigate,
  onClose,
  toolUsage = [],
  onRecordUsage,
  childName,
}) => {
  const [selectedTool, setSelectedTool] = useState<CopingTool | null>(null);
  const [showAll, setShowAll] = useState(false);

  const intensityInfo = getIntensityInfo(intensity);

  // Filter tools based on intensity
  const getRecommendedTools = () => {
    return copingTools.filter(
      tool => intensity >= tool.minIntensity && intensity <= tool.maxIntensity
    );
  };

  // Calculate effectiveness for each tool
  const getToolEffectiveness = (toolId: string) => {
    const usages = toolUsage.filter(u => u.toolId === toolId && u.helpful !== null);
    if (usages.length === 0) return undefined;
    const helpful = usages.filter(u => u.helpful).length;
    return helpful / usages.length;
  };

  // Get most effective tools based on past usage
  const getMostEffectiveTools = () => {
    const recommended = getRecommendedTools();
    return recommended.sort((a, b) => {
      const effA = getToolEffectiveness(a.id) || 0.5;
      const effB = getToolEffectiveness(b.id) || 0.5;
      return effB - effA;
    });
  };

  const recommendedTools = getMostEffectiveTools();
  const displayTools = showAll ? copingTools : recommendedTools;

  const handleToolComplete = (helpful: boolean) => {
    if (selectedTool && worryId && onRecordUsage) {
      onRecordUsage({
        toolId: selectedTool.id,
        worryId,
        helpful,
        intensity,
      });
    }
    setSelectedTool(null);
  };

  const handleToolSelect = (tool: CopingTool) => {
    setSelectedTool(tool);
    if (onSelectTool) {
      onSelectTool(tool);
    }
  };

  // If a tool is selected, show the detail view
  if (selectedTool) {
    return (
      <div className="p-6">
        <ToolDetailView
          tool={selectedTool}
          onBack={() => setSelectedTool(null)}
          onComplete={handleToolComplete}
          onNavigate={onNavigate}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Coping Toolbox</h2>
          <p className="text-sm text-gray-600">
            Tools to help {childName || 'you'} feel better
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Intensity indicator */}
      <div className={`rounded-2xl p-4 ${intensityInfo.color}`}>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i <= intensity ? intensityInfo.bgColor : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="font-medium">
            {intensityInfo.label} Worry
          </span>
        </div>
        <p className="text-sm mt-2 opacity-80">
          {intensity <= 2 && "Quick activities can help with smaller worries."}
          {intensity === 3 && "Try a guided exercise or creative activity."}
          {intensity >= 4 && "Big worries might need extra support. It's okay to ask for help!"}
        </p>
      </div>

      {/* Tool suggestions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            {showAll ? 'All Tools' : 'Recommended for You'}
          </h3>
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {showAll ? 'Show Recommended' : 'Show All'}
          </button>
        </div>

        <div className="space-y-3">
          {displayTools.map((tool, index) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              onSelect={() => handleToolSelect(tool)}
              effectiveness={getToolEffectiveness(tool.id)}
              isRecommended={!showAll && index === 0}
            />
          ))}
        </div>
      </div>

      {/* Tip section */}
      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800 text-sm">Tip</p>
            <p className="text-sm text-amber-700">
              {intensity <= 2 && "Try a quick tool first. If you still feel worried, try another one!"}
              {intensity === 3 && "Take your time with these exercises. There's no rush."}
              {intensity >= 4 && "Remember: it's always okay to ask a grown-up for help with big worries."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CopingToolbox;
