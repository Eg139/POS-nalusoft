import { ScannedReceiptItem } from '../types';

export async function scanReceiptImageApi(
  imageBase64: string,
  mimeType: string
): Promise<ScannedReceiptItem[]> {
  const res = await fetch('/api/receipts/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType }),
  });

  const data = (await res.json()) as { items?: ScannedReceiptItem[]; error?: string };
  if (!res.ok) {
    throw new Error(data.error || 'Error al analizar la boleta.');
  }
  return data.items || [];
}
