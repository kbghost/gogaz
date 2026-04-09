export const formatPrix = (prix) => {
    return new Intl.NumberFormat('fr-BJ', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0,
    }).format(prix)
}

export const formatDate = (date) => {
    return new Intl.DateTimeFormat('fr-BJ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date))
}

export const formatDateRelative = (date) => {
    const now = new Date()
    const d = new Date(date)
    const diff = now - d
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    if (minutes < 1) return "À l'instant"
    if (minutes < 60) return `Il y a ${minutes} min`
    if (hours < 24) return `Il y a ${hours}h`
    return formatDate(date)
}

export const statutLabel = {
    en_attente: { label: 'En attente', icon: '⏳', step: 0 },
    validee: { label: 'Validée', icon: '✅', step: 1 },
    en_livraison: { label: 'En cours', icon: '🚚', step: 2 },
    livree: { label: 'Livrée', icon: '🎉', step: 3 },
    annulee: { label: 'Annulée', icon: '❌', step: -1 },
}

export const getBadgeClass = (statut) => {
    const map = {
        en_attente: 'badge-attente',
        validee: 'badge-validee',
        en_livraison: 'badge-livraison',
        livree: 'badge-livree',
        annulee: 'badge-annulee',
    }
    return map[statut] || 'badge-attente'
}

export const getUserPosition = () => new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error('Géolocalisation non supportée')); return }
    navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => reject(err), { enableHighAccuracy: true, timeout: 10000 }
    )
})

// Updated: TotalEnergies→PUMA GAZ (#1565C0 bleu), Autres→PRO GAZ (#2E7D32 vert foncé)
export const marqueColors = {
    'Oryx': '#E53935', // rouge
    'Bénin Petro': '#16a34a', // vert national
    'PUMA GAZ': '#060e83', // bleu PUMA
    'PRO GAZ': '#470657', // vert pro
}

export const MARQUES = ['Oryx', 'Bénin Petro', 'PUMA GAZ', 'PRO GAZ']