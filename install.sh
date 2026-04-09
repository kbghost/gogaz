#!/bin/bash
set -e
echo "🔥 Installation GazLivraison v2..."

# Backend
echo "📦 Backend..."
cd backend
[ ! -f .env ] && cp .env.example .env && echo "⚠️  Modifiez backend/.env avec vos paramètres MongoDB"
npm install
echo "✅ Backend OK"

# Frontend
echo "📦 Frontend..."
cd ../frontend
[ ! -f .env ] && cp .env.example .env
npm install
echo "✅ Frontend OK"

cd ..
echo ""
echo "🎉 Installation terminée!"
echo ""
echo "▶️  Démarrer:"
echo "   Backend  → cd backend && npm run dev"
echo "   Frontend → cd frontend && npm run dev"
echo ""
echo "🌱 Données de démo (optionnel):"
echo "   cd backend && node src/config/seed.js"
echo ""
echo "🔑 Comptes de test:"
echo "   Admin   : +22961000000 / Admin@123"
echo "   Livreur : +22961000001 / Livreur@123"
echo "   Client  : +22961000002 / Client@123"
