self.addEventListener('install', event => {
  console.log('✅ SW installé');
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  console.log('✅ SW activé');
  event.waitUntil(clients.claim());
});
self.addEventListener('push', event => {
  console.log('📨 Push reçu', event);
  // Récupération sécurisée des données
  let title = 'GazLivraison';
  let body = 'Mise à jour de votre commande';
  try {
    if (event.data) {
      const data = event.data.json();
      title = data.title || title;
      body = data.body || body;
    }
  } catch (e) {
    console.error('Erreur parsing push data', e);
  }
  const options = {
    body: body,
    icon: '/logo.png',    // assure-toi que ce fichier existe
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    requireInteraction: true,  // reste à l'écran jusqu'à interaction
  };
  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => console.log('✅ Notification affichée'))
      .catch(err => console.error('❌ Erreur affichage notification', err))
  );
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});
