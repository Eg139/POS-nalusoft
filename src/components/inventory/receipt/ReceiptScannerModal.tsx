import React from 'react';
import { X, ScanLine, ArrowLeft, Check } from 'lucide-react';
import { Product, ReceiptImportSummary, StoreMode } from '../../../types';
import { useReceiptScanner } from '../../../hooks/useReceiptScanner';
import { ReceiptCaptureStep } from './ReceiptCaptureStep';
import { ReceiptReviewTable } from './ReceiptReviewTable';

interface ReceiptScannerModalProps {
  products: Product[];
  storeMode: StoreMode;
  onImported: (summary: ReceiptImportSummary) => void;
  onClose: () => void;
}

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({
  products,
  storeMode,
  onImported,
  onClose,
}) => {
  const {
    step, setStep, previewUrl, items, error, isCameraActive, videoRef,
    startCamera, stopCamera, captureFromCamera, handleFileSelect,
    scanReceipt, updateRow, removeRow, addEmptyRow, toggleAll, confirmImport, resetScanner,
  } = useReceiptScanner(products, storeMode, onImported);

  const selectedValidCount = items.filter((i) => i.selected && i.name.trim().length > 0 && i.quantity > 0).length;

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <ScanLine className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-base">Escaneo de Boletas con IA</h3>
              <p className="text-xs text-slate-400">
                {step === 'review'
                  ? 'Paso 2: Revisión humana previa al ingreso de stock'
                  : 'Paso 1: Captura de factura o remito de proveedor'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {step === 'review' ? (
            <ReceiptReviewTable
              items={items}
              onUpdateRow={updateRow}
              onRemoveRow={removeRow}
              onAddRow={addEmptyRow}
              onToggleAll={toggleAll}
            />
          ) : (
            <ReceiptCaptureStep
              step={step}
              previewUrl={previewUrl}
              error={error}
              isCameraActive={isCameraActive}
              videoRef={videoRef}
              onStartCamera={startCamera}
              onStopCamera={stopCamera}
              onCaptureCamera={captureFromCamera}
              onFileSelect={handleFileSelect}
              onAnalyze={scanReceipt}
              onReset={resetScanner}
            />
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          {step === 'review' ? (
            <>
              <button
                type="button"
                onClick={() => setStep('capture')}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver a Imagen</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={selectedValidCount === 0}
                  onClick={confirmImport}
                  className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 rounded-xl shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirmar e Ingresar ({selectedValidCount})</span>
                </button>
              </div>
            </>
          ) : (
            <div className="ml-auto">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
