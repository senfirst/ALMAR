import { Student, Teacher, SchoolClass, AttendanceRecord, GradeItem, Payment, SchoolInfo, UserAccount } from '../types';

export const initialSchoolInfo: SchoolInfo = {
  nom: "Groupe Scolaire d'Excellence Cheikh Anta Diop",
  devise: "Discipline - Travail - Réussite",
  ministere: "République du Sénégal - Ministère de l'Éducation Nationale",
  inspectionAcademique: "IA de Dakar",
  inspectionEducationFormation: "IEF des Almadies / Grand Dakar",
  codeEtablissement: "SN-DKR-2024-048",
  adresse: "Avenue Cheikh Anta Diop, Fann-Point E, Dakar",
  ville: "Dakar",
  telephone: "+221 33 825 40 40 / +221 77 650 22 11",
  email: "contact@groupescolaire-cad.sn",
  siteWeb: "www.groupescolaire-cad.sn",
  nomDirecteur: "Pr. Mamadou Lamine Ndiaye",
  anneeScolaire: "2024-2025",
  monnaie: "FCFA"
};

export const initialUsers: UserAccount[] = [
  {
    id: "usr-1",
    nom: "Ahn",
    prenom: "Thierno Djiby",
    email: "ahnethiernodjiby@gmail.com",
    role: "admin",
    telephone: "+221 77 500 12 34",
    actif: true,
    dateCreation: "2024-09-01"
  },
  {
    id: "usr-2",
    nom: "Diallo",
    prenom: "Aïssatou",
    email: "secretaire@groupescolaire-cad.sn",
    role: "secretaire",
    telephone: "+221 78 432 10 98",
    actif: true,
    dateCreation: "2024-09-05"
  },
  {
    id: "usr-3",
    nom: "Diop",
    prenom: "Moussa",
    email: "moussa.diop@groupescolaire-cad.sn",
    role: "enseignant",
    telephone: "+221 76 345 67 89",
    actif: true,
    dateCreation: "2024-09-10"
  },
  {
    id: "usr-4",
    nom: "Sow",
    prenom: "Abdoulaye",
    email: "comptable@groupescolaire-cad.sn",
    role: "comptable",
    telephone: "+221 70 876 54 32",
    actif: true,
    dateCreation: "2024-09-02"
  }
];

export const initialClasses: SchoolClass[] = [
  {
    id: "cls-1",
    code: "CM2_A",
    nom: "CM2 A - Élémentaire",
    niveau: "CM2",
    cycle: "Élémentaire",
    salle: "Salle B02",
    capacite: 35,
    fraisInscription: 35000,
    scolariteMensuelle: 25000,
    professeurPrincipalId: "ens-1"
  },
  {
    id: "cls-2",
    code: "6EME_A",
    nom: "Sixième A (Collège)",
    niveau: "6ème",
    cycle: "Moyen",
    salle: "Salle 101",
    capacite: 40,
    fraisInscription: 45000,
    scolariteMensuelle: 35000,
    professeurPrincipalId: "ens-2"
  },
  {
    id: "cls-3",
    code: "3EME_B",
    nom: "Troisième B (BFEM)",
    niveau: "3ème",
    cycle: "Moyen",
    salle: "Salle 204",
    capacite: 38,
    fraisInscription: 50000,
    scolariteMensuelle: 40000,
    professeurPrincipalId: "ens-3"
  },
  {
    id: "cls-4",
    code: "2NDE_S",
    nom: "Seconde S (Scientifique)",
    niveau: "2nde",
    cycle: "Secondaire",
    serie: "Scientifique (S)",
    salle: "Salle 301",
    capacite: 35,
    fraisInscription: 55000,
    scolariteMensuelle: 45000,
    professeurPrincipalId: "ens-4"
  },
  {
    id: "cls-5",
    code: "TLE_S2",
    nom: "Terminale S2 (Bac Scientifique)",
    niveau: "Tle",
    cycle: "Secondaire",
    serie: "S2 (Sciences Expérimentales)",
    salle: "Laboratoire 01",
    capacite: 32,
    fraisInscription: 65000,
    scolariteMensuelle: 50000,
    professeurPrincipalId: "ens-2"
  },
  {
    id: "cls-6",
    code: "TLE_L2",
    nom: "Terminale L2 (Bac Littéraire)",
    niveau: "Tle",
    cycle: "Secondaire",
    serie: "L2 (Lettres & Sciences Humaines)",
    salle: "Salle 305",
    capacite: 35,
    fraisInscription: 65000,
    scolariteMensuelle: 48000,
    professeurPrincipalId: "ens-5"
  }
];

