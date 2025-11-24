/**
 * @file src/schemas/utilities.ts
 * @description Zod validation schemas for utility functions
 */

import { z } from 'zod';

/**
 * Base response schema for utilities
 */
const BaseUtilityResponseSchema = z.object({
  status: z.string(),
  code: z.string(),
  message: z.string(),
});

/**
 * Schema for card validation response
 */
export const ValidateCardResponseSchema = BaseUtilityResponseSchema.extend({
  data: z.object({
    valid: z.boolean(),
    brand: z.string().optional(),
    type: z.string().optional(),
    country: z.string().optional(),
    bank: z.string().optional(),
  }),
});

/**
 * Schema for CVV validation response
 */
export const ValidateCvvResponseSchema = BaseUtilityResponseSchema;

/**
 * Schema for expiration validation response
 */
export const ValidateExpirationResponseSchema = BaseUtilityResponseSchema;

/**
 * Schema for routing number validation response
 */
export const ValidateRoutingNumberResponseSchema =
  BaseUtilityResponseSchema.extend({
    data: z.object({
      valid: z.boolean(),
      bank_name: z.string().optional(),
      location: z.string().optional(),
    }),
  });

/**
 * Schema for BIN lookup response
 */
export const BinLookupResponseSchema = BaseUtilityResponseSchema.extend({
  data: z.object({
    bin: z.string(),
    brand: z.string(),
    type: z.string(),
    category: z.string(),
    country: z.string(),
    bank_name: z.string(),
    bank_url: z.string().url().optional(),
    bank_phone: z.string().optional(),
    bank_city: z.string().optional(),
  }),
});

/**
 * Schema for AVS result check response
 */
export const CheckAvsResultResponseSchema = BaseUtilityResponseSchema.extend({
  data: z.object({
    avs_code: z.string(),
    avs_message: z.string(),
    cvv_code: z.string().optional(),
    cvv_message: z.string().optional(),
  }),
});

/**
 * Schema for test card generation response
 */
export const GenerateTestCardResponseSchema = BaseUtilityResponseSchema.extend({
  data: z.object({
    card_number: z.string(),
    brand: z.string(),
    exp_month: z.string(),
    exp_year: z.string(),
    cvv: z.string(),
  }),
});

/**
 * Schema for tax ID validation response
 */
export const ValidateTaxIdResponseSchema = BaseUtilityResponseSchema.extend({
  data: z.object({
    valid: z.boolean(),
    type: z.string().optional(),
    format_valid: z.boolean(),
  }),
});

/**
 * Schema for account validation response
 */
export const ValidateAccountResponseSchema = BaseUtilityResponseSchema.extend({
  data: z.object({
    valid: z.boolean(),
    mid: z.string(),
    status: z.string(),
    business_name: z.string().optional(),
    account_type: z.string().optional(),
    created_date: z.string().optional(),
    last_activity: z.string().optional(),
  }),
});

/**
 * Schema for enhanced Luhn validation response
 */
export const ValidateCardLuhnResponseSchema = BaseUtilityResponseSchema.extend({
  data: z.object({
    valid: z.boolean(),
    card_number: z.string(),
    luhn_valid: z.boolean(),
    brand: z.string().optional(),
    type: z.string().optional(),
    category: z.string().optional(),
    check_digit: z.string().optional(),
    issuer_identifier: z.string().optional(),
  }),
});

/**
 * Schema for enhanced BIN lookup response
 */
export const EnhancedBinLookupResponseSchema = BaseUtilityResponseSchema.extend(
  {
    data: z.object({
      bin: z.string(),
      brand: z.string(),
      type: z.string(),
      category: z.string(),
      country: z.string(),
      country_code: z.string(),
      bank_name: z.string(),
      bank_url: z.string().url().optional(),
      bank_phone: z.string().optional(),
      bank_city: z.string().optional(),
      bank_state: z.string().optional(),
      bank_zip: z.string().optional(),
      prepaid: z.boolean().optional(),
      corporate: z.boolean().optional(),
      debit: z.boolean().optional(),
      credit: z.boolean().optional(),
      durbin_regulated: z.boolean().optional(),
      international: z.boolean().optional(),
    }),
  }
);

/**
 * Schema for enhanced routing number validation response
 */
export const ValidateRoutingNumberEnhancedResponseSchema =
  BaseUtilityResponseSchema.extend({
    data: z.object({
      valid: z.boolean(),
      routing_number: z.string(),
      bank_name: z.string(),
      bank_city: z.string(),
      bank_state: z.string(),
      bank_zip: z.string(),
      phone: z.string().optional(),
      website: z.string().url().optional(),
      fedwire: z.boolean().optional(),
      swift: z.string().optional(),
      office: z.string().optional(),
      changed_date: z.string().optional(),
      data_view_date: z.string().optional(),
    }),
  });

/**
 * Schema for ZIP code validation response
 */
export const ValidateZipCodeResponseSchema = BaseUtilityResponseSchema.extend({
  data: z.object({
    valid: z.boolean(),
    postal_code: z.string(),
    city: z.string().optional(),
    state: z.string().optional(),
    county: z.string().optional(),
    country: z.string().optional(),
    timezone: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    area_codes: z.array(z.string()).optional(),
  }),
});

/**
 * Schema for server time response
 */
export const ServerTimeResponseSchema = BaseUtilityResponseSchema.extend({
  data: z.object({
    timestamp: z.number(),
    iso_date: z.string(),
  }),
});

/**
 * Schema for address validation response
 */
export const ValidateAddressResponseSchema = BaseUtilityResponseSchema;

// Request schemas for input validation

/**
 * Schema for card validation request
 */
export const ValidateCardRequestSchema = z.object({
  card_number: z.string().min(13).max(19),
});

/**
 * Schema for CVV validation request
 */
export const ValidateCvvRequestSchema = z.object({
  cvv: z.string().min(3).max(4),
  card_number: z.string().min(13).max(19).optional(),
});

/**
 * Schema for expiration validation request
 */
export const ValidateExpirationRequestSchema = z.object({
  exp_month: z.union([z.string().min(1).max(2), z.number().min(1).max(12)]),
  exp_year: z.union([z.string().min(2).max(4), z.number().min(0)]),
});

/**
 * Schema for routing number validation request
 */
export const ValidateRoutingNumberRequestSchema = z.object({
  routing_number: z.string().min(9).max(9),
});

/**
 * Schema for tax ID validation request
 */
export const ValidateTaxIdRequestSchema = z.object({
  tax_id: z.string().min(1),
  type: z.string().min(1),
});

/**
 * Schema for address validation request
 */
export const ValidateAddressRequestSchema = z.object({
  address: z.string().min(1),
  postal_code: z.string().min(1),
  country_code: z.string().length(2).default('US'),
});

/**
 * Schema for AVS result check request
 */
export const CheckAvsResultRequestSchema = z.object({
  avs_code: z.string().min(1),
  cvv_code: z.string().min(1).optional(),
});

/**
 * Schema for test card generation request
 */
export const GenerateTestCardRequestSchema = z.object({
  brand: z.string().optional(),
});
