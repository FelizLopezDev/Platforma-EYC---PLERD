import React, { useState } from 'react';
import { User, Report } from '../../types';
import { DataStore } from '../../services/store';
import { StatusChip } from '../common/StatusChip';
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
  const [currentTab, setCurrentTab] = useState<'reports' | 'users'>(
    activeView === 'undersecretaries' ? 'users' : 'reports'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

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
  const allUsers = DataStore.getAllUsers();
  const aicUsers = DataStore.getAicUsers();
  const undersecretaryUsers = DataStore.getUndersecretaryUsers();

  const filteredReports = forwardedReports.filter((rep) => {
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
    setReviewModalOpen(true);
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

  return (
    <div id="secretary-general-dashboard-root" className="space-y-6">
      {/* High-level Institutional Metrics */}
      <div id="sg-metrics-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs">
          <div className="text-[11px] font-bold text-[#c9972b] uppercase tracking-wider">
            INFORMES RECIBIDOS
          </div>
          <div className="text-3xl font-display font-bold text-[#0c1f33] mt-2 tabular-nums">
            {forwardedReports.length}
          </div>
          <div className="text-xs text-[#64748b] mt-1 font-medium">
            Reenviados por Subsecretaría
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs">
          <div className="text-[11px] font-bold text-[#0e7a52] uppercase tracking-wider">
            EVALUACIÓN Y CONTROL (EYC) ACTIVOS
          </div>
          <div className="text-3xl font-display font-bold text-[#0e7a52] mt-2 tabular-nums">
            {aicUsers.length}
          </div>
          <div className="text-xs text-[#0e7a52] mt-1 font-medium">
            Activos en el modelo
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs">
          <div className="text-[11px] font-bold text-[#0f68a4] uppercase tracking-wider">
            SUBSECRETARIOS ACTIVOS
          </div>
          <div className="text-3xl font-display font-bold text-[#0c1f33] mt-2 tabular-nums">
            {undersecretaryUsers.length}
          </div>
          <div className="text-xs text-[#64748b] mt-1 font-medium">
            Personal de control autorizado
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs">
          <div className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
            USUARIOS EN SISTEMA
          </div>
          <div className="text-3xl font-display font-bold text-[#0c1f33] mt-2 tabular-nums">
            {allUsers.length}
          </div>
          <div className="text-xs text-[#64748b] mt-1">
            Total cuentas autorizadas
          </div>
        </div>
      </div>

      {/* Navigation View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-[#cbd5e1] pb-2">
        <button
          onClick={() => setCurrentTab('reports')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
            currentTab === 'reports'
              ? 'bg-[#0c1f33] text-white shadow-xs'
              : 'text-[#475569] hover:bg-[#e2e8f0]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Informes Reenviados ({forwardedReports.length})</span>
        </button>

        <button
          onClick={() => setCurrentTab('users')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
            currentTab === 'users'
              ? 'bg-[#0c1f33] text-white shadow-xs'
              : 'text-[#475569] hover:bg-[#e2e8f0]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Directorio de Usuarios Autorizados ({allUsers.length})</span>
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
      ) : (
        /* FORWARDED REPORTS INBOX (DEFAULT / MAIN VIEW) */
        <div id="sg-reports-inbox-section" className="bg-white rounded-xl border border-[#e2e8f0] shadow-xs overflow-hidden">
          <div className="p-6 border-b border-[#e2e8f0] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-xl text-[#0c1f33]">
                  Informes Finales Reenviados por la Subsecretaría
                </h2>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Recepción definitiva para el archivo oficial y memoria de MONUR XVIII.
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

          {/* Table */}
          <div className="overflow-x-auto">
            <table id="secretary-reports-table" className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-[#475569] uppercase font-bold tracking-wider border-b border-[#e2e8f0]">
                <tr>
                  <th className="px-5 py-3.5">Comisión / EYC</th>
                  <th className="px-5 py-3.5">Archivo</th>
                  <th className="px-5 py-3.5">Fecha de Envío</th>
                  <th className="px-5 py-3.5">Fecha de Reenvío</th>
                  <th className="px-5 py-3.5">Subsecretario</th>
                  <th className="px-5 py-3.5">Estado</th>
                  <th className="px-5 py-3.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-[#64748b]">
                      No hay informes reenviados actualmente por la Subsecretaría de Evaluación y Control.
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((rep) => (
                    <tr key={rep.id} className="hover:bg-[#f8fafc]/80 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-[#0c1f33] text-sm">{rep.aicName}</div>
                        <div className="text-[11px] text-[#0d5285] font-medium">{rep.commission}</div>
                        <div className="text-[11px] text-[#64748b]">{rep.district}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#0f68a4] shrink-0" />
                          <div>
                            <div className="font-semibold text-[#0c1f33] truncate max-w-[180px]">
                              {rep.fileName}
                            </div>
                            <div className="text-[11px] text-[#64748b]">
                              {rep.fileSize}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[#334155] tabular-nums whitespace-nowrap">
                        {rep.submissionDate || 'N/A'}
                      </td>
                      <td className="px-5 py-4 text-[#0e7a52] font-semibold tabular-nums whitespace-nowrap">
                        {rep.forwardingDate || 'N/A'}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-[#0c1f33]">
                          {rep.undersecretaryName || 'Lic. Rafael Mendoza Castillo'}
                        </div>
                        <div className="text-[11px] text-[#64748b]">
                          Subsecretaría Control
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <StatusChip status={rep.status} size="sm" />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleOpenReview(rep)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0f68a4] hover:bg-[#0d5285] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Expediente</span>
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

      {/* EXPEDIENTE PREVIEW MODAL */}
      {reviewModalOpen && selectedReport && (
        <div
          id="secretary-expediente-modal"
          className="fixed inset-0 z-50 bg-[#0c1f33]/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#cbd5e1] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 bg-[#0c1f33] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileCheck2 className="w-5 h-5 text-[#ecc978]" />
                <h3 className="font-display font-bold text-base">
                  Expediente Oficial de Comisión — MONUR XVIII
                </h3>
              </div>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="text-[rgba(232,242,250,0.72)] hover:text-white text-xs font-semibold px-2 py-1 rounded cursor-pointer"
              >
                Cerrar
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs text-[#64748b] font-medium uppercase tracking-wider">
                    COMISIÓN EVALUADA
                  </div>
                  <div className="text-base font-bold font-display text-[#0c1f33] mt-0.5">
                    {selectedReport.commission}
                  </div>
                  <div className="text-xs text-[#475569]">
                    Radicado por: {selectedReport.aicName} · {selectedReport.district}
                  </div>
                </div>
                <StatusChip status={selectedReport.status} size="md" />
              </div>

              {/* Document details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]">
                  <span className="text-[#64748b] block text-[10px] font-bold uppercase">ARCHIVO ADJUNTO</span>
                  <span className="font-bold text-[#0c1f33] block mt-1">{selectedReport.fileName}</span>
                  <span className="text-[11px] text-[#64748b]">Tamaño: {selectedReport.fileSize}</span>
                </div>

                <div className="p-3.5 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]">
                  <span className="text-[#64748b] block text-[10px] font-bold uppercase">FIRMA DIGITAL & VERIFICACIÓN</span>
                  <span className="font-mono text-[11px] text-[#0d5285] font-semibold block mt-1 truncate">
                    {selectedReport.hashVerification || 'SHA256: 7a8f9c1b3d4e6f2a8c0d9e1f3a5b7c9d'}
                  </span>
                  <span className="text-[11px] text-[#0e7a52] font-medium">Sello Digital Válido</span>
                </div>
              </div>

              {/* Summary */}
              <div>
                <h5 className="text-xs font-bold text-[#334155] uppercase tracking-wider mb-1.5">
                  Resumen Ejecutivo del Informe:
                </h5>
                <div className="p-4 bg-[#f8fafc] border border-[#cbd5e1] rounded-xl text-xs text-[#334155] leading-relaxed">
                  {selectedReport.summary ||
                    'Documento oficial consolidado remitido formalmente.'}
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#f8fafc] border-t border-[#e2e8f0] flex justify-end">
              <button
                onClick={() => setReviewModalOpen(false)}
                className="px-5 py-2 bg-[#0f68a4] hover:bg-[#0d5285] text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cerrar Expediente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE SUBSECRETARY MODAL */}
      {createSubModalOpen && (
        <div
          id="create-subsecretary-modal"
          className="fixed inset-0 z-50 bg-[#0c1f33]/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#cbd5e1] shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#0c1f33] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-5 h-5 text-[#ecc978]" />
                <h3 className="font-display font-bold text-base">
                  Crear Nuevo Subsecretario
                </h3>
              </div>
              <button
                onClick={() => setCreateSubModalOpen(false)}
                className="text-[rgba(232,242,250,0.72)] hover:text-white text-xs font-semibold px-2 py-1 rounded cursor-pointer"
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
