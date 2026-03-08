import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { registerForPushNotificationsAsync } from '../services/notificationService';

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notificação respondida:', response);
      const { prayerId } = response.notification.request.content.data as { prayerId?: string };
      if (prayerId) {
        // Navegar para o pedido de oração
        // navigation.navigate('Oracoes', { prayerId });
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return { expoPushToken, notification };
}