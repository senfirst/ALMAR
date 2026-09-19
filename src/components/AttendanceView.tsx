import { useState, useMemo } from 'react';
import { Plus, Clock, Search, CheckCircle2, AlertCircle, Calendar, Filter, X, Check, FileCheck } from 'lucide-react';
import { AttendanceRecord, Student, SchoolClass, UserRole } from '../types';
import { formatDateFR, formatDateShort } from '../utils/formatters';

interface AttendanceViewProps {
  absences: AttendanceRecord[];
  students: Student[];
  classes: SchoolClass[];
  currentRole: UserRole;
  onSaveAttendance: (record: AttendanceRecord) => void;
  onToggleJustify: (id: string, justifie: boolean, motif?: string) => void;
  onDeleteAttendance: (id: string) => void;
}

export function AttendanceView({
  absences,
  students,
  classes,
  currentRole,
  onSaveAttendance,
  onToggleJustify,
  onDeleteAttendance
}: AttendanceViewProps) {
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [selectedJustifyFilter, setSelectedJustifyFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const canManage = currentRole === 'admin' || currentRole === 'secretaire' || currentRole === 'enseignant';

  // Filter absences
  const filteredAbsences = useMemo(() => {
    return absences.filter(abs => {
      const student = students.find(s => s.id === abs.eleveId);
      const studentName = student ? `${student.prenom} ${student.nom} ${student.matricule}` : '';
      const matchSearch = `${studentName} ${abs.motif}`.toLowerCase().includes(searchQuery.toLowerCase());
      const matchClass = selectedClassFilter === 'all' || abs.classeId === selectedClassFilter;
      const matchJustify = 
        selectedJustifyFilter === 'all' 
          ? true 
          : selectedJustifyFilter === 'justifie' 
          ? abs.justifie 
          : !abs.justifie;

      return matchSearch && matchClass && matchJustify;
    });
  }, [absences, students, searchQuery, selectedClassFilter, selectedJustifyFilter]);

  // Form State
  const [formData, setFormData] = useState<Partial<AttendanceRecord>>({
    classeId: classes[0]?.id || '',
    eleveId: '',
    date: new Date().toISOString().split('T')[0],
    creneau: 'Matin',
    heuresManquees: 4,
    motif: 'Raison de santé (Consultation médicale)',
    justifie: false,
    pieceJustificative: ''
  });

  const studentsInSelectedClass = useMemo(() => {
    return students.filter(s => s.classeId === formData.classeId);
  }, [students, formData.classeId]);

  const openNewAttendanceModal = () => {
    const firstClass = classes[0]?.id || '';
    const firstStudent = students.find(s => s.classeId === firstClass);
    setFormData({
      classeId: firstClass,
      eleveId: firstStudent?.id || '',
      date: new Date().toISOString().split('T')[0],
      creneau: 'Matin',
      heuresManquees: 4,
      motif: 'Indisposition de santé',
      justifie: false,
      pieceJustificative: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.eleveId || !formData.classeId || !formData.date) {
      alert('Veuillez sélectionner un élève, une classe et une date.');
      return;
    }

    const newRecord: AttendanceRecord = {
      id: `abs-${Date.now()}`,
      eleveId: formData.eleveId!,
      classeId: formData.classeId!,
      date: formData.date!,
      creneau: formData.creneau as any || 'Journée entière',
      heuresManquees: Number(formData.heuresManquees) || 1,
      motif: formData.motif || 'Non précisé',
      justifie: formData.justifie || false,
      dateJustification: formData.justifie ? new Date().toISOString().split('T')[0] : undefined,
      pieceJustificative: formData.pieceJustificative
    };

    onSaveAttendance(newRecord);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Registre des Absences & Retards
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Cahier d'appel, suivi d'assiduité scolaire et contrôle des justificatifs
          </p>
        </div>

        {canManage && (
          <button
            id="attendance-add-btn"
            onClick={openNewAttendanceModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Enregistrer une absence
          </button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Absences</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{absences.length}</div>
          <span className="text-[11px] text-slate-400">Pour l'année en cours</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Justifiées</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {absences.filter(a => a.justifie).length}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">Avec mot des parents ou certificat</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Non Justifiées</span>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {absences.filter(a => !a.justifie).length}
          </div>
          <span className="text-[11px] text-rose-500 font-semibold">À relancer auprès des parents</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher élève, motif..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
          />
        </div>

        <div className="w-full md:w-auto flex flex-wrap items-center gap-2">
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 text-slate-700 font-semibold"
          >
            <option value="all">Toutes les classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>

          <select
            value={selectedJustifyFilter}
            onChange={(e) => setSelectedJustifyFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 text-slate-700 font-semibold"
          >
            <option value="all">Tous les états</option>
            <option value="justifie">Justifiées</option>
            <option value="non_justifie">Non justifiées</option>
          </select>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Élève</th>
                <th className="py-3 px-4">Classe</th>
                <th className="py-3 px-4">Créneau / Durée</th>
                <th className="py-3 px-4">Motif déclaré</th>
                <th className="py-3 px-4">Justificatif</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAbsences.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Aucune absence trouvée pour les critères sélectionnés.
                  </td>
                </tr>
              ) : (
                filteredAbsences.map((abs) => {
                  const student = students.find(s => s.id === abs.eleveId);
                  const cls = classes.find(c => c.id === abs.classeId);
                  return (
                    <tr key={abs.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {formatDateShort(abs.date)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-slate-900">
                          {student ? `${student.prenom} ${student.nom}` : 'Élève inconnu'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {student?.matricule}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {cls?.code || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800">{abs.creneau}</span>
                        <div className="text-[10px] text-slate-400">{abs.heuresManquees} heure(s)</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                        {abs.motif || 'Non précisé'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          abs.justifie
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {abs.justifie ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {abs.justifie ? 'Justifiée' : 'Non justifiée'}
                        </span>
                        {abs.pieceJustificative && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                            {abs.pieceJustificative}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canManage && (
                            <button
                              onClick={() => onToggleJustify(abs.id, !abs.justifie)}
                              className={`p-1.5 rounded-lg transition text-xs font-bold ${
                                abs.justifie 
                                  ? 'text-rose-600 hover:bg-rose-50' 
                                  : 'text-emerald-700 hover:bg-emerald-50'
                              }`}
                              title={abs.justifie ? 'Marquer comme non justifiée' : 'Valider justification'}
                            >
                              <FileCheck className="w-4 h-4" />
                            </button>
                          )}
                          {canManage && (
                            <button
                              onClick={() => {
                                if (confirm('Supprimer cette entrée d\'absence ?')) {
                                  onDeleteAttendance(abs.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              title="Supprimer"
                            >
                              <X className="w-4 h-4" />
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

      {/* MODAL: Enregistrer une absence */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 my-8">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Signaler une Absence ou un Retard
                </h3>
                <p className="text-xs text-slate-500">
                  Enregistrement sur le cahier d'appel de l'établissement
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Classe *
                  </label>
                  <select
                    required
                    value={formData.classeId || ''}
                    onChange={(e) => {
                      const newCls = e.target.value;
                      const firstStudent = students.find(s => s.classeId === newCls);
                      setFormData({ 
                        ...formData, 
                        classeId: newCls,
                        eleveId: firstStudent?.id || '' 
                      });
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.nom}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Élève *
                  </label>
                  <select
                    required
                    value={formData.eleveId || ''}
                    onChange={(e) => setFormData({ ...formData, eleveId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    <option value="" disabled>Sélectionner l'élève...</option>
                    {studentsInSelectedClass.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.prenom} {s.nom} ({s.matricule})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Date de l'absence *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Créneau
                  </label>
                  <select
                    value={formData.creneau || 'Matin'}
                    onChange={(e) => setFormData({ ...formData, creneau: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Matin">Matin</option>
                    <option value="Après-midi">Après-midi</option>
                    <option value="Journée entière">Journée entière</option>
                    <option value="Retard (15m)">Retard 15 min</option>
                    <option value="Retard (30m+)">Retard 30 min+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Heures manquées
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formData.heuresManquees || 1}
                    onChange={(e) => setFormData({ ...formData, heuresManquees: Number(e.target.value) || 1 })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Motif de l'absence
                </label>
                <input
                  type="text"
                  placeholder="Ex: Rendez-vous médical, Cérémonie familiale, Panne transport..."
                  value={formData.motif || ''}
                  onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="justifieCheckbox"
                    checked={formData.justifie || false}
                    onChange={(e) => setFormData({ ...formData, justifie: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <label htmlFor="justifieCheckbox" className="text-xs font-bold text-slate-800 cursor-pointer">
                    L'absence est justifiée par un parent ou un médecin
                  </label>
                </div>

                {formData.justifie && (
                  <div>
                    <input
                      type="text"
                      placeholder="Préciser le justificatif (ex: Certificat Dr. Sow, billet tuteur...)"
                      value={formData.pieceJustificative || ''}
                      onChange={(e) => setFormData({ ...formData, pieceJustificative: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 bg-white"
                    />
                  </div>
                )}
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
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