export const initialTeachers: Teacher[] = [
  {
    id: "ens-1",
    matricule: "ENS-2021-001",
    nom: "Fall",
    prenom: "Mariama",
    email: "mariama.fall@groupescolaire-cad.sn",
    telephone: "+221 77 450 11 22",
    statut: "Titulaire",
    diplome: "Certificat d'Aptitude Pédagogique (CAP)",
    matieres: ["Français", "Calcul / Maths", "Éveil / Sciences"],
    classeIds: ["cls-1"],
    dateEmbauche: "2021-10-01"
  },
  {
    id: "ens-2",
    matricule: "ENS-2020-014",
    nom: "Diop",
    prenom: "Moussa",
    email: "moussa.diop@groupescolaire-cad.sn",
    telephone: "+221 76 345 67 89",
    statut: "Titulaire",
    diplome: "Master en Mathématiques Pures (UCAD)",
    matieres: ["Mathématiques"],
    classeIds: ["cls-2", "cls-4", "cls-5"],
    dateEmbauche: "2020-09-15"
  },
  {
    id: "ens-3",
    matricule: "ENS-2022-008",
    nom: "Sarr",
    prenom: "Ousmane",
    email: "ousmane.sarr@groupescolaire-cad.sn",
    telephone: "+221 78 889 00 12",
    statut: "Titulaire",
    diplome: "Doctorat en Sciences Physiques",
    matieres: ["Sciences Physiques", "Chimie"],
    classeIds: ["cls-3", "cls-4", "cls-5"],
    dateEmbauche: "2022-10-01"
  },
  {
    id: "ens-4",
    matricule: "ENS-2019-003",
    nom: "Ndiaye",
    prenom: "Fatou Bintou",
    email: "fatou.ndiaye@groupescolaire-cad.sn",
    telephone: "+221 77 123 99 88",
    statut: "Titulaire",
    diplome: "Master Sciences de la Vie et de la Terre",
    matieres: ["SVT"],
    classeIds: ["cls-3", "cls-4", "cls-5"],
    dateEmbauche: "2019-10-01"
  },
  {
    id: "ens-5",
    matricule: "ENS-2018-002",
    nom: "Gueye",
    prenom: "Cheikh Tidiane",
    email: "cheikh.gueye@groupescolaire-cad.sn",
    telephone: "+221 70 334 55 66",
    statut: "Titulaire",
    diplome: "Agrégation de Lettres Modernes",
    matieres: ["Français", "Philosophie"],
    classeIds: ["cls-2", "cls-3", "cls-6"],
    dateEmbauche: "2018-10-01"
  },
  {
    id: "ens-6",
    matricule: "ENS-2023-019",
    nom: "Kane",
    prenom: "Babacar",
    email: "babacar.kane@groupescolaire-cad.sn",
    telephone: "+221 77 901 23 45",
    statut: "Vacataire",
    diplome: "Master en Études Anglophones (UCAD)",
    matieres: ["Anglais"],
    classeIds: ["cls-2", "cls-3", "cls-4", "cls-5", "cls-6"],
    dateEmbauche: "2023-10-05"
  }
];

