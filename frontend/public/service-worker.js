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
  
  let title = 'GoGaz';
  let body = 'Mise à jour de votre commande';
  
  if (event.data) {
    try {
      // Tentative de lecture en JSON
      const data = event.data.json();
      title = data.title || title;
      body = data.body || body;
    } catch (e) {
      // Fallback : lecture en texte brut si ce n'est pas du JSON
      body = event.data.text() || body;
      console.warn('⚠️ Données reçues non-JSON, affichage en mode texte');
    }
  }
  
  const options = {
    body: body,
    icon: '/logo.png',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    requireInteraction: true,
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
