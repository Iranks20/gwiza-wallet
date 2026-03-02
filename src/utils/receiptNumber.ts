/**
 * Format a transaction/receipt identifier as a standard ascending invoice-style number
 * (e.g. 001, 002, 000001, 000002) like health and billing systems use.
 * @param id - Transaction ID string (e.g. "TXN-001842") or numeric ID
 * @param width - Zero-pad to this many digits (default 6 → 000001, 000002)
 */
export function formatReceiptNumber(id: string | number, width = 6): string {
  let num: number
  if (typeof id === 'number') {
    num = id
  } else {
    const match = String(id).replace(/\D/g, '')
    num = match ? parseInt(match, 10) : 0
  }
  if (!Number.isFinite(num) || num < 0) num = 0
  return String(num).padStart(width, '0')
}
