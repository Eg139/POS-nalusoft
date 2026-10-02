import React from 'react';
import { Sale, SupermarketSettings } from '../../types';
import { Printer, Download, X, CheckCircle2 } from 'lucide-react';

interface TicketModalProps {
  sale: Sale;
  settings: SupermarketSettings;
  onClose: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({ sale, settings, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
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
      `${item.quantity.toString().padEnd(6)} ${item.product_name.substring(0, 18).padEnd(20)} $${item.total.toFixed(2)}`
  )
  .join('\n')}
----------------------------------------
SUBTOTAL:              $${sale.subtotal.toFixed(2)}
DESCUENTO:             -$${sale.discount.toFixed(2)}
IVA:                   $${sale.tax.toFixed(2)}
TOTAL:                 $${sale.total.toFixed(2)}
----------------------------------------
FORMA DE PAGO:         ${sale.payment_method.toUpperCase()}
IMPORTE PAGADO:        $${sale.amount_paid.toFixed(2)}
CAMBIO:                $${sale.change.toFixed(2)}
----------------------------------------
${settings.ticket_footer}
========================================
`;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket-${sale.folio}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden flex flex-col my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-slate-800 text-base">Venta Completada con Éxito</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Ticket Preview */}
        <div className="p-6 bg-slate-100 flex justify-center">
          <div
            id="pos-receipt-print"
            className="w-72 bg-white p-5 border border-slate-300 shadow-xs font-mono text-xs text-slate-800 leading-relaxed"
          >
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <p className="font-bold text-sm tracking-wide">{settings.store_name}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">RFC: {settings.tax_id}</p>
              <p className="text-[10px] text-slate-500">{settings.address}</p>
              <p className="text-[10px] text-slate-500">Tel: {settings.phone}</p>
            </div>

            <div className="py-2 border-b border-dashed border-slate-300 text-[11px] text-slate-600 space-y-0.5">
              <div className="flex justify-between">
                <span>Folio:</span>
                <span className="font-bold text-slate-800">{sale.folio}</span>
              </div>
              <div className="flex justify-between">
                <span>Fecha:</span>
                <span>{new Date(sale.created_at).toLocaleDateString('es-MX')}</span>
              </div>
              <div className="flex justify-between">
                <span>Hora:</span>
                <span>{new Date(sale.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex justify-between">
                <span>Cajero:</span>
                <span>{sale.cashier_name}</span>
              </div>
            </div>

            {/* Items */}
            <div className="py-3 border-b border-dashed border-slate-300">
              <div className="flex justify-between font-semibold pb-1.5 text-[10px] uppercase text-slate-500">
                <span>Cant. / Prod</span>
                <span>Importe</span>
              </div>
              <div className="space-y-1.5">
                {sale.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start text-[11px]">
                    <div className="pr-2 max-w-[190px]">
                      <span className="font-semibold text-slate-900">{item.quantity} {item.unit}</span>{' '}
                      <span className="text-slate-700">{item.product_name}</span>
                      {item.selected_flavors && item.selected_flavors.length > 0 && (
                        <div className="text-[9px] text-pink-700 italic pl-1 border-l border-pink-300 my-0.5">
                          Sabores: {item.selected_flavors.map((f) => `${f.flavor_name} (${f.grams}g)`).join(', ')}
                        </div>
                      )}
                      {item.discount_percent > 0 && (
                        <span className="block text-[9px] text-emerald-600">Desc. {item.discount_percent}%</span>
                      )}
                    </div>
                    <span className="font-medium tabular-nums text-slate-900 whitespace-nowrap">
                      ${item.total.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Totals */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="tabular-nums">${sale.subtotal.toFixed(2)}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Descuento aplicado:</span>
                  <span className="tabular-nums">-${sale.discount.toFixed(2)}</span>
                </div>
              )}
              {sale.tax > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>IVA Trasladado:</span>
                  <span className="tabular-nums">${sale.tax.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                <span>TOTAL:</span>
                <span className="tabular-nums">${sale.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Info */}
            <div className="py-2 border-b border-dashed border-slate-300 text-[10px] space-y-0.5 text-slate-600">
              <div className="flex justify-between">
                <span>Método de pago:</span>
                <span className="font-semibold uppercase text-slate-800">{sale.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span>Pagado:</span>
                <span className="tabular-nums font-semibold">${sale.amount_paid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cambio:</span>
                <span className="tabular-nums font-semibold text-slate-800">${sale.change.toFixed(2)}</span>
              </div>
            </div>

            {/* Barcode & Footer */}
            <div className="text-center pt-3">
              <div className="inline-block py-1 px-3 bg-slate-100 rounded text-[10px] tracking-widest font-mono text-slate-700">
                *{sale.folio}*
              </div>
              <p className="text-[9px] text-slate-500 mt-2 leading-tight">
                {settings.ticket_footer}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between p-4 bg-white border-t border-slate-200">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Descargar TXT
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              Imprimir Ticket
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
            >
              Cerrar y Nueva Venta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
