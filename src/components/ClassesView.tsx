import { useState } from 'react';
import { Plus, BookOpen, Users, UserCheck, Edit3, Trash2, X, Check, ArrowRightLeft } from 'lucide-react';
import { SchoolClass, Student, Teacher, UserRole, SchoolCycle } from '../types';
import { formatFCFA } from '../utils/formatters';

interface ClassesViewProps {
  classes: SchoolClass[];
  students: Student[];
  teachers: Teacher[];
  currentRole: UserRole;
  onSaveClass: (schoolClass: SchoolClass) => void;
  onDeleteClass: (id: string) => void;
  onReassignStudent: (studentId: string, newClassId: string) => void;
}

export function ClassesView({
  classes,
  students,
  teachers,
  currentRole,
  onSaveClass,
  onDeleteClass,
  onReassignStudent
}: ClassesViewProps) {
  const [selectedCycle, setSelectedCycle] = useState<string>('all');
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);

  // Assignment Modal
  const [assigningClass, setAssigningClass] = useState<SchoolClass | null>(null);

  const canManage = currentRole === 'admin' || currentRole === 'secretaire';

  const cycles: SchoolCycle[] = ['Élémentaire', 'Moyen', 'Secondaire'];

  const filteredClasses = classes.filter(
    c => selectedCycle === 'all' || c.cycle === selectedCycle
  );

  // Form State for Class
  const [formData, setFormData] = useState<Partial<SchoolClass>>({
    code: '',
    nom: '',
    niveau: '6ème',
    cycle: 'Moyen',
    serie: '',
    salle: 'Salle 101',
    capacite: 40,
    fraisInscription: 45000,
    scolariteMensuelle: 35000,
    professeurPrincipalId: teachers[0]?.id || ''
  });

  const openNewClassModal = () => {
    setEditingClass(null);
    setFormData({
      code: '5EME_B',
      nom: 'Cinquième B (Collège)',
      niveau: '5ème',
      cycle: 'Moyen',
      serie: '',
      salle: 'Salle 105',
      capacite: 40,
      fraisInscription: 45000,
      scolariteMensuelle: 35000,
      professeurPrincipalId: teachers[0]?.id || ''
    });
    setIsClassModalOpen(true);
  };

  const openEditClassModal = (cls: SchoolClass) => {
    setEditingClass(cls);
    setFormData(JSON.parse(JSON.stringify(cls)));
    setIsClassModalOpen(true);
  };

  const handleClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.nom || !formData.cycle) {
      alert('Veuillez remplir les informations obligatoires de la classe.');
      return;
    }

    const classToSave: SchoolClass = {
      id: editingClass ? editingClass.id : `cls-${Date.now()}`,
      code: formData.code.toUpperCase().replace(/\s+/g, '_'),
      nom: formData.nom,
      niveau: formData.niveau || 'Autre',
      cycle: formData.cycle as SchoolCycle || 'Moyen',
      serie: formData.serie,
      salle: formData.salle || 'Salle de cours',
      capacite: Number(formData.capacite) || 40,
      fraisInscription: Number(formData.fraisInscription) || 40000,
      scolariteMensuelle: Number(formData.scolariteMensuelle) || 30000,
      professeurPrincipalId: formData.professeurPrincipalId
    };

    onSaveClass(classToSave);
    setIsClassModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Classes & Affectations des Élèves
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Structure pédagogique des cycles Élémentaire, Moyen et Secondaire au Sénégal
          </p>
        </div>

        {canManage && (
          <button
            id="classes-add-btn"
            onClick={openNewClassModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Créer une classe
          </button>
        )}
      </div>

      {/* Cycle Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedCycle('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            selectedCycle === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Tous les cycles ({classes.length})
        </button>
        {cycles.map((cy) => (
          <button
            key={cy}
            onClick={() => setSelectedCycle(cy)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              selectedCycle === cy
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Cycle {cy} ({classes.filter(c => c.cycle === cy).length})
          </button>
        ))}
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClasses.map((cls) => {
          const classStudents = students.filter(s => s.classeId === cls.id);
          const teacher = teachers.find(t => t.id === cls.professeurPrincipalId);
          const occupancy = Math.round((classStudents.length / cls.capacite) * 100);

          return (
            <div
              key={cls.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-slate-900">{cls.nom}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500">
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        {cls.code}
                      </span>
                      <span>•</span>
                      <span>{cls.salle}</span>
                    </div>
                  </div>

                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditClassModal(cls)}
                        className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        title="Modifier"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Supprimer la classe ${cls.nom} ? Attention aux élèves rattachés.`)) {
                            onDeleteClass(cls.id);
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

                {/* Cycle and Série */}
                <div className="flex items-center gap-2 mt-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                    Cycle {cls.cycle}
                  </span>
                  {cls.serie && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100">
                      Série {cls.serie}
                    </span>
                  )}
                </div>

                {/* Capacity Progress */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1 font-semibold">
                    <span className="text-slate-600">Effectif d'élèves</span>
                    <span className="text-slate-900 font-bold">{classStudents.length} / {cls.capacite} ({occupancy}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        occupancy >= 100
                          ? 'bg-rose-500'
                          : occupancy > 75
                          ? 'bg-emerald-500'
                          : 'bg-teal-500'
                      }`}
                      style={{ width: `${Math.min(occupancy, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Professeur Principal & Tarifs */}
                <div className="mt-4 space-y-1.5 text-xs text-slate-600 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Prof. Principal :</span>
                    <span className="font-bold text-slate-800">
                      {teacher ? `${teacher.prenom} ${teacher.nom}` : 'Non désigné'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Mensualité :</span>
                    <span className="font-black text-emerald-800">{formatFCFA(cls.scolariteMensuelle)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Inscription :</span>
                    <span className="font-semibold text-slate-700">{formatFCFA(cls.fraisInscription)}</span>
                  </div>
                </div>
              </div>

              {/* Action Affectation */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  id={`assign-class-${cls.id}`}
                  onClick={() => setAssigningClass(cls)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-bold text-xs border border-slate-200 transition flex items-center justify-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  Gérer les élèves affectés ({classStudents.length})
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: Add / Edit Class */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 my-8">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {editingClass ? `Modifier la classe : ${editingClass.nom}` : 'Créer une Nouvelle Classe'}
                </h3>
                <p className="text-xs text-slate-500">
                  Définissez le niveau, le cycle, la salle et les frais de scolarité
                </p>
              </div>
              <button
                onClick={() => setIsClassModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleClassSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Code de la classe *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 6EME_A, TLE_S2..."
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nom d'usage *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Sixième A, Terminale S2..."
                    value={formData.nom || ''}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Cycle scolaire *
                  </label>
                  <select
                    value={formData.cycle || 'Moyen'}
                    onChange={(e) => setFormData({ ...formData, cycle: e.target.value as SchoolCycle })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    <option value="Élémentaire">Élémentaire (CI-CM2)</option>
                    <option value="Moyen">Moyen (6ème-3ème)</option>
                    <option value="Secondaire">Secondaire (Lycée)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Niveau
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 6ème, 3ème, Tle..."
                    value={formData.niveau || ''}
                    onChange={(e) => setFormData({ ...formData, niveau: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Série (optionnel)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: S1, S2, L2, G..."
                    value={formData.serie || ''}
                    onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Salle de classe
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Salle 204, Labo 1..."
                    value={formData.salle || ''}
                    onChange={(e) => setFormData({ ...formData, salle: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Capacité maximale (élèves)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={80}
                    value={formData.capacite || 40}
                    onChange={(e) => setFormData({ ...formData, capacite: parseInt(e.target.value) || 40 })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Frais d'inscription (FCFA)
                  </label>
                  <input
                    type="number"
                    step={1000}
                    value={formData.fraisInscription || 45000}
                    onChange={(e) => setFormData({ ...formData, fraisInscription: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Scolarité mensuelle (FCFA)
                  </label>
                  <input
                    type="number"
                    step={1000}
                    value={formData.scolariteMensuelle || 35000}
                    onChange={(e) => setFormData({ ...formData, scolariteMensuelle: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Professeur Principal
                </label>
                <select
                  value={formData.professeurPrincipalId || ''}
                  onChange={(e) => setFormData({ ...formData, professeurPrincipalId: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-semibold"
                >
                  <option value="">Aucun professeur assigné</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.prenom} {t.nom} ({t.matieres.join(', ')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-xs"
                >
                  {editingClass ? 'Enregistrer' : 'Créer la classe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Gestion des Affectations des élèves pour cette classe */}
      {assigningClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 my-8">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Affectations des Élèves : {assigningClass.nom}
                </h3>
                <p className="text-xs text-slate-500">
                  {students.filter(s => s.classeId === assigningClass.id).length} élève(s) actuellement dans cette classe (Capacité: {assigningClass.capacite})
                </p>
              </div>
              <button
                onClick={() => setAssigningClass(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              {/* Currently Assigned Students */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Élèves inscrits dans cette classe
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                  {students.filter(s => s.classeId === assigningClass.id).length === 0 ? (
                    <div className="p-4 text-center text-slate-400">
                      Aucun élève n'est encore affecté à cette classe.
                    </div>
                  ) : (
                    students.filter(s => s.classeId === assigningClass.id).map((student) => (
                      <div key={student.id} className="p-2.5 flex items-center justify-between hover:bg-slate-50">
                        <div>
                          <div className="font-bold text-slate-900">
                            {student.prenom} {student.nom}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {student.matricule} • {student.sexe === 'M' ? 'Garçon' : 'Fille'}
                          </div>
                        </div>

                        {canManage && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500">Réaffecter :</span>
                            <select
                              value={student.classeId}
                              onChange={(e) => onReassignStudent(student.id, e.target.value)}
                              className="px-2 py-1 text-xs rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 font-semibold"
                            >
                              {classes.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.code}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick transfer from other classes */}
              {canManage && (
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Transférer un élève vers {assigningClass.code}
                  </h4>
                  <div className="flex items-center gap-2">
                    <select
                      id="select-transfer-student"
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                      onChange={(e) => {
                        if (e.target.value) {
                          onReassignStudent(e.target.value, assigningClass.id);
                          e.target.value = '';
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>Sélectionner un élève d'une autre classe...</option>
                      {students
                        .filter(s => s.classeId !== assigningClass.id)
                        .map((s) => {
                          const currentCls = classes.find(c => c.id === s.classeId);
                          return (
                            <option key={s.id} value={s.id}>
                              {s.prenom} {s.nom} ({s.matricule} - {currentCls?.code || 'Sans classe'})
                            </option>
                          );
                        })}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setAssigningClass(null)}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white"
              >
                Terminer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