export const initialStudents: Student[] = [
  {
    id: "elv-1",
    matricule: "CAD-2024-001",
    prenom: "Mouhamed",
    nom: "Ba",
    dateNaissance: "2007-04-12",
    lieuNaissance: "Dakar",
    sexe: "M",
    classeId: "cls-5",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    adresse: "Villa 124, Sacré-Cœur 3",
    ville: "Dakar",
    quartier: "Sacré-Cœur",
    statut: "Inscrit",
    dateInscription: "2024-09-08",
    tuteur: {
      nomComplet: "El Hadji Malick Ba",
      lienParente: "Père",
      telephone: "+221 77 638 12 34",
      email: "malick.ba@telecom.sn",
      adresse: "Villa 124, Sacré-Cœur 3, Dakar",
      profession: "Ingénieur Télécom"
    },
    groupeSanguin: "O+",
    fraisInscriptionPaye: true
  },
  {
    id: "elv-2",
    matricule: "CAD-2024-002",
    prenom: "Aminata",
    nom: "Sow",
    dateNaissance: "2007-09-23",
    lieuNaissance: "Saint-Louis",
    sexe: "F",
    classeId: "cls-5",
    photoUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80",
    adresse: "Cité Keur Gorgui, Immeuble B",
    ville: "Dakar",
    quartier: "Keur Gorgui",
    statut: "Inscrit",
    dateInscription: "2024-09-10",
    tuteur: {
      nomComplet: "Dr. Khady Diouf Sow",
      lienParente: "Mère",
      telephone: "+221 78 221 45 67",
      email: "dr.khady@sante.sn",
      adresse: "Cité Keur Gorgui, Dakar",
      profession: "Médecin Pédiatre"
    },
    groupeSanguin: "A+",
    fraisInscriptionPaye: true
  },
  {
    id: "elv-3",
    matricule: "CAD-2024-003",
    prenom: "Cheikh Anta",
    nom: "Diop",
    dateNaissance: "2006-11-05",
    lieuNaissance: "Thiès",
    sexe: "M",
    classeId: "cls-6",
    adresse: "HLM Grand Médine, Villa 45",
    ville: "Dakar",
    quartier: "Grand Médine",
    statut: "Inscrit",
    dateInscription: "2024-09-12",
    tuteur: {
      nomComplet: "Ibrahima Diop",
      lienParente: "Père",
      telephone: "+221 76 540 88 12",
      email: "ibrahima.diop@port.sn",
      adresse: "HLM Grand Médine, Dakar",
      profession: "Cadre Port Autonome de Dakar"
    },
    fraisInscriptionPaye: true
  },
  {
    id: "elv-4",
    matricule: "CAD-2024-004",
    prenom: "Fatou Binetou",
    nom: "Fall",
    dateNaissance: "2009-02-18",
    lieuNaissance: "Kaolack",
    sexe: "F",
    classeId: "cls-3",
    adresse: "Parcelles Assainies, Unité 15",
    ville: "Dakar",
    quartier: "Parcelles Assainies",
    statut: "Inscrit",
    dateInscription: "2024-09-14",
    tuteur: {
      nomComplet: "Ndeye Astou Dieng",
      lienParente: "Tuteur légal",
      telephone: "+221 77 400 33 22",
      adresse: "Parcelles Assainies U15, Dakar",
      profession: "Commerçante"
    },
    fraisInscriptionPaye: true
  },
  {
    id: "elv-5",
    matricule: "CAD-2024-005",
    prenom: "Pape Demba",
    nom: "Ndiaye",
    dateNaissance: "2012-08-30",
    lieuNaissance: "Dakar",
    sexe: "M",
    classeId: "cls-2",
    adresse: "Médina, Rue 22 x Corniche",
    ville: "Dakar",
    quartier: "Médina",
    statut: "Inscrit",
    dateInscription: "2024-09-15",
    tuteur: {
      nomComplet: "Moustapha Ndiaye",
      lienParente: "Père",
      telephone: "+221 70 811 22 33",
      adresse: "Médina Rue 22, Dakar",
      profession: "Enseignant-Chercheur"
    },
    fraisInscriptionPaye: true
  },
  {
    id: "elv-6",
    matricule: "CAD-2024-006",
    prenom: "Rama",
    nom: "Cissé",
    dateNaissance: "2013-05-14",
    lieuNaissance: "Ziguinchor",
    sexe: "F",
    classeId: "cls-1",
    adresse: "Ouakam, Cité Avion",
    ville: "Dakar",
    quartier: "Ouakam",
    statut: "Inscrit",
    dateInscription: "2024-09-16",
    tuteur: {
      nomComplet: "Mamadou Cissé",
      lienParente: "Père",
      telephone: "+221 77 912 34 56",
      adresse: "Ouakam Cité Avion, Dakar",
      profession: "Architecte"
    },
    fraisInscriptionPaye: true
  },
  {
    id: "elv-7",
    matricule: "CAD-2024-007",
    prenom: "Alassane",
    nom: "Sy",
    dateNaissance: "2008-01-10",
    lieuNaissance: "Matam",
    sexe: "M",
    classeId: "cls-4",
    adresse: "Mermoz Pyrotechnie",
    ville: "Dakar",
    quartier: "Mermoz",
    statut: "Inscrit",
    dateInscription: "2024-09-18",
    tuteur: {
      nomComplet: "Oumar Sy",
      lienParente: "Oncle/Tante",
      telephone: "+221 78 555 77 88",
      adresse: "Mermoz Pyrotechnie, Dakar",
      profession: "Comptable Agréé"
    },
    fraisInscriptionPaye: true
  },
  {
    id: "elv-8",
    matricule: "CAD-2024-008",
    prenom: "Khadija",
    nom: "Diallo",
    dateNaissance: "2007-06-25",
    lieuNaissance: "Dakar",
    sexe: "F",
    classeId: "cls-5",
    adresse: "Almadies Zone 4",
    ville: "Dakar",
    quartier: "Almadies",
    statut: "Inscrit",
    dateInscription: "2024-09-20",
    tuteur: {
      nomComplet: "Amadou Tidiane Diallo",
      lienParente: "Père",
      telephone: "+221 77 234 56 78",
      email: "at.diallo@banque.sn",
      adresse: "Almadies Zone 4, Dakar",
      profession: "Directeur Financier"
    },
    fraisInscriptionPaye: true
  }
];

