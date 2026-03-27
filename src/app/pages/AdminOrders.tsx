import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Eye, Calendar, User, Phone, Mail, Download, Check, XCircle, Loader2 } from 'lucide-react';
import { venteService } from '../service/venteService';
import html2pdf from "html2pdf.js"


// Type Supabase Vente
type VenteStatus = 'EN_ATTENTE' | 'ECHOUER' | 'VALIDER';

interface Produit {
  id: number;
  nom: string;
  image?: string;
}

interface VenteProduit {
  id: number;
  vente_id: number;
  produit_id: number;
  quantite: number;
  prixUnitaire: number;
  Produit: Produit;
}

interface Vente {
  id: number;
  reference: string;
  prixTotal: number;
  status: VenteStatus;
  clientNom: string;
  clientPhone: string;
  clientEmail?: string;
  operateur: string;
  image?: string;
  created_at: string;
  VenteProduit?: VenteProduit[];
}

export const AdminOrders = () => {
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [selectedVente, setSelectedVente] = useState<Vente | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Chargement initial de toutes les ventes
  useEffect(() => {
    loadVentes();
  }, []);

  const loadVentes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await venteService.getAll();
      setVentes(data as Vente[]);
    } catch (err) {
      setError('Erreur lors du chargement des commandes.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Sélection d'une vente → charge les détails avec produits
  const handleSelectVente = async (vente: Vente) => {
    try {
      setDetailLoading(true);
      const full = await venteService.getWithProduits(vente.id);
      setSelectedVente(full as Vente);
    } catch (err) {
      console.error('Erreur chargement détails:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Mise à jour du statut via Supabase
  const updateStatus = async (id: number, status: VenteStatus) => {
    try {
      setUpdating(true);
      const updated = await venteService.updateStatus(id, status);
      setVentes(prev => prev.map(v => v.id === id ? { ...v, status } : v));
      if (selectedVente?.id === id) {
        setSelectedVente(prev => prev ? { ...prev, status } : prev);
      }
    } catch (err) {
      console.error('Erreur mise à jour statut:', err);
      alert('Impossible de mettre à jour le statut.');
    } finally {
      setUpdating(false);
    }
  };

  //   const downloadReceipt = (vente: Vente) => {
  //     const produits = vente.VenteProduit || [];
  //     const receiptHTML = `
  // <!DOCTYPE html>
  // <html lang="fr">
  // <head>
  //     <meta charset="UTF-8">
  //     <title>Reçu - Commande #${vente.reference}</title>
  //     <style>
  //         body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #333; }
  //         .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #ec4899; padding-bottom: 20px; }
  //         .header h1 { color: #ec4899; margin: 0; font-size: 32px; }
  //         .info-section { margin-bottom: 30px; }
  //         .info-section h2 { color: #ec4899; font-size: 18px; border-bottom: 2px solid #f9a8d4; padding-bottom: 5px; }
  //         .info-row { margin: 8px 0; display: flex; }
  //         .info-label { font-weight: bold; width: 150px; color: #666; }
  //         .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  //         .items-table th { background-color: #ec4899; color: white; padding: 12px; text-align: left; }
  //         .items-table td { padding: 12px; border-bottom: 1px solid #e5e5e5; }
  //         .total-section { text-align: right; margin-top: 20px; font-size: 24px; }
  //         .total-amount { color: #ec4899; font-weight: bold; }
  //         .footer { margin-top: 60px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #e5e5e5; padding-top: 20px; }
  //         .status-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 14px; font-weight: bold; }
  //         .status-EN_ATTENTE { background-color: #fef3c7; color: #92400e; }
  //         .status-ECHOUER { background-color: #fee2e2; color: #991b1b; }
  //         .status-VALIDER { background-color: #d1fae5; color: #065f46; }
  //     </style>
  // </head>
  // <body>
  //     <div class="header">
  //         <h1>IDACHOU PERLAGE GLOSS</h1>
  //         <p>Reçu de commande</p>
  //     </div>
  //     <div class="info-section">
  //         <h2>Informations de commande</h2>
  //         <div class="info-row"><span class="info-label">Référence:</span><span>#${vente.reference}</span></div>
  //         <div class="info-row"><span class="info-label">Date:</span><span>${new Date(vente.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>
  //         <div class="info-row"><span class="info-label">Statut:</span><span class="status-badge status-${vente.status}">${getStatusText(vente.status)}</span></div>
  //         <div class="info-row"><span class="info-label">Opérateur:</span><span>${vente.operateur}</span></div>
  //     </div>
  //     <div class="info-section">
  //         <h2>Informations client</h2>
  //         <div class="info-row"><span class="info-label">Nom:</span><span>${vente.clientNom}</span></div>
  //         <div class="info-row"><span class="info-label">Téléphone:</span><span>${vente.clientPhone}</span></div>
  //         ${vente.clientEmail ? `<div class="info-row"><span class="info-label">Email:</span><span>${vente.clientEmail}</span></div>` : ''}
  //     </div>
  //     <div class="info-section">
  //         <h2>Articles commandés</h2>
  //         <table class="items-table">
  //             <thead><tr><th>Produit</th><th>Prix unitaire</th><th>Quantité</th><th>Total</th></tr></thead>
  //             <tbody>
  //                 ${produits.map(vp => `
  //                 <tr>
  //                     <td>${vp.Produit?.nom ?? '—'}</td>
  //                     <td>${vp.prixUnitaire.toFixed(2)} FCFA</td>
  //                     <td>${vp.quantite}</td>
  //                     <td>${(vp.prixUnitaire * vp.quantite).toFixed(2)} FCFA</td>
  //                 </tr>`).join('')}
  //             </tbody>
  //         </table>
  //     </div>
  //     <div class="total-section"><strong>Total: <span class="total-amount">${vente.prixTotal.toFixed(2)} FCFA</span></strong></div>
  //     <div class="footer"><p>Merci pour votre commande !</p><p>IDACHOU PERLAGE GLOSS - ${new Date().getFullYear()}</p></div>
  // </body>
  // </html>`;

  //     const blob = new Blob([receiptHTML], { type: 'text/html' });
  //     const url = URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = `recu-${vente.reference}.html`;
  //     document.body.appendChild(a);
  //     a.click();
  //     document.body.removeChild(a);
  //     URL.revokeObjectURL(url);
  //   };



  const downloadReceipt = (vente: Vente) => {
    const produits = vente.VenteProduit || []

    const receiptHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Reçu - Commande #${vente.reference}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #333; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #ec4899; padding-bottom: 20px; }
        .header h1 { color: #ec4899; margin: 0; font-size: 32px; }
        .info-section { margin-bottom: 30px; }
        .info-section h2 { color: #ec4899; font-size: 18px; border-bottom: 2px solid #f9a8d4; padding-bottom: 5px; }
        .info-row { margin: 8px 0; display: flex; }
        .info-label { font-weight: bold; width: 150px; color: #666; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items-table th { background-color: #ec4899; color: white; padding: 12px; text-align: left; }
        .items-table td { padding: 12px; border-bottom: 1px solid #e5e5e5; }
        .total-section { text-align: right; margin-top: 20px; font-size: 24px; }
        .total-amount { color: #ec4899; font-weight: bold; }
        .footer { margin-top: 60px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #e5e5e5; padding-top: 20px; }
        .status-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 14px; font-weight: bold; }
        .status-EN_ATTENTE { background-color: #fef3c7; color: #92400e; }
        .status-ECHOUER { background-color: #fee2e2; color: #991b1b; }
        .status-VALIDER { background-color: #d1fae5; color: #065f46; }
    </style>
</head>
<body>
    <div class="header">
        <h1>IDACHOU PERLAGE GLOSS</h1>
        <p>Reçu de commande</p>
    </div>
    <div class="info-section">
        <h2>Informations de commande</h2>
        <div class="info-row"><span class="info-label">Référence:</span><span>#${vente.reference}</span></div>
        <div class="info-row"><span class="info-label">Date:</span><span>${new Date(vente.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>
        <div class="info-row"><span class="info-label">Statut:</span><span class="status-badge status-${vente.status}">${getStatusText(vente.status)}</span></div>
        <div class="info-row"><span class="info-label">Opérateur:</span><span>${vente.operateur}</span></div>
    </div>
    <div class="info-section">
        <h2>Informations client</h2>
        <div class="info-row"><span class="info-label">Nom:</span><span>${vente.clientNom}</span></div>
        <div class="info-row"><span class="info-label">Téléphone:</span><span>${vente.clientPhone}</span></div>
        ${vente.clientEmail ? `<div class="info-row"><span class="info-label">Email:</span><span>${vente.clientEmail}</span></div>` : ''}
    </div>
    <div class="info-section">
        <h2>Articles commandés</h2>
        <table class="items-table">
            <thead><tr><th>Produit</th><th>Prix unitaire</th><th>Quantité</th><th>Total</th></tr></thead>
            <tbody>
                ${produits.map(vp => `
                <tr>
                    <td>${vp.Produit?.nom ?? '—'}</td>
                    <td>${vp.prixUnitaire?.toFixed(2)} FCFA</td>
                    <td>${vp.quantite}</td>
                    <td>${(vp.prixUnitaire * vp.quantite)?.toFixed(2)} FCFA</td>
                </tr>`).join('')}
            </tbody>
        </table>
    </div>
    <div class="total-section"><strong>Total: <span class="total-amount">${vente.prixTotal?.toFixed(2)} FCFA</span></strong></div>
    <div class="footer"><p>Merci pour votre commande !</p><p>IDACHOU PERLAGE GLOSS - ${new Date().getFullYear()}</p></div>
</body>
</html>`;

    const element = document.createElement("div")
    element.innerHTML = receiptHTML

    const opt = {
      margin: 10,
      filename: `recu-${vente.reference}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    }

    html2pdf().from(element).set(opt).save()
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const getStatusColor = (status: VenteStatus) => {
    switch (status) {
      case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-800';
      case 'ECHOUER': return 'bg-red-100 text-red-800';
      case 'VALIDER': return 'bg-green-100 text-green-800';
    }
  };

  const getStatusText = (status: VenteStatus) => {
    switch (status) {
      case 'EN_ATTENTE': return 'En attente';
      case 'ECHOUER': return 'Échouée';
      case 'VALIDER': return 'Validée';
    }
  };


  // Après
  const enAttente = ventes.filter(v => v.status === 'EN_ATTENTE');
  const echouees = ventes.filter(v => v.status === 'ECHOUER');
  const validees = ventes.filter(v => v.status === 'VALIDER');

  const STATUS_ORDER: Record<VenteStatus, number> = { EN_ATTENTE: 0, VALIDER: 1, ECHOUER: 2 };
  const [filterStatus, setFilterStatus] = useState<VenteStatus | 'ALL'>('ALL');

  const ventesFiltrees = ventes
    .filter(v => filterStatus === 'ALL' || v.status === filterStatus)
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Link to="/admin/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Gestion des commandes</h1>
            <div className="ml-auto flex gap-2 flex-wrap">
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                {enAttente.length} en attente
              </span>
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                {echouees.length} échouées
              </span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                {validees.length} validées
              </span>
            </div>
          </div>
        </div>
      </header>


      {/* Main */}
      <main className="container mx-auto px-4 py-8">
        {/* Filtres */}
        <div className="flex gap-2 flex-wrap mb-6">
          {([
            ['ALL', 'Toutes', 'bg-gray-200 text-gray-800'],
            ['EN_ATTENTE', 'En attente', 'bg-yellow-100 text-yellow-800'],
            ['VALIDER', 'Validées', 'bg-green-100 text-green-800'],
            ['ECHOUER', 'Échouées', 'bg-red-100 text-red-800'],
          ] as const).map(([val, label, cls]) => (
            <button
              key={val}
              onClick={() => setFilterStatus(val)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all border-2 ${cls} ${filterStatus === val ? 'border-gray-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">
            <XCircle className="w-10 h-10 mx-auto mb-2" />
            <p>{error}</p>
            <button onClick={loadVentes} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
              Réessayer
            </button>
          </div>
        ) : ventes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Aucune commande</h2>
            <p className="text-gray-600">Les commandes des clients apparaîtront ici.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Liste des ventes */}
            <div className="space-y-4">
              {ventesFiltrees.map((vente) => (
                <div
                  key={vente.id}
                  className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer ${selectedVente?.id === vente.id ? 'ring-2 ring-pink-500' : ''
                    }`}
                  onClick={() => handleSelectVente(vente)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-semibold text-gray-800 text-lg">
                        {vente.reference}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(vente.created_at)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(vente.status)}`}>
                      {getStatusText(vente.status)}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <User className="w-4 h-4" /> {vente.clientNom}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Phone className="w-4 h-4" /> {vente.clientPhone}
                    </p>
                    {vente.clientEmail && (
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Mail className="w-4 h-4" /> {vente.clientEmail}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="text-sm text-gray-500">via {vente.operateur}</span>
                    <span className="text-lg font-bold text-pink-600">
                      {vente.prixTotal?.toFixed(2)} FCFA
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Détail vente */}
            <div className="lg:sticky lg:top-4 h-fit">
              {detailLoading ? (
                <div className="bg-white rounded-xl shadow-md p-12 flex justify-center items-center">
                  <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
                </div>
              ) : selectedVente ? (
                <div className="bg-white rounded-xl shadow-md p-6">
                  {/* Header détail */}
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Détails</h2>
                    <button
                      onClick={() => downloadReceipt(selectedVente)}
                      className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Reçu
                    </button>
                  </div>

                  <p className="text-sm text-gray-400 mb-4 font-mono">{selectedVente.reference}</p>

                  {/* Image de preuve si disponible */}
                  {selectedVente.image && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-800 mb-2">
                        Preuve de paiement
                      </h3>

                      <a
                        href={selectedVente.image}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={selectedVente.image}
                          alt="Preuve de paiement"
                          className="w-full rounded-xl object-cover max-h-56 border border-gray-200 cursor-pointer hover:opacity-90 transition"
                        />
                      </a>
                    </div>
                  )}

                  {/* Infos client */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-3">Client</h3>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <User className="w-4 h-4" /> {selectedVente.clientNom}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Phone className="w-4 h-4" /> {selectedVente.clientPhone}
                      </p>
                      {selectedVente.clientEmail && (
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Mail className="w-4 h-4" /> {selectedVente.clientEmail}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> {formatDate(selectedVente.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Produits */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-3">Articles</h3>
                    {selectedVente.VenteProduit && selectedVente.VenteProduit.length > 0 ? (
                      <div className="space-y-3">
                        {selectedVente.VenteProduit.map((vp) => (
                          <div key={vp.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            {vp.Produit?.image ? (
                              <img
                                src={vp.Produit.image}
                                alt={vp.Produit.nom}
                                className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-pink-100 flex items-center justify-center">
                                <ShoppingBag className="w-6 h-6 text-pink-400" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-gray-800 text-sm">{vp.Produit?.nom ?? '—'}</p>
                              <p className="text-xs text-gray-500">
                                {vp.prixUnitaire.toFixed(2)} FCFA × {vp.quantite}
                              </p>
                            </div>
                            <p className="font-semibold text-gray-800 text-sm">
                              {(vp.prixUnitaire * vp.quantite).toFixed(2)} FCFA
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Aucun produit trouvé.</p>
                    )}
                  </div>

                  {/* Total */}
                  <div className="mb-6 p-4 bg-pink-50 rounded-lg flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">Total</span>
                    <span className="text-2xl font-bold text-pink-600">
                      {selectedVente.prixTotal?.toFixed(2)} FCFA
                    </span>
                  </div>

                  {/* Statut */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Mettre à jour le statut</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {(['EN_ATTENTE', 'ECHOUER', 'VALIDER'] as VenteStatus[]).map((s) => (
                        <button
                          key={s}
                          disabled={updating || selectedVente.status === s}
                          onClick={() => updateStatus(selectedVente.id, s)}
                          className={`px-3 py-3 rounded-lg text-xs font-semibold transition-colors flex flex-col items-center gap-1 disabled:opacity-60 disabled:cursor-not-allowed ${selectedVente.status === s
                              ? s === 'EN_ATTENTE' ? 'bg-yellow-500 text-white'
                                : s === 'ECHOUER' ? 'bg-red-500 text-white'
                                  : 'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                          {selectedVente.status === s && <Check className="w-4 h-4" />}
                          <span>{getStatusText(s)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Sélectionnez une commande pour voir les détails</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};