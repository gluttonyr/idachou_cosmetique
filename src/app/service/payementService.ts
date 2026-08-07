// service/payementService.ts
type Operateur = 'moov' | 'yas';

interface GenerateUssdOptions {
  operateur: Operateur;
  identifiant: string; // code_marchand en priorité, sinon numero en fallback
  montant: number;
  frais?: number;
}

export function generateUssd({ operateur, identifiant, montant, frais = 0 }: GenerateUssdOptions) {
  if (!['moov', 'yas'].includes(operateur)) {
    throw new Error('Opérateur non supporté');
  }

  // Le code marchand fait souvent 6 chiffres, le numéro de téléphone 8 (fallback)
  const idRegex = /^[0-9]{4,8}$/;
  if (!idRegex.test(identifiant)) {
    throw new Error("Identifiant de paiement invalide pour cet opérateur.");
  }

  const montantTotal = montant + frais;

  const templates: Record<Operateur, string> = {
    // Moov: le code secret (PIN) n'est jamais généré côté app -> on laisse
    // le champ ouvert par un "*" final, l'utilisateur tape son PIN puis "Appeler"
    moov: `*155*2*2*${identifiant}*${identifiant}*${montantTotal}#`,
    // Tmoney/Yas: chaîne complète, le PIN est demandé par le réseau après le dial
    yas: `*145*5*${montantTotal}*${identifiant}#`,
  };

  const ussdCode = templates[operateur];
  const telLink = `tel:${encodeURIComponent(ussdCode)}`;

  return {
    ussdCodeHidden: ussdCode,
    telLink,
    montantTotal,
    message:
      operateur === 'moov'
        ? "Lien USSD généré. Une fois l'application téléphonique ouverte, saisissez votre code secret puis appuyez sur Appeler."
        : "Lien USSD généré. Vous pouvez cliquer pour lancer l'application téléphonique.",
  };
}