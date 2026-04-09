const Commande    = require('../models/Commande');
const CommandeAcc = require('../models/CommandeAccessoire');
const User        = require('../models/User');

exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // Données de base
    const [
      totalCommandes, enAttente, validee, enLivraison, livrees, annulees,
      totalClients, totalLivreurs,
      commandesToday, commandesAccToday,
      commandesThisMonth, commandesAccThisMonth,
    ] = await Promise.all([
      Commande.countDocuments({}),
      Commande.countDocuments({ statut: 'en_attente' }),
      Commande.countDocuments({ statut: 'validee' }),
      Commande.countDocuments({ statut: 'en_livraison' }),
      Commande.countDocuments({ statut: 'livree' }),
      Commande.countDocuments({ statut: 'annulee' }),
      User.countDocuments({ role: 'client' }),
      User.countDocuments({ role: 'livreur' }),
      Commande.find({ createdAt: { $gte: today }, statut: { $ne: 'annulee' } }).select('prixTotal'),
      CommandeAcc.find({ createdAt: { $gte: today }, statut: { $ne: 'annulee' } }).select('prixTotal'),
      Commande.find({ createdAt: { $gte: monthStart }, statut: { $ne: 'annulee' } }).select('prixTotal'),
      CommandeAcc.find({ createdAt: { $gte: monthStart }, statut: { $ne: 'annulee' } }).select('prixTotal'),
    ]);

    const caJour = [...commandesToday, ...commandesAccToday].reduce((s, c) => s + (c.prixTotal || 0), 0);
    const caMois = [...commandesThisMonth, ...commandesAccThisMonth].reduce((s, c) => s + (c.prixTotal || 0), 0);

    // Graphique 7 derniers jours
    const jours = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dEnd = new Date(d); dEnd.setHours(23, 59, 59, 999);
      const label = d.toLocaleDateString('fr-BJ', { weekday: 'short', day: 'numeric' });
      jours.push({ date: d, dateEnd: dEnd, label });
    }

    const [gazParJour, accParJour] = await Promise.all([
      Commande.aggregate([
        { $match: { createdAt: { $gte: jours[0].date }, statut: { $ne: 'annulee' } } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$prixTotal' },
          count: { $sum: 1 }
        }}
      ]),
      CommandeAcc.aggregate([
        { $match: { createdAt: { $gte: jours[0].date }, statut: { $ne: 'annulee' } } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$prixTotal' },
          count: { $sum: 1 }
        }}
      ]),
    ]);

    const gazMap = Object.fromEntries(gazParJour.map(g => [g._id, g]));
    const accMap = Object.fromEntries(accParJour.map(g => [g._id, g]));

    const chartData = jours.map(j => {
      const key = j.date.toISOString().slice(0, 10);
      return {
        label: j.label,
        gaz:   gazMap[key]?.total || 0,
        acc:   accMap[key]?.total || 0,
        cmdGaz: gazMap[key]?.count || 0,
        cmdAcc: accMap[key]?.count || 0,
      };
    });

    // Répartition statuts pour pie chart
    const statutsData = [
      { name: 'En attente', value: enAttente,   color: '#fbbf24' },
      { name: 'Validée',    value: validee,      color: '#60a5fa' },
      { name: 'En cours',   value: enLivraison,  color: '#f97c0a' },
      { name: 'Livrée',     value: livrees,      color: '#34d399' },
      { name: 'Annulée',    value: annulees,     color: '#f87171' },
    ].filter(s => s.value > 0);

    res.json({
      success: true,
      stats: {
        totalCommandes, enAttente, validee, enLivraison, livrees, annulees,
        totalClients, totalLivreurs, caJour, caMois,
        chartData,    // 7 jours
        statutsData,  // pie chart
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur statistiques.' });
  }
};
