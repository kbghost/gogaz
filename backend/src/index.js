require('dotenv').config();
const express    = require('express');
const http       = require('http');
const path       = require('path');
const { Server } = require('socket.io');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');
const connectDB  = require('./config/db');
const socketHandler = require('./socket/socketHandler');

const app    = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'https://gogaz.vercel.app', methods: ['GET','POST'], credentials: true },
});
app.set('io', io);

connectDB();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(cors({ origin: process.env.CLIENT_URL || 'https://gogaz.vercel.app', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static uploads
const uploadsDir = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir, {
  maxAge: '7d',
  setHeaders: (res) => res.set('Cross-Origin-Resource-Policy', 'cross-origin'),
}));

// Ensure upload dirs exist
const fs = require('fs');
['produits','slider','accessoires'].forEach(d => {
  const p = path.join(uploadsDir, d);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

// Rate limit
app.use('/api/', rateLimit({ windowMs: 15*60*1000, max: 300 }));

// Routes
app.use('/api/auth',                  require('./routes/auth'));
app.use('/api/commandes',             require('./routes/commandes'));
app.use('/api/commandes-accessoires', require('./routes/commandesAccessoires'));
app.use('/api/produits',              require('./routes/produits'));
app.use('/api/users',                 require('./routes/users'));
app.use('/api/stats',                 require('./routes/stats'));
app.use('/api/slider',                require('./routes/slider'));
app.use('/api/accessoires',           require('./routes/accessoires'));

app.get('/api/health', (_, res) => res.json({ status: 'OK', version: '2.0' }));

socketHandler(io);

// Global error handler
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ success: false, message: 'Fichier trop volumineux (max 5 Mo).' });
  console.error(err.message);
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Erreur serveur.' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 GazLivraison API v2 — port ${PORT}`);
  console.log(`📁 Uploads: ${uploadsDir}`);
});

module.exports = { app, io };
