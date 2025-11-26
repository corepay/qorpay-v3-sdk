/**
 * @file src/schemas/payment-tokens.ts
 * @description Zod validation schemas for payment token operations
 */

import { z } from 'zod';

// ========================================================
// PAYMENT TOKEN CREATION SCHEMAS
// ========================================================

/**
 * Billing address schema for token creation
 */
export const TokenBillingAddressSchema = z.object({
  address1: z.string().max(255).optional(),
  address2: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().length(2).optional(),
  postal_code: z.string().max(20).optional(),
  country: z.string().length(2).optional(),
});

/**
 * Card token creation request validation
 */
export const CreateCardTokenRequestSchema = z.object({
  card_number: z
    .string()
    .regex(/^\d{13,19}$/, 'Card number must be 13-19 digits'),
  card_exp: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\d{2}$/, 'Expiry must be in MMYY format'),
  card_cvv: z
    .string()
    .regex(/^\d{3,4}$/, 'CVV must be 3-4 digits')
    .optional(),
  customer_id: z.string().optional(),
  card_holder: z.string().max(100).optional(),
  billing_address: TokenBillingAddressSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * ACH token creation request validation
 */
export const CreateAchTokenRequestSchema = z.object({
  account_number: z
    .string()
    .regex(/^\d{4,17}$/, 'Account number must be 4-17 digits'),
  routing_number: z
    .string()
    .regex(/^\d{9}$/, 'Routing number must be 9 digits'),
  account_type: z.enum(['checking', 'savings']),
  account_holder_name: z.string().max(100).optional(),
  customer_id: z.string().optional(),
  bank_name: z.string().max(100).optional(),
  billing_address: TokenBillingAddressSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
});

// ========================================================
// TOKEN MANAGEMENT SCHEMAS
// ========================================================

/**
 * Card token update request validation
 */
export const UpdateCardTokenRequestSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  card_holder: z.string().max(100).optional(),
  billing_address: TokenBillingAddressSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Card token rotation request validation
 */
export const RotateCardTokenRequestSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  card_number: z
    .string()
    .regex(/^\d{13,19}$/, 'Card number must be 13-19 digits'),
  card_exp: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\d{2}$/, 'Expiry must be in MMYY format'),
  card_cvv: z
    .string()
    .regex(/^\d{3,4}$/, 'CVV must be 3-4 digits')
    .optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Card token rollback request validation
 */
export const RollbackCardTokenRequestSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  reason: z.string().max(500).optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Card token deletion parameters validation
 */
export const DeleteCardTokenParamsSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  customer_id: z.string().optional(),
});

// ========================================================
// QUERY PARAMETERS SCHEMAS
// ========================================================

/**
 * Base query parameters for token listing
 */
