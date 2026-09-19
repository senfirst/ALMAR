export type UserRole = 'admin' | 'secretaire' | 'enseignant' | 'comptable';

export interface UserAccount {
  id: string;
  nom?: string;
  prenom?: string;
  nomComplet?: string;
  email: string;
  role: UserRole;
  telephone: string;
  actif: boolean;
  dateCreation?: string;
  derniereConnexion?: string;
}

export interface ParentTuteur {
  nomComplet: string;
  lienParente: 'Père' | 'Mère' | 'Tuteur légal' | 'Oncle/Tante' | 'Autre';
  telephone: string;
  telephoneSecondaire?: string;
  email?: string;
  adresse: string;
  profession?: string;
}

export interface Student {
  id: string;
  matricule: string;
  prenom: string;
  nom: string;
  dateNaissance: string;
  lieuNaissance: string;
  sexe: 'M' | 'F';
  classeId: string;
  photoUrl?: string;
  adresse: string;
  ville: string;
  quartier?: string;
  statut: 'Inscrit' | 'Réinscrit' | 'En attente' | 'Radié' | 'Transféré';
  statutInscription?: 'Inscrit' | 'Réinscrit' | 'En attente' | 'Radié' | 'Transféré';
  dateInscription: string;
  tuteur: ParentTuteur;
  groupeSanguin?: string;
  allergiesOrMedical?: string;
  observations?: string;
  fraisInscriptionPaye: boolean;
}

export interface Teacher {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  statut: 'Titulaire' | 'Vacataire' | 'Contractuel';
  diplome: string;
  matieres: string[];
  classeIds: string[];
  dateEmbauche: string;
  photoUrl?: string;
}

export type SchoolCycle = 'Élémentaire' | 'Moyen' | 'Secondaire';

export interface SchoolClass {
  id: string;
  code: string;
  nom: string;
  niveau: string; // CI, CP, CE1, CE2, CM1, CM2, 6ème, 5ème, 4ème, 3ème, 2nde, 1ère, Tle
  cycle: SchoolCycle;
  serie?: string; // S1, S2, L1, L2, G, etc.
  salle: string;
  capacite: number;
  fraisInscription: number; // en FCFA
  scolariteMensuelle: number; // en FCFA
  professeurPrincipalId?: string;
}

export interface AttendanceRecord {
  id: string;
  eleveId: string;
  classeId: string;
  date: string;
  creneau: 'Journée entière' | 'Matin' | 'Après-midi' | 'Retard (15m)' | 'Retard (30m+)';
  heuresManquees: number;
  motif: string;
  justifie: boolean;
  dateJustification?: string;
  pieceJustificative?: string;
}

export interface GradeItem {
  id: string;
  eleveId: string;
  classeId: string;
  matiere: string;
  semestre: 'Semestre 1' | 'Semestre 2' | 'Trimestre 1' | 'Trimestre 2' | 'Trimestre 3';
  noteDevoir1: number | null;
  noteDevoir2: number | null;
  noteCompo: number | null;
  coefficient: number;
  appreciationProf?: string;
}

export type PaymentType = 
  | 'Inscription' 
  | 'Réinscription' 
  | 'Mensualité' 
  | 'Frais d\'Examen' 
  | 'Tenue Scolaire' 
  | 'Cantine & Transport'
  | 'Autre';

export type PaymentMethod = 'Espèces' | 'Wave' | 'Orange Money' | 'Chèque' | 'Virement';

export interface Payment {
  id: string;
  numeroRecu: string; // Ex: REC-2024-0042
  eleveId: string;
  classeId: string;
  montant: number; // en FCFA
  datePaiement: string;
  typeFrais: PaymentType;
  moisConcerne?: string; // Octobre, Novembre, etc.
  modePaiement: PaymentMethod;
  referenceTransaction?: string;
  recuPar: string;
  payeurNom: string;
  observations?: string;
}

export interface SchoolInfo {
  nom: string;
  devise: string;
  ministere: string;
  inspectionAcademique: string; // IA
  inspectionEducationFormation: string; // IEF
  codeEtablissement: string;
  adresse: string;
  ville: string;
  telephone: string;
  email: string;
  siteWeb?: string;
  nomDirecteur: string;
  anneeScolaire: string;
  monnaie: string; // "FCFA"
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  connected: boolean;
  lastSync?: string;
}
