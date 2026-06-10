import { useEffect, useRef } from 'react';
import axios from 'axios';

const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotifier({ orderId }) {
  const subscribed = useRef(false);

  useEffect(() => {
    if (!orderId) return;
    if (!('serviceWorker' in navigator && 'PushManager' in window)) {
      console.warn('Push non supporté');
      return;
    }
    if (!VAPID_PUBLIC_KEY) {
      console.error('REACT_APP_VAPID_PUBLIC_KEY manquante');
      return;
    }

    const registerAndSubscribe = async () => {
      try {
        // 1. Enregistrer le service worker
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        await navigator.serviceWorker.ready;

        // 2. Demander la permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        // 3. S'abonner avec VAPID
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });

        // 4. Envoyer l'abonnement au backend
        await axios.post(`${process.env.REACT_APP_API_URL}/api/notifications/subscribe`, {
          orderId,
          subscription: subscription.toJSON()
        });
        console.log('Abonnement push réussi');
        subscribed.current = true;
      } catch (err) {
        console.error('Erreur push:', err);
      }
    };

    registerAndSubscribe();
  }, [orderId]);

  return null;
}
