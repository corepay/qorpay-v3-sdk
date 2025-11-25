/**
 * @file src/utils/type-guards.ts
 * @description Type guards for runtime type checking and validation
 */

import type { BaseQorPayResponse } from '../types/common';

// Import error classes for instanceof checks
import { QorPayError, QorPayApiError, QorPayNetworkError, QorPayUnknownError } from '../errors';

// Response type guards
export function isQorPayResponse(obj: unknown): obj is BaseQorPayResponse {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'status' in obj &&
    (obj.status === 'success' || obj.status === 'error')
  );
}

export function isSuccessResponse<T>(obj: unknown): obj is BaseQorPayResponse & { data: T; status: 'success' } {
  return isQorPayResponse(obj) && obj.status === 'success';
}

export function isErrorResponse(obj: unknown): obj is BaseQorPayResponse & { status: 'error' } {
  return isQorPayResponse(obj) && obj.status === 'error';
}

// Error type guards
export function isQorPayError(error: unknown): error is QorPayError {
  return error instanceof QorPayError || (error !== null && typeof error === 'object' && 'name' in error && error.name === 'QorPayError');
}

export function isQorPayApiError(error: unknown): error is QorPayApiError {
  return (
    error instanceof QorPayApiError ||
    (error !== null && typeof error === 'object' && 'name' in error && error.name === 'QorPayApiError')
  );
}

export function isQorPayNetworkError(error: unknown): error is QorPayNetworkError {
  return (
    error instanceof QorPayNetworkError ||
    (error !== null && typeof error === 'object' && 'name' in error && error.name === 'QorPayNetworkError')
  );
}

export function isQorPayUnknownError(error: unknown): error is QorPayUnknownError {
  return (
    error instanceof QorPayUnknownError ||
    (error !== null && typeof error === 'object' && 'name' in error && error.name === 'QorPayUnknownError')
  );
}

// Payment status type guards
export type PaymentStatus = 'approved' | 'declined' | 'pending' | 'voided' | 'refunded' | 'partial_refund';
export type TransactionType = 'sale' | 'authorization' | 'capture' | 'void' | 'refund' | 'credit';

export function isPaymentStatus(status: unknown): status is PaymentStatus {
  return (
    typeof status === 'string' &&
    ['approved', 'declined', 'pending', 'voided', 'refunded', 'partial_refund'].includes(status)
  );
}

export function isTransactionType(type: unknown): type is TransactionType {
  return (
    typeof type === 'string' &&
    ['sale', 'authorization', 'capture', 'void', 'refund', 'credit'].includes(type)
  );
}

// Card data type guards
export function isValidCardNumber(cardNumber: unknown): boolean {
  return (
    typeof cardNumber === 'string' &&
    /^\d{13,19}$/.test(cardNumber) &&
    luhnCheck(cardNumber)
  );
}

export function isValidExpiry(month: unknown, year: unknown): boolean {
  if (typeof month !== 'string' || typeof year !== 'string') {
    return false;
  }

  // Check if strings contain only digits
  if (!/^\d+$/.test(month) || !/^\d+$/.test(year)) {
    return false;
  }

  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;

  if (monthNum < 1 || monthNum > 12) {
    return false;
  }

  if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
    return false;
  }

  return true;
}

export function isValidCVV(cvv: unknown): boolean {
  return typeof cvv === 'string' && /^\d{3,4}$/.test(cvv);
}

