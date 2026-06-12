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
  
  // Valeurs par défaut (si jamais le backend envoie un truc vide)
  let title = 'GoGaz';
  let body = 'Mise à jour de votre commande';
  
  try {
    if (event.data) {
      // 1. C'est ICI qu'on déballe le message dynamique du backend !
      const data = event.data.json();
      
      // On remplace les valeurs par défaut par celles du backend ("Commande Validée ✅" etc.)
      title = data.title || title;
      body = data.body || body;
    }
  } catch (e) {
    console.error('Erreur parsing push data', e);
  }
  
  // 2. On configure l'apparence
  const options = {
    body: body,
    icon: '/logo.png',    // Assure-toi que logo.png est dans ton dossier public/
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    requireInteraction: true,  // reste à l'écran jusqu'à interaction
  };
  
  // 3. On affiche la notification
  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => console.log('✅ Notification affichée avec succès'))
      .catch(err => console.error('❌ Erreur affichage notification', err))
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/')); // Redirige le client vers le site au clic
});
