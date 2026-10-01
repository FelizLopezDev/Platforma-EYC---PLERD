import * as pdfjsLib from 'pdfjs-dist';

export interface PrintPdfOptions {
  file: File | Blob | ArrayBuffer | string;
  fileName?: string;
  onProgress?: (message: string) => void;
  onError?: (error: Error | string) => void;
  onComplete?: () => void;
}

/**
 * Renders all pages of a real PDF into a dedicated print container/window and triggers
 * the browser's native print dialog without application UI, sidebars, or headers.
 *
 * Supports two strategies:
 * 1. Immediate popup window (preferred when allowed by browser)
 * 2. Invisible, dedicated print container appended to document.body with @media print rules
 *    (fallback if popup window is blocked by iframe or browser permissions)
 */
export async function printPdfDocument({
  file,
  fileName = 'informe_oficial.pdf',
  onProgress,
  onError,
  onComplete,
}: PrintPdfOptions): Promise<void> {
  if (!file) {
    onError?.('Documento no disponible');
    return;
  }

  // 1. Try to open the print window immediately synchronously during click event
  let printWindow: Window | null = null;
  try {
    printWindow = window.open('', '_blank', 'width=900,height=800,menubar=no,toolbar=no,location=no,status=no');
  } catch (e) {
    console.warn('Popup window blocked or not allowed, falling back to print container:', e);
  }

  onProgress?.('Preparando documento para imprimir...');

  try {
    // 2. Load PDF with PDF.js
    let loadingTask: pdfjsLib.PDFDocumentLoadingTask;

    if (file instanceof Blob) {
      const arrayBuffer = await file.arrayBuffer();
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
      throw new Error('Tipo de archivo no compatible');
    }

    const doc = await loadingTask.promise;
    const numPages = doc.numPages;

    if (numPages === 0) {
      throw new Error('El documento no contiene páginas para imprimir');
    }

    // Render all pages to high-resolution data URLs
    const pageImageUrls: { url: string; width: number; height: number }[] = [];

    // Scale 2.0 ensures crisp vector/text quality for 300 DPI printers
    const PRINT_SCALE = 2.0;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      onProgress?.(`Preparando página ${pageNum} de ${numPages}...`);
      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale: PRINT_SCALE });

      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);

      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) continue;

      // Fill white background for print
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const renderContext: any = {
        canvas,
        canvasContext: ctx,
        viewport,
      };

      await page.render(renderContext).promise;
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      pageImageUrls.push({
        url: dataUrl,
        width: viewport.width,
        height: viewport.height,
      });
    }

    // Strategy A: If printWindow is available and not closed
    if (printWindow && !printWindow.closed) {
      printWindow.document.open();
      printWindow.document.write(`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>${fileName}</title>
  <style>
    @page {
      margin: 0;
      size: auto;
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #000000;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .print-page {
      display: block;
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
      page-break-after: always;
      break-after: page;
      text-align: center;
      background: #ffffff;
    }
    .print-page:last-child {
      page-break-after: auto;
      break-after: auto;
    }
    .print-page img {
      display: block;
      width: 100%;
      height: auto;
      max-width: 100%;
      margin: 0 auto;
    }
    @media screen {
      body {
        background: #525659;
        padding: 20px;
      }
      .print-page {
        margin-bottom: 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        max-width: 800px;
      }
      .print-bar {
        position: sticky;
        top: 0;
        background: #0c1f33;
        color: white;
        padding: 12px 20px;
        margin: -20px -20px 20px -20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 13px;
        z-index: 100;
      }
      .print-bar button {
        background: #0f68a4;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
      }
    }
    @media print {
      .print-bar {
        display: none !important;
      }
      body {
        background: white !important;
        padding: 0 !important;
      }
      .print-page {
        box-shadow: none !important;
        margin: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
      }
    }
  </style>
</head>
<body>
  <div class="print-bar">
    <span>Expediente: <strong>${fileName}</strong> (${numPages} ${numPages === 1 ? 'página' : 'páginas'})</span>
    <button onclick="window.print()">Imprimir ahora</button>
  </div>
  ${pageImageUrls
    .map(
      (p, i) => `
    <div class="print-page" id="page-${i + 1}">
      <img src="${p.url}" alt="Página ${i + 1} de ${fileName}" />
    </div>
  `
    )
    .join('')}
</body>
</html>
      `);
      printWindow.document.close();

      // Wait a tick for images to lay out before calling print()
      setTimeout(() => {
        try {
          printWindow?.focus();
          printWindow?.print();
        } catch (e) {
          console.warn('Direct print call on window failed:', e);
        }
        onComplete?.();
      }, 500);
      return;
    }

    // Strategy B: Dedicated DOM Print Container (works 100% inside iframe without popup restrictions)
    const existingContainer = document.getElementById('sigel-dedicated-print-container');
    if (existingContainer) {
      existingContainer.remove();
    }

    const printContainer = document.createElement('div');
    printContainer.id = 'sigel-dedicated-print-container';
    printContainer.className = 'sigel-print-only-element';

    // Style specifically for print isolation
    printContainer.innerHTML = `
      <style id="sigel-print-inline-style">
        @media screen {
          #sigel-dedicated-print-container {
            display: none !important;
          }
        }
        @media print {
          /* Hide EVERYTHING in normal app */
          body > *:not(#sigel-dedicated-print-container) {
            display: none !important;
          }
          #root {
            display: none !important;
          }
          #sigel-dedicated-print-container {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            z-index: 9999999 !important;
          }
          .sigel-print-page {
            display: block !important;
            width: 100% !important;
            page-break-after: always !important;
            break-after: page !important;
            margin: 0 0 0 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          .sigel-print-page:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
          .sigel-print-page img {
            display: block !important;
            width: 100% !important;
            height: auto !important;
            max-width: 100% !important;
            margin: 0 auto !important;
          }
        }
      </style>
      ${pageImageUrls
        .map(
          (p, i) => `
        <div class="sigel-print-page" id="sigel-print-page-${i + 1}">
          <img src="${p.url}" alt="Página ${i + 1}" />
        </div>
      `
        )
        .join('')}
    `;

    document.body.appendChild(printContainer);

    // Trigger browser print
    setTimeout(() => {
      try {
        window.focus();
        window.print();
      } catch (err) {
        console.error('Error invoking window.print():', err);
      } finally {
        // Clean up temporary DOM container after printing dialog closes
        setTimeout(() => {
          printContainer.remove();
          onComplete?.();
        }, 1500);
      }
    }, 400);
  } catch (error: any) {
    if (printWindow && !printWindow.closed) {
      printWindow.close();
    }
    console.error('Error preparando impresión de PDF:', error);
    onError?.(error?.message || 'No se pudo preparar el documento para impresión.');
  }
}
