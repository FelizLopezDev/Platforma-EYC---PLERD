import React, { useState } from 'react';
import { User, Report } from '../../types';
import { DataStore } from '../../services/store';
import { StatusChip } from '../common/StatusChip';
import {
  FileText,
  Send,
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  UserPlus,
  ShieldCheck,
  Eye,
  FileCheck,
  AlertCircle,
  Building,
  Mail,
  Calendar,
  Lock
} from 'lucide-react';

interface UndersecretaryDashboardProps {
  user: User;
  onRefreshData: () => void;
  activeView: string;
}

export const UndersecretaryDashboard: React.FC<UndersecretaryDashboardProps> = ({
  user,
  onRefreshData,
  activeView = 'dashboard',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [isForwarding, setIsForwarding] = useState(false);
  const [forwardSuccessMessage, setForwardSuccessMessage] = useState<string | null>(null);

  // User management states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newCommission, setNewCommission] = useState('');
  const [newDistrict, setNewDistrict] = useState('Distrito Educativo 10-02');
  const [newEmail, setNewEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const reports = DataStore.getSubmittedReportsForUndersecretary();
  const aicUsers = DataStore.getAicUsers();

  // Metrics
  const totalReceived = reports.length;
  const pendingForward = reports.filter((r) => r.status === 'submitted_to_undersecretary').length;
  const alreadyForwarded = reports.filter((r) => r.status === 'forwarded_to_secretary_general').length;

  // Filtered reports
  const filteredReports = reports.filter((rep) => {
    const matchesSearch =
      rep.aicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.commission.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.district.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true : rep.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenReview = (report: Report) => {
    setSelectedReport(report);
    setForwardSuccessMessage(null);
    setReviewModalOpen(true);
  };

  const handleForwardToSecretaryGeneral = () => {
    if (!selectedReport) return;
    setIsForwarding(true);

    setTimeout(() => {
      const updated = DataStore.forwardReportToSecretaryGeneral(selectedReport.id, user);
      if (updated) {
        setSelectedReport(updated);
        setForwardSuccessMessage('El informe fue reenviado formalmente a la Secretaría General.');
      }
      setIsForwarding(false);
      onRefreshData();
    }, 450);
  };

  const handleCreateAicUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newFullName.trim() || !newCommission.trim() || !newEmail.trim()) {
      setFormError('Por favor complete todos los campos obligatorios del formulario.');
      return;
    }

    if (!newEmail.includes('@')) {
      setFormError('El correo institucional debe tener un formato válido (ej. usuario@sigel.edu.do).');
      return;
    }

    DataStore.createAicUser({
      fullName: newFullName.trim(),
      commission: newCommission.trim(),
      district: newDistrict,
      email: newEmail.trim(),
    });

    setFormSuccess(`Usuario ${newFullName} registrado exitosamente.`);
    setNewFullName('');
    setNewCommission('');
    setNewEmail('');

    setTimeout(() => {
      setCreateModalOpen(false);
      setFormSuccess(null);
      onRefreshData();
    }, 900);
  };

  return (
    <div id="undersecretary-dashboard-root" className="space-y-6">
      {/* Institutional Metric Cards - Based on PDF Page 8 */}
      <div id="undersecretary-metrics-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs">
          <div className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
            INFORMES EN BANDEJA
          </div>
          <div className="text-3xl font-display font-bold text-[#0c1f33] mt-2 tabular-nums">
            {totalReceived}
          </div>
          <div className="text-xs text-[#0f68a4] mt-1 font-medium">
            Bandeja de recepción general
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs">
          <div className="text-[11px] font-bold text-[#97650b] uppercase tracking-wider">
            PENDIENTES DE REENVÍO
          </div>
          <div className="text-3xl font-display font-bold text-[#97650b] mt-2 tabular-nums">
            {pendingForward}
          </div>
          <div className="text-xs text-[#64748b] mt-1">
            Requieren revisión y trámite
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs">
          <div className="text-[11px] font-bold text-[#0e7a52] uppercase tracking-wider">
            REENVIADOS A SECRETARÍA
          </div>
          <div className="text-3xl font-display font-bold text-[#0e7a52] mt-2 tabular-nums">
            {alreadyForwarded}
          </div>
          <div className="text-xs text-[#0e7a52] mt-1 font-medium">
            Trámite institucional completado
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs">
          <div className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
            EVALUACIÓN Y CONTROL (EYC) ACTIVOS
          </div>
          <div className="text-3xl font-display font-bold text-[#0c1f33] mt-2 tabular-nums">
            {aicUsers.length}
          </div>
          <div className="text-xs text-[#64748b] mt-1">
            Comisiones activas en el modelo
          </div>
        </div>
      </div>

      {/* Main Section toggle: either Reports Inbox or AIC User Management */}
      {activeView === 'aic-users' ? (
        /* USER MANAGEMENT VIEW FOR AIC USERS */
        <div id="undersecretary-aic-management-section" className="bg-white rounded-xl border border-[#e2e8f0] shadow-xs overflow-hidden">
          <div className="p-6 border-b border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-bold text-xl text-[#0c1f33]">
                Gestión de Usuarios EYC (Comisiones)
              </h2>
              <p className="text-xs text-[#64748b] mt-0.5">
                Facultad exclusiva de la Subsecretaría de Evaluación y Control para habilitar cuentas de comisión.
              </p>
            </div>

            <button
              id="open-create-aic-btn"
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0f68a4] hover:bg-[#0d5285] text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>Crear Nuevo Usuario EYC</span>
            </button>
          </div>

          {/* AIC Users Table */}
          <div className="overflow-x-auto">
            <table id="aic-users-table" className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-[#475569] uppercase font-bold tracking-wider border-b border-[#e2e8f0]">
                <tr>
                  <th className="px-6 py-3.5">Nombre / Comisión</th>
                  <th className="px-6 py-3.5">Distrito Educativo</th>
                  <th className="px-6 py-3.5">Correo Institucional</th>
                  <th className="px-6 py-3.5">Fecha de Registro</th>
                  <th className="px-6 py-3.5 text-right">Rol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {aicUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#f8fafc]/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-[#0c1f33]">
                      <div>{u.fullName}</div>
                      <div className="text-[11px] text-[#64748b] font-normal">{u.commission}</div>
                    </td>
                    <td className="px-6 py-4 text-[#475569]">
                      {u.district || 'Distrito Regional 10'}
                    </td>
                    <td className="px-6 py-4 text-[#0d5285] font-mono">
                      {u.email}
                    </td>
                    <td className="px-6 py-4 text-[#64748b] tabular-nums">
                      {new Date(u.createdAt).toLocaleDateString('es-DO', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-block px-2.5 py-0.5 rounded bg-[#eff7fd] text-[#0f68a4] border border-[#b0dbf5] font-semibold text-[11px]">
                        EYC
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* REPORTS INBOX (DEFAULT / MAIN VIEW) */
        <div id="undersecretary-reports-inbox-section" className="bg-white rounded-xl border border-[#e2e8f0] shadow-xs overflow-hidden">
          {/* Inbox Header & Filters */}
          <div className="p-6 border-b border-[#e2e8f0] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-xl text-[#0c1f33]">
                  Bandeja de Informes Institucionales
                </h2>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Revisión y reenvío de informes finales emitidos por las comisiones EYC.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="tab-create-aic-shortcut-btn"
                  onClick={() => setCreateModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#eff7fd] hover:bg-[#d6ecfa] text-[#0d5285] border border-[#b0dbf5] rounded-lg text-xs font-semibold transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Nuevo EYC</span>
                </button>
              </div>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#64748b] absolute left-3 top-3 pointer-events-none" />
                <input
                  id="reports-search-input"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por comisión, distrito o nombre de archivo..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#cbd5e1] focus:border-[#0f68a4] focus:ring-1 focus:ring-[#0f68a4] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#64748b]" />
                <select
                  id="reports-status-filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs border border-[#cbd5e1] rounded-lg px-3 py-2 bg-white text-[#334155] focus:outline-none focus:border-[#0f68a4]"
                >
                  <option value="all">Todos los estados</option>
                  <option value="submitted_to_undersecretary">Pendiente de reenvío</option>
                  <option value="forwarded_to_secretary_general">Reenviados a Secretaría General</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table of Reports - strictly showing: AIC, File name, Submission date, Status, Open/review action */}
          <div className="overflow-x-auto">
            <table id="undersecretary-reports-table" className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-[#475569] uppercase font-bold tracking-wider border-b border-[#e2e8f0]">
                <tr>
                  <th className="px-6 py-3.5">Comisión / EYC</th>
                  <th className="px-6 py-3.5">Archivo Oficial</th>
                  <th className="px-6 py-3.5">Fecha de Envío</th>
                  <th className="px-6 py-3.5">Estado</th>
                  <th className="px-6 py-3.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[#64748b]">
                      No se encontraron informes en la bandeja con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((rep) => (
                    <tr key={rep.id} className="hover:bg-[#f8fafc]/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#0c1f33] text-sm">{rep.aicName}</div>
                        <div className="text-[11px] text-[#0d5285] font-medium">{rep.commission}</div>
                        <div className="text-[11px] text-[#64748b]">{rep.district}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#0f68a4] shrink-0" />
                          <div>
                            <div className="font-semibold text-[#0c1f33] truncate max-w-[220px]">
                              {rep.fileName || 'DOCUMENTO_PENDIENTE.pdf'}
                            </div>
                            <div className="text-[11px] text-[#64748b]">
                              {rep.fileSize || '3.2 MB'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#334155] tabular-nums whitespace-nowrap">
                        {rep.submissionDate || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusChip status={rep.status} size="sm" />
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          id={`review-report-btn-${rep.id}`}
                          onClick={() => handleOpenReview(rep)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0f68a4] hover:bg-[#0d5285] text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Revisar Informe</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DOCUMENT REVIEW & FORWARDING MODAL */}
      {reviewModalOpen && selectedReport && (
        <div
          id="report-review-modal"
          className="fixed inset-0 z-50 bg-[#0c1f33]/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-[#cbd5e1] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#0c1f33] text-white flex items-center justify-between border-b border-[#10395b]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#10395b] text-[#ecc978] flex items-center justify-center border border-[#c9972b]/30">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-white">
                    Revisión de Informe Final — Subsecretaría
                  </h3>
                  <div className="text-[11px] text-[#ecc978]">
                    Control Institucional MONUR XVIII
                  </div>
                </div>
              </div>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="text-[rgba(232,242,250,0.72)] hover:text-white text-xs font-semibold px-2 py-1 rounded"
              >
                Cerrar
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              {/* Success alert when forwarded */}
              {forwardSuccessMessage && (
                <div
                  id="forward-success-alert"
                  className="p-4 bg-[#e6f7ef] border border-[#b6e4ce] rounded-xl flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#0e7a52] shrink-0 mt-0.5" />
                  <div className="text-xs text-[#0e7a52] font-semibold leading-relaxed">
                    {forwardSuccessMessage}
                  </div>
                </div>
              )}

              {/* Document identification header */}
              <div className="p-5 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                    COMISIÓN EMISORA
                  </span>
                  <h4 className="font-display font-bold text-lg text-[#0c1f33]">
                    {selectedReport.aicName}
                  </h4>
                  <p className="text-xs text-[#0d5285] font-medium">
                    {selectedReport.commission} · {selectedReport.district}
                  </p>
                </div>

                <StatusChip status={selectedReport.status} />
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]">
                  <span className="text-[#64748b] block text-[10px] uppercase font-bold">
                    NOMBRE DE ARCHIVO
                  </span>
                  <span className="font-semibold text-[#0c1f33] block mt-1 truncate">
                    {selectedReport.fileName}
                  </span>
                  <span className="text-[11px] text-[#64748b]">
                    {selectedReport.fileSize}
                  </span>
                </div>

                <div className="p-3 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]">
                  <span className="text-[#64748b] block text-[10px] uppercase font-bold">
                    FECHA DE ENVÍO POR AIC
                  </span>
                  <span className="font-semibold text-[#0c1f33] block mt-1 tabular-nums">
                    {selectedReport.submissionDate}
                  </span>
                  <span className="text-[11px] text-[#0e7a52] font-medium">
                    Radicado oficial
                  </span>
                </div>

                <div className="p-3 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]">
                  <span className="text-[#64748b] block text-[10px] uppercase font-bold">
                    REVISADO POR
                  </span>
                  <span className="font-semibold text-[#0c1f33] block mt-1 truncate">
                    {selectedReport.undersecretaryName || user.fullName}
                  </span>
                  <span className="text-[11px] text-[#64748b]">
                    Subsecretaría
                  </span>
                </div>
              </div>

              {/* Summary / Actas */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-[#334155] uppercase tracking-wider">
                  Resumen Ejecutivo y Actas Remitidas:
                </h5>
                <div className="p-4 bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-xs text-[#334155] leading-relaxed">
                  {selectedReport.summary ||
                    'Informe final remitido por la comisión conteniendo acta general de sesiones, registro de asistencia de delegaciones participantes y acuerdos suscritos.'}
                </div>
              </div>

              {/* Forwarding Status Info if already forwarded */}
              {selectedReport.status === 'forwarded_to_secretary_general' && (
                <div className="p-4 bg-[#e6f7ef] border border-[#b6e4ce] rounded-xl text-xs space-y-1">
                  <div className="font-bold text-[#0e7a52] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Informe ya reenviado a la Secretaría General</span>
                  </div>
                  <div className="text-[#0f172a] text-[11px]">
                    Reenviado el: <span className="font-bold tabular-nums">{selectedReport.forwardingDate}</span> por el Subsecretario {selectedReport.undersecretaryName || user.fullName}.
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer with PROMINENT ACTION: "Forward to Secretary General" */}
            <div className="p-5 bg-[#f8fafc] border-t border-[#e2e8f0] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-[#64748b]">
                {selectedReport.status === 'forwarded_to_secretary_general'
                  ? 'Trámite concluido para esta etapa.'
                  : 'Este informe pasará a la bandeja directa del Secretario General.'}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-[#475569] hover:bg-[#e2e8f0] rounded-lg transition-colors"
                >
                  Cerrar
                </button>

                {selectedReport.status === 'submitted_to_undersecretary' && (
                  <button
                    id="forward-to-secretary-general-btn"
                    onClick={handleForwardToSecretaryGeneral}
                    disabled={isForwarding}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0f68a4] hover:bg-[#0d5285] active:bg-[#0f446d] text-white font-semibold rounded-lg text-xs transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {isForwarding ? (
                      <span>Reenviando trámite...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Reenviar a Secretaría General</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE AIC USER MODAL */}
      {createModalOpen && (
        <div
          id="create-aic-modal"
          className="fixed inset-0 z-50 bg-[#0c1f33]/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#cbd5e1] shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#0c1f33] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-[#ecc978]" />
                <h3 className="font-display font-bold text-base">
                  Crear Nuevo Usuario AIC
                </h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-[rgba(232,242,250,0.72)] hover:text-white text-xs font-semibold px-2 py-1 rounded"
              >
                Cancelar
              </button>
            </div>

            <form onSubmit={handleCreateAicUser} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-[#fdeeec] border border-[#f5c9c4] text-[#b23b31] rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-3 bg-[#e6f7ef] border border-[#b6e4ce] text-[#0e7a52] rounded-lg text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider mb-1">
                  NOMBRE COMPLETO DEL REPRESENTANTE EYC
                </label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="Ej. Comisión de Medio Ambiente — EYC 10-06"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#cbd5e1] focus:border-[#0f68a4] focus:ring-1 focus:ring-[#0f68a4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider mb-1">
                  COMISIÓN ASIGNADA (MONUR XVIII)
                </label>
                <input
                  type="text"
                  required
                  value={newCommission}
                  onChange={(e) => setNewCommission(e.target.value)}
                  placeholder="Ej. Programa de las Naciones Unidas para el Medio Ambiente (PNUMA)"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#cbd5e1] focus:border-[#0f68a4] focus:ring-1 focus:ring-[#0f68a4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider mb-1">
                  DISTRITO EDUCATIVO
                </label>
                <select
                  value={newDistrict}
                  onChange={(e) => setNewDistrict(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#cbd5e1] focus:border-[#0f68a4] focus:outline-none bg-white"
                >
                  <option value="Distrito Educativo 10-01 (Villa Mella)">Distrito Educativo 10-01 (Villa Mella)</option>
                  <option value="Distrito Educativo 10-02 (Sabana Perdida)">Distrito Educativo 10-02 (Sabana Perdida)</option>
                  <option value="Distrito Educativo 10-03 (Santo Domingo Este)">Distrito Educativo 10-03 (Santo Domingo Este)</option>
                  <option value="Distrito Educativo 10-04 (Boca Chica)">Distrito Educativo 10-04 (Boca Chica)</option>
                  <option value="Distrito Educativo 10-05 (Guerra)">Distrito Educativo 10-05 (Guerra)</option>
                  <option value="Distrito Educativo 10-06 (Mendoza)">Distrito Educativo 10-06 (Mendoza)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider mb-1">
                  CORREO INSTITUCIONAL
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="eyc.pnuma@sigel.edu.do"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#cbd5e1] focus:border-[#0f68a4] focus:ring-1 focus:ring-[#0f68a4] focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#475569] hover:bg-[#e2e8f0] rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0f68a4] hover:bg-[#0d5285] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                >
                  Crear Usuario EYC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
