import { useState, useEffect, useCallback } from 'react';
import { 
  UserRole, 
  Student, 
  Teacher, 
  SchoolClass, 
  AttendanceRecord, 
  GradeItem, 
  Payment, 
  SchoolInfo, 
  UserAccount 
} from './types';
import { SchoolDataStore, testSupabaseConnection } from './services/supabaseService';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { StudentsView } from './components/StudentsView';
import { TeachersView } from './components/TeachersView';
import { ClassesView } from './components/ClassesView';
import { AttendanceView } from './components/AttendanceView';
import { GradesView } from './components/GradesView';
import { PaymentsView } from './components/PaymentsView';
import { DocumentsView } from './components/DocumentsView';
import { AdminView } from './components/AdminView';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { SupabaseModal } from './components/SupabaseModal';
import { Plus, GraduationCap, CreditCard, Clock, BookOpen, Users, X } from 'lucide-react';

export default function App() {
  // Navigation & Role State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Document direct print target
  const [docStudentId, setDocStudentId] = useState<string | undefined>(undefined);
  const [docType, setDocType] = useState<'bulletin' | 'attestation' | 'certificat' | 'recu'>('bulletin');

  // School Data Store State
  const [students, setStudents] = useState<Student[]>(() => SchoolDataStore.getStudents());
  const [teachers, setTeachers] = useState<Teacher[]>(() => SchoolDataStore.getTeachers());
  const [classes, setClasses] = useState<SchoolClass[]>(() => SchoolDataStore.getClasses());
  const [absences, setAbsences] = useState<AttendanceRecord[]>(() => SchoolDataStore.getAbsences());
  const [grades, setGrades] = useState<GradeItem[]>(() => SchoolDataStore.getGrades());
  const [payments, setPayments] = useState<Payment[]>(() => SchoolDataStore.getPayments());
  const [accounts, setAccounts] = useState<UserAccount[]>(() => SchoolDataStore.getAccounts());
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(() => SchoolDataStore.getSchoolInfo());

  // Check Supabase connection on mount
  useEffect(() => {
    testSupabaseConnection().then(res => setIsSupabaseConnected(res.success));
  }, []);

  // Global Keyboard Shortcut for Search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Refresh all state from local store
  const refreshAllState = useCallback(() => {
    setStudents(SchoolDataStore.getStudents());
    setTeachers(SchoolDataStore.getTeachers());
    setClasses(SchoolDataStore.getClasses());
    setAbsences(SchoolDataStore.getAbsences());
    setGrades(SchoolDataStore.getGrades());
    setPayments(SchoolDataStore.getPayments());
    setAccounts(SchoolDataStore.getAccounts());
    setSchoolInfo(SchoolDataStore.getSchoolInfo());
  }, []);

  // Student Actions
  const handleSaveStudent = (student: Student, recordPayment = false) => {
    SchoolDataStore.saveStudent(student);
    if (recordPayment) {
      const cls = classes.find(c => c.id === student.classeId);
      const amount = student.statutInscription === 'Inscrit' 
        ? (cls?.fraisInscription || 45000) 
        : (cls?.scolariteMensuelle || 35000);
      const receiptNum = `REC-2024-${String(payments.length + 1).padStart(4, '0')}`;

      const newPayment: Payment = {
        id: `pay-${Date.now()}`,
        numeroRecu: receiptNum,
        eleveId: student.id,
        classeId: student.classeId,
        montant: amount,
        datePaiement: new Date().toISOString().split('T')[0],
        typeFrais: student.statutInscription === 'Inscrit' ? 'Inscription' : 'Réinscription',
        modePaiement: 'Wave',
        recuPar: 'Caisse Principale',
        payeurNom: student.tuteur.nomComplet,
        observations: `Paiement automatique lors de l'enregistrement de l'élève`
      };
      SchoolDataStore.savePayment(newPayment);
    }
    refreshAllState();
  };

  const handleDeleteStudent = (id: string) => {
    SchoolDataStore.deleteStudent(id);
    refreshAllState();
  };

  // Teacher Actions
  const handleSaveTeacher = (teacher: Teacher) => {
    SchoolDataStore.saveTeacher(teacher);
    refreshAllState();
  };

  const handleDeleteTeacher = (id: string) => {
    SchoolDataStore.deleteTeacher(id);
    refreshAllState();
  };

  // Class Actions
  const handleSaveClass = (schoolClass: SchoolClass) => {
    SchoolDataStore.saveClass(schoolClass);
    refreshAllState();
  };

  const handleDeleteClass = (id: string) => {
    SchoolDataStore.deleteClass(id);
    refreshAllState();
  };

  const handleReassignStudent = (studentId: string, newClassId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      SchoolDataStore.saveStudent({ ...student, classeId: newClassId });
      refreshAllState();
    }
  };

  // Attendance Actions
  const handleSaveAttendance = (record: AttendanceRecord) => {
    SchoolDataStore.saveAttendance(record);
    refreshAllState();
  };

  const handleToggleJustify = (id: string, justifie: boolean, motif?: string) => {
    const existing = absences.find(a => a.id === id);
    if (existing) {
      SchoolDataStore.saveAttendance({
        ...existing,
        justifie,
        dateJustification: justifie ? new Date().toISOString().split('T')[0] : undefined,
        pieceJustificative: motif || existing.pieceJustificative || (justifie ? 'Billet parental validé' : undefined)
      });
      refreshAllState();
    }
  };

  const handleDeleteAttendance = (id: string) => {
    SchoolDataStore.deleteAttendance(id);
    refreshAllState();
  };

  // Grade Actions
  const handleSaveGrade = (grade: GradeItem) => {
    SchoolDataStore.saveGrade(grade);
    refreshAllState();
  };

  // Payment Actions
  const handleSavePayment = (payment: Payment) => {
    SchoolDataStore.savePayment(payment);
    refreshAllState();
  };

  // Print Document Navigation Helper
  const handlePrintDocument = (type: 'bulletin' | 'attestation' | 'certificat' | 'recu', studentId: string) => {
    setDocType(type);
    setDocStudentId(studentId);
    setActiveTab('documents');
  };

  // Account & School Settings
  const handleSaveAccount = (account: UserAccount) => {
    SchoolDataStore.saveAccount(account);
    refreshAllState();
  };

  const handleDeleteAccount = (id: string) => {
    SchoolDataStore.deleteAccount(id);
    refreshAllState();
  };

  const handleUpdateSchoolInfo = (info: SchoolInfo) => {
    SchoolDataStore.saveSchoolInfo(info);
    refreshAllState();
  };

  const handleResetData = () => {
    SchoolDataStore.resetToDefaults();
    refreshAllState();
  };

  // Global search direct jump
  const handleSearchNavigate = (tab: ActiveTab, targetId?: string) => {
    setActiveTab(tab);
    if (tab === 'students' && targetId) {
      // Direct jump to student
      setDocStudentId(targetId);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased font-sans text-slate-900">
      {/* Top Navigation Bar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenQuickAction={() => setIsQuickActionOpen(true)}
        onOpenSupabaseConfig={() => setIsSupabaseModalOpen(true)}
        schoolInfo={schoolInfo}
        isSupabaseConnected={isSupabaseConnected}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      <div className="flex-1 flex">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          currentRole={currentRole}
          schoolInfo={schoolInfo}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-72 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <DashboardView
              students={students}
              teachers={teachers}
              classes={classes}
              absences={absences}
              payments={payments}
              schoolInfo={schoolInfo}
              onNavigate={setActiveTab}
              onOpenNewStudent={() => {
                setActiveTab('students');
              }}
              onOpenNewPayment={() => {
                setActiveTab('payments');
              }}
              onOpenAttendance={() => {
                setActiveTab('attendance');
              }}
            />
          )}

          {/* TAB 2: STUDENTS */}
          {activeTab === 'students' && (
            <StudentsView
              students={students}
              classes={classes}
              payments={payments}
              absences={absences}
              grades={grades}
              currentRole={currentRole}
              onSaveStudent={handleSaveStudent}
              onDeleteStudent={handleDeleteStudent}
              onPrintDocument={handlePrintDocument}
            />
          )}

          {/* TAB 3: TEACHERS */}
          {activeTab === 'teachers' && (
            <TeachersView
              teachers={teachers}
              classes={classes}
              currentRole={currentRole}
              onSaveTeacher={handleSaveTeacher}
              onDeleteTeacher={handleDeleteTeacher}
            />
          )}

          {/* TAB 4: CLASSES */}
          {activeTab === 'classes' && (
            <ClassesView
              classes={classes}
              students={students}
              teachers={teachers}
              currentRole={currentRole}
              onSaveClass={handleSaveClass}
              onDeleteClass={handleDeleteClass}
              onReassignStudent={handleReassignStudent}
            />
          )}

          {/* TAB 5: ATTENDANCE */}
          {activeTab === 'attendance' && (
            <AttendanceView
              absences={absences}
              students={students}
              classes={classes}
              currentRole={currentRole}
              onSaveAttendance={handleSaveAttendance}
              onToggleJustify={handleToggleJustify}
              onDeleteAttendance={handleDeleteAttendance}
            />
          )}

          {/* TAB 6: GRADES */}
          {activeTab === 'grades' && (
            <GradesView
              grades={grades}
              students={students}
              classes={classes}
              currentRole={currentRole}
              onSaveGrade={handleSaveGrade}
              onPrintBulletin={(studentId) => handlePrintDocument('bulletin', studentId)}
            />
          )}

          {/* TAB 7: PAYMENTS */}
          {activeTab === 'payments' && (
            <PaymentsView
              payments={payments}
              students={students}
              classes={classes}
              currentRole={currentRole}
              onSavePayment={handleSavePayment}
              onPrintReceipt={(payId) => {
                const pay = payments.find(p => p.id === payId);
                if (pay) {
                  handlePrintDocument('recu', pay.eleveId);
                }
              }}
            />
          )}

          {/* TAB 8: DOCUMENTS */}
          {activeTab === 'documents' && (
            <DocumentsView
              students={students}
              classes={classes}
              grades={grades}
              absences={absences}
              payments={payments}
              schoolInfo={schoolInfo}
              initialStudentId={docStudentId}
              initialDocType={docType}
            />
          )}

          {/* TAB 9: SUPABASE / SQL */}
          {activeTab === 'supabase' && (
            <AdminView
              accounts={accounts}
              schoolInfo={schoolInfo}
              currentRole={currentRole}
              onSaveAccount={handleSaveAccount}
              onDeleteAccount={handleDeleteAccount}
              onUpdateSchoolInfo={handleUpdateSchoolInfo}
              onResetData={handleResetData}
            />
          )}

          {/* TAB 10: ADMINISTRATION */}
          {activeTab === 'administration' && (
            <AdminView
              accounts={accounts}
              schoolInfo={schoolInfo}
              currentRole={currentRole}
              onSaveAccount={handleSaveAccount}
              onDeleteAccount={handleDeleteAccount}
              onUpdateSchoolInfo={handleUpdateSchoolInfo}
              onResetData={handleResetData}
            />
          )}
        </main>
      </div>

      {/* Global Spotlight Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        students={students}
        teachers={teachers}
        classes={classes}
        payments={payments}
        onNavigate={handleSearchNavigate}
      />

      {/* Supabase PostgreSQL Configuration & SQL Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        isConnected={isSupabaseConnected}
        onRefreshStatus={() => {
          testSupabaseConnection().then(res => setIsSupabaseConnected(res.success));
        }}
      />

      {/* Quick Action Modal ("Nouveau") */}
      {isQuickActionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200 p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm">Action Rapide</h3>
              <button
                onClick={() => setIsQuickActionOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs font-bold">
              <button
                onClick={() => {
                  setIsQuickActionOpen(false);
                  setActiveTab('students');
                }}
                className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 flex items-center gap-2.5 transition text-left"
              >
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span>Inscrire un nouvel élève</span>
              </button>

              <button
                onClick={() => {
                  setIsQuickActionOpen(false);
                  setActiveTab('payments');
                }}
                className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 flex items-center gap-2.5 transition text-left"
              >
                <CreditCard className="w-4 h-4 text-teal-600" />
                <span>Encaisser un paiement (Wave / OM / Cash)</span>
              </button>

              <button
                onClick={() => {
                  setIsQuickActionOpen(false);
                  setActiveTab('attendance');
                }}
                className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 flex items-center gap-2.5 transition text-left"
              >
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Signaler une absence / retard</span>
              </button>

              <button
                onClick={() => {
                  setIsQuickActionOpen(false);
                  setActiveTab('grades');
                }}
                className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 flex items-center gap-2.5 transition text-left"
              >
                <BookOpen className="w-4 h-4 text-purple-600" />
                <span>Saisir des notes de devoirs / compo</span>
              </button>

              <button
                onClick={() => {
                  setIsQuickActionOpen(false);
                  setActiveTab('documents');
                }}
                className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 flex items-center gap-2.5 transition text-left"
              >
                <Plus className="w-4 h-4 text-blue-600" />
                <span>Éditer une attestation ou un bulletin</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
