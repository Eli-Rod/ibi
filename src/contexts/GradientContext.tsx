import React, { createContext, useContext, useState } from 'react';

type GradientIntensity = 'light' | 'medium' | 'strong';

type GradientContextData = {
  intensity: GradientIntensity; // ← ADICIONE ISSO
  setIntensity: (intensity: GradientIntensity) => void;
};

const GradientContext = createContext<GradientContextData>({} as GradientContextData);

export const GradientProvider = ({ children }: { children: React.ReactNode }) => {
  const [intensity, setIntensity] = useState<GradientIntensity>('medium');

  return (
    <GradientContext.Provider value={{ intensity, setIntensity }}>
      {children}
    </GradientContext.Provider>
  );
};

export const useGradient = () => {
  const context = useContext(GradientContext);
  if (!context) {
    throw new Error('useGradient must be used within a GradientProvider');
  }
  return context;
};