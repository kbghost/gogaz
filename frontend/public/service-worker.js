self.addEventListener('push', function(event) {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/logo.png',        // adapte si ton logo s'appelle différemment
    badge: '/favicon.ico',
    vibrate: [200, 100, 200]
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')   // ouvre la page d'accueil, tu peux mettre '/suivi' si tu veux
  );
});
