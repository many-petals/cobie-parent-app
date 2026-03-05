import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Calendar, Heart, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { getMoodAnalytics, MoodAnalytics } from '@/lib/familyService';

interface EmotionInsightsProps {
  familyId: string;
  childName?: string | null;
}

const MOOD_INFO: Record<string, { label: string; emoji: string; color: string }> = {
  happy: { label: 'Happy', emoji: '😊', color: 'bg-yellow-400' },
  calm: { label: 'Calm', emoji: '😌', color: 'bg-green-400' },
  excited: { label: 'Excited', emoji: '🤩', color: 'bg-orange-400' },
  tired: { label: 'Tired', emoji: '😴', color: 'bg-blue-400' },
  worried: { label: 'Worried', emoji: '😟', color: 'bg-purple-400' },
  sad: { label: 'Sad', emoji: '😢', color: 'bg-indigo-400' },
  angry: { label: 'Angry', emoji: '😠', color: 'bg-red-400' },
  shy: { label: 'Shy', emoji: '🙈', color: 'bg-pink-400' },
};

const PATH_INFO: Record<string, { label: string; color: string }> = {
  'too-noisy': { label: 'Quiet Corner', color: 'bg-green-500' },
  'worried': { label: 'Safe Roots', color: 'bg-amber-500' },
  'cross': { label: 'Cool-Down', color: 'bg-yellow-500' },
  'sad': { label: 'Gentle Lift', color: 'bg-pink-500' },
  'shy': { label: 'Brave Steps', color: 'bg-purple-500' },
  'mine': { label: 'Fair Turns', color: 'bg-gray-500' },
};