export const initialPayments: Payment[] = [
  {
    id: "pay-1",
    numeroRecu: "REC-2024-0012",
    eleveId: "elv-1",
    classeId: "cls-5",
    montant: 65000,
    datePaiement: "2024-09-08",
    typeFrais: "Inscription",
    modePaiement: "Wave",
    referenceTransaction: "WAVE-SN-998412",
    recuPar: "Abdoulaye Sow (Comptable)",
    payeurNom: "El Hadji Malick Ba",
    observations: "Frais d'inscription + tenue scolaire"
  },
  {
    id: "pay-2",
    numeroRecu: "REC-2024-0013",
    eleveId: "elv-1",
    classeId: "cls-5",
    montant: 50000,
    datePaiement: "2024-10-04",
    typeFrais: "Mensualité",
    moisConcerne: "Octobre",
    modePaiement: "Orange Money",
    referenceTransaction: "OM-DKR-77341",
    recuPar: "Abdoulaye Sow (Comptable)",
    payeurNom: "El Hadji Malick Ba"
  },
  {
    id: "pay-3",
    numeroRecu: "REC-2024-0014",
    eleveId: "elv-1",
    classeId: "cls-5",
    montant: 50000,
    datePaiement: "2024-11-03",
    typeFrais: "Mensualité",
    moisConcerne: "Novembre",
    modePaiement: "Wave",
    referenceTransaction: "WAVE-SN-443211",
    recuPar: "Abdoulaye Sow (Comptable)",
    payeurNom: "El Hadji Malick Ba"
  },
  {
    id: "pay-4",
    numeroRecu: "REC-2024-0020",
    eleveId: "elv-2",
    classeId: "cls-5",
    montant: 65000,
    datePaiement: "2024-09-10",
    typeFrais: "Inscription",
    modePaiement: "Espèces",
    recuPar: "Abdoulaye Sow (Comptable)",
    payeurNom: "Dr. Khady Diouf Sow"
  },
  {
    id: "pay-5",
    numeroRecu: "REC-2024-0021",
    eleveId: "elv-2",
    classeId: "cls-5",
    montant: 50000,
    datePaiement: "2024-10-06",
    typeFrais: "Mensualité",
    moisConcerne: "Octobre",
    modePaiement: "Wave",
    referenceTransaction: "WAVE-SN-871109",
    recuPar: "Abdoulaye Sow (Comptable)",
    payeurNom: "Dr. Khady Diouf Sow"
  },
  {
    id: "pay-6",
    numeroRecu: "REC-2024-0033",
    eleveId: "elv-3",
    classeId: "cls-6",
    montant: 65000,
    datePaiement: "2024-09-12",
    typeFrais: "Inscription",
    modePaiement: "Chèque",
    referenceTransaction: "CHQ-CBAO-49021",
    recuPar: "Abdoulaye Sow (Comptable)",
    payeurNom: "Ibrahima Diop"
  },
  {
    id: "pay-7",
    numeroRecu: "REC-2024-0045",
    eleveId: "elv-4",
    classeId: "cls-3",
    montant: 50000,
    datePaiement: "2024-09-14",
    typeFrais: "Inscription",
    modePaiement: "Espèces",
    recuPar: "Abdoulaye Sow (Comptable)",
    payeurNom: "Ndeye Astou Dieng"
  },
  {
    id: "pay-8",
    numeroRecu: "REC-2024-0046",
    eleveId: "elv-5",
    classeId: "cls-2",
    montant: 45000,
    datePaiement: "2024-09-15",
    typeFrais: "Inscription",
    modePaiement: "Wave",
    referenceTransaction: "WAVE-SN-129038",
    recuPar: "Abdoulaye Sow (Comptable)",
    payeurNom: "Moustapha Ndiaye"
  },
  {
    id: "pay-9",
    numeroRecu: "REC-2024-0050",
    eleveId: "elv-8",
    classeId: "cls-5",
    montant: 65000,
    datePaiement: "2024-09-20",
    typeFrais: "Inscription",
    modePaiement: "Virement",
    referenceTransaction: "VIR-SGBS-90214",
    recuPar: "Abdoulaye Sow (Comptable)",
    payeurNom: "Amadou Tidiane Diallo"
  },
  {
    id: "pay-10",
    numeroRecu: "REC-2024-0051",
    eleveId: "elv-8",
    classeId: "cls-5",
    montant: 50000,
    datePaiement: "2024-10-05",
    typeFrais: "Mensualité",
    moisConcerne: "Octobre",
    modePaiement: "Wave",
    referenceTransaction: "WAVE-SN-554411",
    recuPar: "Abdoulaye Sow (Comptable)",
    payeurNom: "Amadou Tidiane Diallo"
  }
];

