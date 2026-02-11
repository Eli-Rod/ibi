// App.tsx
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import RootNavigator from './src/navigation/RootNavigator';
import LockProvider from './src/security/LockProvider';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';

function AppWithTheme() {
  const { theme } = useTheme();
  return (
    <>
      <LockProvider>
        <RootNavigator />
      </LockProvider>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppWithTheme />
    </ThemeProvider>
  );
}