const EmotionInsights: React.FC<EmotionInsightsProps> = ({ familyId, childName }) => {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [analytics, setAnalytics] = useState<MoodAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDateRange = () => {
    const end = new Date(currentDate);
    const start = new Date(currentDate);
    
    if (viewMode === 'week') {
      start.setDate(end.getDate() - 6);
    } else {
      start.setDate(1);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
    }
    
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    };
  };

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);
      const { startDate, endDate } = getDateRange();
      const data = await getMoodAnalytics(familyId, startDate, endDate);
      setAnalytics(data);
      setIsLoading(false);
    };

    loadAnalytics();
  }, [familyId, viewMode, currentDate]);

  const navigatePeriod = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    
    // Don't allow future dates
    if (newDate <= new Date()) {
      setCurrentDate(newDate);
    }
  };

  const formatPeriodLabel = () => {
    if (viewMode === 'week') {
      const { startDate, endDate } = getDateRange();
      const start = new Date(startDate);
      const end = new Date(endDate);
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  const getMoodBarWidth = (count: number) => {
    if (!analytics) return 0;
    const maxCount = Math.max(...Object.values(analytics.moodCounts), 1);
    return (count / maxCount) * 100;
  };

  const getPathBarWidth = (count: number) => {
    if (!analytics) return 0;
    const maxCount = Math.max(...Object.values(analytics.pathCounts), 1);
    return (count / maxCount) * 100;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hasData = analytics && (analytics.totalJournalEntries > 0 || analytics.totalSessions > 0);

  return (
    <div className="space-y-6">
      {/* Header with view toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            Emotion Insights
          </h3>
          <p className="text-sm text-gray-500">
            {childName ? `${childName}'s emotional patterns` : 'Emotional patterns over time'}
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setViewMode('week')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'week'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'month'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Period navigation */}
      <div className="flex items-center justify-between bg-purple-50 rounded-xl p-3">
        <button
          onClick={() => navigatePeriod('prev')}
          className="p-2 rounded-lg hover:bg-purple-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-purple-600" />
        </button>
        <span className="font-medium text-purple-800">{formatPeriodLabel()}</span>
        <button
          onClick={() => navigatePeriod('next')}
          disabled={currentDate >= new Date()}
          className="p-2 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-30"
        >
          <ChevronRight className="w-5 h-5 text-purple-600" />
        </button>
      </div>

      {!hasData ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No data for this period</p>
          <p className="text-sm text-gray-400 mt-1">
            Journal entries and Petal Path sessions will appear here
          </p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Journal Entries</span>
              </div>
              <p className="text-3xl font-bold text-purple-700">{analytics?.totalJournalEntries || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-teal-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Petal Paths</span>
              </div>
              <p className="text-3xl font-bold text-green-700">{analytics?.totalSessions || 0}</p>
            </div>
          </div>

          {/* Most frequent mood */}
          {analytics?.mostFrequentMood && MOOD_INFO[analytics.mostFrequentMood] && (
            <div className="bg-amber-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-amber-600" />
                <span className="font-medium text-amber-800">Most Frequent Mood</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{MOOD_INFO[analytics.mostFrequentMood].emoji}</span>
                <div>
                  <p className="font-bold text-gray-800">{MOOD_INFO[analytics.mostFrequentMood].label}</p>
                  <p className="text-sm text-gray-500">
                    Recorded {analytics.moodCounts[analytics.mostFrequentMood]} times
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Most helpful path */}
          {analytics?.mostHelpfulPath && PATH_INFO[analytics.mostHelpfulPath] && (
            <div className="bg-green-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Most Used Path</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${PATH_INFO[analytics.mostHelpfulPath].color} flex items-center justify-center`}>
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">{PATH_INFO[analytics.mostHelpfulPath].label}</p>
                  <p className="text-sm text-gray-500">
                    Used {analytics.pathCounts[analytics.mostHelpfulPath]} times
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mood distribution chart */}
          {Object.keys(analytics?.moodCounts || {}).length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <h4 className="font-semibold text-gray-700 mb-4">Mood Distribution</h4>
              <div className="space-y-3">
                {Object.entries(analytics?.moodCounts || {})
                  .sort((a, b) => b[1] - a[1])
                  .map(([mood, count]) => {
                    const moodData = MOOD_INFO[mood];
                    if (!moodData) return null;
                    return (
                      <div key={mood} className="flex items-center gap-3">
                        <span className="text-xl w-8">{moodData.emoji}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">{moodData.label}</span>
                            <span className="text-sm text-gray-500">{count}</span>
                          </div>
                          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${moodData.color} rounded-full transition-all duration-500`}
                              style={{ width: `${getMoodBarWidth(count)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Path usage chart */}
          {Object.keys(analytics?.pathCounts || {}).length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <h4 className="font-semibold text-gray-700 mb-4">Petal Paths Used</h4>
              <div className="space-y-3">
                {Object.entries(analytics?.pathCounts || {})
                  .sort((a, b) => b[1] - a[1])
                  .map(([path, count]) => {
                    const pathData = PATH_INFO[path];
                    if (!pathData) return null;
                    return (
                      <div key={path} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${pathData.color} flex items-center justify-center flex-shrink-0`}>
                          <Heart className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">{pathData.label}</span>
                            <span className="text-sm text-gray-500">{count}</span>
                          </div>
                          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${pathData.color} rounded-full transition-all duration-500`}
                              style={{ width: `${getPathBarWidth(count)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Weekly trend */}
          {analytics?.weeklyTrend && analytics.weeklyTrend.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <h4 className="font-semibold text-gray-700 mb-4">Recent Mood Timeline</h4>
              <div className="flex flex-wrap gap-2">
                {analytics.weeklyTrend.slice(-14).map((entry, index) => {
                  const moodData = MOOD_INFO[entry.mood];
                  const date = new Date(entry.date);
                  return (
                    <div
                      key={index}
                      className="flex flex-col items-center p-2 bg-gray-50 rounded-xl"
                      title={`${date.toLocaleDateString()}: ${moodData?.label || entry.mood}`}
                    >
                      <span className="text-lg">{moodData?.emoji || '❓'}</span>
                      <span className="text-xs text-gray-500 mt-1">
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Insights and tips */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4">
            <h4 className="font-semibold text-indigo-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Insights for Parents
            </h4>
            <div className="space-y-2 text-sm text-gray-700">
              {analytics?.mostFrequentMood && (
                <p>
                  • {childName || 'Your child'} has been feeling <strong>{MOOD_INFO[analytics.mostFrequentMood]?.label.toLowerCase() || analytics.mostFrequentMood}</strong> most often this {viewMode}.
                  {analytics.mostFrequentMood === 'worried' && ' Consider extra reassurance at bedtime.'}
                  {analytics.mostFrequentMood === 'angry' && ' Practice calm-down strategies together during peaceful moments.'}
                  {analytics.mostFrequentMood === 'happy' && ' Great job supporting their emotional wellbeing!'}
                  {analytics.mostFrequentMood === 'sad' && ' Extra cuddles and quality time may help.'}
                </p>
              )}
              {analytics?.totalSessions && analytics.totalSessions > 0 && (
                <p>
                  • {analytics.totalSessions} Petal Path{analytics.totalSessions !== 1 ? 's' : ''} completed shows great engagement with emotional learning.
                </p>
              )}
              {analytics?.averageSessionDuration && analytics.averageSessionDuration > 0 && (
                <p>
                  • Average session length: {Math.round(analytics.averageSessionDuration / 60)} minutes - {analytics.averageSessionDuration > 180 ? 'excellent focus!' : 'perfect for young attention spans.'}
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EmotionInsights;