export const initialAbsences: AttendanceRecord[] = [
  {
    id: "abs-1",
    eleveId: "elv-1",
    classeId: "cls-5",
    date: "2024-10-18",
    creneau: "Matin",
    heuresManquees: 4,
    motif: "Rendez-vous médical",
    justifie: true,
    dateJustification: "2024-10-19",
    pieceJustificative: "Certificat médical Dr. Ndao"
  },
  {
    id: "abs-2",
    eleveId: "elv-2",
    classeId: "cls-5",
    date: "2024-11-04",
    creneau: "Retard (15m)",
    heuresManquees: 1,
    motif: "Embouteillage voie de dégagement nord",
    justifie: true,
    dateJustification: "2024-11-04"
  },
  {
    id: "abs-3",
    eleveId: "elv-3",
    classeId: "cls-6",
    date: "2024-11-12",
    creneau: "Journée entière",
    heuresManquees: 8,
    motif: "Cérémonie familiale (Magal)",
    justifie: true,
    dateJustification: "2024-11-14"
  },
  {
    id: "abs-4",
    eleveId: "elv-4",
    classeId: "cls-3",
    date: "2024-11-20",
    creneau: "Après-midi",
    heuresManquees: 3,
    motif: "Non communiqué",
    justifie: false
  },
  {
    id: "abs-5",
    eleveId: "elv-7",
    classeId: "cls-4",
    date: "2024-11-25",
    creneau: "Matin",
    heuresManquees: 4,
    motif: "Paludisme léger",
    justifie: true,
    pieceJustificative: "Ordonnance médicale"
  }
];

