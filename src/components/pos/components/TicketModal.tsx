import React from 'react';
import { Sale, SupermarketSettings } from '../../../types';
import { Printer, Download, X, CheckCircle2, Copy } from 'lucide-react';

interface TicketModalProps {
  sale: Sale;
  settings: SupermarketSettings;
  onClose: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({ sale, settings, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadTXT = () => {
    const textContent = `
========================================
        ${settings.store_name.toUpperCase()}
========================================
RFC: ${settings.tax_id}
Dirección: ${settings.address}
Tel: ${settings.phone}
Fecha: ${new Date(sale.created_at).toLocaleString('es-MX')}
Folio: ${sale.folio}
Cajero: ${sale.cashier_name}
----------------------------------------
CANT.  DESCRIPCIÓN             TOTAL
----------------------------------------
${sale.items
  .map(
    item =>
      `${item.quantity.toString().padEnd(6)} ${item.product_name.substring(0, 18).padEnd(20)}$${item.total.toFixed(2)}`
  )
  .join('\n')}
----------------------------------------
SUBTOTAL:               $${sale.subtotal.toFixed(2)}
DESCUENTO:             -$${sale.discount.toFixed(2)}
IVA:                    $${sale.tax.toFixed(2)}
TOTAL:                  $${sale.total.toFixed(2)}
----------------------------------------
FORMA DE PAGO:          ${sale.payment_method.toUpperCase()}
IMPORTE PAGADO:         $${sale.amount_paid.toFixed(2)}
CAMBIO:                 $${sale.change.toFixed(2)}
----------------------------------------
${settings.ticket_footer}
========================================
`.trim();

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket-${sale.folio}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyText = () => {
    const textContent = `
========================================
        ${settings.store_name.toUpperCase()}
========================================
Folio: ${sale.folio}
Fecha: ${new Date(sale.created_at).toLocaleString('es-MX')}
Total: $${sale.total.toFixed(2)}
`.trim();
    navigator.clipboard.writeText(textContent);
    alert('¡Resumen del ticket copiado!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[95vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-slate-800 text-sm">Venta Completada con Éxito</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. VISTA PREVIA EN PANTALLA (Compacta, bonita y con scroll interno si es larga) */}
        <div className="p-4 bg-slate-100 flex justify-center overflow-y-auto grow">
          <div className="w-[360px] bg-white p-5 shadow-sm rounded-xl border border-slate-200 font-sans text-xs text-slate-700 space-y-3">
            {/* Cabecera Corporativa */}
            <div className="text-center pb-3 border-b border-slate-200">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-bold mb-1.5 text-sm">
                {settings.store_name.charAt(0)}
              </div>
              <h4 className="font-bold text-slate-900 text-sm tracking-tight">{settings.store_name}</h4>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">RFC: {settings.tax_id}</p>
              <p className="text-[9px] text-slate-400 mt-0.5">{settings.address}</p>
              <p className="text-[9px] text-slate-400">Tel: {settings.phone}</p>
            </div>

            {/* Datos del Comprobante */}
            <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 text-[10px] space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Folio de Venta:</span>
                <span className="font-semibold text-slate-800">{sale.folio}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Fecha y Hora:</span>
                <span className="text-slate-700">{new Date(sale.created_at).toLocaleString('es-MX')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Cajero:</span>
                <span className="text-slate-700">{sale.cashier_name}</span>
              </div>
            </div>

            {/* Tabla de Productos con Scroll en Pantalla */}
            <div>
              <div className="flex justify-between font-semibold pb-1.5 text-[9px] uppercase text-slate-400 tracking-wider border-b border-slate-200">
                <span>Descripción del Producto</span>
                <span>Importe</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-[160px] overflow-y-auto pr-1">
                {sale.items.map((item, idx) => (
                  <div key={idx} className="py-2 flex justify-between items-start text-[10px]">
                    <div className="pr-2">
                      <span className="font-semibold text-slate-800">{item.product_name}</span>
                      <div className="text-[9px] text-slate-500 mt-0.5">
                        {item.quantity} {item.unit} x ${(item.total / item.quantity).toFixed(2)}
                      </div>
                      {item.selected_flavors && item.selected_flavors.length > 0 && (
                        <div className="text-[9px] text-pink-600 font-medium italic mt-0.5">
                          Sabores: {item.selected_flavors.map((f) => `${f.flavor_name} (${f.grams}g)`).join(', ')}
                        </div>
                      )}
                      {item.discount_percent > 0 && (
                        <span className="inline-block mt-0.5 px-1 py-0.2 bg-emerald-50 text-emerald-600 text-[8px] font-semibold rounded">
                          Desc. {item.discount_percent}%
                        </span>
                      )}
                    </div>
                    <span className="font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                      ${item.total.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totales y Bloque Financiero */}
            <div className="pt-2 border-t border-slate-200 space-y-1 text-[10px]">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="tabular-nums font-medium text-slate-700">${sale.subtotal.toFixed(2)}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Descuento aplicado</span>
                  <span className="tabular-nums">-${sale.discount.toFixed(2)}</span>
                </div>
              )}
              {sale.tax > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>IVA Trasladado</span>
                  <span className="tabular-nums font-medium text-slate-700">${sale.tax.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-bold text-slate-900 pt-1.5 border-t border-slate-200">
                <span>Total a Pagar</span>
                <span className="tabular-nums text-indigo-600">${sale.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Forma de Pago */}
            <div className="bg-indigo-50/50 rounded-lg p-2.5 border border-indigo-100 text-[10px] space-y-0.5 text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-500">Método de Pago:</span>
                <span className="font-bold text-indigo-900 uppercase">{sale.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Importe Recibido:</span>
                <span className="tabular-nums">${sale.amount_paid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cambio Entregado:</span>
                <span className="tabular-nums font-semibold text-slate-800">${sale.change.toFixed(2)}</span>
              </div>
            </div>

            {/* Pie de Página */}
            <div className="text-center pt-1.5 border-t border-dashed border-slate-200">
              <p className="text-[9px] font-mono tracking-widest text-slate-400 bg-slate-50 py-0.5 rounded">
                REF: {sale.folio}
              </p>
              <p className="text-[9px] text-slate-400 mt-1.5 leading-relaxed italic">
                {settings.ticket_footer}
              </p>
            </div>
          </div>
        </div>

        {/* 2. VERSIÓN EXCLUSIVA PARA PDF / HOJA CARTA (Formato limpio y formal al imprimir) */}
        <div className="hidden print:block w-[210mm] min-h-[297mm] bg-white p-12 font-sans text-slate-800 space-y-6 mx-auto">
          
          {/* Cabecera del Documento */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{settings.store_name}</h1>
              <p className="text-sm text-slate-500 mt-1">RFC: {settings.tax_id}</p>
              <p className="text-xs text-slate-400 mt-0.5">{settings.address}</p>
              <p className="text-xs text-slate-400">Tel: {settings.phone}</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-sm rounded-lg border border-indigo-100">
                COMPROBANTE DE VENTA
              </span>
              <p className="text-sm font-bold text-slate-800 mt-2">Folio: {sale.folio}</p>
              <p className="text-xs text-slate-500 mt-0.5">Fecha: {new Date(sale.created_at).toLocaleString('es-MX')}</p>
              <p className="text-xs text-slate-500">Cajero: {sale.cashier_name}</p>
            </div>
          </div>

          {/* Tabla de Productos Estilizada y Clara */}
          <div className="pt-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-400 tracking-wider">
                  <th className="pb-3 font-semibold">Descripción del Producto</th>
                  <th className="pb-3 font-semibold text-center">Cantidad</th>
                  <th className="pb-3 font-semibold text-right">Precio Unit.</th>
                  <th className="pb-3 font-semibold text-right">Importe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {sale.items.map((item, idx) => (
                  <tr key={idx} className="py-3">
                    <td className="py-3 pr-4">
                      <span className="font-bold text-slate-900">{item.product_name}</span>
                      {item.selected_flavors && item.selected_flavors.length > 0 && (
                        <div className="text-xs text-pink-600 font-medium italic mt-0.5">
                          Sabores: {item.selected_flavors.map((f) => `${f.flavor_name} (${f.grams}g)`).join(', ')}
                        </div>
                      )}
                      {item.discount_percent > 0 && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded">
                          Descuento: {item.discount_percent}%
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-center text-slate-600">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-3 text-right text-slate-600 tabular-nums">
                      ${(item.total / item.quantity).toFixed(2)}
                    </td>
                    <td className="py-3 text-right font-bold text-slate-900 tabular-nums">
                      ${item.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bloque de Totales y Método de Pago */}
          <div className="flex justify-between items-start pt-6 border-t border-slate-200">
            <div className="w-1/2 text-xs text-slate-500 space-y-1">
              <p><strong className="text-slate-700">Método de Pago:</strong> {sale.payment_method.toUpperCase()}</p>
              <p><strong className="text-slate-700">Importe Recibido:</strong> ${sale.amount_paid.toFixed(2)}</p>
              <p><strong className="text-slate-700">Cambio Entregado:</strong> ${sale.change.toFixed(2)}</p>
              <div className="pt-4 italic text-slate-400">
                {settings.ticket_footer}
              </div>
            </div>

            <div className="w-56 space-y-2 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="tabular-nums font-medium">${sale.subtotal.toFixed(2)}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Descuento:</span>
                  <span className="tabular-nums">-${sale.discount.toFixed(2)}</span>
                </div>
              )}
              {sale.tax > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>IVA:</span>
                  <span className="tabular-nums font-medium">${sale.tax.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total:</span>
                <span className="tabular-nums text-indigo-600">${sale.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-col gap-2 p-3 bg-white border-t border-slate-200 shrink-0">
          <div className="flex items-center justify-between">
            <button
              onClick={handleDownloadTXT}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar TXT
            </button>
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              Copiar Resumen
            </button>
          </div>
          
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir / PDF
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
            >
              Cerrar y Nueva Venta
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};