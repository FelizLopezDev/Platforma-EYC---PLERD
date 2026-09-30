import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  FileText,
  Loader2,
  Printer,
  Download
} from 'lucide-react';

// Configure worker explicitly for Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface PdfViewerProps {
  /**
   * The source file: a File object, a Blob, an ArrayBuffer, or a URL string.
   */
  file: File | Blob | ArrayBuffer | string | null | undefined;
  /**
   * Optional custom filename for downloading/printing
   */
  fileName?: string;
  /**
   * Optional initial zoom level (default 1.15)
   */
  initialScale?: number;
  /**
   * Optional callback when PDF successfully loads
   */
  onLoadSuccess?: (numPages: number) => void;
  /**
   * Optional callback on load error
   */
  onLoadError?: (error: Error) => void;
  /**
   * Custom CSS class name for outer container
   */
  className?: string;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  file,
  fileName = 'documento.pdf',
  initialScale = 1.15,
  onLoadSuccess,
  onLoadError,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pagesContainerRef = useRef<HTMLDivElement>(null);
  const printContainerRef = useRef<HTMLDivElement>(null);

  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(initialScale);
  const [rotation, setRotation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [renderedPages, setRenderedPages] = useState<Map<number, string>>(new Map());
  const [isFitWidth, setIsFitWidth] = useState<boolean>(false);

  // 1. Load the PDF Document from File/Blob/ArrayBuffer/URL
  useEffect(() => {
    let isCancelled = false;

    async function loadPdf() {
      if (!file) {
        setIsLoading(false);
        setErrorMessage('Documento no disponible');
        setPdfDoc(null);
        setNumPages(0);
        return;
      }

      // Check if non-PDF File format
      if (file instanceof File) {
        const isPdfType = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        if (!isPdfType) {
          setIsLoading(false);
          setErrorMessage('Formato de documento no compatible. Debe ser un archivo PDF.');
          setPdfDoc(null);
          setNumPages(0);
          return;
        }
      }

      setIsLoading(true);
      setErrorMessage(null);
      setRenderedPages(new Map());

      try {
        let loadingTask: pdfjsLib.PDFDocumentLoadingTask;

        if (file instanceof Blob) {
          const arrayBuffer = await file.arrayBuffer();
          if (isCancelled) return;
          loadingTask = pdfjsLib.getDocument({
            data: new Uint8Array(arrayBuffer),
            cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.3.289/cmaps/',
            cMapPacked: true,
          });
        } else if (file instanceof ArrayBuffer) {
          loadingTask = pdfjsLib.getDocument({
            data: new Uint8Array(file),
            cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.3.289/cmaps/',
            cMapPacked: true,
          });
        } else if (typeof file === 'string') {
          loadingTask = pdfjsLib.getDocument({
            url: file,
            cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.3.289/cmaps/',
            cMapPacked: true,
          });
        } else {
          throw new Error('Tipo de archivo no válido');
        }

        const doc = await loadingTask.promise;
        if (isCancelled) return;

        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setCurrentPage(1);
        setIsLoading(false);
        onLoadSuccess?.(doc.numPages);
      } catch (err: any) {
        if (isCancelled) return;
        console.error('Error al renderizar PDF con PDF.js:', err);
        setIsLoading(false);
        setPdfDoc(null);
        setNumPages(0);
        const msg = err?.message?.includes('Invalid PDF')
          ? 'El archivo seleccionado no es un PDF válido o está corrupto.'
          : 'No se pudo visualizar el documento.';
        setErrorMessage(msg);
        onLoadError?.(err);
      }
    }

    loadPdf();

    return () => {
      isCancelled = true;
    };
  }, [file]);

  // 2. Render each page to High-DPI Canvas
  const renderAllPages = useCallback(async () => {
    if (!pdfDoc || numPages === 0 || !pagesContainerRef.current) return;

    const container = pagesContainerRef.current;
    // Clear previously rendered canvas elements
    container.innerHTML = '';

    const effectiveScale = isFitWidth && containerRef.current
      ? (containerRef.current.clientWidth - 48) / 612
      : scale;

    const devicePixelRatio = window.devicePixelRatio || 1;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      try {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: effectiveScale, rotation });

        const pageWrapper = document.createElement('div');
        pageWrapper.className =
          'pdf-page-wrapper relative bg-white shadow-md rounded-sm overflow-hidden mx-auto transition-shadow hover:shadow-lg border border-[#cbd5e1]';
        pageWrapper.id = `pdf-page-${pageNum}`;
        pageWrapper.style.width = `${viewport.width}px`;
        pageWrapper.style.marginBottom = '20px';

        const canvas = document.createElement('canvas');
        canvas.className = 'block w-full h-auto';
        canvas.width = Math.floor(viewport.width * devicePixelRatio);
        canvas.height = Math.floor(viewport.height * devicePixelRatio);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) continue;

        ctx.scale(devicePixelRatio, devicePixelRatio);

        const renderContext: any = {
          canvas,
          canvasContext: ctx,
          viewport: viewport,
        };

        pageWrapper.appendChild(canvas);
        container.appendChild(pageWrapper);

        await page.render(renderContext).promise;
      } catch (e) {
        console.error(`Error rendering page ${pageNum}:`, e);
      }
    }
  }, [pdfDoc, numPages, scale, rotation, isFitWidth]);

  useEffect(() => {
    if (pdfDoc && numPages > 0) {
      renderAllPages();
    }
  }, [pdfDoc, numPages, scale, rotation, isFitWidth, renderAllPages]);

  // Track scroll position to update current page indicator
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const pageElements = container.querySelectorAll('.pdf-page-wrapper');
      const containerTop = container.scrollTop;

      for (let i = 0; i < pageElements.length; i++) {
        const el = pageElements[i] as HTMLElement;
        const top = el.offsetTop - container.offsetTop;
        const bottom = top + el.offsetHeight;

        if (containerTop >= top - 100 && containerTop < bottom) {
          setCurrentPage(i + 1);
          break;
        }
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [numPages]);

  // Zoom Handlers
  const handleZoomIn = () => {
    setIsFitWidth(false);
    setScale((prev) => Math.min(prev + 0.15, 2.5));
  };

  const handleZoomOut = () => {
    setIsFitWidth(false);
    setScale((prev) => Math.max(prev - 0.15, 0.5));
  };

  const handleResetZoom = () => {
    setIsFitWidth(false);
    setScale(1.0);
  };

  const handleToggleFitWidth = () => {
    setIsFitWidth((prev) => !prev);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const scrollToPage = (pageNum: number) => {
    const el = document.getElementById(`pdf-page-${pageNum}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setCurrentPage(pageNum);
    }
  };

  // Safe Download
  const handleDownload = () => {
    if (!file) return;

    if (file instanceof Blob) {
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || (file instanceof File ? file.name : 'documento.pdf');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } else if (typeof file === 'string') {
      const a = document.createElement('a');
      a.href = file;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Safe Native Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="pdf-viewer-root"
      className={`flex flex-col bg-[#3b4045] rounded-xl overflow-hidden border border-[#cbd5e1] shadow-xs select-none ${className}`}
    >
      {/* Top Professional Toolbar */}
      <div
        id="pdf-viewer-toolbar"
        className="px-3.5 py-2.5 bg-[#0c1f33] text-white flex flex-wrap items-center justify-between gap-3 text-xs border-b border-[#173a5a] no-print shrink-0"
      >
        {/* Left: Document details & page indicator */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 truncate max-w-[200px] sm:max-w-[280px]">
            <FileText className="w-4 h-4 text-[#ecc978] shrink-0" />
            <span className="font-semibold truncate text-[#f8fafc] text-xs" title={fileName}>
              {fileName}
            </span>
          </div>

          {numPages > 0 && (
            <div className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded text-[11px] font-mono text-[#d6ecfa]">
              <button
                onClick={() => scrollToPage(Math.max(currentPage - 1, 1))}
                disabled={currentPage <= 1}
                className="hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                title="Página anterior"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span>
                {currentPage} / {numPages}
              </span>
              <button
                onClick={() => scrollToPage(Math.min(currentPage + 1, numPages))}
                disabled={currentPage >= numPages}
                className="hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                title="Página siguiente"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Center: Zoom and Display Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Reducir zoom"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            onClick={handleResetZoom}
            className="px-2 py-1 rounded hover:bg-white/10 text-white/90 hover:text-white text-[11px] font-mono transition-colors cursor-pointer min-w-[50px] text-center"
            title="Restablecer zoom al 100%"
          >
            {isFitWidth ? 'Ajustar' : `${Math.round(scale * 100)}%`}
          </button>

          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Aumentar zoom"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="h-3.5 w-px bg-white/20 mx-1 hidden sm:block" />

          <button
            onClick={handleToggleFitWidth}
            className={`p-1.5 rounded hover:bg-white/10 transition-colors cursor-pointer hidden sm:inline-flex ${
              isFitWidth ? 'text-[#7cc2ec] bg-white/15' : 'text-white/80 hover:text-white'
            }`}
            title={isFitWidth ? 'Tamaño manual' : 'Ajustar al ancho'}
          >
            {isFitWidth ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={handleRotate}
            className="p-1.5 rounded hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer hidden sm:inline-flex"
            title="Girar documento 90°"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Download & Print actions */}
        <div className="flex items-center gap-2">
          {file && (
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded text-xs font-medium transition-colors cursor-pointer"
              title="Descargar archivo original"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Descargar</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#0f68a4] hover:bg-[#0d5285] active:bg-[#0f446d] text-white rounded text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            title="Imprimir expediente o Guardar como PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div
        ref={containerRef}
        id="pdf-viewport-scroll-area"
        className="flex-1 overflow-y-auto overflow-x-auto min-h-[600px] max-h-[82vh] bg-[#525659] p-4 sm:p-8 flex flex-col items-center relative"
      >
        {/* Loading State */}
        {isLoading && (
          <div className="my-auto py-24 text-center space-y-3">
            <Loader2 className="w-10 h-10 text-white/80 animate-spin mx-auto stroke-[2.5]" />
            <p className="text-white text-xs font-medium tracking-wide">
              Cargando documento en visor institucional...
            </p>
          </div>
        )}

        {/* Error / Empty State */}
        {!isLoading && errorMessage && (
          <div className="my-auto max-w-md w-full bg-white rounded-xl p-8 border border-[#e2e8f0] text-center shadow-lg space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#fdeeec] text-[#b23b31] flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-[#0c1f33]">
              {errorMessage}
            </h3>
            <p className="text-xs text-[#64748b] leading-relaxed">
              {errorMessage.includes('no disponible')
                ? 'No se ha detectado ningún archivo subido en esta sesión. Asegúrese de cargar un documento en formato PDF desde el panel EYC.'
                : 'Verifique que el archivo seleccionado sea un PDF válido y no se encuentre protegido o dañado.'}
            </p>
          </div>
        )}

        {/* Real PDF Rendered Pages Container */}
        <div
          ref={pagesContainerRef}
          id="pdf-rendered-pages"
          className="w-full flex flex-col items-center"
          style={{ display: isLoading || errorMessage ? 'none' : 'flex' }}
        />
      </div>

      {/* Bottom status bar */}
      {numPages > 0 && !errorMessage && (
        <div className="px-4 py-2 bg-[#0c1f33]/90 text-[11px] text-[#9eb8d0] flex items-center justify-between border-t border-[#173a5a] no-print">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0e7a52]" />
            <span>Documento Oficial Verificado por PDF.js (v6.3.289)</span>
          </div>
          <span>Total {numPages} {numPages === 1 ? 'página' : 'páginas'}</span>
        </div>
      )}
    </div>
  );
};
