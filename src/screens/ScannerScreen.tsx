import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, View } from 'react-native';
import { ThemedText, ThemedView } from '../components/Themed';
import { useTheme } from '../theme/ThemeProvider';
import { makeStyles } from './styles/ScannerScreen.styles';

export default function ScannerScreen() {
  const { theme } = useTheme();
  const s = React.useMemo(() => makeStyles(theme), [theme]);

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { kidId, mode } = route.params;

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  if (!permission) {
    return (
      <ThemedView style={s.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </ThemedView>
    );
  }

  if (!permission.granted) {
    return (
      <ThemedView style={s.container}>
        <ThemedText style={s.text}>
          Precisamos de permissão para usar a câmera
        </ThemedText>

        <Pressable
          style={[s.button, { backgroundColor: theme.colors.primary }]}
          onPress={requestPermission}
        >
          <ThemedText style={s.buttonText}>
            Conceder Permissão
          </ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    if (data.includes('IBI_KIDS')) {
      navigation.navigate('KidsMain', {
        scannedData: data,
        kidId,
        mode,
      });
    } else {
      Alert.alert(
        'QR Code Inválido',
        'Este não parece ser um código válido da IBI Kids.',
        [
          {
            text: 'Tentar Novamente',
            onPress: () => setScanned(false),
          },
        ]
      );
    }
  };

  return (
    <View style={s.container}>
      <CameraView
        style={s.cameraFill}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />

      <View style={s.overlay}>
        <View style={s.unfocusedContainer} />

        <View style={s.middleContainer}>
          <View style={s.unfocusedContainer} />
          <View
            style={[
              s.focusedContainer,
              { borderColor: theme.colors.primary },
            ]}
          />
          <View style={s.unfocusedContainer} />
        </View>

        <View style={s.unfocusedContainer} />
      </View>

      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="close-circle" size={40} color="#fff" />
        </Pressable>

        <ThemedText style={s.headerText}>
          Escaneie o QR Code da Igreja
        </ThemedText>

        <ThemedText style={s.subHeaderText}>
          {mode === 'checkin'
            ? 'Para realizar a entrada'
            : 'Para solicitar a saída'}
        </ThemedText>
      </View>
    </View>
  );
}