export const BaseTokenQueryParamsSchema = z.object({
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
  sort_by: z.enum(['created_at', 'updated_at', 'exp_date']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
});

/**
 * Card tokens query parameters validation
 */
export const FetchCardTokensQueryParamsSchema =
  BaseTokenQueryParamsSchema.extend({
    customer_id: z.string().optional(),
    card_type: z
      .enum(['visa', 'mastercard', 'amex', 'discover', 'jcb', 'unionpay'])
      .optional(),
    exp_month: z.number().min(1).max(12).optional(),
    exp_year: z.number().min(2000).max(2099).optional(),
    card_holder: z.string().optional(),
  });

/**
 * ACH tokens query parameters validation
 */
export const FetchAchTokensQueryParamsSchema =
  BaseTokenQueryParamsSchema.extend({
    customer_id: z.string().optional(),
    account_type: z.enum(['checking', 'savings']).optional(),
    account_holder_name: z.string().optional(),
    bank_name: z.string().optional(),
  });

/**
 * Expiring card tokens query parameters validation
 */
export const ExpiringCardTokensParamsSchema = z
  .object({
    start_date: z.date({
      required_error: 'Start date is required',
      invalid_type_error: 'Start date must be a valid date',
    }),
    end_date: z.date({
      required_error: 'End date is required',
      invalid_type_error: 'End date must be a valid date',
    }),
    limit: z.number().min(1).max(100).optional(),
    offset: z.number().min(0).optional(),
  })
  .refine((data) => data.start_date <= data.end_date, {
    message: 'Start date must be before or equal to end date',
    path: ['start_date'],
  });

// ========================================================
// RESPONSE SCHEMAS (For API response validation)
// ========================================================

/**
 * Card token object validation
 */
export const CardTokenObjectSchema = z.object({
  token: z.string(),
  card_type: z.string(),
  last_four: z.string().length(4),
  exp_date: z.string(),
  card_holder: z.string().optional(),
  customer_id: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * ACH token object validation
 */
export const AchTokenObjectSchema = z.object({
  token: z.string(),
  account_type: z.enum(['checking', 'savings']),
  last_four: z.string().length(4),
  routing_number: z.string().length(9),
  bank_name: z.string().optional(),
  account_holder_name: z.string().optional(),
  customer_id: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Card token creation response validation
 */
export const CreateCardTokenResponseSchema = z.object({
  status: z.string(),
  code: z.string(),
  message: z.string(),
  data: CardTokenObjectSchema,
});

/**
 * ACH token creation response validation
 */
export const CreateAchTokenResponseSchema = z.object({
  status: z.string(),
  code: z.string(),
  message: z.string(),
  data: AchTokenObjectSchema,
});

/**
 * Card token fetch response validation
 */
export const FetchCardTokenByIdResponseSchema = z.object({
  status: z.string(),
  code: z.string(),
  message: z.string(),
  data: CardTokenObjectSchema,
});

/**
 * ACH token fetch response validation
 */
export const FetchAchTokenByIdResponseSchema = z.object({
  status: z.string(),
  code: z.string(),
  message: z.string(),
  data: AchTokenObjectSchema,
});

/**
 * Card token list response validation
 */
export const FetchCardTokenByCustomerResponseSchema = z.object({
  status: z.string(),
  code: z.string(),
  message: z.string(),
  data: z.object({
    tokens: z.array(CardTokenObjectSchema),
    total: z.number(),
    has_more: z.boolean(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  }),
});

/**
 * ACH token list response validation
 */
export const FetchAchTokenByCustomerResponseSchema = z.object({
  status: z.string(),
  code: z.string(),
  message: z.string(),
  data: z.object({
    tokens: z.array(AchTokenObjectSchema),
    total: z.number(),
    has_more: z.boolean(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  }),
});

/**
 * Card token update response validation
 */
export const UpdateCardTokenResponseSchema = z.object({
  status: z.string(),
  code: z.string(),
  message: z.string(),
  data: CardTokenObjectSchema,
});

/**
 * Card token rotation response validation
 */
export const RotateCardTokenResponseSchema = z.object({
  status: z.string(),
  code: z.string(),
  message: z.string(),
  data: z.object({
    old_token: z.string(),
    new_token: z.string(),
    card_token: CardTokenObjectSchema,
    rotated_at: z.string(),
  }),
});

/**
 * Card token rollback response validation
 */
export const RollbackCardTokenResponseSchema = z.object({
  status: z.string(),
  code: z.string(),
  message: z.string(),
  data: z.object({
    token: z.string(),
    card_token: CardTokenObjectSchema,
    rollback_at: z.string(),
    reason: z.string().optional(),
  }),
});

/**
 * Card token deletion response validation
 */
export const DeleteCardTokenResponseSchema = z.object({
  status: z.string(),
  code: z.string(),
  message: z.string(),
  data: z.object({
    token: z.string(),
    deleted_at: z.string(),
  }),
});

// ========================================================
// TYPE EXPORTS
// ========================================================

export type CreateCardTokenRequestInput = z.infer<
  typeof CreateCardTokenRequestSchema
>;
export type CreateAchTokenRequestInput = z.infer<
  typeof CreateAchTokenRequestSchema
>;
export type UpdateCardTokenRequestInput = z.infer<
  typeof UpdateCardTokenRequestSchema
>;
export type RotateCardTokenRequestInput = z.infer<
  typeof RotateCardTokenRequestSchema
>;
export type RollbackCardTokenRequestInput = z.infer<
  typeof RollbackCardTokenRequestSchema
>;
export type DeleteCardTokenParamsInput = z.infer<
  typeof DeleteCardTokenParamsSchema
>;
export type FetchCardTokensQueryParamsInput = z.infer<
  typeof FetchCardTokensQueryParamsSchema
>;
export type FetchAchTokensQueryParamsInput = z.infer<
  typeof FetchAchTokensQueryParamsSchema
>;
export type ExpiringCardTokensParamsInput = z.infer<
  typeof ExpiringCardTokensParamsSchema
>;
