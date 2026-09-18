/**
 * RAYVEN - Validation Architecture & Schemas
 * Type-safe input validations for forms, API endpoints, and business rules
 */

export interface ValidationResult<T = unknown> {
  isValid: boolean;
  errors: Record<string, string>;
  data?: T;
}

export const ValidationPatterns = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^\+?[0-9\s\-()]{7,20}$/,
  SKU: /^[A-Z0-9]{3,10}-[A-Z0-9]{2,6}-[A-Z0-9]{1,4}$/,
  POSTAL_CODE: /^[A-Z0-9\s-]{3,10}$/i,
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/,
};

export function validateEmail(email: string): string | null {
  if (!email || !email.trim()) return 'Email address is required.';
  if (!ValidationPatterns.EMAIL.test(email.trim())) return 'Please enter a valid email address.';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required.';
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return 'Password must contain uppercase, lowercase, and numeric characters.';
  }
  return null;
}

export function validateRequired(value: string | number | undefined | null, fieldName: string): string | null {
  if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required.`;
  }
  return null;
}

export function validatePrice(value: number | string): string | null {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return 'Price must be a valid number.';
  if (num < 0) return 'Price cannot be negative.';
  return null;
}

export function validateStock(value: number | string): string | null {
  const num = typeof value === 'string' ? parseInt(value, 10) : value;
  if (isNaN(num) || !Number.isInteger(num)) return 'Stock quantity must be a whole integer.';
  if (num < 0) return 'Stock cannot be negative.';
  return null;
}

export function validateSKU(sku: string): string | null {
  if (!sku || !sku.trim()) return 'SKU identifier is required.';
  if (sku.length < 4 || sku.length > 32) return 'SKU must be between 4 and 32 characters.';
  return null;
}

export interface AddressFormData {
  recipientName: string;
  street1: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export function validateAddress(data: AddressFormData): ValidationResult<AddressFormData> {
  const errors: Record<string, string> = {};

  const nameErr = validateRequired(data.recipientName, 'Recipient full name');
  if (nameErr) errors.recipientName = nameErr;

  const streetErr = validateRequired(data.street1, 'Street address');
  if (streetErr) errors.street1 = streetErr;

  const cityErr = validateRequired(data.city, 'City');
  if (cityErr) errors.city = cityErr;

  const postalErr = validateRequired(data.postalCode, 'Postal code');
  if (postalErr) errors.postalCode = postalErr;

  const countryErr = validateRequired(data.country, 'Country');
  if (countryErr) errors.country = countryErr;

  if (data.phone && !ValidationPatterns.PHONE.test(data.phone.trim())) {
    errors.phone = 'Please provide a valid phone number.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data,
  };
}
