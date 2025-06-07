/**
 * @file src/resources/utilities.ts
 * @description Utilities resource for QorPay utility functions like card validation, BIN lookup, etc.
 */

import type { BaseClient } from '../client/base-client';
import type {
  BaseQorPayResponse,
  QorPaySuccessDataResponse,
} from '../types/common';

/**
 * Response payload for validating a credit card number
 */
export interface ValidateCardResponsePayload extends BaseQorPayResponse {
  data: {
    valid: boolean;
    brand?: string;
    type?: string;
    country?: string;
    bank?: string;
  };
}

/**
 * Response payload for validating a routing number
 */
export interface ValidateRoutingNumberResponsePayload
  extends BaseQorPayResponse {
  data: {
    valid: boolean;
    bank_name?: string;
    location?: string;
  };
}

/**
 * Response payload for BIN lookup
 */
export interface BinLookupResponsePayload extends BaseQorPayResponse {
  data: {
    bin: string;
    brand: string;
    type: string;
    category: string;
    country: string;
    bank_name: string;
    bank_url?: string;
    bank_phone?: string;
    bank_city?: string;
  };
}

/**
 * Response payload for checking AVS/CVV results
 */
export interface CheckAvsResultResponsePayload extends BaseQorPayResponse {
  data: {
    avs_code: string;
    avs_message: string;
    cvv_code?: string;
    cvv_message?: string;
  };
}

/**
 * Response payload for generating a test card number
 */
export interface GenerateTestCardResponsePayload extends BaseQorPayResponse {
  data: {
    card_number: string;
    brand: string;
    exp_month: string;
    exp_year: string;
    cvv: string;
  };
}

/**
 * Resource class for utility functions
 */
export class Utilities {
  private client: BaseClient;

  /**
   * Creates a new Utilities instance
   *
   * @param client - The BaseClient instance to use for API calls
   */
  constructor(client: BaseClient) {
    this.client = client;
  }

  /**
   * Validate a credit card number
   *
   * @param cardNumber - The card number to validate
   * @returns Promise resolving to the validation result
   */
  public async validateCard(
    cardNumber: string
  ): Promise<ValidateCardResponsePayload> {
    return this.client.post<
      ValidateCardResponsePayload,
      { card_number: string }
    >('/utils/validate-card', { card_number: cardNumber });
  }

  /**
   * Validate a CVV/CVC code
   *
   * @param cvv - The CVV/CVC code to validate
   * @param cardNumber - The associated card number (optional)
   * @returns Promise resolving to the validation result
   */
  public async validateCvv(
    cvv: string,
    cardNumber?: string
  ): Promise<BaseQorPayResponse> {
    return this.client.post<
      BaseQorPayResponse,
      { cvv: string; card_number?: string }
    >('/utils/validate-cvv', { cvv, card_number: cardNumber });
  }

  /**
   * Validate a card expiration date
   *
   * @param month - The expiration month (1-12)
   * @param year - The expiration year (2-digit or 4-digit)
   * @returns Promise resolving to the validation result
   */
  public async validateExpiration(
    month: string | number,
    year: string | number
  ): Promise<BaseQorPayResponse> {
    return this.client.post<
      BaseQorPayResponse,
      { exp_month: string | number; exp_year: string | number }
    >('/utils/validate-expiration', { exp_month: month, exp_year: year });
  }

  /**
   * Validate an ACH routing number
   *
   * @param routingNumber - The routing number to validate
   * @returns Promise resolving to the validation result
   */
  public async validateRoutingNumber(
    routingNumber: string
  ): Promise<ValidateRoutingNumberResponsePayload> {
    return this.client.post<
      ValidateRoutingNumberResponsePayload,
      { routing_number: string }
    >('/utils/validate-routing', { routing_number: routingNumber });
  }

  /**
   * Perform a BIN lookup to get card details from the first 6-8 digits
   *
   * @param bin - The Bank Identification Number (first 6-8 digits of card)
   * @returns Promise resolving to the BIN details
   */
  public async binLookup(bin: string): Promise<BinLookupResponsePayload> {
    return this.client.get<BinLookupResponsePayload>(
      `/utils/bin-lookup/${bin}`
    );
  }

  /**
   * Check the meaning of an AVS/CVV result code
   *
   * @param avsCode - The AVS result code
   * @param cvvCode - The CVV result code (optional)
   * @returns Promise resolving to the code descriptions
   */
  public async checkAvsResult(
    avsCode: string,
    cvvCode?: string
  ): Promise<CheckAvsResultResponsePayload> {
    const params: Record<string, string> = { avs_code: avsCode };
    if (cvvCode) {
      params.cvv_code = cvvCode;
    }
    return this.client.get<CheckAvsResultResponsePayload>(
      '/utils/check-avs',
      params
    );
  }

  /**
   * Generate a random test card number
   *
   * @param brand - The card brand (visa, mastercard, amex, discover, etc.)
   * @returns Promise resolving to a test card
   */
  public async generateTestCard(
    brand?: string
  ): Promise<GenerateTestCardResponsePayload> {
    const params: Record<string, string> = {};
    if (brand) {
      params.brand = brand;
    }
    return this.client.get<GenerateTestCardResponsePayload>(
      '/utils/test-card',
      params
    );
  }

  /**
   * Validate an address for AVS matching
   *
   * @param address - The street address
   * @param postalCode - The postal/zip code
   * @param countryCode - The 2-letter country code (default: US)
   * @returns Promise resolving to the validation result
   */
  public async validateAddress(
    address: string,
    postalCode: string,
    countryCode = 'US'
  ): Promise<BaseQorPayResponse> {
    return this.client.post<
      BaseQorPayResponse,
      { address: string; postal_code: string; country_code: string }
    >('/utils/validate-address', {
      address,
      postal_code: postalCode,
      country_code: countryCode,
    });
  }

  /**
   * Get the current server time from the API
   * Useful for checking connectivity and clock synchronization
   *
   * @returns Promise resolving to the server time
   */
  public async getServerTime(): Promise<
    QorPaySuccessDataResponse<{ timestamp: number; iso_date: string }>
  > {
    return this.client.get<
      QorPaySuccessDataResponse<{ timestamp: number; iso_date: string }>
    >('/utils/time');
  }

  /**
   * Validate a tax ID (EIN, SSN, etc.)
   *
   * @param taxId - The tax ID to validate
   * @param type - The type of tax ID (ein, ssn, itin, etc.)
   * @returns Promise resolving to the validation result
   */
  public async validateTaxId(
    taxId: string,
    type: string
  ): Promise<BaseQorPayResponse> {
    return this.client.post<
      BaseQorPayResponse,
      { tax_id: string; type: string }
    >('/utils/validate-tax-id', { tax_id: taxId, type });
  }
}
