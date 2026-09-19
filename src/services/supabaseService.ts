import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  Student, 
  Teacher, 
  SchoolClass, 
  AttendanceRecord, 
  GradeItem, 
  Payment, 
  SchoolInfo, 
  UserAccount,
  SupabaseConfig 
} from '../types';
import { 
  initialClasses, 
  initialStudents, 
  initialTeachers, 
  initialAbsences, 
  initialGrades, 
  initialPayments, 
  initialSchoolInfo, 
  initialUsers 
} from '../data/initialData';

const CONFIG_KEY = 'sunuecole_supabase_config';
const LOCAL_STORAGE_PREFIX = 'sunuecole_data_';

export function getSupabaseConfig(): SupabaseConfig {
  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error reading Supabase config', e);
  }
  return {
    url: (import.meta as any).env?.VITE_SUPABASE_URL || '',
    anonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '',
    connected: false
  };
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(config.url, config.anonKey);
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return supabaseInstance;
}

export async function testSupabaseConnection(url?: string, anonKey?: string): Promise<{ success: boolean; message: string }> {
  try {
    const config = getSupabaseConfig();
    const effectiveUrl = url || config.url;
    const effectiveKey = anonKey || config.anonKey;

    if (!effectiveUrl || !effectiveKey) {
      return { success: false, message: 'Configuration Supabase non renseignée.' };
    }

    const client = createClient(effectiveUrl, effectiveKey);
    // Simple test query to verify credentials
    const { error } = await client.from('classes').select('id').limit(1);
    if (error && error.code !== 'PGRST116' && !error.message.includes('relation "classes" does not exist')) {
      // If error is just table doesn't exist yet, connection is still valid
      if (error.message.includes('API key') || error.message.includes('JWT') || error.message.includes('Invalid API key')) {
        return { success: false, message: 'Clé API Anon invalide ou URL incorrecte.' };
      }
    }
    return { success: true, message: 'Connexion réussie à Supabase PostgreSQL !' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Impossible de joindre le serveur Supabase.' };
  }
}

// Local Storage Helper
function loadLocal<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function saveLocal<T>(key: string, val: T): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + key, JSON.stringify(val));
  } catch (e) {
    console.error('LocalStorage write error', e);
  }
}

export class SchoolDataStore {
  static getStudents(): Student[] {
    return loadLocal<Student[]>('students', initialStudents);
  }
  static saveStudents(students: Student[]): void {
    saveLocal('students', students);
  }
  static saveStudent(student: Student): void {
    const list = this.getStudents();
    const idx = list.findIndex(s => s.id === student.id);
    if (idx >= 0) {
      list[idx] = student;
    } else {
      list.unshift(student);
    }
    this.saveStudents(list);
  }
  static deleteStudent(id: string): void {
    this.saveStudents(this.getStudents().filter(s => s.id !== id));
  }

  static getTeachers(): Teacher[] {
    return loadLocal<Teacher[]>('teachers', initialTeachers);
  }
  static saveTeachers(teachers: Teacher[]): void {
    saveLocal('teachers', teachers);
  }
  static saveTeacher(teacher: Teacher): void {
    const list = this.getTeachers();
    const idx = list.findIndex(t => t.id === teacher.id);
    if (idx >= 0) {
      list[idx] = teacher;
    } else {
      list.unshift(teacher);
    }
    this.saveTeachers(list);
  }
  static deleteTeacher(id: string): void {
    this.saveTeachers(this.getTeachers().filter(t => t.id !== id));
  }

  static getClasses(): SchoolClass[] {
    return loadLocal<SchoolClass[]>('classes', initialClasses);
  }
  static saveClasses(classes: SchoolClass[]): void {
    saveLocal('classes', classes);
  }
  static saveClass(schoolClass: SchoolClass): void {
    const list = this.getClasses();
    const idx = list.findIndex(c => c.id === schoolClass.id);
    if (idx >= 0) {
      list[idx] = schoolClass;
    } else {
      list.unshift(schoolClass);
    }
    this.saveClasses(list);
  }
  static deleteClass(id: string): void {
    this.saveClasses(this.getClasses().filter(c => c.id !== id));
  }

  static getAbsences(): AttendanceRecord[] {
    return loadLocal<AttendanceRecord[]>('absences', initialAbsences);
  }
  static saveAbsences(absences: AttendanceRecord[]): void {
    saveLocal('absences', absences);
  }
  static saveAttendance(record: AttendanceRecord): void {
    const list = this.getAbsences();
    const idx = list.findIndex(a => a.id === record.id);
    if (idx >= 0) {
      list[idx] = record;
    } else {
      list.unshift(record);
    }
    this.saveAbsences(list);
  }
  static deleteAttendance(id: string): void {
    this.saveAbsences(this.getAbsences().filter(a => a.id !== id));
  }

