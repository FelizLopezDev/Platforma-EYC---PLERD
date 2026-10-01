export interface PrintPdfOptions {
  file: File | Blob | ArrayBuffer | string;
  fileName?: string;
  onProgress?: (message: string) => void;
  onError?: (error: Error | string) => void;
  onComplete?: () => void;
}

/**
 * Native, direct printing of the ORIGINAL uploaded PDF.
 * Uses a temporary Blob URL of the original file and an invisible print iframe.
 *
 * This completely avoids:
 * - opening blank popups
 * - converting PDF pages to PNG/Canvas
 * - waiting for slow image rendering
 * - altering the original document quality or formatting
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

  onProgress?.('Preparando impresión...');

  let blobUrl = '';
  let shouldRevoke = false;

  try {
    if (file instanceof Blob) {
      blobUrl = URL.createObjectURL(file);
      shouldRevoke = true;
    } else if (file instanceof ArrayBuffer) {
      const blob = new Blob([file], { type: 'application/pdf' });
      blobUrl = URL.createObjectURL(blob);
      shouldRevoke = true;
    } else if (typeof file === 'string') {
      blobUrl = file;
    } else {
      throw new Error('Tipo de archivo no compatible');
    }

    // Remove any previously created print iframe
    const oldIframe = document.getElementById('sigel-native-pdf-print-iframe');
    if (oldIframe) {
      oldIframe.remove();
    }

    // Create a hidden iframe dedicated to loading and printing the original PDF
    const iframe = document.createElement('iframe');
    iframe.id = 'sigel-native-pdf-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.border = 'none';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    iframe.setAttribute('aria-hidden', 'true');
    iframe.title = fileName;

    let printTriggered = false;

    const cleanup = () => {
      onComplete?.();
      // Keep iframe and blob for a short window while print spooling finishes
      setTimeout(() => {
        try {
          iframe.remove();
        } catch {}
        if (shouldRevoke && blobUrl) {
          try {
            URL.revokeObjectURL(blobUrl);
          } catch {}
        }
      }, 60000);
    };

    const triggerPrint = () => {
      if (printTriggered) return;
      printTriggered = true;

      try {
        if (iframe.contentWindow) {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          cleanup();
          return true;
        }
      } catch (err) {
        console.warn('Iframe contentWindow.print() restricted or blocked:', err);
      }

      // Fallback: If iframe printing is blocked by browser cross-origin policy or permissions,
      // open the original PDF blob in a new tab where user can directly print/save
      try {
        const opened = window.open(blobUrl, '_blank');
        if (opened) {
          opened.focus();
        }
      } catch (e) {
        console.warn('Window open fallback failed:', e);
      }
      cleanup();
      return false;
    };

    // When the PDF has loaded inside the iframe
    iframe.onload = () => {
      // Small timeout allows browser's built-in PDF viewer inside iframe to initialize
      setTimeout(() => {
        triggerPrint();
      }, 300);
    };

    // Fallback timer if iframe onload does not fire for application/pdf in certain browsers
    const fallbackTimer = setTimeout(() => {
      if (!printTriggered) {
        triggerPrint();
      }
    }, 1500);

    // Set src and append to DOM
    iframe.src = blobUrl;
    document.body.appendChild(iframe);
  } catch (error: any) {
    console.error('Error al preparar impresión directa:', error);
    if (shouldRevoke && blobUrl) {
      try {
        URL.revokeObjectURL(blobUrl);
      } catch {}
    }
    onError?.(error?.message || 'No se pudo preparar el documento para impresión.');
    onComplete?.();
  }
}
