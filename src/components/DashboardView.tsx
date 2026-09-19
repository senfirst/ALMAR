import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Clock, 
  CreditCard, 
  PlusCircle, 
  FileText, 
  TrendingUp,
  ArrowUpRight,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Student, Teacher, SchoolClass, AttendanceRecord, Payment, SchoolInfo } from '../types';
import { formatFCFA, formatDateShort } from '../utils/formatters';

interface DashboardViewProps {
  students: Student[];
  teachers: Teacher[];
  classes: SchoolClass[];
  absences: AttendanceRecord[];
  payments: Payment[];
  schoolInfo: SchoolInfo;
  onNavigate: (tab: any) => void;
  onOpenNewStudent: () => void;
  onOpenNewPayment: () => void;
  onOpenAttendance: () => void;
}

export function DashboardView({
  students,
  teachers,
  classes,
  absences,
  payments,
  schoolInfo,
  onNavigate,
  onOpenNewStudent,
  onOpenNewPayment,
  onOpenAttendance
}: DashboardViewProps) {
  const totalStudents = students.length;
  const boysCount = students.filter(s => s.sexe === 'M').length;
  const girlsCount = students.filter(s => s.sexe === 'F').length;

  const totalTeachers = teachers.length;
  const totalClasses = classes.length;
  const totalAbsences = absences.length;
  const unexcusedAbsences = absences.filter(a => !a.justifie).length;

  const totalPaymentsAmount = payments.reduce((acc, p) => acc + p.montant, 0);

  // Recent payments
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.datePaiement).getTime() - new Date(a.datePaiement).getTime())
    .slice(0, 5);

  // Recent absences
  const recentAbsences = [...absences]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
              Année Scolaire {schoolInfo.anneeScolaire}
            </span>
            <span className="text-slate-300 text-xs">
              {schoolInfo.inspectionAcademique}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {schoolInfo.nom}
          </h2>
          <p className="text-emerald-100/80 text-sm mt-1 max-w-xl">
            Système intégré de gestion pédagogique, financière et administrative pour établissements sénégalais.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="dash-btn-new-student"
            onClick={onOpenNewStudent}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Nouvelle Inscription
          </button>
          <button
            id="dash-btn-new-payment"
            onClick={onOpenNewPayment}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition backdrop-blur-xs"
          >
            <CreditCard className="w-4 h-4 text-emerald-300" />
            Encaisser Mensualité
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Élèves */}
        <div 
          onClick={() => onNavigate('students')}
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Élèves</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{totalStudents}</div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
              <span className="text-emerald-700 font-semibold">{girlsCount} Filles</span>
              <span>•</span>
              <span className="text-blue-700 font-semibold">{boysCount} Garçons</span>
            </div>
          </div>
        </div>

        {/* Enseignants */}
        <div 
          onClick={() => onNavigate('teachers')}
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Enseignants</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{totalTeachers}</div>
            <p className="text-xs text-slate-500 mt-1">Corps professoral actif</p>
          </div>
        </div>

        {/* Classes */}
        <div 
          onClick={() => onNavigate('classes')}
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Classes</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{totalClasses}</div>
            <p className="text-xs text-slate-500 mt-1">Élémentaire, Moyen & Lycée</p>
          </div>
        </div>

        {/* Absences */}
        <div 
          onClick={() => onNavigate('attendance')}
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-amber-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Absences</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{totalAbsences}</div>
            <p className="text-xs text-amber-600 font-semibold mt-1">
              {unexcusedAbsences} non justifiée(s)
            </p>
          </div>
        </div>

        {/* Paiements / Caisse */}
        <div 
          onClick={() => onNavigate('payments')}
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Encaissé (FCFA)</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-black text-emerald-700 truncate">
              {formatFCFA(totalPaymentsAmount)}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-semibold">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              {payments.length} reçus émis
            </p>
          </div>
        </div>
      </div>

      {/* Middle Grid: Classes distribution & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classes & Capacités (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Effectifs par Classe & Capacité
              </h3>
              <p className="text-xs text-slate-500">
                Suivi des taux de remplissage par niveau académique
              </p>
            </div>
            <button
              onClick={() => onNavigate('classes')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
            >
              Voir tout <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {classes.map((cls) => {
              const classStudents = students.filter(s => s.classeId === cls.id);
              const percentage = Math.round((classStudents.length / cls.capacite) * 100);
              const teacher = teachers.find(t => t.id === cls.professeurPrincipalId);

              return (
                <div key={cls.id} className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900">{cls.nom}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white text-slate-600 border border-slate-200">
                        {cls.cycle}
                      </span>
                      {cls.salle && (
                        <span className="text-slate-400 hidden sm:inline">
                          ({cls.salle})
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-slate-700">
                      {classStudents.length} / {cls.capacite} élèves ({percentage}%)
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        percentage > 90
                          ? 'bg-rose-500'
                          : percentage > 70
                          ? 'bg-emerald-500'
                          : 'bg-teal-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
                    <span>Prof. Principal: {teacher ? `${teacher.prenom} ${teacher.nom}` : 'Non assigné'}</span>
                    <span className="font-semibold text-emerald-800">
                      Mensualité: {formatFCFA(cls.scolariteMensuelle)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Derniers Paiements Encaissés (1 col) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Derniers Paiements
                </h3>
                <p className="text-xs text-slate-500">
                  Flux financier récent de la caisse
                </p>
              </div>
              <button
                onClick={() => onNavigate('payments')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
              >
                Caisse <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {recentPayments.map((pay) => {
                const student = students.find(s => s.id === pay.eleveId);
                return (
                  <div key={pay.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-extrabold text-slate-900">
                        {student ? `${student.prenom} ${student.nom}` : pay.payeurNom}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <span className="font-mono text-slate-400">{pay.numeroRecu}</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-600">{pay.typeFrais}</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-bold">{pay.modePaiement}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-emerald-700">
                        {formatFCFA(pay.montant)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {formatDateShort(pay.datePaiement)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={onOpenNewPayment}
            className="w-full mt-4 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 transition text-center"
          >
            + Enregistrer un encaissement
          </button>
        </div>
      </div>

      {/* Bottom Row: Absences Récentes & Raccourcis Scolaires */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Absences récentes */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Registre des Absences Récentes
              </h3>
              <p className="text-xs text-slate-500">
                Élèves signalés absents ou en retard
              </p>
            </div>
            <button
              onClick={() => onNavigate('attendance')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
            >
              Cahier d'appel <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentAbsences.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">Aucune absence enregistrée.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentAbsences.map((abs) => {
                const student = students.find(s => s.id === abs.eleveId);
                const cls = classes.find(c => c.id === abs.classeId);
                return (
                  <div key={abs.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-start gap-2.5">
                      <div className={`mt-0.5 p-1 rounded-full ${abs.justifie ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        <AlertCircle className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">
                          {student ? `${student.prenom} ${student.nom}` : 'Élève'}
                          <span className="font-normal text-slate-500 ml-1.5">
                            ({cls?.code || 'Classe'})
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Motif: {abs.motif || 'Non précisé'} • {abs.creneau}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        abs.justifie 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {abs.justifie ? 'Justifiée' : 'Non justifiée'}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {formatDateShort(abs.date)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modules Documents & Bulletins rapides */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Documents & Bulletins Scolaires
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Génération normalisée conforme aux directives du Ministère de l'Éducation
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onNavigate('documents')}
                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition text-left group"
              >
                <FileText className="w-5 h-5 text-emerald-600 mb-2 group-hover:scale-110 transition" />
                <div className="font-bold text-slate-900 text-xs">Bulletins de Notes</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Semestre 1 & 2 avec coefficients</div>
              </button>

              <button
                onClick={() => onNavigate('documents')}
                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition text-left group"
              >
                <FileText className="w-5 h-5 text-blue-600 mb-2 group-hover:scale-110 transition" />
                <div className="font-bold text-slate-900 text-xs">Attestations de Scolarité</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Avec en-tête officiel & cachet</div>
              </button>

              <button
                onClick={() => onNavigate('documents')}
                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition text-left group"
              >
                <FileText className="w-5 h-5 text-teal-600 mb-2 group-hover:scale-110 transition" />
                <div className="font-bold text-slate-900 text-xs">Certificats de Fréquentation</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Délivrés aux élèves réguliers</div>
              </button>

              <button
                onClick={() => onNavigate('documents')}
                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition text-left group"
              >
                <FileText className="w-5 h-5 text-amber-600 mb-2 group-hover:scale-110 transition" />
                <div className="font-bold text-slate-900 text-xs">Reçus de Paiement Caisse</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Format souche & reçu parent</div>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              Trimestre en cours : 1er Semestre 2024-2025
            </span>
            <span className="font-bold text-emerald-700">Dakar, Sénégal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