  static getGrades(): GradeItem[] {
    return loadLocal<GradeItem[]>('grades', initialGrades);
  }
  static saveGrades(grades: GradeItem[]): void {
    saveLocal('grades', grades);
  }
  static saveGrade(grade: GradeItem): void {
    const list = this.getGrades();
    const idx = list.findIndex(g => g.id === grade.id || (
      g.eleveId === grade.eleveId && 
      g.classeId === grade.classeId && 
      g.matiere === grade.matiere && 
      g.semestre === grade.semestre
    ));
    if (idx >= 0) {
      list[idx] = grade;
    } else {
      list.unshift(grade);
    }
    this.saveGrades(list);
  }

  static getPayments(): Payment[] {
    return loadLocal<Payment[]>('payments', initialPayments);
  }
  static savePayments(payments: Payment[]): void {
    saveLocal('payments', payments);
  }
  static savePayment(payment: Payment): void {
    const list = this.getPayments();
    const idx = list.findIndex(p => p.id === payment.id);
    if (idx >= 0) {
      list[idx] = payment;
    } else {
      list.unshift(payment);
    }
    this.savePayments(list);
  }

  static getSchoolInfo(): SchoolInfo {
    return loadLocal<SchoolInfo>('school_info', initialSchoolInfo);
  }
  static saveSchoolInfo(info: SchoolInfo): void {
    saveLocal('school_info', info);
  }

  static getUsers(): UserAccount[] {
    return loadLocal<UserAccount[]>('users', initialUsers);
  }
  static getAccounts(): UserAccount[] {
    return this.getUsers();
  }
  static saveUsers(users: UserAccount[]): void {
    saveLocal('users', users);
  }
  static saveAccount(account: UserAccount): void {
    const list = this.getUsers();
    const idx = list.findIndex(u => u.id === account.id);
    if (idx >= 0) {
      list[idx] = account;
    } else {
      list.unshift(account);
    }
    this.saveUsers(list);
  }
  static deleteAccount(id: string): void {
    this.saveUsers(this.getUsers().filter(u => u.id !== id));
  }

  static resetToDefaults(): void {
    saveLocal('students', initialStudents);
    saveLocal('teachers', initialTeachers);
    saveLocal('classes', initialClasses);
    saveLocal('absences', initialAbsences);
    saveLocal('grades', initialGrades);
    saveLocal('payments', initialPayments);
    saveLocal('school_info', initialSchoolInfo);
    saveLocal('users', initialUsers);
  }
}

