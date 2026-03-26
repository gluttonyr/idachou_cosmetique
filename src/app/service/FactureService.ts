import html2pdf from "html2pdf.js"

export const receiptService = {
    download: (vente: any) => {
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
        console.log("Generating PDF with options:", opt)

        html2pdf().from(element).set(opt).save()
    }
}