export const initialGrades: GradeItem[] = [
  // Terminale S2 - Mouhamed Ba
  {
    id: "grd-1",
    eleveId: "elv-1",
    classeId: "cls-5",
    matiere: "Mathématiques",
    semestre: "Semestre 1",
    noteDevoir1: 17,
    noteDevoir2: 18.5,
    noteCompo: 16.75,
    coefficient: 5,
    appreciationProf: "Excellent travail, esprit d'analyse remarquable."
  },
  {
    id: "grd-2",
    eleveId: "elv-1",
    classeId: "cls-5",
    matiere: "Sciences Physiques",
    semestre: "Semestre 1",
    noteDevoir1: 15,
    noteDevoir2: 16,
    noteCompo: 17,
    coefficient: 5,
    appreciationProf: "Très bonne maîtrise des concepts de mécanique et chimie."
  },
  {
    id: "grd-3",
    eleveId: "elv-1",
    classeId: "cls-5",
    matiere: "SVT",
    semestre: "Semestre 1",
    noteDevoir1: 14.5,
    noteDevoir2: 15,
    noteCompo: 15.5,
    coefficient: 5,
    appreciationProf: "Bon travail, raisonnement scientifique rigoureux."
  },
  {
    id: "grd-4",
    eleveId: "elv-1",
    classeId: "cls-5",
    matiere: "Philosophie",
    semestre: "Semestre 1",
    noteDevoir1: 13,
    noteDevoir2: 14,
    noteCompo: 13.5,
    coefficient: 2,
    appreciationProf: "Bonne réflexion critique et rédaction soignée."
  },
  {
    id: "grd-5",
    eleveId: "elv-1",
    classeId: "cls-5",
    matiere: "Français",
    semestre: "Semestre 1",
    noteDevoir1: 14,
    noteDevoir2: 13.5,
    noteCompo: 14,
    coefficient: 2,
    appreciationProf: "Expression claire et argumentation solide."
  },
  {
    id: "grd-6",
    eleveId: "elv-1",
    classeId: "cls-5",
    matiere: "Anglais",
    semestre: "Semestre 1",
    noteDevoir1: 16.5,
    noteDevoir2: 17,
    noteCompo: 16,
    coefficient: 2,
    appreciationProf: "Very good student, fluent and proactive in class."
  },
  {
    id: "grd-7",
    eleveId: "elv-1",
    classeId: "cls-5",
    matiere: "Histoire-Géographie",
    semestre: "Semestre 1",
    noteDevoir1: 15,
    noteDevoir2: 14.5,
    noteCompo: 15,
    coefficient: 2,
    appreciationProf: "Bonne assimilation du cours et cartes bien légendées."
  },

  // Terminale S2 - Aminata Sow
  {
    id: "grd-8",
    eleveId: "elv-2",
    classeId: "cls-5",
    matiere: "Mathématiques",
    semestre: "Semestre 1",
    noteDevoir1: 18,
    noteDevoir2: 19,
    noteCompo: 18.5,
    coefficient: 5,
    appreciationProf: "Brillante élève ! Rigueur mathématique exceptionnelle."
  },
  {
    id: "grd-9",
    eleveId: "elv-2",
    classeId: "cls-5",
    matiere: "Sciences Physiques",
    semestre: "Semestre 1",
    noteDevoir1: 17.5,
    noteDevoir2: 18,
    noteCompo: 18,
    coefficient: 5,
    appreciationProf: "Travail impeccable et grand sens de l'observation."
  },
  {
    id: "grd-10",
    eleveId: "elv-2",
    classeId: "cls-5",
    matiere: "SVT",
    semestre: "Semestre 1",
    noteDevoir1: 17,
    noteDevoir2: 17.5,
    noteCompo: 17,
    coefficient: 5,
    appreciationProf: "Excellent niveau scientifique, félicitations."
  },
  {
    id: "grd-11",
    eleveId: "elv-2",
    classeId: "cls-5",
    matiere: "Philosophie",
    semestre: "Semestre 1",
    noteDevoir1: 15,
    noteDevoir2: 16,
    noteCompo: 15,
    coefficient: 2,
    appreciationProf: "Pensée profonde et maturité intellectuelle."
  },
  {
    id: "grd-12",
    eleveId: "elv-2",
    classeId: "cls-5",
    matiere: "Français",
    semestre: "Semestre 1",
    noteDevoir1: 16,
    noteDevoir2: 16.5,
    noteCompo: 16,
    coefficient: 2,
    appreciationProf: "Très bon style, vocabulaire riche."
  },
  {
    id: "grd-13",
    eleveId: "elv-2",
    classeId: "cls-5",
    matiere: "Anglais",
    semestre: "Semestre 1",
    noteDevoir1: 18,
    noteDevoir2: 18.5,
    noteCompo: 18,
    coefficient: 2,
    appreciationProf: "Outstanding performance in both oral and written exam."
  },

  // Terminale S2 - Khadija Diallo
  {
    id: "grd-14",
    eleveId: "elv-8",
    classeId: "cls-5",
    matiere: "Mathématiques",
    semestre: "Semestre 1",
    noteDevoir1: 13.5,
    noteDevoir2: 14,
    noteCompo: 13,
    coefficient: 5,
    appreciationProf: "Assez bon ensemble, intensifier les exercices."
  },
  {
    id: "grd-15",
    eleveId: "elv-8",
    classeId: "cls-5",
    matiere: "Sciences Physiques",
    semestre: "Semestre 1",
    noteDevoir1: 12,
    noteDevoir2: 13,
    noteCompo: 12.5,
    coefficient: 5,
    appreciationProf: "Efforts réguliers, persévérer."
  },
  {
    id: "grd-16",
    eleveId: "elv-8",
    classeId: "cls-5",
    matiere: "SVT",
    semestre: "Semestre 1",
    noteDevoir1: 14,
    noteDevoir2: 14.5,
    noteCompo: 14,
    coefficient: 5,
    appreciationProf: "Bon travail, méthode satisfaisante."
  }
];

