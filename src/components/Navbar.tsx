import { Search, Plus, ShieldCheck, Database, Bell, School, Menu } from 'lucide-react';
import { UserRole, SchoolInfo } from '../types';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenSearch: () => void;
  onOpenQuickAction: () => void;
  onOpenSupabaseConfig: () => void;
  schoolInfo: SchoolInfo;
  isSupabaseConnected: boolean;
  onToggleMobileMenu: () => void;
}

export function Navbar({
  currentRole,
  onRoleChange,
  onOpenSearch,
  onOpenQuickAction,
  onOpenSupabaseConfig,
  schoolInfo,
  isSupabaseConnected,
  onToggleMobileMenu
}: NavbarProps) {
  const roleBadges: Record<UserRole, { label: string; bg: string; text: string; icon: string }> = {
    admin: { label: 'Administrateur', bg: 'bg-emerald-100 border-emerald-200', text: 'text-emerald-800', icon: '👑' },
    secretaire: { label: 'Secrétaire', bg: 'bg-blue-100 border-blue-200', text: 'text-blue-800', icon: '📋' },
    enseignant: { label: 'Enseignant', bg: 'bg-purple-100 border-purple-200', text: 'text-purple-800', icon: '🎓' },
    comptable: { label: 'Comptable', bg: 'bg-amber-100 border-amber-200', text: 'text-amber-800', icon: '💰' },
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-6 py-2.5 transition-all no-print">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Mobile trigger & School title */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-menu-btn"
            onClick={onToggleMobileMenu}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
            title="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-sm font-bold text-lg">
              <School className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-slate-900 text-sm md:text-base tracking-tight leading-tight">
                  SunuÉcole
                </h1>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  🇸🇳 Sénégal
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-[200px] md:max-w-xs font-medium">
                {schoolInfo.anneeScolaire} • {schoolInfo.inspectionAcademique}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Search button */}
        <div className="flex-1 max-w-md mx-2 hidden md:block">
          <button
            id="global-search-trigger"
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-slate-400 bg-slate-50 hover:bg-slate-100 hover:text-slate-600 rounded-xl border border-slate-200 transition-colors shadow-xs"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <span>Rechercher élève, enseignant, classe, reçu...</span>
            </div>
            <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right: Actions, Supabase, and Interactive Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search on mobile */}
          <button
            id="mobile-search-btn"
            onClick={onOpenSearch}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
            title="Rechercher"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Quick Action Button */}
          <button
            id="quick-add-btn"
            onClick={onOpenQuickAction}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nouveau</span>
          </button>

          {/* Supabase Status Button */}
          <button
            id="supabase-status-btn"
            onClick={onOpenSupabaseConfig}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
              isSupabaseConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title="Configuration Supabase & PostgreSQL RLS"
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden lg:inline">Supabase</span>
            <span
              className={`w-2 h-2 rounded-full ${
                isSupabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
              }`}
            />
          </button>

          {/* Role Switcher */}
          <div className="relative flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <span className="text-xs pl-1.5 pr-0.5 font-medium text-slate-500 hidden xl:inline">
              Rôle :
            </span>
            <select
              id="role-switcher-select"
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="text-xs font-bold bg-white text-slate-800 py-1 px-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-xs"
              title="Changer de profil pour tester les permissions"
            >
              <option value="admin">👑 Administrateur</option>
              <option value="secretaire">📋 Secrétaire</option>
              <option value="enseignant">🎓 Enseignant</option>
              <option value="comptable">💰 Comptable</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
