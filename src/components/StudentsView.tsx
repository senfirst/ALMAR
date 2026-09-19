import { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  GraduationCap, 
  Eye, 
  Edit3, 
  Trash2, 
  UserCheck, 
  FileText, 
  CreditCard, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  CheckCircle,
  X,
  Printer
} from 'lucide-react';
import { Student, SchoolClass, Payment, AttendanceRecord, GradeItem, UserRole } from '../types';
import { formatFCFA, formatDateFR, formatDateShort, calculateGradeMoyenne, getAppreciationMention } from '../utils/formatters';

interface StudentsViewProps {
  students: Student[];
  classes: SchoolClass[];
  payments: Payment[];
  absences: AttendanceRecord[];
  grades: GradeItem[];
  currentRole: UserRole;
  onSaveStudent: (student: Student, recordPayment?: boolean) => void;
  onDeleteStudent: (id: string) => void;
  onPrintDocument: (type: 'bulletin' | 'attestation' | 'certificat' | 'recu', studentId: string) => void;
}

export function StudentsView({
  students,
  classes,
  payments,
  absences,
  grades,
  currentRole,
  onSaveStudent,
  onDeleteStudent,
  onPrintDocument
}: StudentsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedGenderFilter, setSelectedGenderFilter] = useState<string>('all');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [activeDossierTab, setActiveDossierTab] = useState<'info' | 'grades' | 'payments' | 'absences'>('info');

  // Can manage students (Admin & Secrétaire)
  const canManage = currentRole === 'admin' || currentRole === 'secretaire';

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchSearch = 
        `${student.prenom} ${student.nom} ${student.matricule} ${student.tuteur.nomComplet} ${student.tuteur.telephone}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      
      const matchClass = selectedClassFilter === 'all' || student.classeId === selectedClassFilter;
      const matchStatus = selectedStatusFilter === 'all' || student.statut === selectedStatusFilter;
      const matchGender = selectedGenderFilter === 'all' || student.sexe === selectedGenderFilter;

      return matchSearch && matchClass && matchStatus && matchGender;
    });
  }, [students, searchTerm, selectedClassFilter, selectedStatusFilter, selectedGenderFilter]);

  // Form State
  const [formData, setFormData] = useState<Partial<Student>>({
    matricule: '',
    prenom: '',
    nom: '',
    dateNaissance: '2008-01-01',
    lieuNaissance: 'Dakar',
    sexe: 'M',
    classeId: classes[0]?.id || '',
    adresse: '',
    ville: 'Dakar',
    quartier: '',
    statut: 'Inscrit',
    tuteur: {
      nomComplet: '',
      lienParente: 'Père',
      telephone: '+221 ',
      adresse: '',
      profession: ''
    },
    fraisInscriptionPaye: true
  });
  const [recordInitialPayment, setRecordInitialPayment] = useState(true);

  const openNewStudentModal = () => {
    const nextNum = students.length + 1;
    const autoMatricule = `CAD-2024-${String(nextNum).padStart(3, '0')}`;
    setEditingStudent(null);
    setFormData({
      matricule: autoMatricule,
      prenom: '',
      nom: '',
      dateNaissance: '2008-01-01',
      lieuNaissance: 'Dakar',
      sexe: 'M',
      classeId: classes[0]?.id || '',
      adresse: 'Médina',
      ville: 'Dakar',
      quartier: 'Médina',
      statut: 'Inscrit',
      tuteur: {
        nomComplet: '',
        lienParente: 'Père',
        telephone: '+221 77 ',
        adresse: 'Dakar',
        profession: ''
      },
      fraisInscriptionPaye: true
    });
    setRecordInitialPayment(true);
    setIsFormOpen(true);
  };

  const openEditStudentModal = (student: Student) => {
    setEditingStudent(student);
    setFormData(JSON.parse(JSON.stringify(student)));
    setRecordInitialPayment(false);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.prenom || !formData.nom || !formData.classeId || !formData.tuteur?.nomComplet) {
      alert('Veuillez remplir les champs obligatoires (Prénom, Nom, Classe, Tuteur).');
      return;
    }

    const studentToSave: Student = {
      id: editingStudent ? editingStudent.id : `elv-${Date.now()}`,
      matricule: formData.matricule || `CAD-2024-${Date.now().toString().slice(-4)}`,
      prenom: formData.prenom!,
      nom: formData.nom!,
      dateNaissance: formData.dateNaissance || '2008-01-01',
      lieuNaissance: formData.lieuNaissance || 'Dakar',
      sexe: formData.sexe as 'M' | 'F' || 'M',
      classeId: formData.classeId!,
      photoUrl: formData.photoUrl || (formData.sexe === 'F' 
        ? 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
      adresse: formData.adresse || 'Dakar',
      ville: formData.ville || 'Dakar',
      quartier: formData.quartier || '',
      statut: (formData.statut as any) || 'Inscrit',
      dateInscription: editingStudent?.dateInscription || new Date().toISOString().split('T')[0],
      tuteur: {
        nomComplet: formData.tuteur?.nomComplet || '',
        lienParente: formData.tuteur?.lienParente || 'Père',
        telephone: formData.tuteur?.telephone || '+221 77 000 00 00',
        telephoneSecondaire: formData.tuteur?.telephoneSecondaire,
        email: formData.tuteur?.email,
        adresse: formData.tuteur?.adresse || 'Dakar',
        profession: formData.tuteur?.profession || ''
      },
      groupeSanguin: formData.groupeSanguin,
      fraisInscriptionPaye: formData.fraisInscriptionPaye ?? true
    };

    onSaveStudent(studentToSave, !editingStudent && recordInitialPayment);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Gestion des Élèves & Inscriptions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Dossiers scolaires, fiches individuelles, tuteurs et affectation en classe
          </p>
        </div>

        {canManage && (
          <button
            id="students-add-btn"
            onClick={openNewStudentModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Inscrire un élève
          </button>
        )}
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Nom, prénom, matricule, tuteur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
            />
          </div>

          {/* Class Filter */}
          <div>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 text-slate-700 font-semibold"
            >
              <option value="all">Toutes les classes ({students.length})</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom} ({students.filter(s => s.classeId === c.id).length})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 text-slate-700 font-semibold"
            >
              <option value="all">Tous les statuts</option>
              <option value="Inscrit">Inscrit</option>
              <option value="Réinscrit">Réinscrit</option>
              <option value="En attente">En attente</option>
              <option value="Radié">Radié</option>
            </select>
          </div>

          {/* Gender Filter */}
          <div>
            <select
              value={selectedGenderFilter}
              onChange={(e) => setSelectedGenderFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 text-slate-700 font-semibold"
            >
              <option value="all">Tous les genres (M & F)</option>
              <option value="M">Garçons (M)</option>
              <option value="F">Filles (F)</option>
            </select>
          </div>
        </div>

        {/* Counter Summary */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div>
            Affichage de <span className="font-bold text-slate-900">{filteredStudents.length}</span> élève(s) sur {students.length}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-emerald-700 font-semibold">
              {students.filter(s => s.sexe === 'F').length} Filles
            </span>
            <span>•</span>
            <span className="text-blue-700 font-semibold">
              {students.filter(s => s.sexe === 'M').length} Garçons
            </span>
          </div>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Élève & Matricule</th>
                <th className="py-3 px-4">Classe & Cycle</th>
                <th className="py-3 px-4">Date & Lieu Naiss.</th>
                <th className="py-3 px-4">Parent / Tuteur</th>
                <th className="py-3 px-4">Téléphone</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Aucun élève ne correspond aux critères de recherche.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const assignedClass = classes.find(c => c.id === student.classeId);
                  return (
                    <tr 
                      key={student.id} 
                      className="hover:bg-slate-50/80 transition group"
                    >
                      {/* Élève nom & avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.photoUrl || (student.sexe === 'F' ? 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100')}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-extrabold text-slate-900 group-hover:text-emerald-700 transition">
                              {student.prenom} {student.nom}
                            </div>
                            <div className="font-mono text-[10px] text-slate-400">
                              {student.matricule} • {student.sexe === 'M' ? 'Masculin' : 'Féminin'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Classe */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800">
                          {assignedClass ? assignedClass.nom : 'Non affecté'}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          {assignedClass?.cycle}
                        </div>
                      </td>

                      {/* Date & lieu de naissance */}
                      <td className="py-3 px-4 text-slate-600">
                        <div>{formatDateShort(student.dateNaissance)}</div>
                        <div className="text-[10px] text-slate-400">à {student.lieuNaissance}</div>
                      </td>

                      {/* Tuteur */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">
                          {student.tuteur.nomComplet}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {student.tuteur.lienParente} {student.tuteur.profession ? `(${student.tuteur.profession})` : ''}
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-medium text-slate-700">
                          {student.tuteur.telephone}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {student.adresse || student.ville}
                        </div>
                      </td>

                      {/* Statut */}
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          student.statut === 'Inscrit'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : student.statut === 'Réinscrit'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {student.statut}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`view-student-${student.id}`}
                            onClick={() => {
                              setViewingStudent(student);
                              setActiveDossierTab('info');
                            }}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition"
                            title="Voir le dossier complet"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {canManage && (
                            <button
                              id={`edit-student-${student.id}`}
                              onClick={() => openEditStudentModal(student)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition"
                              title="Modifier"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            id={`cert-student-${student.id}`}
                            onClick={() => onPrintDocument('certificat', student.id)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition"
                            title="Générer Certificat de fréquentation"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {canManage && (
                            <button
                              id={`delete-student-${student.id}`}
                              onClick={() => {
                                if (confirm(`Êtes-vous sûr de vouloir supprimer l'élève ${student.prenom} ${student.nom} ?`)) {
                                  onDeleteStudent(student.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Inscription & Réinscription Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 my-8">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {editingStudent ? `Modifier le dossier : ${editingStudent.prenom} ${editingStudent.nom}` : 'Nouvelle Inscription Scolaire'}
                </h3>
                <p className="text-xs text-slate-500">
                  Remplissez les informations administratives de l'élève et du tuteur
                </p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Section 1: Informations de l'Élève */}
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider pb-1 border-b border-emerald-100 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" /> État Civil de l'Élève
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Matricule *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.matricule || ''}
                    onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Mouhamed, Fatou..."
                    value={formData.prenom || ''}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nom de famille *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Ba, Sow, Diop..."
                    value={formData.nom || ''}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Sexe *
                  </label>
                  <select
                    value={formData.sexe || 'M'}
                    onChange={(e) => setFormData({ ...formData, sexe: e.target.value as 'M' | 'F' })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="M">Masculin (Garçon)</option>
                    <option value="F">Féminin (Fille)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Date de naissance *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dateNaissance || ''}
                    onChange={(e) => setFormData({ ...formData, dateNaissance: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Lieu de naissance *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Dakar, Thiès, Kaolack..."
                    value={formData.lieuNaissance || ''}
                    onChange={(e) => setFormData({ ...formData, lieuNaissance: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Classe affectée *
                  </label>
                  <select
                    required
                    value={formData.classeId || ''}
                    onChange={(e) => setFormData({ ...formData, classeId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.nom} ({formatFCFA(cls.scolariteMensuelle)}/mois)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Statut dossier
                  </label>
                  <select
                    value={formData.statut || 'Inscrit'}
                    onChange={(e) => setFormData({ ...formData, statut: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Inscrit">Nouvelle Inscription</option>
                    <option value="Réinscrit">Réinscription</option>
                    <option value="En attente">Dossier en attente</option>
                    <option value="Transféré">Élève transféré</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Groupe Sanguin
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: O+, A+, B+..."
                    value={formData.groupeSanguin || ''}
                    onChange={(e) => setFormData({ ...formData, groupeSanguin: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Adresse de résidence
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Médina Rue 22, Sacré-Cœur 3..."
                    value={formData.adresse || ''}
                    onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Quartier / Ville
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Parcelles Assainies, Dakar"
                    value={formData.quartier || ''}
                    onChange={(e) => setFormData({ ...formData, quartier: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Section 2: Informations du Tuteur / Parent */}
              <div className="text-xs font-bold text-blue-800 uppercase tracking-wider pt-3 pb-1 border-b border-blue-100 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" /> Parent ou Tuteur Légal au Sénégal
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nom complet du tuteur *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: El Hadji Malick Ba"
                    value={formData.tuteur?.nomComplet || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      tuteur: { ...formData.tuteur!, nomComplet: e.target.value }
                    })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Lien de parenté *
                  </label>
                  <select
                    value={formData.tuteur?.lienParente || 'Père'}
                    onChange={(e) => setFormData({
                      ...formData,
                      tuteur: { ...formData.tuteur!, lienParente: e.target.value as any }
                    })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Père">Père</option>
                    <option value="Mère">Mère</option>
                    <option value="Tuteur légal">Tuteur légal</option>
                    <option value="Oncle/Tante">Oncle / Tante</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Profession
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Ingénieur, Enseignant, Commerçant..."
                    value={formData.tuteur?.profession || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      tuteur: { ...formData.tuteur!, profession: e.target.value }
                    })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Téléphone principal (Sénégal) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+221 77 000 00 00"
                    value={formData.tuteur?.telephone || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      tuteur: { ...formData.tuteur!, telephone: e.target.value }
                    })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Email de contact
                  </label>
                  <input
                    type="email"
                    placeholder="parent@example.sn"
                    value={formData.tuteur?.email || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      tuteur: { ...formData.tuteur!, email: e.target.value }
                    })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {!editingStudent && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="recordInitialPaymentCheck"
                    checked={recordInitialPayment}
                    onChange={(e) => setRecordInitialPayment(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <label htmlFor="recordInitialPaymentCheck" className="text-xs text-slate-800 font-medium cursor-pointer">
                    Encaisser et éditer le reçu des frais d'inscription immédiatement (Caisse)
                  </label>
                </div>
              )}

              {/* Form Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-xs"
                >
                  {editingStudent ? 'Enregistrer les modifications' : 'Confirmer l\'inscription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Dossier Complet de l'Élève */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 my-8 flex flex-col">
            {/* Header of Dossier */}
            <div className="p-6 bg-gradient-to-r from-emerald-800 to-slate-900 text-white flex items-start justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={viewingStudent.photoUrl || (viewingStudent.sexe === 'F' ? 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150')}
                  alt=""
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400/40 shadow-sm"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black">
                      {viewingStudent.prenom} {viewingStudent.nom}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                      {viewingStudent.statut}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200/80 font-mono mt-0.5">
                    Matricule: {viewingStudent.matricule} • {classes.find(c => c.id === viewingStudent.classeId)?.nom || 'Classe'}
                  </p>
                  <p className="text-xs text-slate-300 mt-1">
                    Né(e) le {formatDateFR(viewingStudent.dateNaissance)} à {viewingStudent.lieuNaissance}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setViewingStudent(null)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dossier Tabs */}
            <div className="px-6 border-b border-slate-200 bg-slate-50 flex items-center gap-4 text-xs font-bold text-slate-600">
              <button
                onClick={() => setActiveDossierTab('info')}
                className={`py-3 border-b-2 transition ${
                  activeDossierTab === 'info'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                Fiche & Tuteur
              </button>
              <button
                onClick={() => setActiveDossierTab('grades')}
                className={`py-3 border-b-2 transition ${
                  activeDossierTab === 'grades'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                Notes & Bulletins ({grades.filter(g => g.eleveId === viewingStudent.id).length})
              </button>
              <button
                onClick={() => setActiveDossierTab('payments')}
                className={`py-3 border-b-2 transition ${
                  activeDossierTab === 'payments'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                Historique Paiements ({payments.filter(p => p.eleveId === viewingStudent.id).length})
              </button>
              <button
                onClick={() => setActiveDossierTab('absences')}
                className={`py-3 border-b-2 transition ${
                  activeDossierTab === 'absences'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                Absences ({absences.filter(a => a.eleveId === viewingStudent.id).length})
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {activeDossierTab === 'info' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Civil & Medical */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      <div className="font-extrabold text-slate-900 pb-1 border-b border-slate-200">
                        État Civil & Coordonnées
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Genre :</span>
                        <span className="font-bold text-slate-800">{viewingStudent.sexe === 'M' ? 'Masculin' : 'Féminin'}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Adresse :</span>
                        <span className="font-bold text-slate-800">{viewingStudent.adresse}, {viewingStudent.ville}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Date d'inscription :</span>
                        <span className="font-bold text-slate-800">{formatDateFR(viewingStudent.dateInscription)}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Groupe Sanguin :</span>
                        <span className="font-bold text-emerald-700">{viewingStudent.groupeSanguin || 'Non renseigné'}</span>
                      </div>
                    </div>

                    {/* Tuteur */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      <div className="font-extrabold text-slate-900 pb-1 border-b border-slate-200">
                        Parent ou Tuteur
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Nom complet :</span>
                        <span className="font-bold text-slate-800">{viewingStudent.tuteur.nomComplet}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Lien de parenté :</span>
                        <span className="font-bold text-slate-800">{viewingStudent.tuteur.lienParente}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Téléphone :</span>
                        <span className="font-mono font-bold text-emerald-800">{viewingStudent.tuteur.telephone}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Profession :</span>
                        <span className="font-bold text-slate-800">{viewingStudent.tuteur.profession || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Email :</span>
                        <span className="text-slate-800">{viewingStudent.tuteur.email || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Document Generation Action Bar */}
                  <div className="pt-2">
                    <div className="text-xs font-bold text-slate-700 mb-2">
                      Générer des documents officiels pour cet élève :
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        onClick={() => onPrintDocument('bulletin', viewingStudent.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Bulletin de Notes
                      </button>
                      <button
                        onClick={() => onPrintDocument('attestation', viewingStudent.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Attestation de Scolarité
                      </button>
                      <button
                        onClick={() => onPrintDocument('certificat', viewingStudent.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition shadow-xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Certificat de Fréquentation
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeDossierTab === 'grades' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Notes enregistrées pour l'année en cours</span>
                    <button
                      onClick={() => onPrintDocument('bulletin', viewingStudent.id)}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5" /> Imprimer le bulletin
                    </button>
                  </div>

                  {grades.filter(g => g.eleveId === viewingStudent.id).length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">Aucune note enregistrée pour cet élève.</p>
                  ) : (
                    <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                          <tr>
                            <th className="p-2.5">Matière</th>
                            <th className="p-2.5">Coef</th>
                            <th className="p-2.5">Devoir 1</th>
                            <th className="p-2.5">Devoir 2</th>
                            <th className="p-2.5">Composition</th>
                            <th className="p-2.5">Moyenne</th>
                            <th className="p-2.5">Appréciation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {grades
                            .filter(g => g.eleveId === viewingStudent.id)
                            .map((g) => {
                              const moy = calculateGradeMoyenne(g.noteDevoir1, g.noteDevoir2, g.noteCompo);
                              return (
                                <tr key={g.id} className="hover:bg-slate-50/50">
                                  <td className="p-2.5 font-bold text-slate-900">{g.matiere}</td>
                                  <td className="p-2.5 font-mono">{g.coefficient}</td>
                                  <td className="p-2.5">{g.noteDevoir1 !== null ? `${g.noteDevoir1}/20` : '-'}</td>
                                  <td className="p-2.5">{g.noteDevoir2 !== null ? `${g.noteDevoir2}/20` : '-'}</td>
                                  <td className="p-2.5 font-bold">{g.noteCompo !== null ? `${g.noteCompo}/20` : '-'}</td>
                                  <td className="p-2.5 font-bold text-emerald-700">
                                    {moy !== null ? `${moy}/20` : '-'}
                                  </td>
                                  <td className="p-2.5 text-[11px] text-slate-500 italic max-w-xs truncate">
                                    {g.appreciationProf || '-'}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeDossierTab === 'payments' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Reçus de paiement de la scolarité</span>
                    <span className="text-xs font-black text-emerald-700">
                      Total réglé : {formatFCFA(payments.filter(p => p.eleveId === viewingStudent.id).reduce((a, b) => a + b.montant, 0))}
                    </span>
                  </div>

                  {payments.filter(p => p.eleveId === viewingStudent.id).length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">Aucun paiement enregistré pour cet élève.</p>
                  ) : (
                    <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                          <tr>
                            <th className="p-2.5">N° Reçu</th>
                            <th className="p-2.5">Date</th>
                            <th className="p-2.5">Type de Frais</th>
                            <th className="p-2.5">Mode</th>
                            <th className="p-2.5">Montant</th>
                            <th className="p-2.5 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {payments
                            .filter(p => p.eleveId === viewingStudent.id)
                            .map((p) => (
                              <tr key={p.id} className="hover:bg-slate-50/50">
                                <td className="p-2.5 font-mono font-bold text-slate-800">{p.numeroRecu}</td>
                                <td className="p-2.5 text-slate-600">{formatDateShort(p.datePaiement)}</td>
                                <td className="p-2.5 font-semibold text-slate-700">
                                  {p.typeFrais} {p.moisConcerne ? `(${p.moisConcerne})` : ''}
                                </td>
                                <td className="p-2.5 font-bold text-emerald-700">{p.modePaiement}</td>
                                <td className="p-2.5 font-black text-slate-900">{formatFCFA(p.montant)}</td>
                                <td className="p-2.5 text-right">
                                  <button
                                    onClick={() => onPrintDocument('recu', viewingStudent.id)}
                                    className="p-1 rounded text-slate-600 hover:text-emerald-700 hover:bg-slate-100"
                                    title="Imprimer le reçu"
                                  >
                                    <Printer className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeDossierTab === 'absences' && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-700">Historique des absences et retards</span>
                  {absences.filter(a => a.eleveId === viewingStudent.id).length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">Aucune absence enregistrée. Félicitations pour la parfaite assiduité !</p>
                  ) : (
                    <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                          <tr>
                            <th className="p-2.5">Date</th>
                            <th className="p-2.5">Créneau</th>
                            <th className="p-2.5">Motif</th>
                            <th className="p-2.5">Statut</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {absences
                            .filter(a => a.eleveId === viewingStudent.id)
                            .map((a) => (
                              <tr key={a.id} className="hover:bg-slate-50/50">
                                <td className="p-2.5 font-bold text-slate-800">{formatDateShort(a.date)}</td>
                                <td className="p-2.5">{a.creneau} ({a.heuresManquees}h)</td>
                                <td className="p-2.5 text-slate-600">{a.motif || 'Non précisé'}</td>
                                <td className="p-2.5">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    a.justifie ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                  }`}>
                                    {a.justifie ? 'Justifiée' : 'Non justifiée'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Dossier Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">Groupe Scolaire d'Excellence Cheikh Anta Diop</span>
              <button
                onClick={() => setViewingStudent(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 font-semibold text-slate-800 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
