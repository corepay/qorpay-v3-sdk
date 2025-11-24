import { z } from 'zod';

// ========================================================
// CLEAN SDK SCHEMAS (What developers use)
// ========================================================

/**
 * Query parameters validation for transaction lists
 */
export const TransactionListParamsSchema = z.object({
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
  status: z
    .enum(['approved', 'declined', 'pending', 'voided', 'refunded'])
    .or(
      z.array(z.enum(['approved', 'declined', 'pending', 'voided', 'refunded']))
    )
    .optional(),
  type: z
    .enum(['sale', 'authorization', 'capture', 'void', 'refund'])
    .or(z.array(z.enum(['sale', 'authorization', 'capture', 'void', 'refund'])))
    .optional(),
  customerId: z.string().optional(),
  batchId: z.string().optional(),
  startDate: z.union([z.date(), z.string()]).optional(),
  endDate: z.union([z.date(), z.string()]).optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  paymentMethod: z.enum(['card', 'ach', 'cash', 'gift']).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * Proof of Delivery creation validation
 */
export const CreateProofOfDeliverySchema = z.object({
  transactionId: z.string().min(1, 'Transaction ID is required'),
  deliveryDate: z.union([z.date(), z.string()]).optional(),
  recipientName: z.string().max(100).optional(),
  recipientSignature: z.string().optional(),
  notes: z.string().max(500).optional(),
  images: z.array(z.string()).optional(),
});

/**
 * Proof of Delivery update validation
 */
export const UpdateProofOfDeliverySchema =
  CreateProofOfDeliverySchema.partial().extend({
    id: z.string().min(1, 'POD ID is required'),
  });

// ========================================================
// QORPAY RAW SCHEMAS (Internal transformation use)
// ========================================================

/**
 * Raw QorPay transaction response validation
 * Used for validating API responses before transformation
 */
export const QorPayTransactionResponseSchema = z.object({
  transaction_id: z.string(),
  amount: z.string(),
  currency: z.string().optional(),
  status: z.string(),
  type: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  transaction_date: z.string().optional(),

  // Card fields
  card_brand: z.string().optional(),
  card_last4: z.string().optional(),
  card_exp_month: z.string().optional(),
  card_exp_year: z.string().optional(),
  exp_month: z.string().optional(),
  exp_year: z.string().optional(),

  // ACH fields
  ach_account_last4: z.string().optional(),
  ach_routing: z.string().optional(),
  ach_account_type: z.string().optional(),
  ach_bank_name: z.string().optional(),

  // Customer fields
  customer_id: z.string().optional(),
  profile_id: z.string().optional(),
  customer_email: z.string().optional(),
  cemail: z.string().optional(),
  customer_name: z.string().optional(),
  cfirstname: z.string().optional(),
  clastname: z.string().optional(),

  // References
  reference_id: z.string().optional(),
  order_id: z.string().optional(),
  orderid: z.string().optional(),
  batch_id: z.string().optional(),

  // Additional data
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Raw QorPay POD response validation
 */
export const QorPayProofOfDeliveryResponseSchema = z.object({
  id: z.string(),
  transaction_id: z.string(),
  delivery_date: z.string().optional(),
  recipient_name: z.string().optional(),
  recipient_signature: z.string().optional(),
  notes: z.string().optional(),
  images: z.array(z.string()).optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
});

// ========================================================
// LEGACY SCHEMAS (Backward compatibility)
// ========================================================

/**
 * Legacy transaction query parameters for backward compatibility
 */
export const TransactionQueryParamsSchema = z.object({
  transaction_id: z.string().optional(),
  reference_id: z.string().optional(),
  order_id: z.string().optional(),
  customer_id: z.union([z.string(), z.number()]).optional(),
  mid: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  created_start: z.string().optional(),
  created_end: z.string().optional(),
  amount_min: z.union([z.string(), z.number()]).optional(),
  amount_max: z.union([z.string(), z.number()]).optional(),
  currency: z.string().optional(),
  batch_id: z.string().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
});

/**
 * Legacy POD creation schema
 */
export const ProofOfDeliveryCreateRequestSchema = z.object({
  transaction_id: z.string(),
  delivery_date: z.string(),
  carrier: z.string().optional(),
  tracking_number: z.string().optional(),
  signed_by: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Legacy POD update schema
 */
export const ProofOfDeliveryUpdateRequestSchema = z.object({
  delivery_date: z.string().optional(),
  carrier: z.string().optional(),
  tracking_number: z.string().optional(),
  signed_by: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Legacy POD query parameters schema
 */
export const ProofOfDeliveryQueryParamsSchema = z.object({
  transaction_id: z.string().optional(),
  delivery_date_start: z.string().optional(),
  delivery_date_end: z.string().optional(),
  carrier: z.string().optional(),
  tracking_number: z.string().optional(),
  created_start: z.string().optional(),
  created_end: z.string().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
});

// ========================================================
// TYPE EXPORTS
// ========================================================

/**
 * Schema for clean transaction list request parameters
 */
export type TransactionListParamsInput = z.infer<
  typeof TransactionListParamsSchema
>;

/**
 * Schema for clean POD creation request
 */
export type CreateProofOfDeliveryInput = z.infer<
  typeof CreateProofOfDeliverySchema
>;

/**
 * Schema for clean POD update request
 */
export type UpdateProofOfDeliveryInput = z.infer<
  typeof UpdateProofOfDeliverySchema
>;

/**
 * Schema for QorPay raw transaction response validation
 */
export type QorPayTransactionResponseInput = z.infer<
  typeof QorPayTransactionResponseSchema
>;

/**
 * Schema for QorPay raw POD response validation
 */
export type QorPayProofOfDeliveryResponseInput = z.infer<
  typeof QorPayProofOfDeliveryResponseSchema
>;
