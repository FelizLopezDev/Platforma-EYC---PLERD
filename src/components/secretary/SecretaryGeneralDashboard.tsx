import React, { useState } from 'react';
import { User, Report } from '../../types';
import { DataStore } from '../../services/store';
import { StatusChip } from '../common/StatusChip';
import { ReportReviewView } from '../common/ReportReviewView';
import {
  FileText,
  Users,
  Search,
  CheckCircle2,
  Eye,
  UserCheck,
  Building,
  UserPlus,
  AlertCircle,
  FileCheck2,
  Trash2,
  KeyRound
} from 'lucide-react';

interface SecretaryGeneralDashboardProps {
  user: User;
  onRefreshData: () => void;
  activeView?: string;
}

export const SecretaryGeneralDashboard: React.FC<SecretaryGeneralDashboardProps> = ({
  user,
  onRefreshData,
  activeView = 'reports',
}) => {
  const [currentTab, setCurrentTab] = useState<'pending' | 'reviewed' | 'users'>(
    activeView === 'undersecretaries' ? 'users' : 'pending'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Subsecretary creation modal
  const [createSubModalOpen, setCreateSubModalOpen] = useState(false);
  const [newSubFullName, setNewSubFullName] = useState('');
  const [newSubDepartment, setNewSubDepartment] = useState('Subsecretaría de Evaluación y Control');
  const [newSubEmail, setNewSubEmail] = useState('');
  const [newSubPassword, setNewSubPassword] = useState('sub2026');

  // EYC Commission creation modal
  const [createAicModalOpen, setCreateAicModalOpen] = useState(false);
  const [newAicName, setNewAicName] = useState('');
  const [newAicDistrict, setNewAicDistrict] = useState('Distrito Educativo 10-01');
  const [newAicEmail, setNewAicEmail] = useState('');
  const [newAicPassword, setNewAicPassword] = useState('eyc2026');

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // User deletion modal state
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  // Secretary General sees reports forwarded by Undersecretary
  const forwardedReports = DataStore.getForwardedReportsForSecretaryGeneral();
  const reviewedReports = DataStore.getReviewedReportsForSecretaryGeneral();
  const allUsers = DataStore.getAllUsers();
  const aicUsers = DataStore.getAicUsers();
  const undersecretaryUsers = DataStore.getUndersecretaryUsers();

  const filteredPendingReports = forwardedReports.filter((rep) => {
    return (
      rep.aicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.commission.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rep.undersecretaryName && rep.undersecretaryName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const filteredReviewedReports = reviewedReports.filter((rep) => {
    return (
      rep.aicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.commission.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rep.undersecretaryName && rep.undersecretaryName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const filteredUsers = allUsers.filter((u) => {
    const term = userSearchTerm.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.commission && u.commission.toLowerCase().includes(term)) ||
      (u.department && u.department.toLowerCase().includes(term)) ||
      u.role.toLowerCase().includes(term)
    );
  });

  const handleOpenReview = (report: Report) => {
    setSelectedReport(report);
  };

  const handleMarkAsReviewed = (reportId: string) => {
    const updated = DataStore.markReportAsReviewed(reportId, user);
    if (updated) {
      setSelectedReport(updated);
    }
    onRefreshData();
  };

  const handleCreateUndersecretary = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newSubFullName.trim() || !newSubEmail.trim() || !newSubDepartment.trim()) {
      setFormError('Por favor complete todos los campos obligatorios.');
      return;
    }

    if (!newSubEmail.includes('@')) {
      setFormError('El correo institucional debe ser válido.');
      return;
    }

    DataStore.createUndersecretaryUser({
      fullName: newSubFullName.trim(),
      department: newSubDepartment.trim(),
      email: newSubEmail.trim(),
      password: newSubPassword.trim() || 'sub2026',
    });

    setFormSuccess(`Subsecretario ${newSubFullName} registrado formalmente.`);
    setNewSubFullName('');
    setNewSubEmail('');
    setNewSubPassword('sub2026');

    setTimeout(() => {
      setCreateSubModalOpen(false);
      setFormSuccess(null);
      onRefreshData();
    }, 900);
  };

  const handleCreateAicCommission = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newAicName.trim() || !newAicEmail.trim() || !newAicDistrict.trim()) {
      setFormError('Por favor complete todos los campos requeridos.');
      return;
    }

    if (!newAicEmail.includes('@')) {
      setFormError('El correo institucional debe tener un formato válido.');
      return;
    }

    DataStore.createAicUser({
      fullName: newAicName.trim(),
      commission: newAicName.trim(),
      district: newAicDistrict.trim(),
      email: newAicEmail.trim(),
      password: newAicPassword.trim() || 'eyc2026',
    });

    setFormSuccess(`Comisión EYC "${newAicName}" habilitada exitosamente.`);
    setNewAicName('');
    setNewAicEmail('');
    setNewAicPassword('eyc2026');

    setTimeout(() => {
      setCreateAicModalOpen(false);
      setFormSuccess(null);
      onRefreshData();
    }, 900);
  };

  const handleRequestDeleteUser = (targetUser: User) => {
    if (targetUser.id === user.id || targetUser.role === 'secretary_general') {
      setDeleteErrorMessage('No es posible eliminar la cuenta del Secretario General / Administrador.');
      return;
    }
    setDeleteErrorMessage(null);
    setUserToDelete(targetUser);
  };

  const handleConfirmDeleteUser = () => {
    if (!userToDelete) return;
    DataStore.deleteUser(userToDelete.id);
    setUserToDelete(null);
    onRefreshData();
  };

  // If a report is selected for review, render the dedicated institutional document reviewer
  if (selectedReport) {
    return (
      <ReportReviewView
        report={selectedReport}
        currentUser={user}
        onBack={() => {
          setSelectedReport(null);
          onRefreshData();
        }}
        onMarkAsReviewed={handleMarkAsReviewed}
      />
    );
  }

  return (
    <div id="secretary-general-dashboard-root" className="space-y-6">
      {/* High-level Institutional Metrics */}
      <div id="sg-metrics-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-2xs hover:border-[#bde0f2] transition-colors">
          <div className="text-[11px] font-bold text-[#006699] uppercase tracking-wider">
            INFORMES RECIBIDOS
          </div>
          <div className="text-3xl font-display font-bold text-[#002B49] mt-2 tabular-nums">
            {forwardedReports.length}
          </div>
          <div className="text-xs text-[#64748b] mt-1 font-medium">
            Reenviados por Subsecretaría
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-2xs hover:border-[#b8e6d5] transition-colors">
          <div className="text-[11px] font-bold text-[#0e835c] uppercase tracking-wider">
            INFORMES REVISADOS
          </div>
          <div className="text-3xl font-display font-bold text-[#0e835c] mt-2 tabular-nums">
            {reviewedReports.length}
          </div>
          <div className="text-xs text-[#0e835c] mt-1 font-medium">
            Concluidos y archivados
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-2xs hover:border-[#b0dbf5] transition-colors">
          <div className="text-[11px] font-bold text-[#0099CC] uppercase tracking-wider">
            EVALUACIÓN Y CONTROL (EYC)
          </div>
          <div className="text-3xl font-display font-bold text-[#002B49] mt-2 tabular-nums">
            {aicUsers.length}
          </div>
          <div className="text-xs text-[#64748b] mt-1 font-medium">
            Comisiones activas en el modelo
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-2xs hover:border-[#cbd5e1] transition-colors">
          <div className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
            USUARIOS EN SISTEMA
          </div>
          <div className="text-3xl font-display font-bold text-[#002B49] mt-2 tabular-nums">
            {allUsers.length}
          </div>
          <div className="text-xs text-[#64748b] mt-1">
            Total cuentas autorizadas
          </div>
        </div>
      </div>

      {/* Navigation View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e2e8f0] pb-2 overflow-x-auto">
        <button
          id="sg-tab-pending"
          onClick={() => setCurrentTab('pending')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            currentTab === 'pending'
              ? 'bg-[#006699] text-white shadow-2xs'
              : 'text-[#475569] hover:bg-[#f0f7fb] hover:text-[#002B49]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Informes Reenviados ({forwardedReports.length})</span>
        </button>

        <button
          id="sg-tab-reviewed"
          onClick={() => setCurrentTab('reviewed')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            currentTab === 'reviewed'
              ? 'bg-[#006699] text-white shadow-2xs'
              : 'text-[#475569] hover:bg-[#f0f7fb] hover:text-[#002B49]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Informes Revisados ({reviewedReports.length})</span>
        </button>

        <button
          id="sg-tab-users"
          onClick={() => setCurrentTab('users')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            currentTab === 'users'
              ? 'bg-[#006699] text-white shadow-2xs'
              : 'text-[#475569] hover:bg-[#f0f7fb] hover:text-[#002B49]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Directorio de Usuarios ({allUsers.length})</span>
        </button>
      </div>

      {/* Main View: Reports or User Management */}
      {currentTab === 'users' ? (
        /* COMPREHENSIVE USER MANAGEMENT VIEW */
        <div id="sg-users-management-section" className="bg-white rounded-xl border border-[#e2e8f0] shadow-xs overflow-hidden">
          <div className="p-6 border-b border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-bold text-xl text-[#0c1f33]">
                Control de Usuarios y Credenciales Autorizadas
              </h2>
              <p className="text-xs text-[#64748b] mt-0.5">
                Facultad exclusiva de la Secretaría General. Solo los usuarios creados aquí pueden acceder al sistema.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="open-create-aic-btn"
                onClick={() => {
                  setFormError(null);
                  setCreateAicModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0e7a52] hover:bg-[#09573a] text-white rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Crear EYC</span>
              </button>

              <button
                id="open-create-subsecretary-btn"
                onClick={() => {
                  setFormError(null);
                  setCreateSubModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0f68a4] hover:bg-[#0d5285] text-white rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>+ Crear Subsecretario</span>
              </button>
            </div>
          </div>

          {/* Search in user directory */}
          <div className="p-4 bg-[#f8fafc] border-b border-[#e2e8f0]">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-[#64748b] absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                placeholder="Filtrar por nombre, correo, comisión o rol..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#cbd5e1] focus:border-[#0f68a4] focus:outline-none bg-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table id="all-users-table" className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-[#475569] uppercase font-bold tracking-wider border-b border-[#e2e8f0]">
                <tr>
                  <th className="px-5 py-3.5">Nombre / Comisión</th>
                  <th className="px-5 py-3.5">Rol</th>
                  <th className="px-5 py-3.5">Correo Institucional</th>
                  <th className="px-5 py-3.5">Distrito / Dependencia</th>
                  <th className="px-5 py-3.5">Contraseña Asignada</th>
                  <th className="px-5 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {filteredUsers.map((u) => {
                  const userPassword = DataStore.getPasswordForUser(u.email);
                  return (
                    <tr key={u.id} className="hover:bg-[#f8fafc]/80 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-[#0c1f33]">
                        <div className="text-sm font-bold">{u.fullName}</div>
                        {u.commission && (
                          <div className="text-[11px] text-[#0d5285] font-normal">{u.commission}</div>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {u.role === 'secretary_general' && (
                          <span className="inline-block px-2.5 py-0.5 rounded bg-[#fef3c7] text-[#92400e] border border-[#fde68a] font-bold text-[10px]">
                            SECRETARIO GENERAL (ADMIN)
                          </span>
                        )}
                        {u.role === 'undersecretary' && (
                          <span className="inline-block px-2.5 py-0.5 rounded bg-[#eff7fd] text-[#0f68a4] border border-[#b0dbf5] font-semibold text-[10px]">
                            SUBSECRETARIO
                          </span>
                        )}
                        {u.role === 'aic' && (
                          <span className="inline-block px-2.5 py-0.5 rounded bg-[#e6f7ef] text-[#0e7a52] border border-[#b6e4ce] font-semibold text-[10px]">
                            COMISIÓN EYC
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[#0d5285]">
                        {u.email}
                      </td>
                      <td className="px-5 py-3.5 text-[#475569]">
                        {u.district || u.department || 'Dirección General'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 border border-slate-200 rounded font-mono text-[11px] text-[#0c1f33]">
                          <KeyRound className="w-3 h-3 text-[#64748b]" />
                          <span>{userPassword}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {u.role !== 'secretary_general' ? (
                          <button
                            onClick={() => handleRequestDeleteUser(u)}
                            className="text-[#b23b31] hover:bg-[#fdeeec] p-1.5 rounded transition-colors cursor-pointer"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-[#64748b] italic">Protegido</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : currentTab === 'reviewed' ? (
        /* REVIEWED REPORTS (INFORMES REVISADOS) */
        <div id="sg-reports-reviewed-section" className="bg-white rounded-xl border border-[#e2e8f0] shadow-xs overflow-hidden">
          <div className="p-6 border-b border-[#e2e8f0] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-xl text-[#0c1f33]">
                  Informes Revisados y Concluidos
                </h2>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Expedientes oficiales validados por la Secretaría General para la memoria de MONUR XVIII.
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#64748b] absolute left-3 top-3 pointer-events-none" />
              <input
                id="sg-reviewed-reports-search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por comisión EYC, subsecretario o archivo..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#cbd5e1] focus:border-[#0f68a4] focus:ring-1 focus:ring-[#0f68a4] focus:outline-none"
              />
            </div>
          </div>

          <div className="divide-y divide-[#e2e8f0]">
            {filteredReviewedReports.length === 0 ? (
              <div className="p-12 text-center text-[#64748b] text-xs">
                Aún no hay informes archivados en la sección de Informes Revisados. Los expedientes validados aparecerán aquí.
              </div>
            ) : (
              filteredReviewedReports.map((rep) => (
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
                        {rep.fileName} ({rep.fileSize})
                      </span>
                    </div>
                    <div className="text-[11px] text-[#64748b] flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
                      <span>Radicado: <strong className="text-[#334155] font-medium">{rep.submissionDate}</strong></span>
                      <span>•</span>
                      <span>Revisado el: <strong className="text-[#0e7a52] font-medium">{rep.reviewedDate || '2026-09-30'}</strong> por {rep.reviewedByName || user.fullName}</span>
                    </div>
                  </div>

                  <div className="flex items-center self-start md:self-center shrink-0">
                    <button
                      id={`view-reviewed-report-btn-${rep.id}`}
                      onClick={() => handleOpenReview(rep)}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-[#eff7fd] text-[#0d5285] border border-[#cbd5e1] hover:border-[#b0dbf5] rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ver informe</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* PENDING FORWARDED REPORTS INBOX */
        <div id="sg-reports-inbox-section" className="bg-white rounded-xl border border-[#e2e8f0] shadow-xs overflow-hidden">
          <div className="p-6 border-b border-[#e2e8f0] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-xl text-[#0c1f33]">
                  Informes Finales Reenviados por la Subsecretaría
                </h2>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Expedientes en espera de revisión definitiva por la Secretaría General.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentTab('users')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#eff7fd] hover:bg-[#d6ecfa] text-[#0d5285] border border-[#b0dbf5] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Gestionar Usuarios</span>
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#64748b] absolute left-3 top-3 pointer-events-none" />
              <input
                id="sg-reports-search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por comisión EYC, subsecretario responsable o archivo..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#cbd5e1] focus:border-[#0f68a4] focus:ring-1 focus:ring-[#0f68a4] focus:outline-none"
              />
            </div>
          </div>

          <div className="divide-y divide-[#e2e8f0]">
            {filteredPendingReports.length === 0 ? (
              <div className="p-12 text-center text-[#64748b] text-xs">
                No hay informes pendientes de revisión en la bandeja de la Secretaría General.
              </div>
            ) : (
              filteredPendingReports.map((rep) => (
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
                        {rep.fileName} ({rep.fileSize})
                      </span>
                    </div>
                    <div className="text-[11px] text-[#64748b] flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
                      <span>Radicado: <strong className="text-[#334155] font-medium">{rep.submissionDate || 'N/A'}</strong></span>
                      <span>•</span>
                      <span>Reenviado por: <strong className="text-[#0e7a52] font-medium">{rep.undersecretaryName || 'Subsecretaría'}</strong> ({rep.forwardingDate || 'N/A'})</span>
                    </div>
                  </div>

                  {/* Primary review action: clearly visible without horizontal scrolling */}
                  <div className="flex items-center self-start md:self-center shrink-0">
                    <button
                      id={`review-report-btn-${rep.id}`}
                      onClick={() => handleOpenReview(rep)}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#006699] hover:bg-[#005580] active:bg-[#004466] text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Revisar informe</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CREATE SUBSECRETARY MODAL */}
      {createSubModalOpen && (
        <div
          id="create-subsecretary-modal"
          className="fixed inset-0 z-50 bg-[#002B49]/70 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#cbd5e1] shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#002B49] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-5 h-5 text-[#00B2B2]" />
                <h3 className="font-display font-bold text-base">
                  Crear Nuevo Subsecretario
                </h3>
              </div>
              <button
                onClick={() => setCreateSubModalOpen(false)}
                className="text-[#bde0f2] hover:text-white text-xs font-semibold px-2 py-1 rounded cursor-pointer"
              >
                Cancelar
              </button>
            </div>

            <form onSubmit={handleCreateUndersecretary} className="p-6 space-y-4">
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
                  NOMBRE COMPLETO DEL SUBSECRETARIO
                </label>
                <input
                  type="text"
                  required
                  value={newSubFullName}
                  onChange={(e) => setNewSubFullName(e.target.value)}
                  placeholder="Ej. Lic. Manuel De Jesús Valera"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#cbd5e1] focus:border-[#0f68a4] focus:ring-1 focus:ring-[#0f68a4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider mb-1">
                  DEPARTAMENTO / SUBSECRETARÍA
                </label>
                <input
                  type="text"
                  required
                  value={newSubDepartment}
                  onChange={(e) => setNewSubDepartment(e.target.value)}
                  placeholder="Subsecretaría de Evaluación y Control"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#cbd5e1] focus:border-[#0f68a4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider mb-1">
                  CORREO INSTITUCIONAL
                </label>
                <input
                  type="email"
                  required
                  value={newSubEmail}
                  onChange={(e) => setNewSubEmail(e.target.value)}
                  placeholder="subsecretario.control2@sigel.edu.do"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#cbd5e1] focus:border-[#0f68a4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider mb-1">
                  CONTRASEÑA INICIAL ASIGNADA
                </label>
                <input
                  type="text"
                  required
                  value={newSubPassword}
                  onChange={(e) => setNewSubPassword(e.target.value)}
                  placeholder="sub2026"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#cbd5e1] focus:border-[#0f68a4] focus:outline-none font-mono"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setCreateSubModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#475569] hover:bg-[#e2e8f0] rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0f68a4] hover:bg-[#0d5285] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  Crear Subsecretario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE EYC COMMISSION MODAL */}
      {createAicModalOpen && (
        <div
          id="create-aic-modal"
          className="fixed inset-0 z-50 bg-[#0c1f33]/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#cbd5e1] shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#0c1f33] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Building className="w-5 h-5 text-[#ecc978]" />
                <h3 className="font-display font-bold text-base">
                  Crear Nueva Comisión EYC
                </h3>
              </div>
              <button
                onClick={() => setCreateAicModalOpen(false)}
                className="text-[rgba(232,242,250,0.72)] hover:text-white text-xs font-semibold px-2 py-1 rounded cursor-pointer"
              >
                Cancelar
              </button>
            </div>

            <form onSubmit={handleCreateAicCommission} className="p-6 space-y-4">
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
                  NOMBRE DE LA COMISIÓN
                </label>
                <input
                  type="text"
                  required
                  value={newAicName}
                  onChange={(e) => setNewAicName(e.target.value)}
                  placeholder="Ej. Comisión de Asuntos Económicos y Financieros (ECOFIN)"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#cbd5e1] focus:border-[#0e7a52] focus:ring-1 focus:ring-[#0e7a52] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider mb-1">
                  DISTRITO EDUCATIVO REGIONAL
                </label>
                <input
                  type="text"
                  required
                  value={newAicDistrict}
                  onChange={(e) => setNewAicDistrict(e.target.value)}
                  placeholder="Ej. Distrito Educativo 10-02"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#cbd5e1] focus:border-[#0e7a52] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider mb-1">
                  CORREO INSTITUCIONAL DE LA COMISIÓN
                </label>
                <input
                  type="email"
                  required
                  value={newAicEmail}
                  onChange={(e) => setNewAicEmail(e.target.value)}
                  placeholder="eyc.ecofin@sigel.edu.do"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#cbd5e1] focus:border-[#0e7a52] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider mb-1">
                  CONTRASEÑA INICIAL ASIGNADA
                </label>
                <input
                  type="text"
                  required
                  value={newAicPassword}
                  onChange={(e) => setNewAicPassword(e.target.value)}
                  placeholder="eyc2026"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#cbd5e1] focus:border-[#0e7a52] focus:outline-none font-mono"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setCreateAicModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#475569] hover:bg-[#e2e8f0] rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0e7a52] hover:bg-[#09573a] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  Crear Comisión EYC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE USER MODAL */}
      {userToDelete && (
        <div
          id="confirm-delete-user-modal"
          className="fixed inset-0 z-50 bg-[#0c1f33]/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#cbd5e1] shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3 text-[#b23b31]">
              <div className="w-10 h-10 rounded-full bg-[#fdeeec] flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-base text-[#0c1f33]">
                  Revocar Acceso a Usuario
                </h4>
                <p className="text-xs text-[#64748b]">
                  Esta acción deshabilitará el acceso de esta cuenta a la plataforma.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-xs space-y-1">
              <div className="font-bold text-[#0c1f33]">{userToDelete.fullName}</div>
              <div className="text-[#0d5285] font-mono">{userToDelete.email}</div>
              <div className="text-[11px] text-[#64748b]">
                {userToDelete.commission || userToDelete.department || 'Dependencia institucional'}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-[#475569] hover:bg-[#e2e8f0] rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                className="px-4 py-2 bg-[#b23b31] hover:bg-[#962f27] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Confirmar Revocación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ERROR NOTICE MODAL */}
      {deleteErrorMessage && (
        <div
          id="delete-error-modal"
          className="fixed inset-0 z-50 bg-[#0c1f33]/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full border border-[#cbd5e1] shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3 text-[#b23b31]">
              <AlertCircle className="w-6 h-6" />
              <h4 className="font-display font-bold text-sm text-[#0c1f33]">
                Acción Restringida
              </h4>
            </div>
            <p className="text-xs text-[#475569] leading-relaxed">
              {deleteErrorMessage}
            </p>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setDeleteErrorMessage(null)}
                className="px-4 py-2 bg-[#0f68a4] hover:bg-[#0d5285] text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
