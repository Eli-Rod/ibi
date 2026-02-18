import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText, ThemedView } from '../components/Themed';
import { useTheme } from '../theme/ThemeProvider';

export default function ScannerScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { kidId, mode } = route.params; // mode: 'checkin' | 'checkout'

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  if (!permission) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </ThemedView>
    );
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.text}>Precisamos de permissão para usar a câmera</ThemedText>
        <Pressable style={[styles.button, { backgroundColor: theme.colors.primary }]} onPress={requestPermission}>
          <ThemedText style={styles.buttonText}>Conceder Permissão</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    // Aqui validamos se o QR Code lido é o da igreja
    // Por enquanto, vamos aceitar qualquer QR Code que contenha "IBI_KIDS"
    if (data.includes('IBI_KIDS')) {
      navigation.navigate('KidsMain', { 
        scannedData: data, 
        kidId, 
        mode 
      });
    } else {
      Alert.alert(
        'QR Code Inválido', 
        'Este não parece ser um código válido da IBI Kids.',
        [{ text: 'Tentar Novamente', onPress: () => setScanned(false) }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />
      
      <View style={styles.overlay}>
        <View style={styles.unfocusedContainer}></View>
        <View style={styles.middleContainer}>
          <View style={styles.unfocusedContainer}></View>
          <View style={[styles.focusedContainer, { borderColor: theme.colors.primary }]}></View>
          <View style={styles.unfocusedContainer}></View>
        </View>
        <View style={styles.unfocusedContainer}></View>
      </View>

      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="close-circle" size={40} color="#fff" />
        </Pressable>
        <ThemedText style={styles.headerText}>
          Escaneie o QR Code da Igreja
        </ThemedText>
        <ThemedText style={styles.subHeaderText}>
          {mode === 'checkin' ? 'Para realizar a entrada' : 'Para solicitar a saída'}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  text: {
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  header: {
    position: 'absolute',
    top: 60,
    alignItems: 'center',
    width: '100%',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 10,
  },
  subHeaderText: {
    color: '#fff',
    opacity: 0.8,
    fontSize: 14,
  },
  backBtn: {
    marginBottom: 10,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  middleContainer: {
    flexDirection: 'row',
    height: 250,
  },
  focusedContainer: {
    width: 250,
    borderWidth: 2,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
});