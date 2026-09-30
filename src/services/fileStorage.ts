/**
 * Client-side persistence for actual document files using IndexedDB + in-memory Blob cache.
 * Ensures uploaded files persist across role switching, navigation, and page refreshes.
 */

const DB_NAME = 'sigel_documents_db_v2';
const DB_VERSION = 1;
const STORE_NAME = 'documents';

export interface StoredDoc {
  reportId: string;
  fileName: string;
  fileSize: string;
  mimeType: string;
  blob: Blob;
  updatedAt: string;
}

// In-memory cache for fast synchronous access & active Object URLs
const blobCache = new Map<string, Blob>();
const urlCache = new Map<string, string>();
const fileInstanceCache = new Map<string, File | Blob>();

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'reportId' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });

  return dbPromise;
}

/**
 * Creates a valid, well-formed standard PDF 1.4 binary Blob with institutional header.
 * Used for initial demo reports so they are real, native, readable PDFs right out of the box.
 */
export function createStandardPdfBlob(
  title: string,
  commission: string,
  delegate: string,
  district: string,
  date: string,
  summary: string
): Blob {
  // Sanitize text for PDF ASCII encoding
  const clean = (str: string) =>
    str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[\(\)\\\r]/g, '');

  const cTitle = clean(title);
  const cCommission = clean(commission);
  const cDelegate = clean(delegate);
  const cDistrict = clean(district);
  const cDate = clean(date);
  const cSummary = clean(summary);

  const streamContent = `BT
/F1 15 Tf
50 780 Td
(REPUBLICA DOMINICANA - MINISTERIO DE EDUCACION (MINERD)) Tj
/F1 11 Tf
0 -18 Td
(Programa de Liderazgo Educativo (PLE-RD) - Regional de Educacion 10) Tj
/F2 13 Tf
0 -22 Td
(MODELO DE LAS NACIONES UNIDAS REGIONAL - MONUR XVIII) Tj
/F2 12 Tf
0 -20 Td
(ACTA OFICIAL DE EVALUACION Y CONTROL (EYC)) Tj
/F1 10 Tf
0 -24 Td
(Comision Evaluada: ${cCommission}) Tj
0 -15 Td
(Distrito Educativo: ${cDistrict}) Tj
0 -15 Td
(Oficial EYC Radicador: ${cDelegate}) Tj
0 -15 Td
(Fecha y Hora de Radicacion: ${cDate}) Tj
/F2 11 Tf
0 -24 Td
(I. VERIFICACION DE CUORUM Y PROCEDIMIENTO PARLAMENTARIO) Tj
/F1 10 Tf
0 -15 Td
(Se certifica que la mesa directiva y las delegaciones cumplieron con el pase de lista reglamentario,) Tj
0 -13 Td
(alcanzando el 100% de participacion de los paises miembros acreditados en la sesion plenaria.) Tj
0 -13 Td
(El debate formal e informal se condujo en estricto apego a las normas diplomaticas.) Tj
/F2 11 Tf
0 -24 Td
(II. RESUMEN EJECUTIVO DEL INFORME) Tj
/F1 10 Tf
0 -15 Td
(${cSummary.substring(0, 100)}) Tj
0 -13 Td
(${cSummary.substring(100, 200) || 'Resoluciones debatidas y acordadas con consenso de las delegaciones participantes.'}) Tj
/F2 11 Tf
0 -24 Td
(III. RUBRICA INSTITUCIONAL DE CONTROL) Tj
/F1 10 Tf
0 -15 Td
(- Rigor y Procedimiento Parlamentario: 98 / 100 (Excelente)) Tj
0 -13 Td
(- Manejo de Tiempos y Mociones: 95 / 100 (Sobresaliente)) Tj
0 -13 Td
(- Calidad de Resoluciones Aprobadas: 97 / 100 (Conforme)) Tj
0 -13 Td
(- Disciplina y Etica Diplomatica: 100 / 100 (Impecable)) Tj
/F2 11 Tf
0 -28 Td
(IV. REFRENDO Y SELLOS DIGITALES) Tj
/F1 9 Tf
0 -16 Td
(Firma Digital: Oficial EYC [${cDelegate}] - Radicado en Plataforma SIGEL CELIDER 10) Tj
0 -14 Td
(Sello Criptografico SHA-256: 9e4f2a7b1c8d3e5f0a2b4c6d8e1f3a5b7c9d0e2f) Tj
0 -14 Td
(Estado: Documento Original Emitido para Revision de Subsecretaria y Secretaria General) Tj
ET`;

  const streamBytes = new TextEncoder().encode(streamContent);
  const streamLength = streamBytes.length;

  const pdfParts: string[] = [
    '%PDF-1.4\n',
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n',
    `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n',
  ];

  // Build xref
  let currentOffset = 0;
  const offsets: number[] = [0]; // obj 0

  for (let i = 0; i < pdfParts.length; i++) {
    offsets.push(currentOffset);
    currentOffset += new TextEncoder().encode(pdfParts[i]).length;
  }

  let xref = `xref\n0 7\n0000000000 65535 f \n`;
  for (let i = 1; i <= 6; i++) {
    xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  const trailer = `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${currentOffset}\n%%EOF\n`;

  pdfParts.push(xref);
  pdfParts.push(trailer);

  return new Blob(pdfParts, { type: 'application/pdf' });
}

export class FileStorageService {
  /**
   * Saves a document file (File or Blob) for a specific reportId into IndexedDB and cache.
   */
  static async saveFile(reportId: string, file: File | Blob, fileName: string): Promise<string> {
    const sizeStr =
      file.size >= 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${(file.size / 1024).toFixed(1)} KB`;

    // Revoke previous object URL if any
    const oldUrl = urlCache.get(reportId);
    if (oldUrl) {
      try {
        URL.revokeObjectURL(oldUrl);
      } catch {}
    }

    const mimeType = file.type || 'application/pdf';
    const blob = file instanceof Blob ? file : new Blob([file], { type: mimeType });
    const url = URL.createObjectURL(blob);

    blobCache.set(reportId, blob);
    urlCache.set(reportId, url);
    fileInstanceCache.set(reportId, file);

    try {
      const db = await getDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      const record: StoredDoc = {
        reportId,
        fileName,
        fileSize: sizeStr,
        mimeType: blob.type || 'application/pdf',
        blob,
        updatedAt: new Date().toISOString(),
      };

      store.put(record);
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('Could not persist file to IndexedDB, stored in memory cache:', err);
    }

    return url;
  }

  /**
   * Gets the active Object URL for a report's document.
   * Checks in-memory cache first, then IndexedDB.
   */
  static async getFileUrl(reportId: string): Promise<string | null> {
    if (urlCache.has(reportId)) {
      return urlCache.get(reportId)!;
    }

    try {
      const db = await getDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(reportId);

      const result = await new Promise<StoredDoc | undefined>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      if (result && result.blob) {
        blobCache.set(reportId, result.blob);
        const newUrl = URL.createObjectURL(result.blob);
        urlCache.set(reportId, newUrl);
        return newUrl;
      }
    } catch (err) {
      console.warn('Error reading from IndexedDB:', err);
    }

    return null;
  }

  /**
   * Synchronous check in in-memory cache.
   */
  static getCachedUrl(reportId: string): string | null {
    return urlCache.get(reportId) || null;
  }

  /**
   * Gets the raw Blob for a report.
   */
  static async getBlob(reportId: string): Promise<Blob | null> {
    if (blobCache.has(reportId)) {
      return blobCache.get(reportId)!;
    }

    try {
      const db = await getDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(reportId);

      const result = await new Promise<StoredDoc | undefined>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      if (result && result.blob) {
        blobCache.set(reportId, result.blob);
        return result.blob;
      }
    } catch {}

    return null;
  }

  /**
   * Gets the File or Blob instance for a report.
   * Checks in-memory cache first, then fetches Blob from IndexedDB.
   */
  static async getFile(reportId: string): Promise<File | Blob | null> {
    if (fileInstanceCache.has(reportId)) {
      return fileInstanceCache.get(reportId)!;
    }
    const blob = await this.getBlob(reportId);
    if (blob) {
      fileInstanceCache.set(reportId, blob);
      return blob;
    }
    return null;
  }

  static getCachedFile(reportId: string): File | Blob | null {
    return fileInstanceCache.get(reportId) || null;
  }

  /**
   * Seeds default demo reports with real standard PDF files if not already present.
   */
  static async seedDemoFilesIfMissing(): Promise<void> {
    const demo1Id = 'rep-eyc-disec-001';
    const demo2Id = 'rep-eyc-ddhh-002';

    const url1 = await this.getFileUrl(demo1Id);
    if (!url1) {
      const blob1 = createStandardPdfBlob(
        'Informe Final DISEC MONUR XVIII',
        'Comisión EYC de Desarme y Seguridad Internacional (DISEC)',
        'Comisión EYC DISEC',
        'Distrito Educativo 10-01',
        '2026-09-30 09:30',
        'Informe final de evaluación protocolar de DISEC. Verificación de quórum de 28 delegaciones, debate de resolución sobre desarme nuclear y control de armas convencionales. Apego pleno al reglamento parlamentario.'
      );
      await this.saveFile(demo1Id, blob1, 'Informe_Final_DISEC_MONUR_XVIII.pdf');
    }

    const url2 = await this.getFileUrl(demo2Id);
    if (!url2) {
      const blob2 = createStandardPdfBlob(
        'Acta Final Comisión Derechos Humanos',
        'Consejo EYC de Derechos Humanos (CDH)',
        'Comisión EYC Derechos Humanos',
        'Distrito Educativo 10-03',
        '2026-09-30 08:45',
        'Acta y evaluación final de las sesiones del Consejo de Derechos Humanos. 32 delegaciones participantes, 2 proyectos de resolución aprobados por mayoría calificada. Auditoría protocolar conforme.'
      );
      await this.saveFile(demo2Id, blob2, 'Acta_Final_Comision_Derechos_Humanos.pdf');
    }
  }
}
