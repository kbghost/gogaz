require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');

const connectDB = async() => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gazlivraison');
    console.log('✅ MongoDB connecté');
};

const User = require('../models/User');
const Produit = require('../models/Produit');
const Slider = require('../models/Slider');
const Accessoire = require('../models/Accessoire');

const IMG = {
    oryx: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&q=80',
    benin: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80',
    puma: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=500&q=80',
    pro: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=500&q=80',
    acc: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&q=80',
    s1: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=85',
    s2: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=1400&q=85',
    s3: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=1400&q=85',
};

const seed = async() => {
    await connectDB();

    // Clear all collections safely
    const collections = ['users', 'produits', 'sliders', 'accessoires', 'commandeaccessoires'];
    for (const col of collections) {
        try { await mongoose.connection.db.collection(col).deleteMany({}); } catch (e) {}
    }
    console.log('🗑️  Anciennes données supprimées');

    // Users
    await User.create([
        { nom: 'Admin GazExpress', telephone: '+22961000000', email: 'admin@gazexpress.bj', password: 'Admin@123', role: 'admin' },
        { nom: 'Jean Livreur', telephone: '+22961000001', email: 'livreur@gazexpress.bj', password: 'Livreur@123', role: 'livreur' },
        { nom: 'Marie Client', telephone: '+22961000002', email: 'client@gazexpress.bj', password: 'Client@123', role: 'client' },
    ]);
    console.log('✅ Utilisateurs créés');

    // Produits — 4 marques, 3 formats chacune
    await Produit.insertMany([
        { marque: 'Oryx', poids: 6, prix: 3500, stock: 50, couleur: '#E53935', imageUrl: IMG.oryx, description: 'Bouteille Oryx 6kg — idéale studio & célibataires.' },
        { marque: 'Oryx', poids: 12.5, prix: 7000, stock: 30, couleur: '#E53935', imageUrl: IMG.oryx, description: 'Bouteille Oryx 12.5kg — la référence béninoise.' },
        { marque: 'Oryx', poids: 25, prix: 13500, stock: 20, couleur: '#E53935', imageUrl: IMG.oryx, description: 'Bouteille Oryx 25kg — familles nombreuses & restaurants.' },
        { marque: 'Bénin Petro', poids: 6, prix: 3200, stock: 40, couleur: '#16a34a', imageUrl: IMG.benin, description: 'Bénin Petro 6kg — marque nationale de qualité.' },
        { marque: 'Bénin Petro', poids: 12.5, prix: 6500, stock: 25, couleur: '#16a34a', imageUrl: IMG.benin, description: 'Bénin Petro 12.5kg — prix accessible.' },
        { marque: 'Bénin Petro', poids: 25, prix: 12500, stock: 15, couleur: '#16a34a', imageUrl: IMG.benin, description: 'Bénin Petro 25kg — grand format économique.' },
        { marque: 'PUMA GAZ', poids: 6, prix: 3800, stock: 60, couleur: '#060e83', imageUrl: IMG.puma, description: 'PUMA GAZ 6kg — qualité premium.' },
        { marque: 'PUMA GAZ', poids: 12.5, prix: 7500, stock: 35, couleur: '#060e83', imageUrl: IMG.puma, description: 'PUMA GAZ 12.5kg — le choix des professionnels.' },
        { marque: 'PUMA GAZ', poids: 25, prix: 14500, stock: 18, couleur: '#060e83', imageUrl: IMG.puma, description: 'PUMA GAZ 25kg — haute performance industrielle.' },
        { marque: 'PRO GAZ', poids: 6, prix: 3000, stock: 30, couleur: '#470657', imageUrl: IMG.pro, description: 'PRO GAZ 6kg — rapport qualité/prix imbattable.' },
        { marque: 'PRO GAZ', poids: 12.5, prix: 6000, stock: 20, couleur: '#470657', imageUrl: IMG.pro, description: 'PRO GAZ 12.5kg — pour tous les usages.' },
        { marque: 'PRO GAZ', poids: 25, prix: 11500, stock: 10, couleur: '#470657', imageUrl: IMG.pro, description: 'PRO GAZ 25kg — économique et fiable.' },
    ]);
    console.log('✅ Produits créés (Oryx, Bénin Petro, PUMA GAZ, PRO GAZ)');

    // Slider
    await Slider.insertMany([
        { titre: 'Livraison de gaz en 30 min', sousTitre: 'Oryx, Bénin Petro, PUMA GAZ, PRO GAZ — livrés à votre porte', imageUrl: IMG.s1, lien: '/commander', labelBouton: 'Commander maintenant', ordre: 1, actif: true },
        { titre: 'Boutique accessoires gaz', sousTitre: 'Détendeurs, tuyaux, briquets — tout ce qu\'il vous faut', imageUrl: IMG.s2, lien: '/accessoires', labelBouton: 'Voir la boutique', ordre: 2, actif: true },
        { titre: 'Suivi en temps réel', sousTitre: 'Tracez votre livreur sur la carte jusqu\'à votre porte', imageUrl: IMG.s3, lien: '/suivi', labelBouton: 'Suivre ma commande', ordre: 3, actif: true },
    ]);
    console.log('✅ Slider créé (3 slides)');

    // Accessoires
    await Accessoire.insertMany([
        { nom: 'Détendeur universel', categorie: 'Détendeur', prix: 2500, stock: 100, description: 'Compatible toutes marques. Norme CE.', imageUrl: IMG.acc, disponible: true, reference: 'DET-001' },
        { nom: 'Détendeur haute pression', categorie: 'Détendeur', prix: 4500, stock: 50, description: 'Usage professionnel — grandes bouteilles.', imageUrl: IMG.acc, disponible: true, reference: 'DET-002' },
        { nom: 'Tuyau flexible 1m', categorie: 'Tuyau', prix: 1800, stock: 200, description: 'Tuyau armé certifié, longueur 1 mètre.', imageUrl: null, disponible: true, reference: 'TUY-001' },
        { nom: 'Tuyau flexible 1.5m', categorie: 'Tuyau', prix: 2500, stock: 150, description: 'Tuyau armé certifié, longueur 1.5 mètres.', imageUrl: null, disponible: true, reference: 'TUY-002' },
        { nom: 'Briquet longue flamme', categorie: 'Briquet', prix: 800, stock: 500, description: 'Allume-feu longue durée, rechargeable.', imageUrl: null, disponible: true, reference: 'BRI-001' },
        { nom: 'Détecteur fuite gaz', categorie: 'Sécurité', prix: 6500, stock: 30, description: 'Alarme sonore — indispensable pour votre sécurité.', imageUrl: IMG.acc, disponible: true, reference: 'SEC-001' },
        { nom: 'Gazinière 2 feux compacte', categorie: 'Gazinière', prix: 35000, stock: 15, description: 'Idéale petit espace — livraison avec installation.', imageUrl: null, disponible: true, reference: 'GAZ-001' },
        { nom: 'Colliers de serrage (lot 5)', categorie: 'Autre', prix: 500, stock: 1000, description: 'Raccords métalliques pour tuyaux gaz.', imageUrl: null, disponible: true, reference: 'AUT-001' },
    ]);
    console.log('✅ Accessoires créés (8 articles)');

    console.log('\n🎉 Seed terminé !');
    console.log('📧 Admin   : +22961000000 / Admin@123');
    console.log('📧 Livreur : +22961000001 / Livreur@123');
    console.log('📧 Client  : +22961000002 / Client@123');
    process.exit(0);
};

seed().catch(err => {
    console.error('❌ Erreur seed:', err.message);
    process.exit(1);
});