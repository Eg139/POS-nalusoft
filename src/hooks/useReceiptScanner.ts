import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Product,
  ReceiptImportSummary,
  ReceiptReviewItem,
  ReceiptScanStep,
  ScannedReceiptItem,
  StoreMode,
} from '../types';
import { StorageService } from '../services/storageService';
import { scanReceiptImageApi } from '../services/receiptApiService';

interface ImagePayload {
  base64: string;
  mimeType: string;
}

const findMatchedProduct = (item: ScannedReceiptItem, catalog: Product[]): Product | undefined => {
  const cleanCode = item.barcode.trim().toLowerCase();
  if (cleanCode) {
    const byCode = catalog.find((p) => p.barcode.trim().toLowerCase() === cleanCode);
    if (byCode) return byCode;
  }
  const cleanName = item.name.trim().toLowerCase();
  return catalog.find((p) => p.name.trim().toLowerCase() === cleanName);
};

export const useReceiptScanner = (
  products: Product[],
  storeMode: StoreMode,
  onImported: (summary: ReceiptImportSummary) => void
) => {
  const [step, setStep] = useState<ReceiptScanStep>('capture');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imagePayload, setImagePayload] = useState<ImagePayload | null>(null);
  const [items, setItems] = useState<ReceiptReviewItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const startCamera = useCallback(async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('El navegador no permite acceso directo a la cámara. Usa la carga de archivo.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setIsCameraActive(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      });
    } catch {
      setError('No se pudo acceder a la cámara. Verifica los permisos o sube una imagen.');
    }
  }, []);

  const captureFromCamera = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setPreviewUrl(dataUrl);
    setImagePayload({ base64: dataUrl, mimeType: 'image/jpeg' });
    stopCamera();
  }, [stopCamera]);

  const handleFileSelect = useCallback((file: File | null) => {
    if (!file) return;
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (!result) {
        setError('No se pudo leer la imagen seleccionada.');
        return;
      }
      setPreviewUrl(result);
      setImagePayload({ base64: result, mimeType: file.type || 'image/jpeg' });
    };
    reader.readAsDataURL(file);
  }, []);

  const scanReceipt = useCallback(async () => {
    if (!imagePayload) {
      setError('Selecciona o captura una foto de la boleta primero.');
      return;
    }
    setError(null);
    setStep('scanning');
    try {
      const scannedItems = await scanReceiptImageApi(imagePayload.base64, imagePayload.mimeType);
      const defaultCategory = storeMode === 'heladeria' ? 'Insumos y Utilidades' : 'Otros';
      const mapped: ReceiptReviewItem[] = scannedItems.map((raw, idx) => {
        const matched = findMatchedProduct(raw, products);
        return {
          tempId: `scan-${Date.now()}-${idx}`,
          selected: true,
          name: matched ? matched.name : raw.name,
          quantity: raw.quantity,
          cost_price: raw.cost_price,
          barcode: raw.barcode || matched?.barcode || '',
          matchedProductId: matched?.id,
          matchedProductName: matched?.name,
          currentStock: matched?.stock,
          sale_price: matched?.sale_price ?? Number((raw.cost_price * 1.35).toFixed(2)),
          category: matched?.category || defaultCategory,
          unit: matched?.unit || 'pz',
        };
      });

      if (mapped.length === 0) {
        setError('No se detectaron productos legibles en la boleta. Intenta con una foto más nítida.');
        setStep('capture');
        return;
      }
      setItems(mapped);
      setStep('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fallo inesperado al escanear la boleta.');
      setStep('capture');
    }
  }, [imagePayload, products, storeMode]);

  const updateRow = useCallback(
    <K extends keyof ReceiptReviewItem>(tempId: string, field: K, value: ReceiptReviewItem[K]) => {
      setItems((prev) =>
        prev.map((row) => (row.tempId === tempId ? { ...row, [field]: value } : row))
      );
    },
    []
  );

  const removeRow = useCallback((tempId: string) => {
    setItems((prev) => prev.filter((row) => row.tempId !== tempId));
  }, []);

  const addEmptyRow = useCallback(() => {
    const defaultCategory = storeMode === 'heladeria' ? 'Insumos y Utilidades' : 'Otros';
    setItems((prev) => [
      ...prev,
      {
        tempId: `manual-${Date.now()}`,
        selected: true,
        name: '',
        quantity: 1,
        cost_price: 0,
        barcode: '',
        sale_price: 0,
        category: defaultCategory,
        unit: 'pz',
      },
    ]);
  }, [storeMode]);

  const toggleAll = useCallback((checked: boolean) => {
    setItems((prev) => prev.map((row) => ({ ...row, selected: checked })));
  }, []);

  const confirmImport = useCallback(() => {
    const summary = StorageService.applyReceiptImport(items);
    onImported(summary);
  }, [items, onImported]);

  const resetScanner = useCallback(() => {
    stopCamera();
    setStep('capture');
    setPreviewUrl(null);
    setImagePayload(null);
    setItems([]);
    setError(null);
  }, [stopCamera]);

  return {
    step, setStep, previewUrl, items, error, isCameraActive, videoRef,
    startCamera, stopCamera, captureFromCamera, handleFileSelect,
    scanReceipt, updateRow, removeRow, addEmptyRow, toggleAll, confirmImport, resetScanner,
  };
};
