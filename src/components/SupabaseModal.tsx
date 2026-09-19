import { useState } from 'react';
import { Database, Check, Copy, X, Key, ShieldCheck, ExternalLink, RefreshCw } from 'lucide-react';
import { SUPABASE_SCHEMA_SQL, getSupabaseClient, testSupabaseConnection } from '../services/supabaseService';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
  onRefreshStatus: () => void;
}

export function SupabaseModal({
  isOpen,
  onClose,
  isConnected,
  onRefreshStatus
}: SupabaseModalProps) {
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection();
      if (res.success) {
        setTestResult(res.message);
      } else {
        setTestResult(res.message || 'Mode local actif : Configuration par défaut ou clé manquante. Les données sont persistées dans le cache du navigateur.');
      }
      onRefreshStatus();
    } catch (err: any) {
      setTestResult(`Erreur : ${err.message || 'Impossible de joindre le serveur'}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 my-8">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600 text-white">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Intégration Supabase & PostgreSQL RLS
              </h3>
              <p className="text-xs text-slate-500">
                Architecture de sécurité multi-rôles pour l'école
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Status Badge */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`w-3.5 h-3.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <div>
                <div className="font-bold text-xs text-slate-900">
                  {isConnected ? 'Connecté à Supabase Cloud' : 'Mode Cache Local Persistant (Prêt pour Supabase)'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {isConnected 
                    ? 'Synchronisation directe avec la base PostgreSQL' 
                    : 'Toutes les opérations d\'écriture (élèves, notes, paiements) sont sauvegardées localement et synchronisables'}
                </div>
              </div>
            </div>

            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              Tester
            </button>
          </div>

          {testResult && (
            <div className="p-3 text-xs rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200">
              {testResult}
            </div>
          )}

          {/* RLS Security Explanations */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Politiques de Sécurité Row Level Security (RLS)
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <span className="font-bold text-purple-800 block text-[11px]">👑 Administrateur</span>
                <span className="text-[11px] text-slate-500">Accès intégral (SELECT, INSERT, UPDATE, DELETE) sur toutes les tables.</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <span className="font-bold text-blue-800 block text-[11px]">📋 Secrétaire</span>
                <span className="text-[11px] text-slate-500">Gestion des inscriptions, dossiers élèves, certificats et absences.</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <span className="font-bold text-amber-800 block text-[11px]">🎓 Enseignant</span>
                <span className="text-[11px] text-slate-500">Saisie des notes, devoirs, compositions et relevés d'appel de ses classes.</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <span className="font-bold text-emerald-800 block text-[11px]">💰 Comptable</span>
                <span className="text-[11px] text-slate-500">Gestion de la caisse, des frais d'inscription et édition des reçus en FCFA.</span>
              </div>
            </div>
          </div>

          {/* SQL Script View & Copy */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Schéma PostgreSQL DDL officiel pour Supabase :
              </span>
              <button
                onClick={handleCopySql}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copié !' : 'Copier SQL'}
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-200 p-3 rounded-xl text-[10px] font-mono max-h-48 overflow-y-auto leading-relaxed border border-slate-800">
              {SUPABASE_SCHEMA_SQL}
            </pre>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer"
            className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1"
          >
            Ouvrir la console Supabase <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
