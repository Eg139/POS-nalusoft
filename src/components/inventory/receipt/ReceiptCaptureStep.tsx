import React, { useRef } from 'react';
import { Camera, Upload, Sparkles, AlertCircle, RotateCcw, Loader2, Image as ImageIcon } from 'lucide-react';
import { ReceiptScanStep } from '../../../types';

interface ReceiptCaptureStepProps {
  step: ReceiptScanStep;
  previewUrl: string | null;
  error: string | null;
  isCameraActive: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onCaptureCamera: () => void;
  onFileSelect: (file: File | null) => void;
  onAnalyze: () => void;
  onReset: () => void;
}

export const ReceiptCaptureStep: React.FC<ReceiptCaptureStepProps> = ({
  step,
  previewUrl,
  error,
  isCameraActive,
  videoRef,
  onStartCamera,
  onStopCamera,
  onCaptureCamera,
  onFileSelect,
  onAnalyze,
  onReset,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const isScanning = step === 'scanning';

  return (
    <div className="p-6 space-y-5">
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {isCameraActive ? (
        <div className="space-y-3">
          <div className="relative bg-slate-950 rounded-xl overflow-hidden aspect-video border border-slate-800">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onStopCamera}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              Cancelar Cámara
            </button>
            <button
              type="button"
              onClick={onCaptureCamera}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
            >
              <Camera className="w-4 h-4" />
              <span>Capturar Foto</span>
            </button>
          </div>
        </div>
      ) : previewUrl ? (
        <div className="space-y-4">
          <div className="relative bg-slate-100 rounded-xl border border-slate-200 overflow-hidden max-h-[340px] flex items-center justify-center">
            <img src={previewUrl} alt="Vista previa de boleta" className="max-h-[340px] w-auto object-contain" />
            {isScanning && (
              <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-[2px] flex flex-col items-center justify-center text-white gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                <p className="text-sm font-bold">Analizando comprobante con Gemini 2.5 Flash...</p>
                <p className="text-xs text-slate-300">Extrayendo productos, cantidades, costos y códigos</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              disabled={isScanning}
              onClick={onReset}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Cambiar Imagen</span>
            </button>

            <button
              type="button"
              disabled={isScanning}
              onClick={onAnalyze}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 rounded-lg shadow-xs"
            >
              {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{isScanning ? 'Procesando...' : 'Extraer Productos con IA'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-slate-300 hover:border-emerald-400 rounded-2xl p-8 text-center bg-slate-50/70 transition-colors space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <ImageIcon className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Sube o fotografía la boleta del proveedor</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              La IA detectará los artículos, cantidades, precios de costo y códigos para que los revises antes de actualizar el stock.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs"
            >
              <Upload className="w-4 h-4" />
              <span>Subir Archivo / Foto</span>
            </button>

            <button
              type="button"
              onClick={onStartCamera}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-xl"
            >
              <Camera className="w-4 h-4" />
              <span>Usar Cámara en Vivo</span>
            </button>

            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="sm:hidden flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl"
            >
              <Camera className="w-4 h-4" />
              <span>Cámara del Dispositivo</span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
          />
        </div>
      )}
    </div>
  );
};
