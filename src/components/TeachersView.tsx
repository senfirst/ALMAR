import { useState, useMemo } from 'react';
import { Plus, Search, Users, Phone, Mail, BookOpen, Edit3, Trash2, X, Check } from 'lucide-react';
import { Teacher, SchoolClass, UserRole } from '../types';

interface TeachersViewProps {
  teachers: Teacher[];
  classes: SchoolClass[];
  currentRole: UserRole;
  onSaveTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
}

export function TeachersView({
  teachers,
  classes,
  currentRole,
  onSaveTeacher,
  onDeleteTeacher
}: TeachersViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const canManage = currentRole === 'admin';

  // Extract all distinct subjects
  const allSubjects = useMemo(() => {
    const set = new Set<string>();
    teachers.forEach(t => t.matieres.forEach(m => set.add(m)));
    return Array.from(set).sort();
  }, [teachers]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => {
      const matchSearch = `${t.prenom} ${t.nom} ${t.matricule} ${t.email} ${t.telephone}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchSubject = selectedSubjectFilter === 'all' || t.matieres.includes(selectedSubjectFilter);
      return matchSearch && matchSubject;
    });
  }, [teachers, searchTerm, selectedSubjectFilter]);

  // Form State
  const [formData, setFormData] = useState<Partial<Teacher>>({
    matricule: '',
    prenom: '',
    nom: '',
    email: '',
    telephone: '+221 77 ',
    statut: 'Titulaire',
    diplome: 'Master / CAPES',
    matieres: [],
    classeIds: []
  });
  const [newSubjectInput, setNewSubjectInput] = useState('');

  const openNewTeacherModal = () => {
    const nextNum = teachers.length + 1;
    setEditingTeacher(null);
    setFormData({
      matricule: `ENS-2024-${String(nextNum).padStart(3, '0')}`,
      prenom: '',
      nom: '',
      email: '',
      telephone: '+221 77 ',
      statut: 'Titulaire',
      diplome: 'Master UCAD / FASTEF',
      matieres: ['Mathématiques'],
      classeIds: [classes[0]?.id || '']
    });
    setIsModalOpen(true);
  };

  const openEditTeacherModal = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData(JSON.parse(JSON.stringify(teacher)));
    setIsModalOpen(true);
  };

  const handleToggleClass = (classId: string) => {
    const current = formData.classeIds || [];
    if (current.includes(classId)) {
      setFormData({ ...formData, classeIds: current.filter(id => id !== classId) });
    } else {
      setFormData({ ...formData, classeIds: [...current, classId] });
    }
  };

  const handleAddSubject = () => {
    if (!newSubjectInput.trim()) return;
    const current = formData.matieres || [];
    if (!current.includes(newSubjectInput.trim())) {
      setFormData({ ...formData, matieres: [...current, newSubjectInput.trim()] });
    }
    setNewSubjectInput('');
  };

  const handleRemoveSubject = (matiere: string) => {
    setFormData({
      ...formData,
      matieres: (formData.matieres || []).filter(m => m !== matiere)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.prenom || !formData.nom || !formData.email || !formData.telephone) {
      alert('Veuillez remplir les informations obligatoires de l\'enseignant.');
      return;
    }

    const teacherToSave: Teacher = {
      id: editingTeacher ? editingTeacher.id : `ens-${Date.now()}`,
      matricule: formData.matricule || `ENS-2024-${Date.now().toString().slice(-3)}`,
      prenom: formData.prenom!,
      nom: formData.nom!,
      email: formData.email!,
      telephone: formData.telephone!,
      statut: (formData.statut as any) || 'Titulaire',
      diplome: formData.diplome || 'Enseignant',
      matieres: formData.matieres && formData.matieres.length > 0 ? formData.matieres : ['Général'],
      classeIds: formData.classeIds || [],
      dateEmbauche: editingTeacher?.dateEmbauche || new Date().toISOString().split('T')[0]
    };

    onSaveTeacher(teacherToSave);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Corps Professoral & Enseignants
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Gestion des professeurs, affectations aux matières et classes
          </p>
        </div>

        {canManage && (
          <button
            id="teachers-add-btn"
            onClick={openNewTeacherModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Ajouter un enseignant
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, matière, matricule..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
          />
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold shrink-0">Matière :</span>
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 text-slate-700 font-semibold"
          >
            <option value="all">Toutes les matières ({allSubjects.length})</option>
            {allSubjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Teacher Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeachers.map((teacher) => {
          const assignedClasses = classes.filter(c => teacher.classeIds.includes(c.id));
          return (
            <div
              key={teacher.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-extrabold flex items-center justify-center text-base shadow-xs">
                      {teacher.prenom[0]}{teacher.nom[0]}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        {teacher.prenom} {teacher.nom}
                      </h3>
                      <div className="text-[11px] font-mono text-slate-400">
                        {teacher.matricule}
                      </div>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold mt-1 ${
                        teacher.statut === 'Titulaire' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {teacher.statut}
                      </span>
                    </div>
                  </div>

                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditTeacherModal(teacher)}
                        className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        title="Modifier"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Supprimer l'enseignant ${teacher.prenom} ${teacher.nom} ?`)) {
                            onDeleteTeacher(teacher.id);
                          }
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Diplôme */}
                <p className="text-xs text-slate-600 mt-3 font-medium">
                  🎓 {teacher.diplome}
                </p>

                {/* Matières */}
                <div className="mt-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Matières enseignées
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {teacher.matieres.map((m, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Classes assignées */}
                <div className="mt-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Classes assignées ({assignedClasses.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {assignedClasses.length === 0 ? (
                      <span className="text-[11px] text-slate-400 italic">Aucune classe assignée</span>
                    ) : (
                      assignedClasses.map((c) => (
                        <span
                          key={c.id}
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700"
                        >
                          {c.code}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5 font-mono">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{teacher.telephone}</span>
                </div>
                <div className="truncate max-w-[140px] text-[11px]" title={teacher.email}>
                  {teacher.email}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: Add/Edit Teacher */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-200 my-8">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {editingTeacher ? `Modifier : ${editingTeacher.prenom} ${editingTeacher.nom}` : 'Ajouter un Enseignant'}
                </h3>
                <p className="text-xs text-slate-500">
                  Définissez la spécialité, les matières et les classes attribuées
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                    value={formData.nom || ''}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Téléphone (Sénégal) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+221 77 000 00 00"
                    value={formData.telephone || ''}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Email académique *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="prof@groupescolaire-cad.sn"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Statut enseignant
                  </label>
                  <select
                    value={formData.statut || 'Titulaire'}
                    onChange={(e) => setFormData({ ...formData, statut: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    <option value="Titulaire">Titulaire</option>
                    <option value="Vacataire">Vacataire</option>
                    <option value="Contractuel">Contractuel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Diplôme le plus élevé
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Master UCAD, Doctorat, CAPES..."
                    value={formData.diplome || ''}
                    onChange={(e) => setFormData({ ...formData, diplome: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Matières */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Matières enseignées
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Ajouter une matière (ex: Mathématiques, Philosophie...)"
                    value={newSubjectInput}
                    onChange={(e) => setNewSubjectInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubject}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800"
                  >
                    Ajouter
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[30px] p-2 rounded-xl bg-slate-50 border border-slate-200">
                  {(formData.matieres || []).map((m) => (
                    <span
                      key={m}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800"
                    >
                      {m}
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(m)}
                        className="hover:text-rose-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Classes assignées */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Classes prises en charge
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-2 rounded-xl bg-slate-50 border border-slate-200">
                  {classes.map((cls) => {
                    const isSelected = (formData.classeIds || []).includes(cls.id);
                    return (
                      <button
                        type="button"
                        key={cls.id}
                        onClick={() => handleToggleClass(cls.id)}
                        className={`p-2 rounded-lg text-left text-xs font-semibold border transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span>{cls.code}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    );
                  })}
                </div>
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
                  {editingTeacher ? 'Enregistrer' : 'Créer l\'enseignant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
