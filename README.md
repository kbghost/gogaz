<<<<<<< HEAD
--# 🔥 GazLivraison Bénin — v2

Plateforme complète de livraison de gaz domestique au Bénin.

---

## 🆕 Nouveautés v2

| Feature | Description |
|---|---|
| 🖼️ **Vraies images** | Photos réelles de bouteilles de gaz (upload ou URL externe) |
| 🎠 **Slider automatique** | Carousel avec défilement toutes les 10 secondes |
| 🌓 **Dark / Light mode** | Thème sombre/clair avec persistance localStorage |
| 🔧 **Boutique accessoires** | Détendeurs, tuyaux, briquets — CRUD complet |
| 💡 **Upsell post-commande** | Suggestion d'accessoires après chaque commande de gaz |
| 📤 **Upload d'images** | Multer — upload sécurisé pour produits, slider, accessoires |

---

## ⚙️ Prérequis

- **Node.js** v18+
- **MongoDB** v6+ (local ou Atlas)
- **npm**

---

## 🚀 Installation

### 1. Backend

```bash
cd gazlivraison/backend
cp .env.example .env
# Éditez .env (MongoDB URI, JWT secret, etc.)
npm install
node src/config/seed.js   # Données initiales + images réelles
npm run dev               # Port 5000
```

### 2. Frontend

```bash
cd gazlivraison/frontend
cp .env.example .env
# Optionnel: ajoutez VITE_GOOGLE_MAPS_KEY pour Google Maps
npm install
npm run dev               # Port 3000
```

---

## 🔐 Comptes de test

| Rôle | Téléphone | Mot de passe |
|---|---|---|
| Admin | +22961000000 | Admin@123 |
| Livreur | +22961000001 | Livreur@123 |
| Client | +22961000002 | Client@123 |

---

## 🖼️ Gestion des images — Guide complet

### Architecture

Les images sont stockées dans `backend/uploads/` avec 3 sous-dossiers :

```
backend/uploads/
├── produits/     ← images des bouteilles de gaz
├── slider/       ← images du carousel
└── accessoires/  ← images de la boutique accessoires
```

Elles sont servies publiquement à : `http://localhost:5000/uploads/<catégorie>/<fichier>`

### Option A — Upload via Dashboard Admin (recommandé)

1. Connectez-vous en tant qu'admin (`/login`)
2. Allez dans **Admin → Produits** ou **Admin → Slider** ou **Admin → Accessoires**
3. Cliquez sur "Modifier" ou "Ajouter"
4. Dans le formulaire : cliquez sur la zone image ou le bouton "📤 Uploader une photo"
5. Choisissez un fichier JPG/PNG/WebP (max 5 Mo)

**L'image est automatiquement :**
- Sauvegardée dans `backend/uploads/<catégorie>/`
- Liée au produit en base de données
- Affichée partout sur le site

### Option B — URL externe (sans upload)

Dans les formulaires admin, collez simplement l'URL d'une image externe :
```
https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80
```

**Sources d'images gratuites recommandées :**

