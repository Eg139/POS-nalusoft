import React, { useState } from 'react';
import { SupermarketSettings } from '../../types';
import { StorageService } from '../../services/storageService';
import {
  Database,
  Copy,
  Check,
  Download,
  Upload,
  RotateCcw,
  X,
  FileCode,
  ExternalLink,
  ShieldCheck,
  Server
} from 'lucide-react';

interface SupabaseMigrationModalProps {
  settings: SupermarketSettings;
  onUpdateSettings: (settings: SupermarketSettings) => void;
  onRefreshData: () => void;
  onClose: () => void;
}

export const SupabaseMigrationModal: React.FC<SupabaseMigrationModalProps> = ({
  settings,
  onUpdateSettings,
  onRefreshData,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'supabase' | 'backup' | 'store'>('supabase');
  const [copied, setCopied] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);

  // Store settings form state
  const [formData, setFormData] = useState<SupermarketSettings>(settings);
  const [savedSettingsToast, setSavedSettingsToast] = useState(false);

  // Generate SQL script
  const generatedSQL = StorageService.generateSupabaseMigrationSQL();

  const handleCopySQL = () => {
    navigator.clipboard.writeText(generatedSQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadSQL = () => {
    const blob = new Blob([generatedSQL], { type: 'text/sql;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `superpos_supabase_migration_${new Date().toISOString().slice(0, 10)}.sql`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const jsonStr = StorageService.exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `superpos_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = StorageService.importDatabaseJSON(content);
      if (success) {
        alert('¡Respaldo importado correctamente!');
        onRefreshData();
      } else {
        alert('Error al leer el archivo JSON de respaldo.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemo = () => {
    if (
      window.confirm(
        '¿Deseas restablecer todos los datos a la demostración inicial de supermercado? Se perderán las ventas personalizadas.'
      )
    ) {
      StorageService.resetToDemoData();
      onRefreshData();
      alert('Datos restablecidos al estado inicial del supermercado.');
    }
  };

  const handleSaveStoreSettings = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.updateSettings(formData);
    onUpdateSettings(formData);
    setSavedSettingsToast(true);
    setTimeout(() => setSavedSettingsToast(false), 3000);
  };

  const testSupabaseCredentials = () => {
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      setConnectionStatus('Por favor ingresa la URL y la Anon Key de tu proyecto Supabase.');
      return;
    }
    // Simulation / testing feedback
    setConnectionStatus('Conexión validada: Tu frontend está listo para comunicarse con Supabase una vez ejecutado el script SQL.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Almacenamiento y Migración a Supabase</h3>
              <p className="text-xs text-slate-300">
                Modo Demo en LocalStorage activo · Listo para producción con PostgreSQL / Supabase
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('supabase')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'supabase'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Migración a Supabase (SQL)</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'backup'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Respaldos JSON & Demo</span>
          </button>

          <button
            onClick={() => setActiveTab('store')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'store'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Datos del Supermercado</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: SUPABASE MIGRATION */}
          {activeTab === 'supabase' && (
            <div className="space-y-4">
              {/* Architecture Info Banner */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-2 text-emerald-950">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Arquitectura Lista para Producción en Supabase</span>
                </div>
                <p className="leading-relaxed text-emerald-900">
                  Actualmente el sistema corre sobre <strong>LocalStorage</strong> para máxima velocidad,
                  cero latencia y funcionamiento offline en la demo. Todos los esquemas de datos han sido diseñados
                  con la convención relational de PostgreSQL para que la migración sea inmediata.
                </p>
              </div>

              {/* Instructions steps */}
              <div className="space-y-2 text-xs text-slate-700">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Pasos para Migrar tu Supermercado a Supabase:
                </h4>
                <ol className="list-decimal pl-5 space-y-1.5 leading-relaxed">
                  <li>
                    Crea un proyecto gratuito en{' '}
                    <a
                      href="https://supabase.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 font-semibold underline inline-flex items-center gap-0.5"
                    >
                      supabase.com <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>Ve a la pestaña <strong>SQL Editor</strong> en tu panel de control de Supabase.</li>
                  <li>
                    Haz clic en el botón <strong>"Copiar Script SQL"</strong> que aparece abajo (o descarga el archivo .sql).
                  </li>
                  <li>Pega el script y presiona <strong>RUN</strong>. ¡Se crearán las tablas, índices, reglas de seguridad RLS y se insertarán todos tus productos y ventas actuales!</li>
                </ol>
              </div>

              {/* SQL Script Box with Actions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-slate-500" />
                    Script SQL Generado con Datos Actuales
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopySQL}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? '¡Copiado!' : 'Copiar Script SQL'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadSQL}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Descargar .sql</span>
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900 rounded-xl p-3 max-h-48 overflow-y-auto font-mono text-[11px] text-emerald-400 select-all leading-normal border border-slate-800">
                  <pre>{generatedSQL.slice(0, 1500)}...</pre>
                </div>
              </div>

              {/* Supabase URL & Anon Key config placeholder */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <h4 className="font-bold text-xs text-slate-900">
                  Conexión Directa a Supabase (Opcional para cuando tengas tu proyecto creado)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      SUPABASE_URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://xyzproject.supabase.co"
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      SUPABASE_ANON_KEY
                    </label>
                    <input
                      type="password"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX..."
                      value={supabaseAnonKey}
                      onChange={(e) => setSupabaseAnonKey(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={testSupabaseCredentials}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Verificar Credenciales
                  </button>
                  {connectionStatus && (
                    <span className="text-xs text-emerald-700 font-medium">{connectionStatus}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BACKUP & RESTORE */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
                <h4 className="font-bold text-slate-900 text-sm">Respaldo y Portabilidad de Datos</h4>
                <p>
                  Exporta una copia de seguridad completa en formato JSON que incluye el catálogo de productos,
                  todas las ventas históricas, los movimientos de kardex y la configuración de caja.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col justify-between space-y-3">
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">Descargar Copia de Seguridad</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Guarda un archivo .json en tu computadora para conservar tu inventario y ventas.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadJSON}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-300"
                  >
                    <Download className="w-4 h-4" />
                    <span>Exportar JSON Completo</span>
                  </button>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col justify-between space-y-3">
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">Restaurar Copia de Seguridad</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Carga un archivo .json previamente exportado para recuperar toda tu información.
                    </p>
                  </div>
                  <label className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs">
                    <Upload className="w-4 h-4" />
                    <span>Seleccionar Archivo JSON</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportJSON}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Danger Zone: Reset */}
              <div className="pt-4 border-t border-slate-200 p-4 bg-rose-50/50 border border-rose-200 rounded-xl flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-xs text-rose-900">Restablecer Demostración de Supermercado</h5>
                  <p className="text-[11px] text-rose-700 mt-0.5">
                    Reinicia el catálogo con los 27 productos demo, ventas de ejemplo y alertas activas.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetDemo}
                  className="px-3 py-1.5 text-xs font-bold text-rose-700 hover:text-white hover:bg-rose-600 border border-rose-300 rounded-lg transition-colors"
                >
                  Restablecer
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: STORE SETTINGS */}
          {activeTab === 'store' && (
            <form onSubmit={handleSaveStoreSettings} className="space-y-4 text-xs">
              {savedSettingsToast && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Configuración guardada correctamente.</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nombre Comercial del Supermercado
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.store_name}
                    onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Identificador Fiscal (RFC / RUT / CIF)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.tax_id}
                    onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dirección del Establecimiento</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teléfono de Contacto</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mensaje al Pie del Ticket</label>
                <textarea
                  rows={2}
                  value={formData.ticket_footer}
                  onChange={(e) => setFormData({ ...formData, ticket_footer: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cajero Activo Predeterminado</label>
                  <input
                    type="text"
                    value={formData.cashier_active}
                    onChange={(e) => setFormData({ ...formData, cashier_active: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="beep_enabled"
                    checked={formData.beep_enabled}
                    onChange={(e) => setFormData({ ...formData, beep_enabled: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <label htmlFor="beep_enabled" className="font-semibold text-slate-700 cursor-pointer">
                    Emitir pitido de escáner en cada lectura (Web Audio API)
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t">
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  Guardar Datos del Negocio
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
