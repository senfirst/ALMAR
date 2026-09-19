import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  BookOpen, 
  Clock, 
  Award, 
  CreditCard, 
  FileText, 
  Database, 
  Settings, 
  X,
  Building,
  Phone
} from 'lucide-react';
import { UserRole, SchoolInfo } from '../types';

export type ActiveTab = 
  | 'dashboard' 
  | 'students' 
  | 'teachers' 
  | 'classes' 
  | 'attendance' 
  | 'grades' 
  | 'payments' 
  | 'documents' 
  | 'supabase' 
  | 'administration';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  currentRole: UserRole;
  schoolInfo: SchoolInfo;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  activeTab,
  onSelectTab,
  currentRole,
  schoolInfo,
  isOpenMobile,
  onCloseMobile
}: SidebarProps) {
  const menuItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Tableau de bord',
      icon: LayoutDashboard,
      roles: ['admin', 'secretaire', 'enseignant', 'comptable'],
      badge: null
    },
    {
      id: 'students' as ActiveTab,
      label: 'Élèves & Inscriptions',
      icon: GraduationCap,
      roles: ['admin', 'secretaire', 'enseignant', 'comptable'],
      badge: 'Dossiers'
    },
    {
      id: 'teachers' as ActiveTab,
      label: 'Enseignants',
      icon: Users,
      roles: ['admin', 'secretaire'],
      badge: null
    },
    {
      id: 'classes' as ActiveTab,
      label: 'Classes & Affectations',
      icon: BookOpen,
      roles: ['admin', 'secretaire', 'enseignant'],
      badge: null
    },
    {
      id: 'attendance' as ActiveTab,
      label: 'Absences & Retards',
      icon: Clock,
      roles: ['admin', 'secretaire', 'enseignant'],
      badge: null
    },
    {
      id: 'grades' as ActiveTab,
      label: 'Notes & Évaluations',
      icon: Award,
      roles: ['admin', 'secretaire', 'enseignant'],
      badge: 'Moyennes'
    },
    {
      id: 'payments' as ActiveTab,
      label: 'Paiements & Caisse',
      icon: CreditCard,
      roles: ['admin', 'comptable', 'secretaire'],
      badge: 'FCFA'
    },
    {
      id: 'documents' as ActiveTab,
      label: 'Documents Officiels',
      icon: FileText,
      roles: ['admin', 'secretaire', 'enseignant', 'comptable'],
      badge: 'PDF'
    },
    {
      id: 'supabase' as ActiveTab,
      label: 'Supabase & SQL RLS',
      icon: Database,
      roles: ['admin', 'secretaire', 'enseignant', 'comptable'],
      badge: 'Postgres'
    },
    {
      id: 'administration' as ActiveTab,
      label: 'Administration',
      icon: Settings,
      roles: ['admin'],
      badge: null
    },
  ];

  const handleTabClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        } no-print`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-sm">
              SE
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-sm tracking-tight">
                SunuÉcole
              </div>
              <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded inline-block">
                Système Sénégal
              </div>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Gestion de l'Établissement
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isAccessible = item.roles.includes(currentRole);
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleTabClick(item.id)}
                disabled={!isAccessible}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : isAccessible
                    ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    : 'text-slate-300 cursor-not-allowed opacity-60'
                }`}
                title={!isAccessible ? `Non autorisé pour le rôle ${currentRole}` : undefined}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      isActive
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* School Footer Information */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 text-xs text-slate-600 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 truncate text-[11px]">
            <Building className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{schoolInfo.nom}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{schoolInfo.telephone.split('/')[0]}</span>
          </div>
          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200/60 flex items-center justify-between">
            <span>Année : {schoolInfo.anneeScolaire}</span>
            <span className="text-emerald-700 font-semibold">Dakar, SN</span>
          </div>
        </div>
      </aside>
    </>
  );
}
