import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

type OnboardingContextData = {
  needsOnboarding: boolean;
  setNeedsOnboarding: (value: boolean) => void;
  checkOnboardingStatus: () => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextData>({} as OnboardingContextData);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const checkOnboardingStatus = async () => {
    if (!user || !profile) return;

    // Verificar se o perfil está completo
    const isProfileComplete = checkProfileCompleteness(profile);
    setNeedsOnboarding(!isProfileComplete);
  };

  // Função para verificar se os dados obrigatórios estão preenchidos
  const checkProfileCompleteness = (profile: any) => {
    const requiredFields = [
      'nome_completo',
      'celular',
      'cep',
      'logradouro',
      'numero',
      'bairro',
      'cidade',
      'uf'
    ];

    // Verifica se todos os campos obrigatórios estão preenchidos
    return requiredFields.every(field => 
      profile[field] && profile[field].toString().trim() !== ''
    );
  };

  useEffect(() => {
    if (user && profile) {
      checkOnboardingStatus();
    }
  }, [user, profile]);

  return (
    <OnboardingContext.Provider value={{ 
      needsOnboarding, 
      setNeedsOnboarding,
      checkOnboardingStatus 
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => useContext(OnboardingContext);