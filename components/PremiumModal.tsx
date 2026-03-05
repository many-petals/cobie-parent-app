import React, { useState } from 'react';
import { X, Crown, Check, Sparkles, Gamepad2, Flower2, Star, Zap, Shield, Users } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { supabase } from '@/lib/supabase';
import { usePremium } from '@/contexts/PremiumContext';

const stripePromise = loadStripe('pk_live_51OJhJBHdGQpsHqInIzu7c6PzGPSH0yImD4xfpofvxvFZs0VFhPRXZCyEgYkkhOtBOXFWvssYASs851mflwQvjnrl00T6DbUwWZ', {
  stripeAccount: 'acct_1Sh9SrQZiZ2litk0'
});

interface PremiumModalProps {
  onClose: () => void;
  familyId: string | null;
  email: string | null;
  onSuccess?: () => void;
}

// Payment form component
function PaymentForm({ 
  customerId, 
  planType,
  familyId,
  onSuccess, 
  onCancel 
}: { 
  customerId: string;
  planType: 'monthly' | 'yearly';
  familyId: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setPremiumActive } = usePremium();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    try {
      const { error: setupError, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: { return_url: window.location.origin },
        redirect: 'if_required',
      });

      if (setupError) {
        setError(setupError.message || 'Payment setup failed');
        setLoading(false);
        return;
      }

      if (setupIntent?.status === 'succeeded') {
        // Activate subscription
        const { data, error: subError } = await supabase.functions.invoke('create-subscription', {
          body: { 
            action: 'activate-subscription', 
            customerId,
            planType,
            familyId
          }
        });

        if (subError || data?.error) {
          setError(data?.error || subError?.message || 'Failed to activate subscription');
          setLoading(false);
          return;
        }

        // Update premium state
        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + (planType === 'yearly' ? 12 : 1));
        setPremiumActive(planType, periodEnd.toISOString());

        // Save to database
        await supabase.from('subscriptions').upsert({
          family_id: familyId,
          stripe_customer_id: customerId,
          stripe_subscription_id: data.subscriptionId,
          status: 'active',
          plan_type: planType,
          current_period_end: periodEnd.toISOString(),
        });

        onSuccess();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement options={{ layout: 'tabs' }} />
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Subscribe Now'}
        </button>
      </div>
    </form>
  );
}

const PremiumModal: React.FC<PremiumModalProps> = ({ onClose, familyId, email, onSuccess }) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [step, setStep] = useState<'plans' | 'payment' | 'success'>('plans');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const features = [
    { icon: Gamepad2, text: 'All games unlocked', color: 'text-purple-500' },
    { icon: Sparkles, text: 'Unlimited stickers', color: 'text-pink-500' },
    { icon: Users, text: 'Family sync across devices', color: 'text-blue-500' },
    { icon: Shield, text: 'Advanced parent insights', color: 'text-green-500' },
    { icon: Zap, text: 'Offline mode', color: 'text-amber-500' },
    { icon: Flower2, text: 'Exclusive garden items', color: 'text-rose-500' },
  ];

  const handleStartSubscription = async () => {
    if (!email || !familyId) {
      setError('Please sign in to subscribe');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-subscription', {
        body: { 
          email, 
          familyId,
          planType: selectedPlan,
          action: 'create-setup-intent'
        }
      });

      if (fnError || data?.error) {
        throw new Error(data?.error || fnError?.message || 'Failed to start subscription');
      }

      setClientSecret(data.clientSecret);
      setCustomerId(data.customerId);
      setStep('payment');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setStep('success');
    setTimeout(() => {
      onSuccess?.();
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400 p-6 rounded-t-3xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <Crown className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Many Petals Premium</h2>
              <p className="text-white/90">Unlock the full experience</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'plans' && (
            <>
              {/* Features */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-3">Everything included:</h3>
                <div className="grid grid-cols-2 gap-3">
                  {features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center ${feature.color}`}>
                        <feature.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm text-gray-700">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plan selection */}
              <div className="space-y-3 mb-6">
                {/* Yearly plan */}
                <button
                  onClick={() => setSelectedPlan('yearly')}
                  className={`w-full p-4 rounded-2xl border-2 transition-all text-left relative ${
                    selectedPlan === 'yearly'
                      ? 'border-amber-400 bg-amber-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {selectedPlan === 'yearly' && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="absolute -top-2 left-4 px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
                    SAVE 35%
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-800">$39</span>
                    <span className="text-gray-500">/year</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Just $3.25/month, billed annually</p>
                </button>

                {/* Monthly plan */}
                <button
                  onClick={() => setSelectedPlan('monthly')}
                  className={`w-full p-4 rounded-2xl border-2 transition-all text-left relative ${
                    selectedPlan === 'monthly'
                      ? 'border-amber-400 bg-amber-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {selectedPlan === 'monthly' && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-800">$4.99</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Billed monthly, cancel anytime</p>
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* CTA */}
              <button
                onClick={handleStartSubscription}
                disabled={loading || !email}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-bold text-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-5 h-5" />
                    <span>Continue to Payment</span>
                  </>
                )}
              </button>

              {!email && (
                <p className="text-center text-sm text-gray-500 mt-3">
                  Please sign in first to subscribe
                </p>
              )}

              <p className="text-center text-xs text-gray-400 mt-4">
                Cancel anytime. Secure payment powered by Stripe.
              </p>
            </>
          )}

          {step === 'payment' && clientSecret && customerId && familyId && (
            <div>
              <h3 className="font-bold text-gray-800 mb-4">
                Complete your {selectedPlan === 'yearly' ? 'annual' : 'monthly'} subscription
              </h3>
              <div className="mb-4 p-3 bg-amber-50 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Total today</span>
                  <span className="text-xl font-bold text-gray-800">
                    {selectedPlan === 'yearly' ? '$39.00' : '$4.99'}
                  </span>
                </div>
              </div>
              <Elements 
                stripe={stripePromise} 
                options={{ 
                  clientSecret,
                  appearance: { 
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#f59e0b',
                      borderRadius: '12px',
                    }
                  }
                }}
              >
                <PaymentForm
                  customerId={customerId}
                  planType={selectedPlan}
                  familyId={familyId}
                  onSuccess={handlePaymentSuccess}
                  onCancel={() => {
                    setStep('plans');
                    setClientSecret(null);
                  }}
                />
              </Elements>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Premium!</h3>
              <p className="text-gray-600">You now have access to all features.</p>
              <div className="mt-4 flex justify-center gap-2">
                <Star className="w-6 h-6 text-amber-400 animate-pulse" />
                <Star className="w-6 h-6 text-amber-400 animate-pulse delay-100" />
                <Star className="w-6 h-6 text-amber-400 animate-pulse delay-200" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;
