import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const thumbnailCache = new Map<string, string>();
const inFlightCache = new Map<string, Promise<string | null>>();

export { pdfjsLib };

export async function disposePdfDocument(pdf: PDFDocumentProxy): Promise<void> {
  const maybe = pdf as PDFDocumentProxy & { destroy?: () => Promise<void> };
  if (typeof maybe.destroy === 'function') {
    await maybe.destroy();
  } else if (typeof pdf.cleanup === 'function') {
    await pdf.cleanup();
  }
}

export async function renderPdfCoverThumbnail(
  pdfUrl: string,
  pageNumber = 1
): Promise<string | null> {
  const cacheKey = `${pdfUrl}::${pageNumber}`;
  const cached = thumbnailCache.get(cacheKey);
  if (cached) return cached;

  const existingPromise = inFlightCache.get(cacheKey);
  if (existingPromise) return existingPromise;

  const task = (async () => {
    try {
      const loadingTask = pdfjsLib.getDocument({
        url: pdfUrl,
        disableAutoFetch: true,
        disableStream: false,
      });
      const pdf = await loadingTask.promise;
      const safePage = Math.min(Math.max(1, pageNumber), pdf.numPages);
      const page = await pdf.getPage(safePage);
      const baseViewport = page.getViewport({ scale: 1 });
      const targetWidth = 420;
      const scale = targetWidth / baseViewport.width;
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        await disposePdfDocument(pdf);
        return null;
      }

      await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      const dataUrl = canvas.toDataURL('image/jpeg', 0.86);
      thumbnailCache.set(cacheKey, dataUrl);
      await disposePdfDocument(pdf);
      return dataUrl;
    } catch {
      return null;
    } finally {
      inFlightCache.delete(cacheKey);
    }
  })();

  inFlightCache.set(cacheKey, task);
  return task;
}
