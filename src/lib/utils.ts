/**
 * RAYVEN - Utility Functions
 */

export function cn(...classes: (string | boolean | undefined | null | { [key: string]: boolean })[]): string {
  const result: string[] = [];
  for (const item of classes) {
    if (!item) continue;
    if (typeof item === 'string') {
      result.push(item);
    } else if (typeof item === 'object') {
      for (const [key, value] of Object.entries(item)) {
        if (value) result.push(key);
      }
    }
  }
  return result.join(' ');
}

export function formatCurrency(amount: number, currency: string = 'BDT'): string {
  const safeAmount = Number(amount) || 0;
  if (currency === 'BDT') {
    return `৳${safeAmount.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);
}

export function formatDate(dateString: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  };
  return new Intl.DateTimeFormat('en-US', defaultOptions).format(date);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `RYV-${timestamp}-${random}`;
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
