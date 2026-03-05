import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface PremiumState {
  isPremium: boolean;
  planType: 'free' | 'monthly' | 'yearly';
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'inactive';
  currentPeriodEnd: string | null;
  purchasedPacks: string[];
  stripeCustomerId: string | null;
}

interface PremiumContextType {
  premium: PremiumState;
  isLoading: boolean;
  checkPremiumStatus: (familyId: string) => Promise<void>;
  addPurchasedPack: (packType: string) => void;
  setPremiumActive: (planType: 'monthly' | 'yearly', periodEnd: string) => void;
  hasAccess: (feature: string) => boolean;
  resetPremium: () => void;
}

const defaultPremiumState: PremiumState = {
  isPremium: false,
  planType: 'free',
  subscriptionStatus: 'inactive',
  currentPeriodEnd: null,
  purchasedPacks: [],
  stripeCustomerId: null,
};

const PremiumContext = createContext<PremiumContextType>({
  premium: defaultPremiumState,
  isLoading: false,
  checkPremiumStatus: async () => {},
  addPurchasedPack: () => {},
  setPremiumActive: () => {},
  hasAccess: () => true,
  resetPremium: () => {},
});

export const usePremium = () => useContext(PremiumContext);

// Define which features require premium or specific packs
const PREMIUM_FEATURES = {
  'all-games': 'premium',
  'unlimited-stickers': 'premium',
  'family-sync': 'premium',
  'parent-insights': 'premium',
  'offline-mode': 'premium',
  'adventure-scenes': 'game-pack',
  'magical-stickers': 'sticker-pack',
  'garden-expansion': 'garden-pack',
} as const;

// Free tier limits
export const FREE_LIMITS = {
  games: ['memory', 'coloring'], // Only memory and coloring are free
  stickersPerWeek: 5,
  journalEntriesPerWeek: 3,
};

export const PremiumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [premium, setPremium] = useState<PremiumState>(defaultPremiumState);
  const [isLoading, setIsLoading] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedPremium = localStorage.getItem('petalPaths_premium');
    if (savedPremium) {
      try {
        const parsed = JSON.parse(savedPremium);
        setPremium(parsed);
      } catch (e) {
        console.error('Failed to parse premium state:', e);
      }
    }
  }, []);

  // Save to localStorage when premium changes
  useEffect(() => {
    localStorage.setItem('petalPaths_premium', JSON.stringify(premium));
  }, [premium]);

  const checkPremiumStatus = useCallback(async (familyId: string) => {
    setIsLoading(true);
    try {
      // Check subscription status
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('family_id', familyId)
        .single();

      // Check purchases
      const { data: purchases, error: purchError } = await supabase
        .from('purchases')
        .select('product_id')
        .eq('family_id', familyId)
        .eq('status', 'completed');

      const purchasedPacks = purchases?.map(p => {
        // Map product IDs to pack types
        if (p.product_id === 'prod_TlBCpWjFuPRCcf') return 'game-pack';
        if (p.product_id === 'prod_TlBCXCr0tD6hFJ') return 'sticker-pack';
        if (p.product_id === 'prod_TlBCj0fG4p3fNp') return 'garden-pack';
        return p.product_id;
      }) || [];

      if (subscription && subscription.status === 'active') {
        setPremium({
          isPremium: true,
          planType: subscription.plan_type as 'monthly' | 'yearly',
          subscriptionStatus: subscription.status,
          currentPeriodEnd: subscription.current_period_end,
          purchasedPacks,
          stripeCustomerId: subscription.stripe_customer_id,
        });
      } else {
        setPremium(prev => ({
          ...prev,
          isPremium: false,
          planType: 'free',
          subscriptionStatus: subscription?.status || 'inactive',
          purchasedPacks,
          stripeCustomerId: subscription?.stripe_customer_id || null,
        }));
      }
    } catch (error) {
      console.error('Error checking premium status:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addPurchasedPack = useCallback((packType: string) => {
    setPremium(prev => ({
      ...prev,
      purchasedPacks: [...prev.purchasedPacks, packType],
    }));
  }, []);

  const setPremiumActive = useCallback((planType: 'monthly' | 'yearly', periodEnd: string) => {
    setPremium(prev => ({
      ...prev,
      isPremium: true,
      planType,
      subscriptionStatus: 'active',
      currentPeriodEnd: periodEnd,
    }));
  }, []);

  const hasAccess = useCallback((feature: string): boolean => {
    // Premium users have access to everything
    if (premium.isPremium) return true;

    const requirement = PREMIUM_FEATURES[feature as keyof typeof PREMIUM_FEATURES];
    
    // If no requirement defined, it's free
    if (!requirement) return true;
    
    // If it requires premium, check premium status
    if (requirement === 'premium') return premium.isPremium;
    
    // If it requires a specific pack, check if purchased
    return premium.purchasedPacks.includes(requirement);
  }, [premium]);

  const resetPremium = useCallback(() => {
    setPremium(defaultPremiumState);
    localStorage.removeItem('petalPaths_premium');
  }, []);

  return (
    <PremiumContext.Provider
      value={{
        premium,
        isLoading,
        checkPremiumStatus,
        addPurchasedPack,
        setPremiumActive,
        hasAccess,
        resetPremium,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
};
