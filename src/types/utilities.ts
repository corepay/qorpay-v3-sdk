/**
 * @file src/types/utilities.ts
 * @description TypeScript type definitions for utility validation responses
 */

// Re-export response types from utilities resource for cleaner imports
export type {
  ValidateCardResponsePayload,
  ValidateRoutingNumberResponsePayload,
  BinLookupResponsePayload,
  CheckAvsResultResponsePayload,
  GenerateTestCardResponsePayload,
  ValidateTaxIdResponsePayload,
  ValidateAccountResponsePayload,
  ValidateCardLuhnResponsePayload,
  EnhancedBinLookupResponsePayload,
  ValidateRoutingNumberEnhancedResponsePayload,
  ValidateZipCodeResponsePayload,
} from '../resources/utilities';

/**
 * Basic card validation result
 */
export interface CardValidationResult {
  valid: boolean;
  brand?: string;
  type?: string;
  country?: string;
  bank?: string;
}

/**
 * Enhanced Luhn validation result
 */
export interface LuhnValidationResult {
  valid: boolean;
  cardNumber: string;
  luhnValid: boolean;
  brand?: string;
  type?: string;
  category?: string;
  checkDigit?: string;
  issuerIdentifier?: string;
}

/**
 * Enhanced BIN lookup result
 */
export interface BinLookupResult {
  bin: string;
  brand: string;
  type: string;
  category: string;
  country: string;
  countryCode: string;
  bankName: string;
  bankUrl?: string;
  bankPhone?: string;
  bankCity?: string;
  bankState?: string;
  bankZip?: string;
  prepaid?: boolean;
  corporate?: boolean;
  debit?: boolean;
  credit?: boolean;
  durbinRegulated?: boolean;
  international?: boolean;
}

/**
 * Basic routing number validation result
 */
export interface RoutingValidationResult {
  valid: boolean;
  bankName?: string;
  location?: string;
}

/**
 * Enhanced routing number validation result
 */
export interface RoutingValidationEnhancedResult {
  valid: boolean;
  routingNumber: string;
  bankName: string;
  bankCity: string;
  bankState: string;
  bankZip: string;
  phone?: string;
  website?: string;
  fedwire?: boolean;
  swift?: string;
  office?: string;
  changedDate?: string;
  dataViewDate?: string;
}

/**
 * Account validation result
 */
export interface AccountValidationResult {
  valid: boolean;
  mid: string;
  status: string;
  businessName?: string;
  accountType?: string;
  createdDate?: string;
  lastActivity?: string;
}

/**
 * ZIP code validation result
 */
export interface ZipValidationResult {
  valid: boolean;
  postalCode: string;
  city?: string;
  state?: string;
  county?: string;
  country?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  areaCodes?: string[];
}

/**
 * Tax ID validation result
 */
export interface TaxIdValidationResult {
  valid: boolean;
  type?: string;
  formatValid: boolean;
}

/**
 * AVS/CVV result check
 */
export interface AvsResult {
  avsCode: string;
  avsMessage: string;
  cvvCode?: string;
  cvvMessage?: string;
}

/**
 * Test card generation result
 */
export interface TestCardResult {
  cardNumber: string;
  brand: string;
  expMonth: string;
  expYear: string;
  cvv: string;
}

/**
 * Server time response
 */
export interface ServerTimeResult {
  timestamp: number;
  isoDate: string;
}
