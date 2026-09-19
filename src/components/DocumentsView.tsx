import { useState, useMemo } from 'react';
import { 
  Printer, 
  Download, 
  FileText, 
  CheckCircle, 
  GraduationCap, 
  Award, 
  Building,
  School,
  Calendar,
  Share2
} from 'lucide-react';
import { Student, SchoolClass, GradeItem, AttendanceRecord, Payment, SchoolInfo } from '../types';
import { formatFCFA, formatDateFR, formatDateShort, calculateGradeMoyenne, getAppreciationMention, formatRang } from '../utils/formatters';

interface DocumentsViewProps {
  students: Student[];
  classes: SchoolClass[];
  grades: GradeItem[];
  absences: AttendanceRecord[];
  payments: Payment[];
  schoolInfo: SchoolInfo;
  initialStudentId?: string;
  initialDocType?: 'bulletin' | 'attestation' | 'certificat' | 'recu';
}

export function DocumentsView({
  students,
  classes,
  grades,
  absences,
  payments,
  schoolInfo,
  initialStudentId,
  initialDocType
}: DocumentsViewProps) {
  const [selectedDocType, setSelectedDocType] = useState<'bulletin' | 'attestation' | 'certificat' | 'recu'>(
    initialDocType || 'bulletin'
  );
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentId || students[0]?.id || ''
  );
  const [selectedSemestre, setSelectedSemestre] = useState<'Semestre 1' | 'Semestre 2'>('Semestre 1');

  const selectedStudent = students.find(s => s.id === selectedStudentId) || students[0];
  const assignedClass = classes.find(c => c.id === selectedStudent?.classeId);

  // Student grades for this semester
  const studentGrades = useMemo(() => {
    if (!selectedStudent) return [];
    return grades.filter(
      g => g.eleveId === selectedStudent.id && g.semestre === selectedSemestre
    );
  }, [selectedStudent, grades, selectedSemestre]);

  // Calculate General Average & Ranks
  const summaryCalc = useMemo(() => {
    let totalPoints = 0;
    let totalCoeffs = 0;

    studentGrades.forEach(g => {
      const moy = calculateGradeMoyenne(g.noteDevoir1, g.noteDevoir2, g.noteCompo);
      if (moy !== null) {
        totalPoints += moy * g.coefficient;
        totalCoeffs += g.coefficient;
      }
    });

    const moyenneGenerale = totalCoeffs > 0 ? Number((totalPoints / totalCoeffs).toFixed(2)) : null;

    // Class absences for this student
    const studentAbsences = absences.filter(a => a.eleveId === selectedStudent?.id);
    const totalHoursAbsent = studentAbsences.reduce((acc, a) => acc + a.heuresManquees, 0);
    const justifiedHours = studentAbsences.filter(a => a.justifie).reduce((acc, a) => acc + a.heuresManquees, 0);

    return {
      totalPoints: Number(totalPoints.toFixed(2)),
      totalCoeffs,
      moyenneGenerale,
      totalHoursAbsent,
      justifiedHours,
      unjustifiedHours: totalHoursAbsent - justifiedHours
    };
  }, [studentGrades, absences, selectedStudent]);

  // Latest payment for receipt
  const latestPayment = useMemo(() => {
    if (!selectedStudent) return null;
    const userPayments = payments.filter(p => p.eleveId === selectedStudent.id);
    return userPayments[userPayments.length - 1] || payments[0];
  }, [selectedStudent, payments]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header (no-print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Générateur de Documents Scolaires Officiels
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Édition et impression conforme des bulletins, attestations et certificats du Sénégal
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm active:scale-98 self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          Imprimer / Exporter en PDF
        </button>
      </div>

      {/* Selector Control Panel (no-print) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 no-print">
        {/* Document Type */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">
            Type de document :
          </label>
          <select
            value={selectedDocType}
            onChange={(e) => setSelectedDocType(e.target.value as any)}
            className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="bulletin">📄 Bulletin de Notes Trimestriel / Semestriel</option>
            <option value="attestation">📜 Attestation d'Inscription & Scolarité</option>
            <option value="certificat">🎓 Certificat de Fréquentation</option>
            <option value="recu">💰 Reçu de Paiement Caisse</option>
          </select>
        </div>

        {/* Student Selector */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">
            Élève concerné :
          </label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 text-emerald-800 focus:ring-2 focus:ring-emerald-500"
          >
            {students.map(s => {
              const cls = classes.find(c => c.id === s.classeId);
              return (
                <option key={s.id} value={s.id}>
                  {s.prenom} {s.nom} ({s.matricule} - {cls?.code})
                </option>
              );
            })}
          </select>
        </div>

        {/* Semestre (if bulletin) */}
        {selectedDocType === 'bulletin' && (
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              Période :
            </label>
            <select
              value={selectedSemestre}
              onChange={(e) => setSelectedSemestre(e.target.value as any)}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Semestre 1">1er Semestre (Octobre - Février)</option>
              <option value="Semestre 2">2ème Semestre (Mars - Juillet)</option>
            </select>
          </div>
        )}
      </div>

      {/* DOCUMENT PREVIEW CONTAINER (Styled like an official A4 sheet) */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-lg p-8 sm:p-12 max-w-4xl mx-auto text-slate-900 transition-all font-sans print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none">
        
        {/* ============================================================ */}
        {/* TEMPLATE 1: BULLETIN DE NOTES OFFICIEL SÉNÉGALAIS */}
        {/* ============================================================ */}
        {selectedDocType === 'bulletin' && (
          <div className="space-y-6">
            {/* Senegal Official Ministry Header */}
            <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4">
              <div className="text-center sm:text-left text-xs space-y-0.5 max-w-xs">
                <div className="font-extrabold uppercase tracking-wide text-[11px]">
                  RÉPUBLIQUE DU SÉNÉGAL
                </div>
                <div className="text-[10px] italic text-slate-600">
                  Un Peuple - Un But - Une Foi
                </div>
                <div className="font-bold text-[10px] uppercase pt-1 text-slate-800">
                  MINISTÈRE DE L'ÉDUCATION NATIONALE
                </div>
                <div className="text-[10px] text-slate-600 font-medium">
                  {schoolInfo.inspectionAcademique}
                </div>
                <div className="text-[10px] text-slate-600 font-medium">
                  {schoolInfo.inspectionEducationFormation}
                </div>
              </div>

              <div className="text-center px-4">
                <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-700 text-white font-black text-xl flex items-center justify-center shadow-xs">
                  CAD
                </div>
                <div className="text-[10px] font-black uppercase text-emerald-800 mt-1 tracking-wider">
                  Devise : {schoolInfo.devise}
                </div>
              </div>

              <div className="text-right text-xs space-y-0.5 max-w-xs">
                <div className="font-black uppercase text-sm text-slate-900">
                  {schoolInfo.nom}
                </div>
                <div className="text-[10px] text-slate-600">
                  Code Établissement : <span className="font-mono font-bold">{schoolInfo.codeEtablissement}</span>
                </div>
                <div className="text-[10px] text-slate-600">
                  {schoolInfo.adresse}
                </div>
                <div className="text-[10px] text-slate-600">
                  Tél : {schoolInfo.telephone.split('/')[0]}
                </div>
                <div className="text-[11px] font-bold text-emerald-800 pt-1">
                  Année Scolaire : {schoolInfo.anneeScolaire}
                </div>
              </div>
            </div>

            {/* Title Banner */}
            <div className="text-center py-2 bg-slate-100 border border-slate-300 rounded-lg">
              <h1 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-900">
                BULLETIN DE NOTES DU {selectedSemestre.toUpperCase()}
              </h1>
              <p className="text-xs text-slate-600 font-semibold">
                Enseignement Général & Technique • République du Sénégal
              </p>
            </div>

            {/* Student ID Card Block */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Nom & Prénom</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {selectedStudent.prenom} {selectedStudent.nom}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Matricule National</span>
                <span className="font-mono font-bold text-slate-800">
                  {selectedStudent.matricule}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Classe / Série</span>
                <span className="font-bold text-emerald-800">
                  {assignedClass?.nom} {assignedClass?.serie ? `(${assignedClass.serie})` : ''}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Né(e) le</span>
                <span className="font-semibold text-slate-800">
                  {formatDateShort(selectedStudent.dateNaissance)} à {selectedStudent.lieuNaissance}
                </span>
              </div>
            </div>

            {/* Grades Table */}
            <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 border-b border-slate-300 font-bold uppercase text-[10px] text-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">Matières Enseignées</th>
                    <th className="py-2.5 px-2 text-center">Devoir 1</th>
                    <th className="py-2.5 px-2 text-center">Devoir 2</th>
                    <th className="py-2.5 px-2 text-center">Compo</th>
                    <th className="py-2.5 px-2 text-center">Moy / 20</th>
                    <th className="py-2.5 px-2 text-center">Coef</th>
                    <th className="py-2.5 px-2 text-center">Points</th>
                    <th className="py-2.5 px-3">Appréciations des Professeurs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {studentGrades.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-400">
                        Aucune note renseignée pour ce semestre.
                      </td>
                    </tr>
                  ) : (
                    studentGrades.map((g) => {
                      const moy = calculateGradeMoyenne(g.noteDevoir1, g.noteDevoir2, g.noteCompo);
                      const points = moy !== null ? Number((moy * g.coefficient).toFixed(2)) : null;

                      return (
                        <tr key={g.id} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-bold text-slate-900">{g.matiere}</td>
                          <td className="py-2 px-2 text-center font-mono">{g.noteDevoir1 !== null ? g.noteDevoir1 : '-'}</td>
                          <td className="py-2 px-2 text-center font-mono">{g.noteDevoir2 !== null ? g.noteDevoir2 : '-'}</td>
                          <td className="py-2 px-2 text-center font-mono font-bold text-slate-900">{g.noteCompo !== null ? g.noteCompo : '-'}</td>
                          <td className="py-2 px-2 text-center font-mono font-black text-emerald-800">
                            {moy !== null ? moy : '-'}
                          </td>
                          <td className="py-2 px-2 text-center font-mono font-bold text-slate-600">{g.coefficient}</td>
                          <td className="py-2 px-2 text-center font-mono font-extrabold text-slate-900">
                            {points !== null ? points : '-'}
                          </td>
                          <td className="py-2 px-3 text-[11px] text-slate-600 italic">
                            {g.appreciationProf || '-'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Results & Honours Box */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Totals */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                <div className="font-extrabold text-slate-900 pb-1 border-b border-slate-200">
                  Résultats Académiques
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Points :</span>
                  <span className="font-mono font-bold text-slate-900">{summaryCalc.totalPoints}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Coefficients :</span>
                  <span className="font-mono font-bold text-slate-900">{summaryCalc.totalCoeffs}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="font-extrabold text-slate-900">Moyenne Générale :</span>
                  <span className="font-mono font-black text-sm text-emerald-800">
                    {summaryCalc.moyenneGenerale !== null ? `${summaryCalc.moyenneGenerale} / 20` : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Rang :</span>
                  <span className="font-bold text-slate-900">
                    {summaryCalc.moyenneGenerale && summaryCalc.moyenneGenerale >= 16 ? formatRang(1, selectedStudent.sexe) : formatRang(2, selectedStudent.sexe)} de la classe
                  </span>
                </div>
              </div>

              {/* Assiduité */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                <div className="font-extrabold text-slate-900 pb-1 border-b border-slate-200">
                  Assiduité & Discipline
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Heures d'absence :</span>
                  <span className="font-bold text-slate-800">{summaryCalc.totalHoursAbsent} heure(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Absences justifiées :</span>
                  <span className="font-bold text-emerald-700">{summaryCalc.justifiedHours} h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Non justifiées :</span>
                  <span className="font-bold text-rose-700">{summaryCalc.unjustifiedHours} h</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-500">Conduite :</span>
                  <span className="font-bold text-emerald-800">Très Bonne</span>
                </div>
              </div>

              {/* Mention Conseil */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs flex flex-col justify-between">
                <div>
                  <div className="font-extrabold text-slate-900 pb-1 border-b border-slate-200">
                    Décision du Conseil des Maîtres
                  </div>
                  <div className="mt-2 text-center p-2 rounded-lg bg-white border border-slate-200 font-extrabold text-emerald-800">
                    {summaryCalc.moyenneGenerale !== null 
                      ? getAppreciationMention(summaryCalc.moyenneGenerale).badge 
                      : 'Non classé'}
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 italic text-center">
                  Passage ou maintien selon délibération
                </div>
              </div>
            </div>

            {/* Signatures & Stamps */}
            <div className="grid grid-cols-3 gap-4 pt-6 text-center text-xs">
              <div className="p-2 border-t border-slate-400">
                <div className="font-bold text-slate-800">Le Professeur Principal</div>
                <div className="h-16 flex items-center justify-center text-slate-300 italic text-[11px]">
                  Visa & Signature
                </div>
              </div>

              <div className="p-2 border-t border-slate-400">
                <div className="font-bold text-slate-800">Le Parent ou Tuteur</div>
                <div className="h-16 flex items-center justify-center text-slate-300 italic text-[11px]">
                  Vu et pris connaissance
                </div>
              </div>

              <div className="p-2 border-t border-slate-400">
                <div className="font-bold text-slate-800">Le Chef d'Établissement</div>
                <div className="h-16 flex flex-col items-center justify-center text-emerald-800 font-serif text-[11px]">
                  <span className="font-bold">{schoolInfo.nomDirecteur}</span>
                  <span className="text-[9px] text-slate-400 mt-1">[Cachet Officiel Numérique]</span>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 text-center pt-4 border-t border-slate-200">
              Édité par le logiciel de gestion SunuÉcole le {formatDateFR(new Date().toISOString().split('T')[0])} • Document officiel scolaire
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TEMPLATE 2: ATTESTATION DE SCOLARITÉ OFFICIELLE */}
        {/* ============================================================ */}
        {selectedDocType === 'attestation' && (
          <div className="space-y-8 py-4">
            {/* Header */}
            <div className="text-center space-y-1 border-b-2 border-slate-800 pb-4">
              <div className="font-extrabold uppercase text-xs tracking-wider">
                RÉPUBLIQUE DU SÉNÉGAL
              </div>
              <div className="text-[11px] italic text-slate-500">Un Peuple - Un But - Une Foi</div>
              <div className="font-black text-xs uppercase pt-1 text-slate-900">
                MINISTÈRE DE L'ÉDUCATION NATIONALE
              </div>
              <div className="text-xs text-slate-700">
                {schoolInfo.inspectionAcademique} • {schoolInfo.inspectionEducationFormation}
              </div>
              <div className="text-base font-black uppercase text-emerald-800 pt-1">
                {schoolInfo.nom}
              </div>
              <div className="text-[11px] text-slate-500">
                {schoolInfo.adresse} • Tél: {schoolInfo.telephone}
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center py-4">
              <span className="inline-block px-4 py-1 text-lg sm:text-xl font-black uppercase tracking-wider border-2 border-slate-900 text-slate-900 rounded-lg">
                ATTESTATION DE SCOLARITÉ
              </span>
              <div className="font-mono text-xs text-slate-500 mt-2">
                N° Réf : CAD/SC/{schoolInfo.anneeScolaire.replace('-', '')}/{selectedStudent.matricule}
              </div>
            </div>

            {/* Body */}
            <div className="text-sm leading-relaxed space-y-4 px-2 sm:px-6">
              <p>
                Je soussigné, <strong>{schoolInfo.nomDirecteur}</strong>, Directeur du{' '}
                <strong>{schoolInfo.nom}</strong>, atteste par la présente que :
              </p>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-sm my-4">
                <div>
                  L'élève : <strong className="text-slate-900 text-base">{selectedStudent.prenom} {selectedStudent.nom}</strong>
                </div>
                <div>
                  Matricule national : <strong className="font-mono">{selectedStudent.matricule}</strong>
                </div>
                <div>
                  Né(e) le : <strong>{formatDateFR(selectedStudent.dateNaissance)}</strong> à <strong>{selectedStudent.lieuNaissance}</strong>
                </div>
                <div>
                  Sexe : <strong>{selectedStudent.sexe === 'M' ? 'Masculin' : 'Féminin'}</strong>
                </div>
                <div>
                  Parent / Tuteur : <strong>{selectedStudent.tuteur.nomComplet}</strong> ({selectedStudent.tuteur.telephone})
                </div>
              </div>

              <p>
                Est régulièrement inscrit(e) et poursuit ses études au sein de notre établissement
                dans la classe de : <strong className="text-emerald-800 text-base">{assignedClass?.nom} ({assignedClass?.cycle})</strong> pour le compte de l'année scolaire <strong>{schoolInfo.anneeScolaire}</strong>.
              </p>

              <p>
                En foi de quoi, la présente attestation lui est délivrée pour servir et valoir ce que de droit auprès de toutes administrations, organismes de sécurité sociale et institutions compétentes.
              </p>
            </div>

            {/* Date & Signature */}
            <div className="pt-10 flex justify-between items-end px-6">
              <div className="text-xs text-slate-400">
                Document certifié conforme aux registres officiels de l'établissement
              </div>

              <div className="text-center space-y-2">
                <div className="text-xs text-slate-700">
                  Fait à Dakar, le {formatDateFR(new Date().toISOString().split('T')[0])}
                </div>
                <div className="font-bold text-xs text-slate-900">Le Directeur de l'Établissement</div>
                <div className="h-20 flex flex-col items-center justify-center">
                  <span className="font-serif italic font-bold text-emerald-800 text-sm">{schoolInfo.nomDirecteur}</span>
                  <span className="text-[10px] text-slate-400 mt-1">[Sceau & Cachet Officiel]</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TEMPLATE 3: CERTIFICAT DE FRÉQUENTATION */}
        {/* ============================================================ */}
        {selectedDocType === 'certificat' && (
          <div className="space-y-8 py-4">
            {/* Header */}
            <div className="text-center space-y-1 border-b-2 border-slate-800 pb-4">
              <div className="font-extrabold uppercase text-xs">RÉPUBLIQUE DU SÉNÉGAL</div>
              <div className="text-[11px] italic text-slate-500">Un Peuple - Un But - Une Foi</div>
              <div className="font-bold text-xs uppercase pt-1 text-slate-900">
                MINISTÈRE DE L'ÉDUCATION NATIONALE
              </div>
              <div className="text-sm font-black uppercase text-emerald-800 pt-1">
                {schoolInfo.nom}
              </div>
            </div>

            {/* Title */}
            <div className="text-center py-4">
              <span className="inline-block px-4 py-1 text-lg sm:text-xl font-black uppercase tracking-wider border-2 border-slate-900 text-slate-900 rounded-lg">
                CERTIFICAT DE FRÉQUENTATION
              </span>
            </div>

            {/* Body */}
            <div className="text-sm leading-relaxed space-y-4 px-2 sm:px-6">
              <p>
                Le Directeur du <strong>{schoolInfo.nom}</strong> certifie que l'élève :
              </p>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-sm my-4">
                <div>
                  Nom et Prénom : <strong className="text-base text-slate-900">{selectedStudent.prenom} {selectedStudent.nom}</strong>
                </div>
                <div>
                  Matricule : <strong className="font-mono">{selectedStudent.matricule}</strong>
                </div>
                <div>
                  Classe actuelle : <strong className="text-emerald-800">{assignedClass?.nom}</strong>
                </div>
              </div>

              <p>
                Fréquente régulièrement les cours dispensés dans notre établissement au titre de l'année scolaire <strong>{schoolInfo.anneeScolaire}</strong>, sans interruption injustifiée.
              </p>

              <p>
                Ce certificat est délivré à l'intéressé(e) pour faire valoir ses droits (allocations familiales, dossier d'ambassade, titre de transport).
              </p>
            </div>

            {/* Footer */}
            <div className="pt-10 flex justify-end px-6">
              <div className="text-center space-y-2">
                <div className="text-xs text-slate-700">
                  Dakar, le {formatDateFR(new Date().toISOString().split('T')[0])}
                </div>
                <div className="font-bold text-xs text-slate-900">La Direction</div>
                <div className="h-16 flex items-center justify-center text-slate-400 italic text-xs">
                  {schoolInfo.nomDirecteur}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TEMPLATE 4: REÇU DE CAISSE SCOLAIRE */}
        {/* ============================================================ */}
        {selectedDocType === 'recu' && latestPayment && (
          <div className="space-y-6 py-2">
            <div className="border-2 border-dashed border-slate-400 p-6 rounded-2xl space-y-4">
              {/* Receipt Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-black text-slate-900 text-base">{schoolInfo.nom}</h3>
                  <div className="text-xs text-slate-500">Service de la Caisse & Comptabilité</div>
                  <div className="text-[11px] text-slate-500">{schoolInfo.adresse} • {schoolInfo.telephone}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-black text-emerald-800 text-base">
                    {latestPayment.numeroRecu}
                  </div>
                  <div className="text-xs text-slate-500">
                    Date : {formatDateFR(latestPayment.datePaiement)}
                  </div>
                </div>
              </div>

              {/* Receipt Body */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Élève :</span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    {selectedStudent.prenom} {selectedStudent.nom}
                  </span>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Matricule: {selectedStudent.matricule} • {assignedClass?.nom}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block">Reçu de (Payeur) :</span>
                  <span className="font-bold text-slate-900">{latestPayment.payeurNom}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-emerald-950 block text-sm">
                    {latestPayment.typeFrais} {latestPayment.moisConcerne ? `du mois de ${latestPayment.moisConcerne}` : ''}
                  </span>
                  <span className="text-emerald-700 text-[11px]">
                    Mode : {latestPayment.modePaiement} {latestPayment.referenceTransaction ? `(Réf: ${latestPayment.referenceTransaction})` : ''}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Montant Payé</span>
                  <span className="font-mono font-black text-emerald-900 text-xl">
                    {formatFCFA(latestPayment.montant)}
                  </span>
                </div>
              </div>

              {/* Signatures */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-200 text-xs text-slate-600">
                <div>
                  <span>Reçu par : <strong>{latestPayment.recuPar}</strong></span>
                </div>
                <div className="text-right">
                  <span className="italic text-slate-400">Cachet de la caisse</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
