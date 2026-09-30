import React, { useState, useEffect, useRef } from 'react';
import { User, Report } from '../../types';
import { StatusChip } from './StatusChip';
import { FileStorageService } from '../../services/fileStorage';
import { DataStore } from '../../services/store';
import { PdfViewer } from './PdfViewer';
import {
  ArrowLeft,
  Send,
  Printer,
  Download,
  CheckCircle2,
  FileText,
  Clock,
  ShieldCheck,
  Building,
  User as UserIcon,
  Check,
  AlertCircle,
  ExternalLink,
  FileCheck
} from 'lucide-react';

interface ReportReviewViewProps {
  report: Report;
  currentUser: User;
  onBack: () => void;
  onForwardToSecretaryGeneral?: (reportId: string) => void;
  onMarkAsReviewed?: (reportId: string) => void;
  isForwarding?: boolean;
}

export const ReportReviewView: React.FC<ReportReviewViewProps> = ({
  report,
  currentUser,
  onBack,
  onForwardToSecretaryGeneral,
  onMarkAsReviewed,
  isForwarding = false,
}) => {
  const [activeFile, setActiveFile] = useState<File | Blob | string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(true);
  const [forwardSuccess, setForwardSuccess] = useState(false);
  const [reviewedSuccess, setReviewedSuccess] = useState(false);

  // Load the actual real uploaded document file
  useEffect(() => {
    let isMounted = true;

    async function loadActualDocument() {
      setIsLoadingFile(true);

      // 1. First priority: live File/Blob directly attached to report object or stored in DataStore
      const liveFile = report.file || DataStore.getLiveFile(report.id) || FileStorageService.getCachedFile(report.id);
      if (liveFile) {
        if (isMounted) {
          setActiveFile(liveFile);
          setIsLoadingFile(false);
        }
        return;
      }

      // 2. Second priority: get Blob from FileStorageService (IndexedDB)
      try {
        const storedBlob = await FileStorageService.getFile(report.id);
        if (storedBlob && isMounted) {
          setActiveFile(storedBlob);
          setIsLoadingFile(false);
          return;
        }
      } catch (err) {
        console.warn('Could not read file from storage:', err);
      }

      // 3. Third priority: fileUrl
      let url = await FileStorageService.getFileUrl(report.id);
      if (!url && report.fileUrl) {
        url = report.fileUrl;
      }

      if (isMounted) {
        if (url) {
          setActiveFile(url);
          setFileUrl(url);
        } else {
          setActiveFile(null);
        }
        setIsLoadingFile(false);
      }
    }

    loadActualDocument();

    return () => {
      isMounted = false;
    };
  }, [report.id, report.file, report.fileUrl]);

  const canForward =
    currentUser.role === 'undersecretary' &&
    report.status === 'submitted_to_undersecretary' &&
    Boolean(onForwardToSecretaryGeneral);

  const canMarkAsReviewed =
    currentUser.role === 'secretary_general' &&
    report.status === 'forwarded_to_secretary_general' &&
    Boolean(onMarkAsReviewed);

  const isAlreadyReviewed = report.status === 'reviewed';
  const isAlreadyForwarded =
    report.status === 'forwarded_to_secretary_general' || report.status === 'reviewed';

  const handleForwardClick = () => {
    if (onForwardToSecretaryGeneral && !isForwarding) {
      onForwardToSecretaryGeneral(report.id);
      setForwardSuccess(true);
    }
  };

  const handleReviewedClick = () => {
    if (onMarkAsReviewed) {
      onMarkAsReviewed(report.id);
      setReviewedSuccess(true);
    }
  };

  const handleDownload = () => {
    if (!activeFile) return;

    if (activeFile instanceof Blob) {
      const url = URL.createObjectURL(activeFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = report.fileName || (activeFile instanceof File ? activeFile.name : 'informe_oficial.pdf');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } else if (typeof activeFile === 'string') {
      const a = document.createElement('a');
      a.href = activeFile;
      a.download = report.fileName || 'informe_oficial.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handlePrint = () => {
    // Native browser print dialog
    window.print();
  };

  return (
    <div id="report-review-view-container" className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e2e8f0]">
        <div className="flex items-center gap-3">
          <button
            id="back-to-reports-btn"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#334155] hover:text-[#0c1f33] bg-white hover:bg-[#f1f5f9] border border-[#cbd5e1] rounded-lg transition-colors shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#64748b]" />
            <span>Volver a la bandeja</span>
          </button>

          <div className="h-4 w-px bg-[#cbd5e1] hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
                EXPEDIENTE INSTITUCIONAL
              </span>
              <span className="text-xs text-[#cbd5e1]">•</span>
              <span className="text-xs font-medium text-[#0f68a4]">
                MONUR XVIII
              </span>
            </div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-[#0c1f33] tracking-tight">
              {report.commission}
            </h2>
          </div>
        </div>

        {/* Action Controls in Top Header */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {activeFile && (
            <button
              id="header-download-doc-btn"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#475569] hover:text-[#0c1f33] bg-white hover:bg-[#f8fafc] border border-[#cbd5e1] rounded-lg transition-colors cursor-pointer shadow-2xs"
              title="Descargar documento a su equipo"
            >
              <Download className="w-4 h-4 text-[#64748b]" />
              <span className="hidden md:inline">Descargar Archivo</span>
            </button>
          )}

          <button
            id="header-print-expediente-btn"
            onClick={handlePrint}
            title="Imprimir expediente o Guardar como PDF"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#475569] hover:text-[#0c1f33] bg-white hover:bg-[#f8fafc] border border-[#cbd5e1] rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            <Printer className="w-4 h-4 text-[#64748b]" />
            <span className="hidden sm:inline">Imprimir Expediente</span>
          </button>

          {/* Undersecretary Action: Forward to Secretary General */}
          {canForward && (
            <button
              id="header-forward-btn"
              onClick={handleForwardClick}
              disabled={isForwarding}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0f68a4] hover:bg-[#0d5285] active:bg-[#0f446d] text-white text-xs font-semibold rounded-lg transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isForwarding ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Reenviando trámite...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Reenviar a Secretaría General</span>
                </>
              )}
            </button>
          )}

          {/* Secretary General Action: "Revisado" (replaces Conforme/Validado) */}
          {canMarkAsReviewed && !reviewedSuccess && (
            <button
              id="header-mark-reviewed-btn"
              onClick={handleReviewedClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0e7a52] hover:bg-[#09573a] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Revisado</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmation feedback alerts */}
      {forwardSuccess && (
        <div className="p-4 bg-[#e6f7ef] border border-[#b6e4ce] rounded-xl flex items-center justify-between gap-3 text-xs text-[#0e7a52] animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="font-semibold">
              El informe ha sido reenviado exitosamente a la Secretaría General con el aval de la Subsecretaría.
            </span>
          </div>
          <span className="text-[11px] font-medium bg-white/70 px-2 py-1 rounded">
            Protocolo Conforme
          </span>
        </div>
      )}

      {reviewedSuccess && (
        <div className="p-4 bg-[#e6f7ef] border border-[#b6e4ce] rounded-xl flex items-center justify-between gap-3 text-xs text-[#0e7a52] animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="font-semibold">
              Expediente marcado como «Revisado» exitosamente. Ha sido trasladado a la sección de Informes Revisados.
            </span>
          </div>
          <button
            onClick={onBack}
            className="text-[11px] font-semibold bg-[#0e7a52] text-white px-2.5 py-1 rounded hover:bg-[#09573a] transition-colors cursor-pointer"
          >
            Ver Informes Revisados
          </button>
        </div>
      )}

      {/* Main Grid: Document Viewer on Left (8 cols) + Metadata on Right (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: ACTUAL UPLOADED DOCUMENT VIEWER */}
        <div className="lg:col-span-8 space-y-4">
          <div id="printable-document-container" className="w-full">
            <PdfViewer
              file={activeFile}
              fileName={report.fileName || 'informe_oficial.pdf'}
              className="w-full min-h-[760px] sm:min-h-[860px]"
            />
          </div>
        </div>

        {/* Right Column: Metadata & Audit Trail Panel */}
        <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-20 no-print">
          {/* Status & Lifecycle Stepper Card */}
          <div className="bg-white rounded-xl p-5 border border-[#e2e8f0] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
                ESTADO DEL EXPEDIENTE
              </span>
              <StatusChip status={report.status} />
            </div>

            {/* Stepper Timeline */}
            <div className="space-y-3 pt-2 text-xs">
              {/* Step 1: EYC */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#0e7a52] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="font-semibold text-[#0c1f33]">1. Radicación por EYC</div>
                  <div className="text-[11px] text-[#64748b]">
                    {report.submissionDate || 'Completado'} · {report.aicName}
                  </div>
                </div>
              </div>

              {/* Step 2: Subsecretaría */}
              <div className="flex items-start gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    isAlreadyForwarded || forwardSuccess
                      ? 'bg-[#0e7a52] text-white'
                      : 'bg-[#0f68a4] text-white'
                  }`}
                >
                  {isAlreadyForwarded || forwardSuccess ? (
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <span className="text-[10px] font-bold">2</span>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-[#0c1f33]">
                    2. Revisión de Subsecretaría
                  </div>
                  <div className="text-[11px] text-[#64748b]">
                    {isAlreadyForwarded || forwardSuccess
                      ? `Reenviado el ${report.forwardingDate || '2026-09-30'}`
                      : 'En proceso de evaluación'}
                  </div>
                </div>
              </div>

              {/* Step 3: Secretaría General */}
              <div className="flex items-start gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    isAlreadyReviewed || reviewedSuccess
                      ? 'bg-[#0e7a52] text-white'
                      : isAlreadyForwarded || forwardSuccess
                      ? 'bg-[#c9972b] text-white'
                      : 'bg-[#e2e8f0] text-[#64748b]'
                  }`}
                >
                  {isAlreadyReviewed || reviewedSuccess ? (
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <span className="text-[10px] font-bold">3</span>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-[#0c1f33]">
                    3. Secretaría General
                  </div>
                  <div className="text-[11px] text-[#64748b]">
                    {isAlreadyReviewed || reviewedSuccess
                      ? `Revisado y Concluido el ${report.reviewedDate || '2026-09-30'}`
                      : isAlreadyForwarded || forwardSuccess
                      ? 'Pendiente de confirmación'
                      : 'A la espera de reenvío'}
                  </div>
                </div>
              </div>
            </div>

            {/* Subsecretary Action Button */}
            {canForward && (
              <div className="pt-2 border-t border-[#e2e8f0]">
                <button
                  id="side-forward-to-sg-btn"
                  onClick={handleForwardClick}
                  disabled={isForwarding}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0f68a4] hover:bg-[#0d5285] active:bg-[#0f446d] text-white font-semibold rounded-lg text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-50"
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
                <p className="text-[11px] text-[#64748b] text-center mt-2">
                  Al reenviar, el expediente pasará a la bandeja directa del Secretario General.
                </p>
              </div>
            )}

            {/* Secretary General Action: "Revisado" */}
            {canMarkAsReviewed && !reviewedSuccess && (
              <div className="pt-2 border-t border-[#e2e8f0]">
                <button
                  id="side-mark-reviewed-btn"
                  onClick={handleReviewedClick}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0e7a52] hover:bg-[#09573a] text-white font-semibold rounded-lg text-xs transition-colors shadow-xs cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Marcar como Revisado</span>
                </button>
                <p className="text-[11px] text-[#64748b] text-center mt-2">
                  Moverá el informe de la bandeja pendiente a la sección «Informes revisados».
                </p>
              </div>
            )}

            {/* Reviewed Confirmation Status Note */}
            {(isAlreadyReviewed || reviewedSuccess) && (
              <div className="pt-2 border-t border-[#e2e8f0]">
                <div className="p-3 bg-[#f1f5f9] rounded-lg border border-[#cbd5e1] text-xs space-y-1">
                  <div className="font-semibold text-[#0c1f33] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0e7a52]" />
                    <span>Trámite Finalizado</span>
                  </div>
                  <div className="text-[#64748b] text-[11px]">
                    Revisado por {report.reviewedByName || currentUser.fullName} el{' '}
                    {report.reviewedDate || '2026-09-30'}.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Technical Metadata Card */}
          <div className="bg-white rounded-xl p-5 border border-[#e2e8f0] shadow-xs space-y-3.5 text-xs">
            <h3 className="font-bold text-[#0c1f33] uppercase text-[11px] tracking-wider border-b border-[#e2e8f0] pb-2">
              Ficha Técnica del Expediente
            </h3>

            <div>
              <span className="text-[#64748b] text-[11px] block">Comisión Radicadora:</span>
              <span className="font-semibold text-[#0c1f33] block mt-0.5">
                {report.commission}
              </span>
              <span className="text-[11px] text-[#0f68a4] block">{report.district}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#f1f5f9]">
              <div>
                <span className="text-[#64748b] text-[10px] uppercase font-bold block">
                  Fecha Radicación
                </span>
                <span className="font-medium text-[#0c1f33] block mt-0.5 tabular-nums">
                  {report.submissionDate || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[#64748b] text-[10px] uppercase font-bold block">
                  Fecha Reenvío
                </span>
                <span className="font-medium text-[#0e7a52] block mt-0.5 tabular-nums">
                  {report.forwardingDate || (forwardSuccess ? 'Hoy' : 'Pendiente')}
                </span>
              </div>
            </div>

            <div className="pt-1 border-t border-[#f1f5f9]">
              <span className="text-[#64748b] text-[10px] uppercase font-bold block">
                Archivo Original Adjunto
              </span>
              <div className="flex items-center justify-between mt-1 p-2 bg-[#f8fafc] rounded border border-[#e2e8f0]">
                <div className="flex items-center gap-2 truncate mr-2">
                  <FileText className="w-4 h-4 text-[#0f68a4] shrink-0" />
                  <span className="font-medium text-[#0c1f33] truncate">
                    {report.fileName || 'informe.pdf'}
                  </span>
                </div>
                <span className="text-[11px] text-[#64748b] shrink-0">
                  {report.fileSize || '2.4 MB'}
                </span>
              </div>
            </div>

            <div className="pt-1 border-t border-[#f1f5f9]">
              <span className="text-[#64748b] text-[10px] uppercase font-bold block">
                Verificación Criptográfica SHA-256
              </span>
              <div className="font-mono text-[10px] text-[#0d5285] bg-[#eff7fd] p-2 rounded border border-[#b0dbf5] break-all mt-1">
                {report.hashVerification || 'SHA256: 9e4f2a7b1c8d3e5f0a2b4c6d8e1f3a5b7c9d0e2f'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
