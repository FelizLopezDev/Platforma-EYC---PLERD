import React, { useState } from 'react';
import { User, Report } from '../../types';
import { DataStore } from '../../services/store';
import { StatusChip } from '../common/StatusChip';
import { ReportReviewView } from '../common/ReportReviewView';
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
  const [isForwarding, setIsForwarding] = useState(false);

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
  };

  const handleForwardToSecretaryGeneral = (reportId: string) => {
    setIsForwarding(true);
    setTimeout(() => {
      const updated = DataStore.forwardReportToSecretaryGeneral(reportId, user);
      if (updated) {
        setSelectedReport(updated);
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

  // If a report is selected, render the dedicated authentic review experience
  if (selectedReport) {
    return (
      <ReportReviewView
        report={selectedReport}
        currentUser={user}
        onBack={() => {
          setSelectedReport(null);
          onRefreshData();
        }}
        onForwardToSecretaryGeneral={handleForwardToSecretaryGeneral}
        isForwarding={isForwarding}
      />
    );
  }

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

      {/* Main Section toggle: either Reports Inbox or EYC User Management */}
      {activeView === 'aic-users' ? (
        /* USER MANAGEMENT VIEW FOR EYC USERS */
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

          {/* EYC Users Table */}
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

          {/* Reports List - responsive card rows with prominent action button */}
          <div className="divide-y divide-[#e2e8f0]">
            {filteredReports.length === 0 ? (
              <div className="p-12 text-center text-[#64748b] text-xs">
                No se encontraron informes en la bandeja con los filtros seleccionados.
              </div>
            ) : (
              filteredReports.map((rep) => {
                const isPendingForward = rep.status === 'submitted_to_undersecretary';

                return (
                  <div
                    key={rep.id}
                    className="p-5 hover:bg-[#f8fafc] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h4 className="font-display font-bold text-base text-[#0c1f33]">
                          {rep.commission}
                        </h4>
                        <StatusChip status={rep.status} size="sm" />
                      </div>
                      <div className="text-xs text-[#475569] flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="font-medium text-[#0d5285]">{rep.aicName}</span>
                        <span>•</span>
                        <span>{rep.district}</span>
                        <span>•</span>
                        <span className="font-medium text-[#0c1f33] flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-[#0f68a4]" />
                          {rep.fileName || 'documento.pdf'} ({rep.fileSize || '2.4 MB'})
                        </span>
                      </div>
                      <div className="text-[11px] text-[#64748b] flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
                        <span>Radicado: <strong className="text-[#334155] font-medium">{rep.submissionDate || 'N/A'}</strong></span>
                        {rep.forwardingDate && (
                          <>
                            <span>•</span>
                            <span>Reenviado el: <strong className="text-[#0e7a52] font-medium">{rep.forwardingDate}</strong></span>
                          </>
                        )}
                        {rep.reviewedDate && (
                          <>
                            <span>•</span>
                            <span>Revisado el: <strong className="text-[#0c1f33] font-medium">{rep.reviewedDate}</strong></span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Primary review action: clearly visible without horizontal scrolling */}
                    <div className="flex items-center self-start md:self-center shrink-0">
                      <button
                        id={`review-report-btn-${rep.id}`}
                        onClick={() => handleOpenReview(rep)}
                        className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer ${
                          isPendingForward
                            ? 'bg-[#0f68a4] hover:bg-[#0d5285] active:bg-[#0f446d] text-white'
                            : 'bg-white hover:bg-[#eff7fd] text-[#0d5285] border border-[#cbd5e1] hover:border-[#b0dbf5]'
                        }`}
                      >
                        <Eye className="w-4 h-4" />
                        <span>{isPendingForward ? 'Revisar informe' : 'Ver informe'}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* CREATE EYC USER MODAL */}
      {createModalOpen && (
        <div
          id="create-eyc-modal"
          className="fixed inset-0 z-50 bg-[#0c1f33]/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#cbd5e1] shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#0c1f33] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-[#ecc978]" />
                <h3 className="font-display font-bold text-base">
                  Crear Nuevo Usuario EYC
                </h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-[rgba(232,242,250,0.72)] hover:text-white text-xs font-semibold px-2 py-1 rounded cursor-pointer"
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
