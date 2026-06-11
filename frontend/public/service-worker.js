self.addEventListener('install', event => {
  console.log('SW installé');
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  console.log('SW activé');
  event.waitUntil(clients.claim());
});
self.addEventListener('push', event => {
  console.log('Push reçu', event);
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'Titre', { body: data.body || 'Message' })
  );
});
