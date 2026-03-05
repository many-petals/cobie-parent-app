
import React from 'react';
import AppLayout from '@/components/AppLayout';
import { AppProvider } from '@/contexts/AppContext';
import { PremiumProvider } from '@/contexts/PremiumContext';

const Index: React.FC = () => {
  return (
    <AppProvider>
      <PremiumProvider>
        <AppLayout />
      </PremiumProvider>
    </AppProvider>
  );
};

export default Index;
