import { useState, useMemo } from 'react';
import { Award, Save, Printer, FileText, CheckCircle2, TrendingUp, Info } from 'lucide-react';
import { GradeItem, Student, SchoolClass, UserRole } from '../types';
import { senegaleseSubjectsByCycle } from '../data/initialData';
import { calculateGradeMoyenne, getAppreciationMention, formatRang } from '../utils/formatters';

interface GradesViewProps {
  grades: GradeItem[];
  students: Student[];
  classes: SchoolClass[];
  currentRole: UserRole;
  onSaveGrade: (grade: GradeItem) => void;
  onPrintBulletin: (studentId: string) => void;
}

export function GradesView({
  grades,
  students,
  classes,
  currentRole,
  onSaveGrade,
  onPrintBulletin
}: GradesViewProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedPeriod, setSelectedPeriod] = useState<'Semestre 1' | 'Semestre 2'>('Semestre 1');

  const selectedClass = classes.find(c => c.id === selectedClassId) || classes[0];

  // Subjects for this class cycle
  const availableSubjects = useMemo(() => {
    if (!selectedClass) return [];
    const cycle = selectedClass.cycle || 'Secondaire';
    return senegaleseSubjectsByCycle[cycle] || senegaleseSubjectsByCycle.Secondaire;
  }, [selectedClass]);

  const [selectedSubject, setSelectedSubject] = useState<string>(
    availableSubjects[0]?.nom || 'Mathématiques'
  );

  const canEdit = currentRole === 'admin' || currentRole === 'enseignant';

  // Students of the selected class
  const classStudents = useMemo(() => {
    return students.filter(s => s.classeId === selectedClassId);
  }, [students, selectedClassId]);

  // Local draft grades for editing
  const currentSubjectGrades = useMemo(() => {
    return classStudents.map(student => {
      const existing = grades.find(
        g => g.eleveId === student.id && 
             g.classeId === selectedClassId && 
             g.matiere === selectedSubject && 
             g.semestre === selectedPeriod
      );
      const subjectDef = availableSubjects.find(s => s.nom === selectedSubject);
      return {
        student,
        grade: existing || {
          id: `grd-${student.id}-${selectedSubject}-${selectedPeriod}`,
          eleveId: student.id,
          classeId: selectedClassId,
          matiere: selectedSubject,
          semestre: selectedPeriod,
          noteDevoir1: null,
          noteDevoir2: null,
          noteCompo: null,
          coefficient: subjectDef?.coef || 2,
          appreciationProf: ''
        }
      };
    });
  }, [classStudents, grades, selectedClassId, selectedSubject, selectedPeriod, availableSubjects]);

  // Calculate Class Statistics for this subject
  const subjectStats = useMemo(() => {
    const validMoyennes: number[] = [];
    currentSubjectGrades.forEach(({ grade }) => {
      const moy = calculateGradeMoyenne(grade.noteDevoir1, grade.noteDevoir2, grade.noteCompo);
      if (moy !== null) validMoyennes.push(moy);
    });

    if (validMoyennes.length === 0) {
      return { classAverage: null, highest: null, lowest: null, successRate: null };
    }

    const sum = validMoyennes.reduce((a, b) => a + b, 0);
    const avg = Number((sum / validMoyennes.length).toFixed(2));
    const highest = Math.max(...validMoyennes);
    const lowest = Math.min(...validMoyennes);
    const passing = validMoyennes.filter(m => m >= 10).length;
    const rate = Math.round((passing / validMoyennes.length) * 100);

    return {
      classAverage: avg,
      highest,
      lowest,
      successRate: rate
    };
  }, [currentSubjectGrades]);

  // Handle single grade input change and instant save
  const handleGradeChange = (
    studentId: string, 
    field: 'noteDevoir1' | 'noteDevoir2' | 'noteCompo' | 'appreciationProf' | 'coefficient', 
    value: any
  ) => {
    const existing = grades.find(
      g => g.eleveId === studentId && 
           g.classeId === selectedClassId && 
           g.matiere === selectedSubject && 
           g.semestre === selectedPeriod
    );

    const subjectDef = availableSubjects.find(s => s.nom === selectedSubject);

    const updatedGrade: GradeItem = {
      id: existing ? existing.id : `grd-${studentId}-${Date.now()}`,
      eleveId: studentId,
      classeId: selectedClassId,
      matiere: selectedSubject,
      semestre: selectedPeriod,
      noteDevoir1: field === 'noteDevoir1' ? (value === '' ? null : Number(value)) : (existing?.noteDevoir1 ?? null),
      noteDevoir2: field === 'noteDevoir2' ? (value === '' ? null : Number(value)) : (existing?.noteDevoir2 ?? null),
      noteCompo: field === 'noteCompo' ? (value === '' ? null : Number(value)) : (existing?.noteCompo ?? null),
      coefficient: field === 'coefficient' ? Number(value) : (existing?.coefficient ?? subjectDef?.coef ?? 2),
      appreciationProf: field === 'appreciationProf' ? value : (existing?.appreciationProf ?? '')
    };

    onSaveGrade(updatedGrade);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Notes, Évaluations & Moyennes
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Saisie des devoirs et compositions avec coefficients officiels sénégalais
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Période :</span>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white text-emerald-800 focus:ring-2 focus:ring-emerald-500 shadow-xs"
          >
            <option value="Semestre 1">Semestre 1 (Octobre - Février)</option>
            <option value="Semestre 2">Semestre 2 (Mars - Juin)</option>
          </select>
        </div>
      </div>

      {/* Selectors Bar: Classe + Matière */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">
            Classe concernée :
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => {
              setSelectedClassId(e.target.value);
              // reset subject to first of that class
              const cls = classes.find(c => c.id === e.target.value);
              const subs = senegaleseSubjectsByCycle[cls?.cycle || 'Secondaire'] || [];
              if (subs.length > 0) setSelectedSubject(subs[0].nom);
            }}
            className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:ring-2 focus:ring-emerald-500"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.nom} ({students.filter(s => s.classeId === c.id).length} élèves)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">
            Matière du programme sénégalais :
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50/50 text-emerald-800 focus:ring-2 focus:ring-emerald-500"
          >
            {availableSubjects.map(s => (
              <option key={s.nom} value={s.nom}>
                {s.nom} (Coefficient {s.coef})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col justify-end">
          <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between text-xs">
            <span className="text-emerald-900 font-semibold">Formule officielle Sénégal :</span>
            <span className="font-mono font-bold text-emerald-700 text-[11px]">
              (Devoirs + 2×Compo) / 3
            </span>
          </div>
        </div>
      </div>

      {/* Stats of the Subject in this Class */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Moyenne Classe</span>
          <div className="text-xl font-black text-slate-900 mt-0.5">
            {subjectStats.classAverage !== null ? `${subjectStats.classAverage} / 20` : '-'}
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-700 uppercase">Note Maximale</span>
          <div className="text-xl font-black text-emerald-700 mt-0.5">
            {subjectStats.highest !== null ? `${subjectStats.highest} / 20` : '-'}
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-rose-600 uppercase">Note Minimale</span>
          <div className="text-xl font-black text-rose-600 mt-0.5">
            {subjectStats.lowest !== null ? `${subjectStats.lowest} / 20` : '-'}
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-blue-700 uppercase">Taux Réussite</span>
          <div className="text-xl font-black text-blue-700 mt-0.5">
            {subjectStats.successRate !== null ? `${subjectStats.successRate}%` : '-'}
          </div>
        </div>
      </div>

      {/* Grade Entry Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="font-extrabold text-slate-800">
            Grille de Saisie : {selectedSubject} • {selectedClass?.nom} ({selectedPeriod})
          </span>
          <span className="text-slate-500 text-[11px]">
            {canEdit ? 'Les notes saisies s\'enregistrent automatiquement' : 'Mode consultation'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Élève & Matricule</th>
                <th className="py-3 px-3 text-center w-28">Devoir 1 (/20)</th>
                <th className="py-3 px-3 text-center w-28">Devoir 2 (/20)</th>
                <th className="py-3 px-3 text-center w-28">Compo (/20)</th>
                <th className="py-3 px-3 text-center w-20">Coef</th>
                <th className="py-3 px-4 text-center w-28">Moyenne</th>
                <th className="py-3 px-4">Appréciation Pédagogique</th>
                <th className="py-3 px-4 text-right">Bulletin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentSubjectGrades.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Aucun élève dans cette classe. Affectez des élèves dans le module Classes.
                  </td>
                </tr>
              ) : (
                currentSubjectGrades.map(({ student, grade }) => {
                  const moy = calculateGradeMoyenne(grade.noteDevoir1, grade.noteDevoir2, grade.noteCompo);
                  const appreciation = moy !== null ? getAppreciationMention(moy) : null;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-slate-900">
                          {student.prenom} {student.nom}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {student.matricule}
                        </div>
                      </td>

                      {/* Devoir 1 */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="number"
                          step={0.25}
                          min={0}
                          max={20}
                          disabled={!canEdit}
                          value={grade.noteDevoir1 !== null ? grade.noteDevoir1 : ''}
                          onChange={(e) => handleGradeChange(student.id, 'noteDevoir1', e.target.value)}
                          placeholder="-"
                          className="w-20 px-2 py-1.5 text-center text-xs font-mono font-bold rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:bg-emerald-50/30"
                        />
                      </td>

                      {/* Devoir 2 */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="number"
                          step={0.25}
                          min={0}
                          max={20}
                          disabled={!canEdit}
                          value={grade.noteDevoir2 !== null ? grade.noteDevoir2 : ''}
                          onChange={(e) => handleGradeChange(student.id, 'noteDevoir2', e.target.value)}
                          placeholder="-"
                          className="w-20 px-2 py-1.5 text-center text-xs font-mono font-bold rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:bg-emerald-50/30"
                        />
                      </td>

                      {/* Composition */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="number"
                          step={0.25}
                          min={0}
                          max={20}
                          disabled={!canEdit}
                          value={grade.noteCompo !== null ? grade.noteCompo : ''}
                          onChange={(e) => handleGradeChange(student.id, 'noteCompo', e.target.value)}
                          placeholder="-"
                          className="w-20 px-2 py-1.5 text-center text-xs font-mono font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-amber-50/40"
                        />
                      </td>

                      {/* Coef */}
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-600">
                        {grade.coefficient}
                      </td>

                      {/* Moyenne Calculée */}
                      <td className="py-3 px-4 text-center">
                        {moy !== null ? (
                          <div>
                            <span className={`inline-block px-2.5 py-1 rounded-lg font-black font-mono text-xs ${
                              moy >= 10 ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                            }`}>
                              {moy} / 20
                            </span>
                            {appreciation && (
                              <div className="text-[9px] text-slate-500 font-semibold mt-0.5 truncate max-w-[100px]">
                                {appreciation.badge}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300 font-mono">-</span>
                        )}
                      </td>

                      {/* Appréciation Professeur */}
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          disabled={!canEdit}
                          value={grade.appreciationProf || ''}
                          onChange={(e) => handleGradeChange(student.id, 'appreciationProf', e.target.value)}
                          placeholder="Ex: Très bon travail, persévérer..."
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500"
                        />
                      </td>

                      {/* Bulletin individuel */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onPrintBulletin(student.id)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition"
                          title="Imprimer le Bulletin officiel de notes"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