| Site | Usage |
|---|---|
| [Unsplash.com](https://unsplash.com/s/photos/gas-bottle) | Photos libres de droits |
| [Pexels.com](https://www.pexels.com/search/gas%20cylinder/) | Photos libres de droits |
| [Pixabay.com](https://pixabay.com/images/search/gas%20bottle/) | Photos libres de droits |

**Termes de recherche utiles :**
- "gas cylinder" / "gas bottle"
- "cooking gas" / "LPG cylinder"
- "propane tank"
- "Oryx gas" / "Total gas"

### Option C — Images dans le seed (par défaut)

Le fichier `backend/src/config/seed.js` contient des URLs Unsplash pré-configurées.
Pour les modifier, éditez la section `GAS_IMAGES` :

```js
const GAS_IMAGES = {
  oryx_6:    'https://votre-url-image-oryx-6kg.jpg',
  oryx_125:  'https://votre-url-image-oryx-12.5kg.jpg',
  // ...
}
```

### Remplacement d'une image existante

1. **Via admin** : Modifier le produit → choisir une nouvelle image → Sauvegarder
   - L'ancienne image locale est automatiquement supprimée du disque

2. **Via API** (avancé) :
```bash
curl -X PUT http://localhost:5000/api/produits/<id> \
  -H "Authorization: Bearer <token>" \
  -F "image=@/chemin/vers/photo.jpg"
```

### Fallback SVG

Si un produit n'a pas de photo, le site affiche automatiquement l'illustration SVG de bouteille colorée selon la marque. Aucune configuration requise.

---

## 🎠 Slider / Carousel

### Fonctionnement

- Défilement automatique toutes les **10 secondes**
- Pause automatique au survol (desktop)
- Navigation par flèches ← → et points cliquables
- Barre de progression animée
- Transitions fluides (cross-fade 0.6s)
- Responsive mobile et desktop

### Gérer les slides (admin)

1. **Admin → Slider**
2. Cliquez "+ Ajouter un slide"
3. Uploadez une image (format paysage recommandé : 1400×580px)
4. Remplissez : titre, sous-titre, lien du bouton, ordre
5. Activez/désactivez avec le toggle

**Ordre d'affichage** : le champ "Ordre" contrôle la séquence. 
- Ordre 1 = premier slide affiché
- Ordre 2 = deuxième, etc.

---

## 🌓 Dark / Light Mode

- Bouton 🌙/☀️ dans la barre de navigation
- Préférence sauvegardée dans `localStorage` (clé : `gz_theme`)
- Transitions fluides (0.25s)
- Par défaut : thème sombre

---

## 🔧 Boutique Accessoires

### Catégories disponibles

- Détendeur
- Tuyau  
- Briquet
- Gazinière
- Sécurité
- Autre

### Gérer les accessoires (admin)

**Admin → Accessoires** — Interface complète :
- ➕ Créer avec photo, catégorie, prix, stock, référence
- ✏️ Modifier tous les champs
- 🗑️ Supprimer (supprime aussi la photo du serveur)
- Filtrer par catégorie

### Upsell post-commande

Après chaque commande de gaz réussie, une modal s'affiche automatiquement :
- Présente 3 accessoires populaires disponibles
- Bouton "Voir tous les accessoires" → `/accessoires`
- Bouton "Non merci" → va directement au suivi de commande

---

## 📡 API REST v2

### Nouvelles routes

```
# Slider
GET    /api/slider              Slides actifs (public)
GET    /api/slider?all=true     Tous les slides (admin)
POST   /api/slider              Créer (multipart/form-data)
PUT    /api/slider/:id          Modifier (multipart/form-data)
PUT    /api/slider/reorder      Réordonner [{id, ordre}, ...]
DELETE /api/slider/:id          Supprimer

# Accessoires
GET    /api/accessoires         Liste (public, filtres: categorie, disponible)
GET    /api/accessoires/:id     Détail
GET    /api/accessoires/categories  Catégories distinctes
POST   /api/accessoires         Créer (multipart/form-data)
PUT    /api/accessoires/:id     Modifier (multipart/form-data)
DELETE /api/accessoires/:id     Supprimer

# Uploads statiques
GET    /uploads/produits/<file>    Image produit
GET    /uploads/slider/<file>      Image slider
GET    /uploads/accessoires/<file> Image accessoire
```

### Upload d'image (FormData)

```js
const fd = new FormData()
fd.append('image', fichier)       // fichier File JS
fd.append('nom', 'Nom du produit')
fd.append('prix', 3500)

fetch('/api/produits', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: fd,
})
```

---

## 📁 Structure complète

```
gazlivraison/
├── backend/
│   ├── uploads/
│   │   ├── produits/    ← images bouteilles
│   │   ├── slider/      ← images carousel
│   │   └── accessoires/ ← images boutique
│   └── src/
│       ├── middleware/
│       │   ├── auth.js
│       │   └── upload.js      ← Multer configuré
│       ├── models/
│       │   ├── Produit.js     ← +imageUrl
│       │   ├── Slider.js      ← NOUVEAU
│       │   └── Accessoire.js  ← NOUVEAU
│       ├── controllers/
│       │   ├── sliderController.js     ← NOUVEAU
│       │   └── accessoireController.js ← NOUVEAU
│       └── routes/
│           ├── slider.js      ← NOUVEAU
│           └── accessoires.js ← NOUVEAU
│
└── frontend/
    └── src/
        ├── components/ui/
        │   ├── HeroSlider.jsx    ← NOUVEAU carousel
        │   ├── ThemeToggle.jsx   ← NOUVEAU bouton thème
        │   ├── ProductImage.jsx  ← NOUVEAU vraie image + fallback SVG
        │   └── UpsellModal.jsx   ← NOUVEAU modal post-commande
        ├── context/
        │   └── ThemeContext.jsx  ← NOUVEAU dark/light mode
        └── pages/
            ├── admin/
            │   ├── AdminSlider.jsx       ← NOUVEAU
            │   └── AdminAccessoires.jsx  ← NOUVEAU
            └── client/
                └── Accessoires.jsx      ← NOUVEAU boutique
```

---

## 🛠️ Déploiement production

### Stockage images en production

En production, remplacez le stockage local par **Cloudinary** ou **AWS S3** :

1. Installez : `npm install cloudinary multer-storage-cloudinary`
2. Remplacez le `diskStorage` dans `src/middleware/upload.js` par `CloudinaryStorage`
3. Mettez à jour `CLOUDINARY_URL` dans `.env`

**Variables d'environnement backend :**
```env
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=secret_tres_long_et_securise
CLIENT_URL=https://votre-domaine.com
NODE_ENV=production
```

**Variables d'environnement frontend :**
```env
VITE_API_URL=https://api.votre-domaine.com
VITE_SOCKET_URL=https://api.votre-domaine.com
VITE_GOOGLE_MAPS_KEY=votre_cle_google_maps
```
=======
# gogaz
projet de gaz
>>>>>>> edc10e5df73326d1d813cdc684d89ee5a4fafee0
