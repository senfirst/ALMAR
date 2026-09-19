import { useState, useMemo } from 'react';
import { 
  Plus, 
  CreditCard, 
  Search, 
  Printer, 
  TrendingUp, 
  ArrowUpRight, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  X,
  FileCheck
} from 'lucide-react';
import { Payment, Student, SchoolClass, UserRole, PaymentType, PaymentMethod } from '../types';
import { formatFCFA, formatDateFR, formatDateShort } from '../utils/formatters';

interface PaymentsViewProps {
  payments: Payment[];
  students: Student[];
  classes: SchoolClass[];
  currentRole: UserRole;
  onSavePayment: (payment: Payment) => void;
  onPrintReceipt: (paymentId: string) => void;
}

export function PaymentsView({
  payments,
  students,
  classes,
  currentRole,
  onSavePayment,
  onPrintReceipt
}: PaymentsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');
  const [selectedMethodFilter, setSelectedMethodFilter] = useState('all');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'recus' | 'impayes'>('recus');

  const canManage = currentRole === 'admin' || currentRole === 'comptable';

  const schoolMonths = [
    'Octobre', 'Novembre', 'Décembre', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin'
  ];

  // Financial Stats
  const totalAmount = payments.reduce((acc, p) => acc + p.montant, 0);
  const waveTotal = payments.filter(p => p.modePaiement === 'Wave').reduce((a, b) => a + b.montant, 0);
  const omTotal = payments.filter(p => p.modePaiement === 'Orange Money').reduce((a, b) => a + b.montant, 0);
  const cashTotal = payments.filter(p => p.modePaiement === 'Espèces').reduce((a, b) => a + b.montant, 0);

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter(pay => {
      const student = students.find(s => s.id === pay.eleveId);
      const studentInfo = student ? `${student.prenom} ${student.nom} ${student.matricule}` : '';
      const matchSearch = `${studentInfo} ${pay.numeroRecu} ${pay.payeurNom} ${pay.referenceTransaction || ''}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      
      const matchType = selectedTypeFilter === 'all' || pay.typeFrais === selectedTypeFilter;
      const matchMethod = selectedMethodFilter === 'all' || pay.modePaiement === selectedMethodFilter;
      const matchMonth = selectedMonthFilter === 'all' || pay.moisConcerne === selectedMonthFilter;

      return matchSearch && matchType && matchMethod && matchMonth;
    });
  }, [payments, students, searchTerm, selectedTypeFilter, selectedMethodFilter, selectedMonthFilter]);

  // Payment Form State
  const [formData, setFormData] = useState<Partial<Payment>>({
    eleveId: students[0]?.id || '',
    montant: 50000,
    datePaiement: new Date().toISOString().split('T')[0],
    typeFrais: 'Mensualité',
    moisConcerne: 'Novembre',
    modePaiement: 'Wave',
    referenceTransaction: '',
    recuPar: 'Caisse Principale',
    payeurNom: '',
    observations: ''
  });

  const openNewPaymentModal = (defaultStudentId?: string) => {
    const student = students.find(s => s.id === (defaultStudentId || students[0]?.id));
    const cls = classes.find(c => c.id === student?.classeId);
    const nextReceiptNum = `REC-2024-${String(payments.length + 1).padStart(4, '0')}`;

    setFormData({
      numeroRecu: nextReceiptNum,
      eleveId: student?.id || '',
      classeId: student?.classeId || '',
      montant: cls?.scolariteMensuelle || 35000,
      datePaiement: new Date().toISOString().split('T')[0],
      typeFrais: 'Mensualité',
      moisConcerne: 'Novembre',
      modePaiement: 'Wave',
      referenceTransaction: '',
      recuPar: currentRole === 'comptable' ? 'Abdoulaye Sow (Comptable)' : 'Direction / Caisse',
      payeurNom: student?.tuteur.nomComplet || '',
      observations: ''
    });
    setIsModalOpen(true);
  };

  const handleStudentSelect = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    const cls = classes.find(c => c.id === student?.classeId);
    setFormData(prev => ({
      ...prev,
      eleveId: studentId,
      classeId: student?.classeId,
      payeurNom: student?.tuteur.nomComplet || prev.payeurNom,
      montant: cls?.scolariteMensuelle || prev.montant
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.eleveId || !formData.montant || !formData.datePaiement) {
      alert('Veuillez renseigner les informations obligatoires de la transaction.');
      return;
    }

    const student = students.find(s => s.id === formData.eleveId);

    const paymentToSave: Payment = {
      id: `pay-${Date.now()}`,
      numeroRecu: formData.numeroRecu || `REC-2024-${Date.now().toString().slice(-4)}`,
      eleveId: formData.eleveId!,
      classeId: formData.classeId || student?.classeId || '',
      montant: Number(formData.montant) || 0,
      datePaiement: formData.datePaiement!,
      typeFrais: formData.typeFrais as PaymentType || 'Mensualité',
      moisConcerne: formData.typeFrais === 'Mensualité' ? formData.moisConcerne : undefined,
      modePaiement: formData.modePaiement as PaymentMethod || 'Espèces',
      referenceTransaction: formData.referenceTransaction,
      recuPar: formData.recuPar || 'Caisse',
      payeurNom: formData.payeurNom || student?.tuteur.nomComplet || 'Parent',
      observations: formData.observations
    };

    onSavePayment(paymentToSave);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Comptabilité Scolaire & Caisse (FCFA)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Gestion des frais d'inscription, mensualités, paiements Wave, Orange Money et reçus
          </p>
        </div>

        {canManage && (
          <button
            id="payments-add-btn"
            onClick={() => openNewPaymentModal()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Encaisser un paiement
          </button>
        )}
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Encaissé */}
        <div className="bg-gradient-to-br from-emerald-700 to-teal-800 text-white p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-emerald-100 uppercase tracking-wider font-bold">
            <span>Total Encaissé</span>
            <CreditCard className="w-4 h-4 text-emerald-300" />
          </div>
          <div className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
            {formatFCFA(totalAmount)}
          </div>
          <div className="text-xs text-emerald-200 mt-1">
            {payments.length} reçus de paiement enregistrés
          </div>
        </div>

        {/* Wave Encaissé */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-sky-600 uppercase tracking-wider">
            <span>Paiements Wave</span>
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-2">
            {formatFCFA(waveTotal)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {payments.filter(p => p.modePaiement === 'Wave').length} transactions mobiles
          </div>
        </div>

        {/* Orange Money */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-orange-600 uppercase tracking-wider">
            <span>Orange Money</span>
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-2">
            {formatFCFA(omTotal)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {payments.filter(p => p.modePaiement === 'Orange Money').length} transactions OM
          </div>
        </div>

        {/* Espèces & Chèques */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-700 uppercase tracking-wider">
            <span>Caisse Espèces</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-2">
            {formatFCFA(cashTotal)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Dépôts physiques au secrétariat
          </div>
        </div>
      </div>

      {/* Tabs: Reçus vs Impayés */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('recus')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition ${
            activeTab === 'recus'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Journal des Paiements & Reçus ({payments.length})
        </button>
        <button
          onClick={() => setActiveTab('impayes')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition ${
            activeTab === 'impayes'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Suivi des Impayés & Relances
        </button>
      </div>

      {activeTab === 'recus' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="N° reçu, élève, payeur, transaction..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
            </div>

            <div>
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 text-slate-700 font-semibold"
              >
                <option value="all">Tous les types de frais</option>
                <option value="Inscription">Frais d'inscription</option>
                <option value="Réinscription">Réinscription</option>
                <option value="Mensualité">Mensualités</option>
                <option value="Tenue Scolaire">Tenue Scolaire</option>
                <option value="Frais d'Examen">Frais d'Examen</option>
              </select>
            </div>

            <div>
              <select
                value={selectedMethodFilter}
                onChange={(e) => setSelectedMethodFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 text-slate-700 font-semibold"
              >
                <option value="all">Tous les modes (Wave, OM, Cash...)</option>
                <option value="Wave">Wave</option>
                <option value="Orange Money">Orange Money</option>
                <option value="Espèces">Espèces</option>
                <option value="Chèque">Chèque</option>
                <option value="Virement">Virement</option>
              </select>
            </div>

            <div>
              <select
                value={selectedMonthFilter}
                onChange={(e) => setSelectedMonthFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 text-slate-700 font-semibold"
              >
                <option value="all">Tous les mois</option>
                {schoolMonths.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Payments Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">N° Reçu & Date</th>
                    <th className="py-3 px-4">Élève & Classe</th>
                    <th className="py-3 px-4">Type de Frais</th>
                    <th className="py-3 px-4">Mode & Réf.</th>
                    <th className="py-3 px-4">Payeur / Encaissé par</th>
                    <th className="py-3 px-4 text-right">Montant (FCFA)</th>
                    <th className="py-3 px-4 text-right">Reçu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Aucun reçu ne correspond à ces critères.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((pay) => {
                      const student = students.find(s => s.id === pay.eleveId);
                      const cls = classes.find(c => c.id === pay.classeId);
                      return (
                        <tr key={pay.id} className="hover:bg-slate-50/80 transition group">
                          {/* Reçu et date */}
                          <td className="py-3 px-4">
                            <div className="font-mono font-extrabold text-slate-900 group-hover:text-emerald-700 transition">
                              {pay.numeroRecu}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {formatDateShort(pay.datePaiement)}
                            </div>
                          </td>

                          {/* Élève */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">
                              {student ? `${student.prenom} ${student.nom}` : 'Élève'}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {cls?.code || 'Classe'} • {student?.matricule}
                            </div>
                          </td>

                          {/* Type */}
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-800">
                              {pay.typeFrais}
                            </span>
                            {pay.moisConcerne && (
                              <span className="block text-[10px] text-emerald-700 font-bold">
                                Mois de {pay.moisConcerne}
                              </span>
                            )}
                          </td>

                          {/* Mode de paiement */}
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              pay.modePaiement === 'Wave' 
                                ? 'bg-sky-50 text-sky-700 border border-sky-200' 
                                : pay.modePaiement === 'Orange Money'
                                ? 'bg-orange-50 text-orange-700 border border-orange-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {pay.modePaiement}
                            </span>
                            {pay.referenceTransaction && (
                              <div className="font-mono text-[9px] text-slate-400 truncate max-w-[120px]">
                                {pay.referenceTransaction}
                              </div>
                            )}
                          </td>

                          {/* Payeur */}
                          <td className="py-3 px-4">
                            <div className="text-slate-800 font-medium">
                              {pay.payeurNom}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Reçu par : {pay.recuPar.split(' ')[0]}
                            </div>
                          </td>

                          {/* Montant */}
                          <td className="py-3 px-4 text-right">
                            <div className="font-black text-emerald-800 text-sm">
                              {formatFCFA(pay.montant)}
                            </div>
                          </td>

                          {/* Action Imprimer Reçu */}
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => onPrintReceipt(pay.id)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition"
                              title="Imprimer le Reçu Officiel"
                            >
                              <Printer className="w-4 h-4" />
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
      )}

      {/* Tab: Suivi des Impayés */}
      {activeTab === 'impayes' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              État des Mensualités & Retards de Paiement
            </h3>
            <p className="text-xs text-slate-500">
              Vérification des élèves à jour pour le mois en cours (Novembre 2024)
            </p>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
            {students.map((student) => {
              const cls = classes.find(c => c.id === student.classeId);
              const paidMonthly = payments.filter(
                p => p.eleveId === student.id && p.typeFrais === 'Mensualité'
              );
              const monthsPaidCount = paidMonthly.length;
              const hasPaidCurrent = paidMonthly.some(p => p.moisConcerne === 'Novembre');

              return (
                <div key={student.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-full ${hasPaidCurrent ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {hasPaidCurrent ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">
                        {student.prenom} {student.nom}
                        <span className="font-mono text-slate-400 font-normal ml-2">({cls?.code})</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Parent : {student.tuteur.nomComplet} • Tél: {student.tuteur.telephone}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        hasPaidCurrent ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {hasPaidCurrent ? 'À jour (Novembre)' : 'Mensualité en attente'}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {monthsPaidCount} mois réglé(s) au total
                      </div>
                    </div>

                    {canManage && !hasPaidCurrent && (
                      <button
                        onClick={() => openNewPaymentModal(student.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                      >
                        Régler
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: Enregistrer un paiement */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 my-8">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Encaisser un Paiement Scolaire
                </h3>
                <p className="text-xs text-slate-500">
                  Édition du reçu de caisse numéroté en Francs CFA
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
                    N° Reçu (automatique)
                  </label>
                  <input
                    type="text"
                    required
                    readOnly
                    value={formData.numeroRecu || ''}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono font-bold bg-slate-100 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Date du paiement *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.datePaiement || ''}
                    onChange={(e) => setFormData({ ...formData, datePaiement: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Élève concerné *
                </label>
                <select
                  required
                  value={formData.eleveId || ''}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-bold"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Type de frais *
                  </label>
                  <select
                    value={formData.typeFrais || 'Mensualité'}
                    onChange={(e) => setFormData({ ...formData, typeFrais: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    <option value="Mensualité">Mensualité</option>
                    <option value="Inscription">Frais d'inscription</option>
                    <option value="Réinscription">Frais de réinscription</option>
                    <option value="Tenue Scolaire">Tenue Scolaire</option>
                    <option value="Frais d'Examen">Frais d'Examen</option>
                    <option value="Cantine & Transport">Cantine & Transport</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                {formData.typeFrais === 'Mensualité' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Mois concerné
                    </label>
                    <select
                      value={formData.moisConcerne || 'Novembre'}
                      onChange={(e) => setFormData({ ...formData, moisConcerne: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                    >
                      {schoolMonths.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Montant encaissé (FCFA) *
                  </label>
                  <input
                    type="number"
                    step={1000}
                    required
                    value={formData.montant || 0}
                    onChange={(e) => setFormData({ ...formData, montant: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-emerald-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Mode de paiement *
                  </label>
                  <select
                    value={formData.modePaiement || 'Wave'}
                    onChange={(e) => setFormData({ ...formData, modePaiement: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-bold"
                  >
                    <option value="Wave">Wave (Mobile Money)</option>
                    <option value="Orange Money">Orange Money</option>
                    <option value="Espèces">Espèces (Guichet)</option>
                    <option value="Chèque">Chèque bancaire</option>
                    <option value="Virement">Virement bancaire</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Référence transaction (Wave/OM/Chèque)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: WAVE-SN-123456"
                    value={formData.referenceTransaction || ''}
                    onChange={(e) => setFormData({ ...formData, referenceTransaction: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nom du payeur (Parent/Tuteur)
                  </label>
                  <input
                    type="text"
                    value={formData.payeurNom || ''}
                    onChange={(e) => setFormData({ ...formData, payeurNom: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  />
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
                  Valider l'encaissement & Émettre le reçu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
