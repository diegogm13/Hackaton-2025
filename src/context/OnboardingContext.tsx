import React, { createContext, useContext, useState, ReactNode } from 'react';

export type OnboardingData = {
  plan: number;
  altura: string;
  peso: string;
  musculo: string;
  grasa: string;
  etnia: string;
  rutina: number;
  disponibilidad: number;
  dieta: number;
  habitos: boolean[];
  alergias: string;
  togglesSalud: boolean[];
  condicionesSalud: string;
};

type OnboardingContextType = {
  data: Partial<OnboardingData>;
  updateData: (partial: Partial<OnboardingData>) => void;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Partial<OnboardingData>>({});

  const updateData = (partial: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...partial }));
  };

  return (
    <OnboardingContext.Provider value={{ data, updateData }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}
