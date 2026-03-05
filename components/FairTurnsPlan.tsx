import React, { useState, useEffect } from 'react';
import { Clock, Users, ArrowRight } from 'lucide-react';

interface FairTurnsPlanProps {
  onComplete: (plan: string) => void;
  color: string;
}

const FairTurnsPlan: React.FC<FairTurnsPlanProps> = ({ onComplete, color }) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [turnOrder, setTurnOrder] = useState<string[]>([]);

  const planOptions = [
    {
      id: 'timer',
      label: 'Timer for turns',
      description: 'Set a timer, then swap',
      icon: Clock,
    },
    {
      id: 'together',
      label: 'Play together',
      description: 'Both use it at the same time',
      icon: Users,
    },
    {
      id: 'first-then',
      label: 'First me, then you',
      description: 'Take turns one at a time',
      icon: ArrowRight,
    },
  ];

  // Timer countdown
  useEffect(() => {
    if (timerActive && timerSeconds > 0) {
      const interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timerSeconds === 0) {
      setTimerActive(false);
    }
  }, [timerActive, timerSeconds]);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    if (planId === 'timer') {
      setTimerSeconds(30);
    }
  };

  const startTimer = () => {
    setTimerActive(true);
  };

  const handleComplete = () => {
    if (selectedPlan) {
      onComplete(selectedPlan);
    }
  };

  const selectedPlanData = planOptions.find(p => p.id === selectedPlan);

  return (
    <div className="flex flex-col items-center py-6">
      <h3 className="text-2xl font-rounded font-bold text-gray-700 mb-2">
        Fair Turns Plan
      </h3>
      <p className="text-gray-500 mb-6 text-center max-w-md">
        It's okay to want things for yourself.
        <br />
        Let's make a fair plan so everyone gets a turn.
      </p>

      {/* Plan options */}
      {!selectedPlan && (
        <div className="flex flex-col gap-4 w-full max-w-md">
          {planOptions.map((plan) => {
            const Icon = plan.icon;
            
            return (
              <button
                key={plan.id}
                onClick={() => handleSelectPlan(plan.id)}
                className="flex items-center gap-4 p-5 rounded-2xl bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:scale-101 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                  <Icon className="w-7 h-7 text-gray-600" />
                </div>
                <div className="text-left">
                  <p className="font-rounded font-semibold">{plan.label}</p>
                  <p className="text-sm text-gray-500">{plan.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Timer plan */}
      {selectedPlan === 'timer' && (
        <div className="bg-gray-50 rounded-2xl p-6 max-w-md text-center">
          <p className="text-gray-700 font-rounded mb-4">
            When the timer ends, it's time to swap!
          </p>
          
          <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-4 ${
            timerActive ? color : 'bg-gray-200'
          }`}>
            <span className={`text-4xl font-bold ${timerActive ? 'text-white' : 'text-gray-600'}`}>
              {timerSeconds}
            </span>
          </div>

          {!timerActive && timerSeconds === 30 && (
            <button
              onClick={startTimer}
              className={`px-8 py-3 rounded-full ${color} text-white font-semibold hover:scale-105 transition-transform shadow-lg`}
            >
              Start Timer
            </button>
          )}

          {timerActive && (
            <p className="text-gray-500 font-rounded animate-pulse">
              Your turn! Enjoy it...
            </p>
          )}

          {timerSeconds === 0 && (
            <div className="space-y-4">
              <p className="text-green-600 font-rounded font-semibold">
                Time's up! Time to share.
              </p>
              <button
                onClick={handleComplete}
                className={`px-8 py-3 rounded-full ${color} text-white font-semibold hover:scale-105 transition-transform shadow-lg`}
              >
                I shared!
              </button>
            </div>
          )}
        </div>
      )}

      {/* Together plan */}
      {selectedPlan === 'together' && (
        <div className="bg-gray-50 rounded-2xl p-6 max-w-md text-center">
          <p className="text-gray-700 font-rounded mb-4">
            Can you both use it at the same time?
          </p>
          
          <div className="flex justify-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <div className="w-16 h-16 rounded-full bg-gray-400 flex items-center justify-center">
              <span className="text-2xl">🎮</span>
            </div>
            <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
          </div>

          <p className="text-gray-500 text-sm mb-4">
            Playing together can be more fun!
          </p>

          <button
            onClick={handleComplete}
            className={`px-8 py-3 rounded-full ${color} text-white font-semibold hover:scale-105 transition-transform shadow-lg`}
          >
            We can share!
          </button>
        </div>
      )}

      {/* First-then plan */}
      {selectedPlan === 'first-then' && (
        <div className="bg-gray-50 rounded-2xl p-6 max-w-md text-center">
          <p className="text-gray-700 font-rounded mb-4">
            Let's make a turn order:
          </p>
          
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex flex-col items-center">
              <div className={`w-16 h-16 rounded-full ${color} flex items-center justify-center text-white font-bold`}>
                1
              </div>
              <span className="text-sm text-gray-600 mt-2">First: Me</span>
            </div>
            <ArrowRight className="w-8 h-8 text-gray-400" />
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
                2
              </div>
              <span className="text-sm text-gray-600 mt-2">Then: You</span>
            </div>
          </div>

          <p className="text-gray-500 text-sm mb-4">
            Everyone gets a turn. That's fair!
          </p>

          <button
            onClick={handleComplete}
            className={`px-8 py-3 rounded-full ${color} text-white font-semibold hover:scale-105 transition-transform shadow-lg`}
          >
            I understand
          </button>
        </div>
      )}

      {/* Back button */}
      {selectedPlan && (
        <button
          onClick={() => setSelectedPlan(null)}
          className="mt-4 text-gray-500 hover:text-gray-700 font-rounded"
        >
          Choose a different plan
        </button>
      )}
    </div>
  );
};

export default FairTurnsPlan;
