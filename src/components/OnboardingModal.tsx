import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useOnboarding } from '../contexts/OnboardingContext';
import { useTheme } from '../theme/ThemeProvider';
import { ThemedText } from './Themed';

const { width } = Dimensions.get('window');

const steps = [
  {
    icon: 'person-circle-outline',
    title: 'Complete seu perfil',
    description: 'Para uma melhor experiência, preencha seus dados pessoais.',
  },
  {
    icon: 'call-outline',
    title: 'Informe seu celular',
    description: 'Seu número para contato e confirmações importantes.',
  },
  {
    icon: 'home-outline',
    title: 'Adicione seu endereço',
    description: 'Para receber informações sobre eventos próximos a você.',
  },
];

export function OnboardingModal() {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { needsOnboarding, setNeedsOnboarding } = useOnboarding();
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (needsOnboarding) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      setCurrentStep(0);
    }
  }, [needsOnboarding]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleGoToProfile = () => {
    setNeedsOnboarding(false);
    navigation.navigate('Perfil');
  };

  const handleLater = () => {
    Alert.alert(
      'Completar depois?',
      'Você pode completar seu perfil mais tarde em Configurações. Deseja continuar?',
      [
        { text: 'Ficar', style: 'cancel' },
        { 
          text: 'Ir para Home', 
          onPress: () => {
            setNeedsOnboarding(false);
            navigation.navigate('Home');
          }
        },
      ]
    );
  };

  if (!needsOnboarding) return null;

  const isLastStep = currentStep === steps.length - 1;

  return (
    <Modal
      visible={needsOnboarding}
      transparent
      animationType="none"
      onRequestClose={handleLater}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View 
          style={[
            styles.container, 
            { 
              backgroundColor: theme.colors.card,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Header com progresso */}
          <View style={styles.header}>
            <View style={styles.progressContainer}>
              {steps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    {
                      backgroundColor: index <= currentStep 
                        ? theme.colors.primary 
                        : theme.colors.border,
                      width: index === currentStep ? 24 : 8,
                    },
                  ]}
                />
              ))}
            </View>
            <Pressable onPress={handleLater} style={styles.skipButton}>
              <ThemedText style={{ color: theme.colors.muted }}>
                Pular
              </ThemedText>
            </Pressable>
          </View>

          {/* Conteúdo do step */}
          <View style={styles.content}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
              <Ionicons 
                name={steps[currentStep].icon as any} 
                size={60} 
                color={theme.colors.primary} 
              />
            </View>
            
            <ThemedText style={styles.title}>
              {steps[currentStep].title}
            </ThemedText>
            
            <ThemedText style={styles.description}>
              {steps[currentStep].description}
            </ThemedText>
          </View>

          {/* Botões de ação */}
          <View style={styles.buttonContainer}>
            {!isLastStep ? (
              <>
                <Pressable
                  style={[styles.button, styles.buttonSecondary, { borderColor: theme.colors.border }]}
                  onPress={handleLater}
                >
                  <ThemedText style={{ color: theme.colors.text }}>Agora não</ThemedText>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.buttonPrimary, { backgroundColor: theme.colors.primary }]}
                  onPress={handleNext}
                >
                  <ThemedText style={styles.buttonText}>Próximo</ThemedText>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable
                  style={[styles.button, styles.buttonSecondary, { borderColor: theme.colors.border }]}
                  onPress={handleLater}
                >
                  <ThemedText style={{ color: theme.colors.text }}>Depois</ThemedText>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.buttonPrimary, { backgroundColor: theme.colors.primary }]}
                  onPress={handleGoToProfile}
                >
                  <ThemedText style={styles.buttonText}>Ir para Perfil</ThemedText>
                </Pressable>
              </>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: width - 40,
    borderRadius: 24,
    padding: 24,
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  skipButton: {
    padding: 4,
  },
  content: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#0066CC',
  },
  buttonSecondary: {
    borderWidth: 1,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});