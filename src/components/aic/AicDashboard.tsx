import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Report } from '../../types';
import { DataStore } from '../../services/store';
import { StatusChip } from '../common/StatusChip';
import { InstitutionalLogo } from '../common/InstitutionalLogo';
import { 
  FileUp, 
  CheckCircle2, 
  Check,
  Send, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  Download, 
  Eye, 
  MapPin,
  Calendar,
  X
} from 'lucide-react';

interface AicDashboardProps {
  user: User;
  onRefreshData: () => void;
  report: Report | undefined;
  activeTab?: string;
}

export const AicDashboard: React.FC<AicDashboardProps> = ({
  user,
  onRefreshData,
  report,
  activeTab = 'dashboard',
}) => {
  // Upload form states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [submittedFileName, setSubmittedFileName] = useState('');

  const isSubmitted = Boolean(
    report?.fileName &&
    (report?.status === 'submitted_to_undersecretary' || report?.status === 'forwarded_to_secretary_general')
  );
  const isForwarded = report?.status === 'forwarded_to_secretary_general';

  // Auto-dismiss the success overlay after a comfortable duration
  useEffect(() => {
    if (showSuccessOverlay) {
      const timer = setTimeout(() => {
        setShowSuccessOverlay(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [showSuccessOverlay]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setUploadError(null);
    }
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Debe adjuntar un archivo en formato PDF o documento oficial para continuar.');
      return;
    }

    setIsSubmitting(true);
    setUploadError(null);

    const fileName = selectedFile.name;
    const fileSize =
      selectedFile.size >= 1024 * 1024
        ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
        : `${(selectedFile.size / 1024).toFixed(1)} KB`;

    // Create a local blob URL for instant previewing and downloading of the user's real file
    const fileUrl = URL.createObjectURL(selectedFile);

    setTimeout(() => {
      DataStore.submitAicReport(user, {
        fileName,
        fileSize,
        fileUrl,
        summary: `Documento oficial radicado por ${user.commission || user.fullName}`,
        pageCount: 1,
      });

      setSubmittedFileName(fileName);
      setSelectedFile(null);
      setIsSubmitting(false);
      setShowSuccessOverlay(true);
      onRefreshData();
    }, 450);
  };

  return (
    <div id="aic-dashboard-container" className="space-y-6">
      {/* AIC Identification Banner */}
      <div
        id="aic-identity-card"
        className="bg-white rounded-xl p-6 border border-[#e2e8f0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <h2 className="font-display font-bold text-2xl text-[#0c1f33] tracking-tight">
            {user.commission || user.fullName}
          </h2>
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#475569] pt-1">
            <span className="flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#0f68a4]" />
              {user.district || 'Distrito Educativo Regional 10'}
            </span>
          </div>
        </div>

        {/* Current status display */}
        <div className="flex flex-col items-start md:items-end justify-center bg-[#f8fafc] md:bg-transparent p-4 md:p-0 rounded-lg border md:border-0 border-[#e2e8f0]">
          <span className="text-[11px] text-[#64748b] font-semibold uppercase tracking-wider mb-1">
            Estado Actual del Informe
          </span>
          <StatusChip status={report?.status || 'pending'} />
        </div>
      </div>

      {/* If a report has been submitted, show current status notification and preview */}
      <AnimatePresence>
        {isSubmitted && report && (
          <motion.div
            id="aic-submitted-confirmation"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-4"
          >
            <div
              id="aic-submission-success-banner"
              className="p-4 sm:p-5 bg-[#e6f7ef] border border-[#b6e4ce] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#0e7a52] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Check className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-display font-bold text-sm sm:text-base text-[#0e7a52]">
                    Documento Subido
                  </h3>
                  <p className="text-xs text-[#0f172a]">
                    Archivo: <span className="font-semibold text-[#0c1f33]">{report.fileName}</span> ({report.fileSize || '3.5 MB'}) — Subido: {report.submissionDate}
                  </p>
                </div>
              </div>

              <button
                id="aic-preview-doc-btn"
                onClick={() => setPreviewModalOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0d5285] bg-white hover:bg-[#eff7fd] border border-[#b0dbf5] rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <Eye className="w-4 h-4" />
                <span>Ver documento</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CENTRAL DOCUMENT UPLOAD & SUBMIT FORM */}
      <div
        id="aic-upload-section"
        className="bg-white rounded-xl p-6 sm:p-8 border border-[#e2e8f0] shadow-xs"
      >
        <div className="max-w-3xl">
          <div className="mb-6">
            <h3 className="font-display font-bold text-xl text-[#0c1f33]">
              {isSubmitted ? 'Subir Nuevo Documento o Actualizar Informe' : 'Carga del Informe Final de Comisión'}
            </h3>
          </div>

          {uploadError && (
            <div
              id="aic-upload-error-alert"
              className="mb-6 p-4 bg-[#fdeeec] border border-[#f5c9c4] text-[#b23b31] rounded-lg text-sm flex items-start gap-3"
            >
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>{uploadError}</div>
            </div>
          )}

          <form onSubmit={handleSubmitReport} className="space-y-6">
            {/* File Dropzone */}
            <div>
              <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider mb-2">
                DOCUMENTO OFICIAL (PDF, DOCX)
              </label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  selectedFile
                    ? 'border-[#0f68a4] bg-[#eff7fd]/40'
                    : 'border-[#cbd5e1] hover:border-[#0f68a4] bg-[#f8fafc]'
                }`}
              >
                <input
                  id="aic-file-upload-input"
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="aic-file-upload-input"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-3"
                >
                  <div className="w-12 h-12 rounded-full bg-[#eff7fd] text-[#0f68a4] flex items-center justify-center border border-[#b0dbf5]">
                    <FileUp className="w-6 h-6" />
                  </div>
                  {selectedFile ? (
                    <div className="space-y-1">
                      <div className="font-semibold text-sm text-[#0c1f33]">
                        {selectedFile.name}
                      </div>
                      <div className="text-xs text-[#64748b]">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Documento seleccionado
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-[#0d5285]">
                        Haga clic para seleccionar archivo o arrástrelo aquí
                      </div>
                      <div className="text-xs text-[#64748b]">
                        Formatos aceptados: PDF, DOCX (Máximo 25 MB)
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Submit Action Button (Institutional blue #0f68a4) */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                id="aic-submit-report-btn"
                type="submit"
                disabled={isSubmitting || !selectedFile}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#0f68a4] hover:bg-[#0d5285] active:bg-[#0f446d] text-white font-medium rounded-lg text-sm transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Registrando y transmitiendo...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{isSubmitted ? 'Actualizar y Enviar Documento' : 'Cargar y Enviar Documento'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Institutional Document Preview Modal */}
      {previewModalOpen && (
        <div
          id="aic-doc-preview-modal"
          className="fixed inset-0 z-50 bg-[#0c1f33]/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-xl max-w-2xl w-full border border-[#cbd5e1] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-[#0c1f33] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-[#ecc978]" />
                <h3 className="font-display font-bold text-base">
                  Visualizador Institucional de Documento
                </h3>
              </div>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="text-[rgba(232,242,250,0.72)] hover:text-white text-xs font-semibold px-2 py-1 rounded cursor-pointer"
              >
                Cerrar
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-sm text-[#334155]">
              <div className="text-center p-5 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] space-y-1.5">
                <div className="flex justify-center mb-1">
                  <InstitutionalLogo size={52} theme="dark" />
                </div>
                <div className="font-display font-bold text-lg text-[#0c1f33]">
                  CLUB ESCOLAR REGIONAL 10 — MONUR XVIII
                </div>
                <div className="text-xs font-semibold text-[#0d5285] uppercase tracking-wider">
                  {user.commission || user.fullName}
                </div>
                <div className="text-xs text-[#64748b]">
                  {report?.fileName}
                </div>
              </div>

              {/* Real PDF or Document Preview */}
              {(() => {
                const activeFileUrl = report?.fileUrl || (report?.id ? DataStore.getCachedFileUrl(report.id) : undefined);
                const isPdf = report?.fileName?.toLowerCase().endsWith('.pdf');

                if (activeFileUrl && isPdf) {
                  return (
                    <div className="rounded-lg overflow-hidden border border-[#cbd5e1] bg-slate-100">
                      <object
                        data={activeFileUrl}
                        type="application/pdf"
                        className="w-full h-80 sm:h-96"
                      >
                        <div className="p-6 text-center text-xs text-[#64748b]">
                          La previsualización está lista para descarga en su equipo.
                        </div>
                      </object>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="space-y-3">
                <h4 className="font-bold text-sm text-[#0c1f33] border-b pb-1">
                  Detalles Oficiales del Documento Radicado
                </h4>
                <div className="text-xs space-y-2 text-[#475569]">
                  <div className="flex items-center justify-between py-1 border-b border-[#f1f5f9]">
                    <span className="text-[#64748b]">Archivo:</span>
                    <span className="font-semibold text-[#0c1f33]">{report?.fileName}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-[#f1f5f9]">
                    <span className="text-[#64748b]">Tamaño verificado:</span>
                    <span className="font-medium text-[#0c1f33]">{report?.fileSize}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-[#f1f5f9]">
                    <span className="text-[#64748b]">Fecha de transmisión:</span>
                    <span className="font-medium text-[#0c1f33]">{report?.submissionDate}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-[#f1f5f9]">
                    <span className="text-[#64748b]">Comisión emisora:</span>
                    <span className="font-medium text-[#0c1f33]">{user.commission || user.fullName}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-[#f1f5f9]">
                    <span className="text-[#64748b]">Distrito escolar:</span>
                    <span className="font-medium text-[#0c1f33]">{user.district}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-[#f1f5f9]">
                    <span className="text-[#64748b]">Sello criptográfico:</span>
                    <span className="font-mono text-[11px] text-[#0f68a4]">{report?.hashVerification}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center justify-between gap-3">
              {(() => {
                const activeFileUrl = report?.fileUrl || (report?.id ? DataStore.getCachedFileUrl(report.id) : undefined);
                if (activeFileUrl) {
                  return (
                    <a
                      href={activeFileUrl}
                      download={report?.fileName || 'documento_oficial.pdf'}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#eff7fd] text-[#0d5285] border border-[#b0dbf5] rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Descargar archivo</span>
                    </a>
                  );
                }
                return <div />;
              })()}
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="px-4 py-2 bg-[#0f68a4] text-white rounded-lg text-xs font-semibold hover:bg-[#0d5285] cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subtle screen darkening & rising green check circle animation upon document submission */}
      <AnimatePresence>
        {showSuccessOverlay && (
          <motion.div
            id="aic-success-animation-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            onClick={() => setShowSuccessOverlay(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c1f33]/45 backdrop-blur-[3px] cursor-pointer"
          >
            <motion.div
              initial={{ opacity: 0, y: 35, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -18, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-7 sm:p-8 max-w-sm w-full shadow-2xl border border-[#e2e8f0] text-center flex flex-col items-center relative overflow-hidden"
            >
              {/* Top subtle highlight */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-[#0e7a52]" />

              {/* Green circle rising up with check animation */}
              <motion.div
                initial={{ scale: 0.25, y: 36, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", damping: 14, stiffness: 220 }}
                className="w-20 h-20 rounded-full bg-[#0e7a52] text-white flex items-center justify-center shadow-lg shadow-[#0e7a52]/25 ring-8 ring-[#e6f7ef] mt-2 mb-4"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -25 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.26, type: "spring", damping: 12, stiffness: 320 }}
                >
                  <Check className="w-10 h-10 stroke-[3]" />
                </motion.div>
              </motion.div>

              {/* Main text: "Documento Subido" */}
              <motion.h3
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.28 }}
                className="font-display font-bold text-2xl text-[#0c1f33] tracking-tight"
              >
                Documento Subido
              </motion.h3>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.28 }}
                className="text-xs text-[#64748b] mt-1 font-medium"
              >
                Línea Gráfica Institucional · MONUR XVIII
              </motion.p>

              {/* File name indicator pill */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.36, duration: 0.28 }}
                className="mt-4 px-3.5 py-1.5 bg-[#eff7fd] border border-[#b0dbf5] text-[#0d5285] rounded-lg text-xs font-semibold flex items-center gap-1.5 max-w-full"
              >
                <FileText className="w-3.5 h-3.5 shrink-0 text-[#0f68a4]" />
                <span className="truncate max-w-[220px]">
                  {submittedFileName || report?.fileName || 'Documento Oficial'}
                </span>
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.42 }}
                onClick={() => setShowSuccessOverlay(false)}
                className="mt-6 px-6 py-2 text-xs font-semibold text-[#0d5285] bg-[#f8fafc] hover:bg-[#eff7fd] border border-[#cbd5e1] hover:border-[#b0dbf5] rounded-lg transition-colors cursor-pointer"
              >
                Aceptar
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
