import { useEffect } from 'react';
import axios from 'axios';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  // ... (conversion inchangée)
}

export default function PushNotifier({ orderId }) {
  useEffect(() => {
    if (!orderId) return;
    if (!('serviceWorker' in navigator && 'PushManager' in window)) {
      console.warn('Push non supporté');
      return;
    }
    if (!VAPID_PUBLIC_KEY) {
      console.error('VITE_VAPID_PUBLIC_KEY manquante');
      return;
    }

    const registerAndSubscribe = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        await navigator.serviceWorker.ready;
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });

        await axios.post(`${import.meta.env.VITE_API_URL}/api/notifications/subscribe`, {
          orderId,
          subscription: subscription.toJSON()
        });
        console.log('Abonnement push réussi');
      } catch (err) {
        console.error('Erreur push:', err);
      }
    };

    registerAndSubscribe();
  }, [orderId]);

  return null;
}
