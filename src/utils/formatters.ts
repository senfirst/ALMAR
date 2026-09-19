export function formatFCFA(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0 FCFA';
  return new Intl.NumberFormat('fr-SN', {
    style: 'decimal',
    maximumFractionDigits: 0
  }).format(amount) + ' FCFA';
}

export function formatDateFR(dateString: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(d);
  } catch (e) {
    return dateString;
  }
}

export function formatDateShort(dateString: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(d);
  } catch (e) {
    return dateString;
  }
}

export function calculateGradeMoyenne(devoir1: number | null, devoir2: number | null, compo: number | null): number | null {
  // Senegal system: Devoirs average + 2 * Compo, divided by 3 (or just (D1 + D2 + 2*C)/4 if 2 devoirs)
  const devoirs: number[] = [];
  if (devoir1 !== null && devoir1 !== undefined) devoirs.push(devoir1);
  if (devoir2 !== null && devoir2 !== undefined) devoirs.push(devoir2);

  if (devoirs.length === 0 && (compo === null || compo === undefined)) {
    return null;
  }

  if (devoirs.length === 0 && compo !== null) {
    return compo;
  }

  const moyDevoirs = devoirs.reduce((a, b) => a + b, 0) / devoirs.length;

  if (compo === null || compo === undefined) {
    return Number(moyDevoirs.toFixed(2));
  }

  // Official formula: (Moyenne Devoirs + 2 * Compo) / 3
  const finalMoy = (moyDevoirs + (2 * compo)) / 3;
  return Number(finalMoy.toFixed(2));
}

export function getAppreciationMention(moyenne: number): { mention: string; color: string; badge: string } {
  if (moyenne >= 16) {
    return { mention: 'Très Bien - Félicitations du Conseil', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', badge: 'Tableau d\'Honneur avec Félicitations' };
  } else if (moyenne >= 14) {
    return { mention: 'Bien - Tableau d\'Honneur', color: 'text-teal-700 bg-teal-50 border-teal-200', badge: 'Tableau d\'Honneur' };
  } else if (moyenne >= 12) {
    return { mention: 'Assez Bien - Encouragements', color: 'text-blue-700 bg-blue-50 border-blue-200', badge: 'Encouragements' };
  } else if (moyenne >= 10) {
    return { mention: 'Passable', color: 'text-amber-700 bg-amber-50 border-amber-200', badge: 'Moyenne Atteinte' };
  } else if (moyenne >= 8) {
    return { mention: 'Insuffisant - Avertissement Travail', color: 'text-orange-700 bg-orange-50 border-orange-200', badge: 'Avertissement' };
  } else {
    return { mention: 'Faible - Blâme pour Travail Insuffisant', color: 'text-rose-700 bg-rose-50 border-rose-200', badge: 'Blâme' };
  }
}

export function formatRang(rang: number, sexe: 'M' | 'F' = 'M'): string {
  if (rang === 1) return sexe === 'F' ? '1ère' : '1er';
  return `${rang}ème`;
}
