self.addEventListener('install', event => {
  console.log('✅ SW installé');
  self.skipWaiting(); // force l'activation immédiate
});
self.addEventListener('activate', event => {
  console.log('✅ SW activé');
  event.waitUntil(clients.claim()); // prend le contrôle immédiatement
});
self.addEventListener('push', event => {
  console.log('📨 Push reçu', event);
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'GazLivraison';
  const options = {
    body: data.body || 'Mise à jour de votre commande',
    icon: '/logo.png',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200]
  };
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