// Customer data type guards
export function isValidEmail(email: unknown): boolean {
  if (typeof email !== 'string') {
    return false;
  }

  // Basic email regex - not perfect but catches most invalid formats
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhoneNumber(phone: unknown): boolean {
  if (typeof phone !== 'string') {
    return false;
  }

  // Accept various phone number formats
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

export function isValidPostalCode(postalCode: unknown, country?: string): boolean {
  if (typeof postalCode !== 'string') {
    return false;
  }

  // Country-specific postal code validation
  switch (country?.toUpperCase()) {
    case 'US':
      return /^\d{5}(-\d{4})?$/.test(postalCode);
    case 'CA':
      return /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(postalCode);
    case 'UK':
      return /^[A-Za-z]{1,2}\d[A-Za-z\d]? \d[A-Za-z]{2}$/.test(postalCode);
    default:
      // Generic postal code validation (alphanumeric, 3-10 characters)
      return /^[A-Za-z0-9\s-]{3,10}$/.test(postalCode);
  }
}

// Amount validation
export function isValidAmount(amount: unknown): boolean {
  if (typeof amount === 'number') {
    return amount > 0 && Number.isFinite(amount);
  }

  if (typeof amount === 'string') {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0 && /^\d*\.?\d{0,2}$/.test(amount);
  }

  return false;
}

// ID validation
export function isValidTransactionId(id: unknown): boolean {
  return typeof id === 'string' && /^txn_\w+$/.test(id);
}

export function isValidCustomerId(id: unknown): boolean {
  return typeof id === 'string' && /^cust_\w+$/.test(id);
}

export function isValidTokenId(id: unknown): boolean {
  return typeof id === 'string' && /^tok_\w+$/.test(id);
}

// Environment validation
export function isValidEnvironment(env: unknown): env is 'sandbox' | 'production' {
  return env === 'sandbox' || env === 'production';
}

// Pagination validation
export function isValidPaginationParams(obj: unknown): obj is { limit?: number; offset?: number } {
  if (obj === null || typeof obj !== 'object') {
    return false;
  }

  const { limit, offset } = obj as any;

  if (limit !== undefined) {
    if (typeof limit !== 'number' || limit < 1 || limit > 100) {
      return false;
    }
  }

  if (offset !== undefined) {
    if (typeof offset !== 'number' || offset < 0) {
      return false;
    }
  }

  return true;
}

// Date validation
export function isValidDateString(date: unknown): boolean {
  if (typeof date !== 'string') {
    return false;
  }

  const parsed = new Date(date);
  return !isNaN(parsed.getTime()) && date.match(/^\d{4}-\d{2}-\d{2}$/);
}

export function isDateInRange(date: Date | string, startDate?: Date | string, endDate?: Date | string): boolean {
  const checkDate = typeof date === 'string' ? new Date(date) : date;
  const start = startDate ? (typeof startDate === 'string' ? new Date(startDate) : startDate) : new Date(0);
  const end = endDate ? (typeof endDate === 'string' ? new Date(endDate) : endDate) : new Date();

  return checkDate >= start && checkDate <= end;
}

// Utility: Luhn algorithm for credit card validation
function luhnCheck(cardNumber: string): boolean {
  let sum = 0;
  let isEven = false;

  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

// Combined validation helpers
export function validatePaymentData(data: unknown): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Payment data must be an object');
    return { isValid: false, errors };
  }

  const payment = data as any;

  // Validate amount
  if (!isValidAmount(payment.amount)) {
    errors.push('Invalid amount');
  }

  // Validate card data if present
  if (payment.creditcard && !isValidCardNumber(payment.creditcard)) {
    errors.push('Invalid card number');
  }

  if (payment.month && payment.year && !isValidExpiry(payment.month, payment.year)) {
    errors.push('Invalid expiry date');
  }

  if (payment.cvv && !isValidCVV(payment.cvv)) {
    errors.push('Invalid CVV');
  }

  return { isValid: errors.length === 0, errors };
}

export function validateCustomerData(data: unknown): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Customer data must be an object');
    return { isValid: false, errors };
  }

  const customer = data as any;

  // Validate email if present
  if (customer.email && !isValidEmail(customer.email)) {
    errors.push('Invalid email address');
  }

  // Validate phone if present
  if (customer.phone && !isValidPhoneNumber(customer.phone)) {
    errors.push('Invalid phone number');
  }

  // Validate postal code if present
  if (customer.postal_code && !isValidPostalCode(customer.postal_code, customer.country)) {
    errors.push('Invalid postal code');
  }

  return { isValid: errors.length === 0, errors };
}