// Complete ready-to-run PostgreSQL DDL and RLS schema for Supabase
export const SUPABASE_SQL_SCHEMA = `-- ========================================================
-- SUNU-ÉCOLE SÉNÉGAL - SCHÉMA POSTGRESQL & SUPABASE RLS
-- Base de données pour Logiciel de Gestion Scolaire
-- ========================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLE DES PROFILS & UTILISATEURS (Lié à auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'secretaire', 'enseignant', 'comptable')),
  telephone TEXT,
  actif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLE DES CLASSES
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  niveau TEXT NOT NULL,
  cycle TEXT NOT NULL CHECK (cycle IN ('Élémentaire', 'Moyen', 'Secondaire')),
  serie TEXT,
  salle TEXT,
  capacite INTEGER DEFAULT 40,
  frais_inscription NUMERIC(12, 2) DEFAULT 40000,
  scolarite_mensuelle NUMERIC(12, 2) DEFAULT 30000,
  professeur_principal_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLE DES ÉLÈVES
CREATE TABLE IF NOT EXISTS public.eleves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matricule TEXT UNIQUE NOT NULL,
  prenom TEXT NOT NULL,
  nom TEXT NOT NULL,
  date_naissance DATE NOT NULL,
  lieu_naissance TEXT NOT NULL,
  sexe TEXT NOT NULL CHECK (sexe IN ('M', 'F')),
  classe_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  photo_url TEXT,
  adresse TEXT,
  ville TEXT DEFAULT 'Dakar',
  quartier TEXT,
  statut TEXT DEFAULT 'Inscrit' CHECK (statut IN ('Inscrit', 'Réinscrit', 'En attente', 'Radié', 'Transféré')),
  date_inscription DATE DEFAULT CURRENT_DATE,
  tuteur_nom_complet TEXT NOT NULL,
  tuteur_lien TEXT NOT NULL,
  tuteur_telephone TEXT NOT NULL,
  tuteur_telephone_secondaire TEXT,
  tuteur_email TEXT,
  tuteur_profession TEXT,
  tuteur_adresse TEXT,
  groupe_sanguin TEXT,
  frais_inscription_paye BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLE DES ENSEIGNANTS
CREATE TABLE IF NOT EXISTS public.enseignants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matricule TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telephone TEXT NOT NULL,
  statut TEXT NOT NULL CHECK (statut IN ('Titulaire', 'Vacataire', 'Contractuel')),
  diplome TEXT,
  matieres TEXT[] NOT NULL DEFAULT '{}',
  classe_ids UUID[] DEFAULT '{}',
  date_embauche DATE DEFAULT CURRENT_DATE,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLE DES ABSENCES & RETARDS
CREATE TABLE IF NOT EXISTS public.absences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  eleve_id UUID REFERENCES public.eleves(id) ON DELETE CASCADE NOT NULL,
  classe_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  creneau TEXT NOT NULL CHECK (creneau IN ('Journée entière', 'Matin', 'Après-midi', 'Retard (15m)', 'Retard (30m+)')),
  heures_manquees NUMERIC(4, 1) DEFAULT 1,
  motif TEXT,
  justifie BOOLEAN DEFAULT FALSE,
  date_justification DATE,
  piece_justificative TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABLE DES NOTES & ÉVALUATIONS
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  eleve_id UUID REFERENCES public.eleves(id) ON DELETE CASCADE NOT NULL,
  classe_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  matiere TEXT NOT NULL,
  semestre TEXT NOT NULL,
  note_devoir1 NUMERIC(4, 2),
  note_devoir2 NUMERIC(4, 2),
  note_compo NUMERIC(4, 2),
  coefficient INTEGER DEFAULT 2,
  appreciation_prof TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABLE DES PAIEMENTS (Comptabilité en FCFA)
CREATE TABLE IF NOT EXISTS public.paiements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_recu TEXT UNIQUE NOT NULL,
  eleve_id UUID REFERENCES public.eleves(id) ON DELETE CASCADE NOT NULL,
  classe_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  montant NUMERIC(12, 2) NOT NULL,
  date_paiement DATE NOT NULL DEFAULT CURRENT_DATE,
  type_frais TEXT NOT NULL CHECK (type_frais IN ('Inscription', 'Réinscription', 'Mensualité', 'Frais d''Examen', 'Tenue Scolaire', 'Cantine & Transport', 'Autre')),
  mois_concerne TEXT,
  mode_paiement TEXT NOT NULL CHECK (mode_paiement IN ('Espèces', 'Wave', 'Orange Money', 'Chèque', 'Virement')),
  reference_transaction TEXT,
  recu_par TEXT NOT NULL,
  payeur_nom TEXT NOT NULL,
  observations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ACTIVATION DE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eleves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enseignants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.absences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paiements ENABLE ROW LEVEL SECURITY;

-- 10. POLITIQUES RLS SELON LES RÔLES

-- Helper function: rôle de l'utilisateur connecté
CREATE OR REPLACE FUNCTION public.current_user_role() 
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Profils: chacun voit son profil, les admins voient et modifient tout
CREATE POLICY "Profiles - Lecture pour utilisateurs authentifiés" 
  ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Profiles - Administration complète" 
  ON public.profiles FOR ALL USING (public.current_user_role() = 'admin');

-- Classes: lisible par tous les utilisateurs de l'école
CREATE POLICY "Classes - Lecture pour tous" 
  ON public.classes FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Classes - Modification par Admin et Secrétaire" 
  ON public.classes FOR ALL USING (public.current_user_role() IN ('admin', 'secretaire'));

-- Élèves: lecture pour tout le personnel, écriture par Admin et Secrétaire
CREATE POLICY "Élèves - Lecture générale" 
  ON public.eleves FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Élèves - Gestion par Admin et Secrétaire" 
  ON public.eleves FOR ALL USING (public.current_user_role() IN ('admin', 'secretaire'));

-- Enseignants: lecture par tous, modification par Admin
CREATE POLICY "Enseignants - Lecture générale" 
  ON public.enseignants FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enseignants - Gestion Admin" 
  ON public.enseignants FOR ALL USING (public.current_user_role() = 'admin');

-- Absences: lecture par tous, ajout par Enseignants, Secrétaire et Admin
CREATE POLICY "Absences - Lecture" 
  ON public.absences FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Absences - Enregistrement" 
  ON public.absences FOR ALL USING (public.current_user_role() IN ('admin', 'secretaire', 'enseignant'));

-- Notes: lecture par tous, modification par Enseignants et Admin
CREATE POLICY "Notes - Lecture" 
  ON public.notes FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Notes - Saisie et modification" 
  ON public.notes FOR ALL USING (public.current_user_role() IN ('admin', 'enseignant'));

-- Paiements: lecture par Admin et Comptable, écriture par Comptable et Admin
CREATE POLICY "Paiements - Gestion Comptabilité" 
  ON public.paiements FOR ALL USING (public.current_user_role() IN ('admin', 'comptable'));

CREATE POLICY "Paiements - Consultation Secrétaire" 
  ON public.paiements FOR SELECT USING (public.current_user_role() = 'secretaire');

-- 11. DÉCLENCHEUR NOUVEL UTILISATEUR AUTOMATIQUE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, nom, prenom, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nom', 'Utilisateur'),
    COALESCE(new.raw_user_meta_data->>'prenom', 'Nouveau'),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'secretaire')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
`;

export const SUPABASE_SCHEMA_SQL = SUPABASE_SQL_SCHEMA;
