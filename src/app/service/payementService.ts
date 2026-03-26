// utils/ussdGenerator.ts
type Operateur = 'moov' | 'yas';

interface GenerateUssdOptions {
  operateur: Operateur;
  numero: string; // ex: '79163948'
  montant: number; // montant envoyé
  frais?: number; // frais additionnels
}

export function generateUssd({ operateur, numero, montant, frais = 0 }: GenerateUssdOptions) {
  if (!['moov', 'yas'].includes(operateur)) {
    throw new Error('Opérateur non supporté');
  }

  // Vérification numéro simple pour Togo
  const telRegex = /^[0-9]{8}$/;
  if (!telRegex.test(numero)) {
    throw new Error('Numéro invalide. Format attendu: 8 chiffres (ex: 79163948)');
  }

  // Calcul montant total avec frais
  const montantTotal = montant + frais;

  // Templates USSD Togo
  const templates: Record<Operateur, string> = {
    moov: `*155*1*1*228${numero}*${montantTotal}#`,
    yas:  `*145*1*${montantTotal}*228${numero}*2#`
  };

  const ussdCode = templates[operateur];

  // Lien tel: pour mobile
  const telLink = `tel:${encodeURIComponent(ussdCode)}`;

  return {
    ussdCodeHidden: ussdCode, // jamais à afficher en front selon tes règles
    telLink,
    montantTotal,
    message: 'Lien USSD généré. Vous pouvez cliquer pour lancer l’application téléphonique.'
  };
}