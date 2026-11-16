import { GoogleGenAI, Type } from '@google/genai';

export interface ScannedReceiptPayloadItem {
  name: string;
  quantity: number;
  cost_price: number;
  barcode: string;
}

const RECEIPT_RESPONSE_SCHEMA = {
  type: Type.ARRAY,
  description: 'Lista de productos extraídos de la boleta o remito del proveedor.',
  items: {
    type: Type.OBJECT,
    properties: {
      name: {
        type: Type.STRING,
        description: 'Nombre o descripción clara del producto.',
      },
      quantity: {
        type: Type.NUMBER,
        description: 'Cantidad comprada (número positivo; usar 1 si no se especifica).',
      },
      cost_price: {
        type: Type.NUMBER,
        description: 'Costo unitario de compra (número >= 0). Si solo figura total de línea, dividir por quantity.',
      },
      barcode: {
        type: Type.STRING,
        description: 'Código de barras, SKU o código interno si aparece en el documento; cadena vacía si no existe.',
      },
    },
    required: ['name', 'quantity', 'cost_price', 'barcode'],
  },
};

const SYSTEM_PROMPT = [
  'Eres un extractor contable de boletas, facturas y remitos de proveedores para un sistema POS.',
  'Extrae exclusivamente los ítems de mercadería/insumos listados en el comprobante.',
  'Ignora encabezados, subtotales, impuestos globales, formas de pago y pies de página.',
  'Devuelve siempre quantity > 0, cost_price unitario >= 0, y barcode como string (vacío si no figura).',
].join(' ');

export async function scanReceiptWithGemini(
  imageBase64: string,
  mimeType: string
): Promise<ScannedReceiptPayloadItem[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY no está configurada en el entorno del servidor.');
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
  });

  const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '').trim();
  if (!cleanBase64) {
    throw new Error('La imagen proporcionada está vacía.');
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: cleanBase64,
        },
      },
      {
        text: 'Analiza esta boleta o remito de proveedor y extrae todos los productos con nombre, cantidad, costo unitario y código.',
      },
    ],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      responseSchema: RECEIPT_RESPONSE_SCHEMA,
      temperature: 0.1,
    },
  });

  const rawText = response.text;
  if (!rawText) {
    throw new Error('El modelo no devolvió contenido analizable para la imagen.');
  }

  const parsed: unknown = JSON.parse(rawText);
  if (!Array.isArray(parsed)) {
    throw new Error('La respuesta estructurada no contiene una lista de productos.');
  }

  return parsed
    .filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === 'object')
    .map((entry) => ({
      name: String(entry.name ?? '').trim(),
      quantity: Math.max(0.001, Number(entry.quantity) || 1),
      cost_price: Math.max(0, Number(entry.cost_price) || 0),
      barcode: String(entry.barcode ?? '').trim(),
    }))
    .filter((item) => item.name.length > 0);
}
