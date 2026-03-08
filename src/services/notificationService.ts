import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configurar o handler de notificações - CORRIGIDO
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: Platform.OS === 'ios', // Booleano simples
    shouldShowList: Platform.OS === 'ios', // Adicionar esta propriedade para iOS
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Permissão de notificação negada!');
      return null;
    }
    
    try {
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId;
      
      token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      
      console.log('Push token:', token);
    } catch (e) {
      console.log('Erro ao obter push token:', e);
    }
  } else {
    console.log('Use um dispositivo físico para notificações push');
  }

  return token?.data;
}

export async function schedulePrayerReminder(
  prayerId: string,
  prayerTitle: string,
  reminderDate: Date
) {
  try {
    // Calcular 30 minutos antes
    const triggerDate = new Date(reminderDate.getTime() - 30 * 60 * 1000);
    
    // Não agendar se já passou
    if (triggerDate.getTime() < Date.now()) {
      console.log('Data de lembrete já passou');
      return null;
    }

    // CORRIGIDO: Usar o formato correto para o trigger
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔔 Lembrete de Oração',
        body: `Faltam 30 minutos para o pedido: "${prayerTitle}"`,
        data: { prayerId, type: 'prayer_reminder' },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        date: triggerDate,
        channelId: 'default',
      },
    });

    console.log('Notificação agendada:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('Erro ao agendar notificação:', error);
    return null;
  }
}

export async function cancelPrayerReminder(notificationId: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log('Notificação cancelada:', notificationId);
  } catch (error) {
    console.error('Erro ao cancelar notificação:', error);
  }
}

export function addNotificationListener(callback: (notification: Notifications.Notification) => void) {
  const subscription = Notifications.addNotificationReceivedListener(callback);
  return subscription;
}

export function addNotificationResponseListener(callback: (response: Notifications.NotificationResponse) => void) {
  const subscription = Notifications.addNotificationResponseReceivedListener(callback);
  return subscription;
}