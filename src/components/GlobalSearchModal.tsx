import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, GraduationCap, Users, BookOpen, CreditCard, ArrowRight } from 'lucide-react';
import { Student, Teacher, SchoolClass, Payment } from '../types';
import { ActiveTab } from './Sidebar';
import { formatFCFA, formatDateShort } from '../utils/formatters';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  teachers: Teacher[];
  classes: SchoolClass[];
  payments: Payment[];
  onNavigate: (tab: ActiveTab, targetId?: string) => void;
}

export function GlobalSearchModal({
  isOpen,
  onClose,
  students,
  teachers,
  classes,
  payments,
  onNavigate
}: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Results
  const matchedStudents = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return students.filter(s => 
      `${s.prenom} ${s.nom} ${s.matricule} ${s.tuteur.nomComplet} ${s.tuteur.telephone} ${s.lieuNaissance}`
        .toLowerCase()
        .includes(q)
    ).slice(0, 5);
  }, [students, query]);

  const matchedTeachers = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return teachers.filter(t => 
      `${t.prenom} ${t.nom} ${t.matricule} ${t.matieres.join(' ')} ${t.telephone}`
        .toLowerCase()
        .includes(q)
    ).slice(0, 4);
  }, [teachers, query]);

  const matchedClasses = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return classes.filter(c => 
      `${c.code} ${c.nom} ${c.cycle} ${c.serie || ''}`
        .toLowerCase()
        .includes(q)
    ).slice(0, 3);
  }, [classes, query]);

  const matchedPayments = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return payments.filter(p => 
      `${p.numeroRecu} ${p.payeurNom} ${p.modePaiement} ${p.typeFrais} ${p.referenceTransaction || ''}`
        .toLowerCase()
        .includes(q)
    ).slice(0, 4);
  }, [payments, query]);

  const totalResults = matchedStudents.length + matchedTeachers.length + matchedClasses.length + matchedPayments.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-emerald-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Rechercher rapidement un élève, professeur, classe, reçu..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm font-medium bg-transparent focus:outline-none text-slate-800 placeholder-slate-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded">
            ESC
          </kbd>
        </div>

        {/* Search Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!query.trim() && (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              Tapez un mot-clé pour chercher dans tous les modules de SunuÉcole (ex: <em>Sow, TLE_S2, Mathématiques, REC-2024</em>)
            </div>
          )}

          {query.trim() && totalResults === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs">
              Aucun résultat trouvé pour « <span className="font-bold text-slate-600">{query}</span> ».
            </div>
          )}

          {/* Students Section */}
          {matchedStudents.length > 0 && (
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                Élèves & Dossiers ({matchedStudents.length})
              </div>
              <div className="space-y-1">
                {matchedStudents.map((s) => {
                  const cls = classes.find(c => c.id === s.classeId);
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        onNavigate('students', s.id);
                        onClose();
                      }}
                      className="w-full p-2.5 rounded-xl hover:bg-emerald-50 text-left flex items-center justify-between transition group"
                    >
                      <div>
                        <div className="font-extrabold text-xs text-slate-900 group-hover:text-emerald-800">
                          {s.prenom} {s.nom}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {s.matricule} • Classe : {cls?.code || 'Sans classe'} • Parent : {s.tuteur.nomComplet}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Teachers Section */}
          {matchedTeachers.length > 0 && (
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                Enseignants & Professeurs ({matchedTeachers.length})
              </div>
              <div className="space-y-1">
                {matchedTeachers.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onNavigate('teachers', t.id);
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-blue-50 text-left flex items-center justify-between transition group"
                  >
                    <div>
                      <div className="font-extrabold text-xs text-slate-900 group-hover:text-blue-800">
                        {t.prenom} {t.nom}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {t.matricule} • {t.matieres.join(', ')} • {t.telephone}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Classes Section */}
          {matchedClasses.length > 0 && (
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                Classes & Niveaux ({matchedClasses.length})
              </div>
              <div className="space-y-1">
                {matchedClasses.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onNavigate('classes', c.id);
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-purple-50 text-left flex items-center justify-between transition group"
                  >
                    <div>
                      <div className="font-extrabold text-xs text-slate-900 group-hover:text-purple-800">
                        {c.nom} ({c.code})
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Cycle {c.cycle} • {c.salle} • Mensualité : {formatFCFA(c.scolariteMensuelle)}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Payments Section */}
          {matchedPayments.length > 0 && (
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                Paiements & Reçus ({matchedPayments.length})
              </div>
              <div className="space-y-1">
                {matchedPayments.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onNavigate('payments', p.id);
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-amber-50 text-left flex items-center justify-between transition group"
                  >
                    <div>
                      <div className="font-mono font-extrabold text-xs text-slate-900 group-hover:text-amber-800">
                        {p.numeroRecu} • {formatFCFA(p.montant)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {p.typeFrais} {p.moisConcerne ? `(${p.moisConcerne})` : ''} • {p.modePaiement} • Payeur : {p.payeurNom}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Recherche intelligente globale</span>
          <span>Cliquez sur une entrée pour ouvrir le module</span>
        </div>
      </div>
    </div>
  );
}