export const senegaleseSubjectsByCycle = {
  Élémentaire: [
    { nom: "Français (Lecture/Écriture)", coef: 4 },
    { nom: "Mathématiques (Calcul/Problèmes)", coef: 4 },
    { nom: "Éveil / Sciences (Vivre ensemble)", coef: 2 },
    { nom: "Histoire-Géographie", coef: 2 },
    { nom: "Éducation Artistique & Physique", coef: 1 }
  ],
  Moyen: [
    { nom: "Français", coef: 4 },
    { nom: "Mathématiques", coef: 4 },
    { nom: "Sciences Physiques", coef: 2 },
    { nom: "SVT", coef: 2 },
    { nom: "Histoire-Géographie", coef: 2 },
    { nom: "Anglais", coef: 2 },
    { nom: "Arabe / LV2", coef: 1 },
    { nom: "EPS", coef: 1 }
  ],
  Secondaire: [
    { nom: "Mathématiques", coef: 5 },
    { nom: "Sciences Physiques", coef: 5 },
    { nom: "SVT", coef: 5 },
    { nom: "Français", coef: 2 },
    { nom: "Philosophie", coef: 2 },
    { nom: "Histoire-Géographie", coef: 2 },
    { nom: "Anglais", coef: 2 },
    { nom: "EPS", coef: 1 }
  ]
};
