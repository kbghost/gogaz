const jwt = require('jsonwebtoken');
const User = require('../models/User');

const socketHandler = (io) => {
  // Auth middleware for sockets
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user) {
          socket.user = user;
        }
      }
    } catch (e) {
      // Anonymous socket is OK for public tracking
    }
    next();
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connecté: ${socket.id} (${socket.user?.role || 'anonyme'})`);

    // Admin/livreur join admin room
    if (socket.user && ['admin', 'livreur'].includes(socket.user.role)) {
      socket.join('admins');
      console.log(`👤 ${socket.user.nom} rejoint la room admins`);
    }

    // Client joins their own room
    if (socket.user) {
      socket.join(`user_${socket.user._id}`);
    }

    // Track a specific commande (public)
    socket.on('track_commande', (commandeId) => {
      socket.join(`commande_${commandeId}`);
      console.log(`📦 Tracking commande: ${commandeId}`);
    });

    // Livreur updates their position
    socket.on('update_position', ({ commandeId, lat, lng }) => {
      if (socket.user?.role === 'livreur') {
        io.to(`commande_${commandeId}`).emit('livreur_position', { lat, lng, commandeId });
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket déconnecté: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;
