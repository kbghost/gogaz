import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Fonction utilitaire pour convertir la clé VAPID Base64 en Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const PushNotifier = ({ orderId }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Sécurité : s'assurer que l'orderId est bien présent avant d'agir
    if (!orderId) {
      console.warn("⚠️ PushNotifier : 'orderId' manquant pour le moment.");
      return;
    }

    const handleSubscription = async () => {
      try {
        setLoading(true);

        // 1. Attendre que le Service Worker soit prêt
        const registration = await navigator.serviceWorker.ready;

        // 2. Récupérer la clé VAPID publique depuis Vite
        const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        
        if (!publicVapidKey) {
          console.error("❌ [Push] VITE_VAPID_PUBLIC_KEY est undefined. Le build Vercel n'a pas accès à la variable.");
          return;
        }

        // 3. Vérifier si un abonnement existe déjà sur ce navigateur
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          console.log("🔄 Aucun abonnement actif trouvé. Création d'un nouvel abonnement...");
          const convertedKey = urlBase64ToUint8Array(publicVapidKey);
          
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedKey
          });
          console.log("✅ Nouvel abonnement généré par le navigateur.");
        } else {
          console.log("ℹ️ Un abonnement existant a été détecté.");
        }

        // 4. Envoi au backend Render
        const backendUrl = import.meta.env.VITE_API_URL;
        console.log(`🚀 Envoi de la requête POST vers ${backendUrl}/api/notifications/subscribe`);
        
        // Log du payload exact pour déboguer le problème MongoDB
        console.log("📦 Payload envoyé :", {
          orderId: orderId,
          subscription: subscription
        });

        const response = await axios.post(`${backendUrl}/api/notifications/subscribe`, {
          orderId: orderId,
          subscription: subscription
        });

        if (response.status === 201 || response.status === 200) {
          console.log("✅ Abonnement enregistré avec succès dans MongoDB ! Response:", response.data);
          setIsSubscribed(true);
        }

      } catch (error) {
        console.error("❌ Erreur dans le processus PushNotifier :", error);
      } finally {
        setLoading(false);
      }
    };

    handleSubscription();
  }, [orderId]);

  // Ce composant agit en tâche de fond, il n'a pas besoin d'afficher d'éléments HTML
  return null;
};

export default PushNotifier;
