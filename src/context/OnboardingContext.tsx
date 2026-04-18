import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PlanEjercicioGenerado } from '../models/ejercicios/ExerciseModel';

export type OnboardingData = {
  // Credenciales (capturadas en RegistroScreen)
  nombre: string;
  email: string;
  password: string;
  // Personalizacion
  plan: number;
  metaEjercicio: number;
  lugarEntrenamiento: number;
  metaNutricional: number;
  controlCalorias: number;
  // DatosEstadisticos
  altura: string;
  peso: string;
  musculo: string;
  grasa: string;
  etnia: string;
  // DatosEstiloVida
  rutina: number;
  disponibilidad: number;
  dieta: number;
  habitos: boolean[];
  alergias: string;
  // DatosSalud
  togglesSalud: boolean[];
  condicionesMedicas: string[];
  medicamentos: string[];
  // ObjetivoDieta
  objetivoDieta: number;
  planEjercicios: PlanEjercicioGenerado; 
  userId?: string;
  token?: string;
};

type OnboardingContextType = {
  data: Partial<OnboardingData>;
  updateData: (partial: Partial<OnboardingData>) => void;
  resetData: () => void;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Partial<OnboardingData>>({});

  const updateData = (partial: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...partial }));
  };

  const resetData = () => setData({});

  return (
    <OnboardingContext.Provider value={{ data, updateData, resetData }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}
