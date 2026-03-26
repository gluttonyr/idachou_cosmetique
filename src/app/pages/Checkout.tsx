import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useCart } from '../context/CartContext';
import { CheckCircle, AlertCircle, Loader2, Upload, Phone } from 'lucide-react';
import supabase from '../utils/supabase';

import { operateurService } from '../service/operateurService';
import { generateUssd } from '../service/payementService';
import { venteService } from '../service/venteService';
import { receiptService } from '../service/FactureService';
import html2pdf from 'html2pdf.js';

interface VenteProduit {
  id: number;
  vente_id: number;
  produit_id: number;
  quantite: number;
  prixUnitaire: number;
  Produit: any;
}

type VenteStatus = 'EN_ATTENTE' | 'ECHOUER' | 'VALIDER'; 
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
// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type Step = 'form' | 'operateur' | 'paiement' | 'upload' | 'success';

interface Operateur {
  id: string | number;
  nom: string;
  code: 'moov' | 'yas';
  image: string;
  numero?: string; 
}

// ─────────────────────────────────────────────
// Utilitaires
// ─────────────────────────────────────────────

/** Génère une référence de vente unique */
function generateReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `VNT-${timestamp}-${random}`;
}

/** Détecte si l'utilisateur est sur mobile */
function isMobile(): boolean {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

// ─────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────
export const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getTotalprix, createOrder, clearCart } = useCart();
  const [fullVente, setFullVente] = useState<Vente | null>(null);
  const [waLink, setWaLink] = useState<string>('');

  // ── State existant ──
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });

  // ── Nouveaux states ──
  const [step, setStep] = useState<Step>('form');
  const [operateurs, setOperateurs] = useState<Operateur[]>([]);
  const [selectedOperateur, setSelectedOperateur] = useState<Operateur | null>(null);
  const [telLink, setTelLink] = useState<string>('');
  const [montantTotal, setMontantTotal] = useState<number>(0);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingOperateurs, setLoadingOperateurs] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Chargement des opérateurs ──
  useEffect(() => {
    const fetchOperateurs = async () => {
      setLoadingOperateurs(true);
      try {
        const data = await operateurService.getAll();
        setOperateurs(data ?? []);
      } catch (err) {
        console.error('Erreur chargement opérateurs:', err);
        // Fallback statique si l'API échoue
        setOperateurs([
          { id: 'moov', nom: 'Moov Money', code: 'moov', image: '/images/moov.png' },
          { id: 'yas', nom: 'Yas (TMoney)', code: 'yas', image: '/images/tmoney.png' },
        ]);
      } finally {
        setLoadingOperateurs(false);
      }
    };
    fetchOperateurs();
  }, []);

  // ── Redirect si panier vide ──
  useEffect(() => {
    if (cart.length === 0 && step === 'form') {
      navigate('/panier');
    }
  }, [cart, step, navigate]);

  // ── Handlers formulaire (inchangés) ──
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ── Soumission du formulaire → passe à l'étape opérateur ──
  // MODIFIÉ : n'appelle plus createOrder ici, on attend la confirmation de paiement
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStep('operateur');
  };

  // ── Sélection d'un opérateur ──
  const handleSelectOperateur = (op: Operateur) => {
    setError(null);
    try {
      const phoneClean = op.numero // 8 derniers chiffres
      const result = generateUssd({
        operateur: op.code,
        numero: phoneClean!,
        montant: getTotalprix(),
        frais: 0,
      });

      setSelectedOperateur(op);
      setTelLink(result.telLink);
      setMontantTotal(result.montantTotal);
      setStep('paiement');

      // Lance automatiquement le lien sur mobile
      if (isMobile()) {
        setTimeout(() => {
          window.location.href = result.telLink;
        }, 800);
      }
    } catch (err: any) {
      setError(err.message ?? 'Erreur lors de la génération du lien de paiement.');
    }
  };

  // ── Sélection du fichier preuve ──
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setProofFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProofPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setProofPreview(null);
    }
  };

  // ── Soumission finale : upload + création Vente + VenteProduit ──
  const handleFinalSubmit = async () => {
    if (!proofFile) {
      setError('Veuillez joindre une capture d\'écran de la transaction.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // ── Étape 1 : Upload de l'image dans Supabase Storage ──
      const fileExt = proofFile.name.split('.').pop();
      const fileName = `${generateReference()}.${fileExt}`;
      const filePath = `preuves/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('commandes')
        .upload(filePath, proofFile, { cacheControl: '3600', upsert: false });

      if (uploadError) throw new Error(`Erreur upload : ${uploadError.message}`);

      const { data: publicData } = supabase.storage
        .from('commandes')
        .getPublicUrl(filePath);

      const imageUrl = publicData.publicUrl;

      // ── Étape 2 : Création de la Vente ──
      const reference = generateReference();
      const { data: venteData, error: venteError } = await supabase
        .from('Vente')
        .insert({
          prixTotal: montantTotal,
          reference,
          image: imageUrl,
          status: 'EN_ATTENTE',
          operateur: selectedOperateur?.code,
          clientNom: formData.name,
          clientPhone: formData.phone,
          clientEmail: formData.email || null,
        })
        .select()
        .single();

      if (venteError) throw new Error(`Erreur création vente : ${venteError.message}`);

      // ── Étape 3 : Création des VenteProduit ──
      const venteProduits = cart.map((item) => ({
        vente_id: venteData.id,
        produit_id: item.id,
        quantite: item.quantity,
        prixUnitaire: item.prix,
      }));

      const { error: vpError } = await supabase
        .from('VenteProduit')
        .insert(venteProduits);

      if (vpError) throw new Error(`Erreur création VenteProduit : ${vpError.message}`);

      // ── Succès ──
      createOrder(formData.name, formData.phone, formData.email);
      setStep('success');
      
const fullVenteData = await venteService.getWithProduits(venteData.id);
setFullVente(fullVenteData);

const link = `https://wa.me/${selectedOperateur?.numero}?text=Bonjour%20IDACHOU%20PERLAGE%20GLOSS%2C%20j'ai%20effectué%20un%20paiement%20de%20${montantTotal}FCFA%20via%20${selectedOperateur?.nom}%20pour%20la%20commande%20${reference}.%20Voici%20le%20lien%20de%20la%20preuve%3A%20${encodeURIComponent(imageUrl)}.%20Merci!`;
setWaLink(link);
// Télécharger le PDF automatiquement
downloadReceipt(fullVenteData);
// ❌ Supprimer le setTimeout WhatsApp ici
  
    } catch (err: any) {
      setError(err.message ?? 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

   const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const getStatusColor = (status: VenteStatus) => {
    switch (status) {
      case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-800';
      case 'ECHOUER':    return 'bg-red-100 text-red-800';
      case 'VALIDER':    return 'bg-green-100 text-green-800';
    }
  };

  const getStatusText = (status: VenteStatus) => {
    switch (status) {
      case 'EN_ATTENTE': return 'En attente';
      case 'ECHOUER':    return 'Échouée';
      case 'VALIDER':    return 'Validée';
    }
  };


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

  // ─────────────────────────────────────────────
  // RENDU – Écran de succès (inchangé dans son principe)
  // ─────────────────────────────────────────────
  // if (step === 'success') {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-12 px-4 flex items-center justify-center">
  //       <div className="bg-white rounded-lg shadow-lg p-12 text-center max-w-md">
  //         <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
  //         <h2 className="text-3xl font-bold text-gray-800 mb-4">Commande envoyée !</h2>
  //         <p className="text-gray-600 mb-2">
  //           Merci <strong>{formData.name}</strong> pour votre commande.
  //         </p>
  //         <p className="text-gray-600 mb-6">
  //           Votre paiement est en cours de vérification. Nous vous contacterons au{' '}
  //           <strong>{formData.phone}</strong>.
  //         </p>
  //         <p className="text-sm text-gray-500">Redirection vers l'accueil...</p>
  //       </div>
  //     </div>
  //   );
  // }

  if (step === 'success') {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-12 px-4 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-12 text-center max-w-md">
        <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Commande envoyée !</h2>
        <p className="text-gray-600 mb-2">
          Merci <strong>{formData.name}</strong> pour votre commande.
        </p>
        <p className="text-gray-600 mb-6">
          Votre paiement est en cours de vérification. Nous vous contacterons au{' '}
          <strong>{formData.phone}</strong>.
        </p>

        {/* Boutons d'action */}
        <div className="flex flex-col gap-3 mb-6">
          {/* Bouton télécharger PDF */}
          <button
            onClick={() => fullVente && downloadReceipt(fullVente)}
            disabled={!fullVente}
            className="flex items-center justify-center gap-2 w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Télécharger le reçu PDF
          </button>

          {/* Bouton WhatsApp */}
          
          <a  href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors font-semibold"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Envoyer via WhatsApp
          </a>
        </div>

        <p className="text-sm text-gray-500">Redirection vers l'accueil dans quelques secondes...</p>
      </div>
    </div>
  );
}

  // ─────────────────────────────────────────────
  // RENDU – Layout principal
  // ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Finaliser la commande</h1>

        {/* Indicateur d'étapes */}
        <StepIndicator step={step} />

        {/* Message d'erreur global */}
        {error && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ── Colonne gauche : étapes dynamiques ── */}
          <div>
            {/* ÉTAPE 1 : Formulaire client */}
            {step === 'form' && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Vos informations</h2>
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <FormField
                    label="Nom complet *"
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Votre nom"
                    required
                  />
                  <FormField
                    label="Numéro de téléphone *"
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Ex: 90123456"
                    required
                  />
                  <FormField
                    label="Email (optionnel)"
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="votre@email.com"
                  />
                  <button
                    type="submit"
                    className="w-full bg-pink-600 text-white py-4 rounded-lg hover:bg-pink-700 transition-colors font-semibold text-lg"
                  >
                    Continuer vers le paiement →
                  </button>
                </form>
              </div>
            )}

            {/* ÉTAPE 2 : Choix de l'opérateur */}
            {step === 'operateur' && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Choisir l'opérateur</h2>
                <p className="text-gray-500 text-sm mb-6">
                  Sélectionnez votre opérateur Mobile Money pour payer{' '}
                  <strong className="text-pink-600">{getTotalprix().toFixed(2)} FCFA</strong>
                </p>

                {loadingOperateurs ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {operateurs.map((op) => (
                      <button
                        key={op.id}
                        onClick={() => handleSelectOperateur(op)}
                        className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-xl hover:border-pink-500 hover:shadow-md transition-all group"
                      >
                        <img
                          src={op.image}
                          alt={op.nom}
                          className="w-16 h-16 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/mobile-money-fallback.png';
                          }}
                        />
                        <span className="font-semibold text-gray-700 group-hover:text-pink-600 transition-colors text-sm text-center">
                          {op.nom}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setStep('form')}
                  className="mt-6 text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  ← Modifier mes informations
                </button>
              </div>
            )}

            {/* ÉTAPE 3 : Lien de paiement */}
            {step === 'paiement' && selectedOperateur && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Effectuer le paiement</h2>
                <p className="text-gray-500 text-sm mb-6">
                  Montant à payer :{' '}
                  <strong className="text-pink-600">{montantTotal.toFixed(2)} FCFA</strong> via{' '}
                  <strong>{selectedOperateur.nom}</strong>
                </p>

                {/* Instruction selon device */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-700">
                      {isMobile()
                        ? 'L\'application de paiement va s\'ouvrir automatiquement. Si ce n\'est pas le cas, cliquez sur le bouton ci-dessous.'
                        : 'Veuillez exécuter ce code USSD sur votre téléphone mobile pour effectuer le paiement.'}
                    </p>
                  </div>
                </div>

                {/* Bouton / lien tel: */}
                <a
                  href={telLink}
                  className="flex items-center justify-center gap-3 w-full bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg mb-4"
                >
                  <Phone className="w-5 h-5" />
                  {isMobile() ? 'Lancer le paiement' : 'Code USSD (mobile uniquement)'}
                </a>

                <button
                  onClick={() => setStep('upload')}
                  className="w-full bg-pink-600 text-white py-4 rounded-lg hover:bg-pink-700 transition-colors font-semibold text-lg"
                >
                  J'ai effectué le paiement →
                </button>

                <button
                  onClick={() => setStep('operateur')}
                  className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline block mx-auto"
                >
                  ← Changer d'opérateur
                </button>
              </div>
            )}

            {/* ÉTAPE 4 : Upload de la preuve */}
            {step === 'upload' && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Confirmer le paiement</h2>
                <p className="text-gray-500 text-sm mb-6">
                  Envoyez une capture d'écran de votre confirmation de paiement.
                </p>

                {/* Zone d'upload */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-pink-400 hover:bg-pink-50 transition-all mb-4"
                >
                  {proofPreview ? (
                    <img
                      src={proofPreview}
                      alt="Aperçu"
                      className="max-h-48 mx-auto rounded-lg object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <Upload className="w-12 h-12" />
                      <p className="text-sm font-medium">Cliquez pour sélectionner une image</p>
                      <p className="text-xs">PNG, JPG, WEBP — max 10 Mo</p>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {proofFile && (
                  <p className="text-xs text-gray-500 mb-4 truncate">
                    Fichier sélectionné : {proofFile.name}
                  </p>
                )}

                <button
                  onClick={handleFinalSubmit}
                  disabled={!proofFile || loading}
                  className="w-full bg-pink-600 text-white py-4 rounded-lg hover:bg-pink-700 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    'Valider ma commande'
                  )}
                </button>

                <button
                  onClick={() => setStep('paiement')}
                  className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline block mx-auto"
                >
                  ← Retour
                </button>
              </div>
            )}
          </div>

          {/* ── Colonne droite : récapitulatif (inchangé) ── */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-8 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Votre commande</h2>

              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.profile}
                      alt={item.libelle}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">{item.libelle}</p>
                      <p className="text-gray-600 text-sm">
                        {item.quantity} x {item.prix.toFixed(2)} FCFA
                      </p>
                    </div>
                    <p className="font-semibold text-gray-800">
                      {(item.quantity * item.prix).toFixed(2)} FCFA
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>{getTotalprix().toFixed(2)} FCFA</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Livraison</span>
                  <span>Gratuite</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-xl text-gray-800">
                  <span>Total</span>
                  <span className="text-pink-600">{getTotalprix().toFixed(2)} FCFA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Sous-composants
// ─────────────────────────────────────────────

/** Indicateur visuel des étapes */
const STEPS: { key: Step; label: string }[] = [
  { key: 'form', label: 'Infos' },
  { key: 'operateur', label: 'Opérateur' },
  { key: 'paiement', label: 'Paiement' },
  { key: 'upload', label: 'Preuve' },
];

const StepIndicator = ({ step }: { step: Step }) => {
  const currentIndex = STEPS.findIndex((s) => s.key === step);
  return (
    <div className="flex items-center mb-8">
      {STEPS.map((s, i) => (
        <React.Fragment key={s.key}>
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${i <= currentIndex
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-200 text-gray-500'
                }`}
            >
              {i < currentIndex ? '✓' : i + 1}
            </div>
            <span
              className={`mt-1 text-xs font-medium ${i <= currentIndex ? 'text-pink-600' : 'text-gray-400'
                }`}
            >
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`flex-1 h-1 mx-2 mb-4 rounded transition-colors ${i < currentIndex ? 'bg-pink-600' : 'bg-gray-200'
                }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

/** Champ de formulaire réutilisable */
const FormField = ({
  label, id, type, value, onChange, placeholder, required,
}: {
  label: string;
  id: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-2">
      {label}
    </label>
    <input
      type={type}
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
    />
  </div>
);