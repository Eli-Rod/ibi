import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import React from 'react';
import { AppState, AppStateStatus, View } from 'react-native';
import { ThemedText } from '../components/Themed';
import { useTheme } from '../theme/ThemeProvider';

export default function LockProvider({ children }: React.PropsWithChildren) {
  const { theme } = useTheme();
  const [needsAuth, setNeedsAuth] = React.useState(false);

  async function maybeLock() {
    const enabled = (await AsyncStorage.getItem('lock.enabled')) === 'true';
    if (!enabled) return;
    const has = await LocalAuthentication.hasHardwareAsync();
    const enrolled = has ? await LocalAuthentication.isEnrolledAsync() : false;
    if (!has || !enrolled) return;

    setNeedsAuth(true);
    const res = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Desbloquear IBI',
      cancelLabel: 'Cancelar',
    });
    setNeedsAuth(!res.success);
  }

  React.useEffect(() => {
    // na primeira abertura
    maybeLock();

    // quando volta para foreground
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') maybeLock();
    });
    return () => sub.remove();
  }, []);

  if (needsAuth) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ThemedText style={{ fontWeight: '800', fontSize: 16 }}>Autenticação necessária</ThemedText>
      </View>
    );
  }

  return <>{children}</>;
}