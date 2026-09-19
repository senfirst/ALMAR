import { useState } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  Users, 
  Key, 
  Database, 
  Building, 
  Check, 
  Copy, 
  RefreshCw, 
  Lock, 
  Unlock,
  AlertTriangle,
  X,
  FileCode2,
  Download
} from 'lucide-react';
import { UserAccount, UserRole, SchoolInfo } from '../types';
import { SUPABASE_SCHEMA_SQL, SchoolDataStore } from '../services/supabaseService';

interface AdminViewProps {
  accounts: UserAccount[];
  schoolInfo: SchoolInfo;
  currentRole: UserRole;
  onSaveAccount: (account: UserAccount) => void;
  onDeleteAccount: (id: string) => void;
  onUpdateSchoolInfo: (info: SchoolInfo) => void;
  onResetData: () => void;
}

export function AdminView({
  accounts,
  schoolInfo,
  currentRole,
  onSaveAccount,
  onDeleteAccount,
  onUpdateSchoolInfo,
  onResetData
}: AdminViewProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'school' | 'supabase'>('users');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // User form state
  const [formData, setFormData] = useState<Partial<UserAccount>>({
    email: '',
    nomComplet: '',
    role: 'secretaire',
    actif: true,
    telephone: '+221 77 '
  });

  const [schoolFormData, setSchoolFormData] = useState<SchoolInfo>({ ...schoolInfo });
  const [saveSchoolSuccess, setSaveSchoolSuccess] = useState(false);

  const canManage = currentRole === 'admin';

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.nomComplet || !formData.role) {
      alert('Veuillez renseigner les champs requis.');
      return;
    }

    const newAcc: UserAccount = {
      id: `usr-${Date.now()}`,
      email: formData.email!,
      nomComplet: formData.nomComplet!,
      role: formData.role as UserRole,
      actif: formData.actif ?? true,
      telephone: formData.telephone || '',
      derniereConnexion: 'À l\'instant'
    };

    onSaveAccount(newAcc);
    setIsModalOpen(false);
  };

  const handleSaveSchool = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSchoolInfo(schoolFormData);
    setSaveSchoolSuccess(true);
    setTimeout(() => setSaveSchoolSuccess(false), 3000);
  };

  const handleExportJson = () => {
    const raw = localStorage.getItem('sunuecole_data_v1');
    if (!raw) return;
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sunuecole_sauvegarde_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Panneau d'Administration & Sécurité
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Gestion des habilitations, configuration de l'établissement et base de données Supabase
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Comptes & Habilitations ({accounts.length})
        </button>

        <button
          onClick={() => setActiveTab('school')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'school'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          Paramètres Établissement
        </button>

        <button
          onClick={() => setActiveTab('supabase')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'supabase'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          Schéma PostgreSQL & Supabase
        </button>
      </div>

      {/* TAB 1: USERS & ROLES */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Comptes d'accès du personnel</h3>
              <p className="text-xs text-slate-500">
                4 rôles avec Row Level Security (RLS) : Administrateur, Secrétaire, Enseignant, Comptable
              </p>
            </div>

            {canManage && (
              <button
                id="admin-add-user-btn"
                onClick={() => {
                  setFormData({
                    email: '',
                    nomComplet: '',
                    role: 'secretaire',
                    actif: true,
                    telephone: '+221 77 '
                  });
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs"
              >
                <UserPlus className="w-4 h-4" />
                Créer un utilisateur
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Utilisateur</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Rôle du Système</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4">Dernière activité</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accounts.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-slate-900">
                          {user.nomComplet}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {user.telephone || '-'}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {user.email}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : user.role === 'secretaire'
                            ? 'bg-blue-100 text-blue-800'
                            : user.role === 'comptable'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                          user.actif ? 'text-emerald-700' : 'text-slate-400'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${user.actif ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          {user.actif ? 'Actif' : 'Suspendu'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {user.derniereConnexion}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {canManage && user.role !== 'admin' && (
                          <button
                            onClick={() => {
                              onSaveAccount({ ...user, actif: !user.actif });
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition"
                            title={user.actif ? 'Suspendre' : 'Réactiver'}
                          >
                            {user.actif ? <Unlock className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4 text-rose-500" />}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PARAMÈTRES ÉTABLISSEMENT SÉNÉGAL */}
      {activeTab === 'school' && (
        <form onSubmit={handleSaveSchool} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 max-w-3xl">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              Identité de l'Établissement (Sénégal)
            </h3>
            <p className="text-xs text-slate-500">
              Ces informations figurent automatiquement sur les en-têtes officiels des bulletins et attestations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Nom complet de l'établissement
              </label>
              <input
                type="text"
                required
                value={schoolFormData.nom}
                onChange={(e) => setSchoolFormData({ ...schoolFormData, nom: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Code Établissement MEN
              </label>
              <input
                type="text"
                required
                value={schoolFormData.codeEtablissement}
                onChange={(e) => setSchoolFormData({ ...schoolFormData, codeEtablissement: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono font-bold focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Inspection d'Académie (IA)
              </label>
              <input
                type="text"
                required
                value={schoolFormData.inspectionAcademique}
                onChange={(e) => setSchoolFormData({ ...schoolFormData, inspectionAcademique: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Inspection de l'Éducation et de la Formation (IEF)
              </label>
              <input
                type="text"
                required
                value={schoolFormData.inspectionEducationFormation}
                onChange={(e) => setSchoolFormData({ ...schoolFormData, inspectionEducationFormation: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Année Scolaire
              </label>
              <input
                type="text"
                required
                value={schoolFormData.anneeScolaire}
                onChange={(e) => setSchoolFormData({ ...schoolFormData, anneeScolaire: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono font-bold focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Nom du Chef d'Établissement / Directeur
              </label>
              <input
                type="text"
                required
                value={schoolFormData.nomDirecteur}
                onChange={(e) => setSchoolFormData({ ...schoolFormData, nomDirecteur: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Devise de l'école
              </label>
              <input
                type="text"
                value={schoolFormData.devise}
                onChange={(e) => setSchoolFormData({ ...schoolFormData, devise: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Adresse & Ville
              </label>
              <input
                type="text"
                value={schoolFormData.adresse}
                onChange={(e) => setSchoolFormData({ ...schoolFormData, adresse: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Téléphone & Contact
              </label>
              <input
                type="text"
                value={schoolFormData.telephone}
                onChange={(e) => setSchoolFormData({ ...schoolFormData, telephone: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            {saveSchoolSuccess && (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Paramètres enregistrés avec succès
              </span>
            )}
            <div className="ml-auto">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-xs"
              >
                Enregistrer les paramètres
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: SUPABASE & DATA BACKUP */}
      {activeTab === 'supabase' && (
        <div className="space-y-5 max-w-4xl">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-600" />
                  Script SQL Complet pour Supabase PostgreSQL
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Tables relationnelles complètes, triggers d'authentification et politiques de sécurité Row Level Security (RLS)
                </p>
              </div>

              <button
                onClick={handleCopySql}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
              >
                {copiedSql ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {copiedSql ? 'Copié !' : 'Copier le script SQL'}
              </button>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
              <div className="font-bold">Instructions de déploiement en production :</div>
              <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-emerald-800">
                <li>Ouvrez votre console de projet sur <a href="https://supabase.com" target="_blank" rel="noreferrer" className="underline font-bold">supabase.com</a>.</li>
                <li>Allez dans le menu <strong>SQL Editor</strong> &gt; <strong>New Query</strong>.</li>
                <li>Collez le script SQL ci-dessous et cliquez sur <strong>Run</strong>.</li>
                <li>Les tables, contraintes et politiques RLS seront créées instantanément.</li>
              </ol>
            </div>

            <div className="relative">
              <pre className="bg-slate-950 text-slate-100 p-4 rounded-xl text-[11px] font-mono max-h-64 overflow-y-auto leading-relaxed border border-slate-800">
                {SUPABASE_SCHEMA_SQL}
              </pre>
            </div>
          </div>

          {/* Backup / Export / Reset Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">Sauvegarde & Restauration Locale</h4>
              <p className="text-xs text-slate-500">
                Exportez toutes les données sous forme de fichier JSON ou restaurez le jeu d'essai du Sénégal
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportJson}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                <Download className="w-4 h-4" />
                Exporter JSON
              </button>

              <button
                onClick={() => {
                  if (confirm('Réinitialiser toutes les données aux valeurs par défaut de démonstration ?')) {
                    onResetData();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
              >
                <RefreshCw className="w-4 h-4" />
                Réinitialiser démo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE USER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 my-8">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Créer un Compte Utilisateur
                </h3>
                <p className="text-xs text-slate-500">
                  Attribuez un rôle spécifique pour la sécurité d'accès
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUserSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nom Complet *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Fatouma Diop"
                  value={formData.nomComplet || ''}
                  onChange={(e) => setFormData({ ...formData, nomComplet: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Adresse Email Professionnelle *
                </label>
                <input
                  type="email"
                  required
                  placeholder="f.diop@sunuecole.sn"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Téléphone (Sénégal)
                </label>
                <input
                  type="tel"
                  placeholder="+221 77 000 00 00"
                  value={formData.telephone || ''}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Rôle & Habilitations *
                </label>
                <select
                  value={formData.role || 'secretaire'}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-bold"
                >
                  <option value="secretaire">Secrétaire (Inscriptions, certificats, registres)</option>
                  <option value="enseignant">Enseignant (Saisie devoirs, appréciations, appel)</option>
                  <option value="comptable">Comptable (Frais scolarité, caisse, reçus)</option>
                  <option value="admin">Administrateur (Contrôle total du système)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-xs"
                >
                  Créer le compte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
