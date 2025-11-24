import { z } from 'zod';

/**
 * Schema for validating dispute list query parameters
 */
export const ListDisputesQueryParamsSchema = z.object({
  limit: z.number().int().positive().max(1000).optional(),
  offset: z.number().int().nonnegative().optional(),
  mid: z.string().optional(),
  status: z.string().optional(),
  reason_code: z.string().optional(),
  created_start: z.string().optional(),
  created_end: z.string().optional(),
  due_date_start: z.string().optional(),
  due_date_end: z.string().optional(),
  transaction_id: z.string().optional(),
  sort_by: z.string().optional(),
  sort_order: z.union([z.literal('asc'), z.literal('desc')]).optional(),
});

/**
 * Schema for validating dispute ID parameter
 */
export const DisputeIdParamSchema = z.string().min(1);

/**
 * Schema for dispute transaction data
 */
export const DisputeTransactionDataSchema = z.object({
  transaction_id: z.string(),
  mid: z.string(),
  amount: z.string(),
  currency: z.string(),
  reason_code: z.string(),
  reason_description: z.string(),
  status: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  due_date: z.string().optional(),
  case_number: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * Schema for dispute document
 */
export const DisputeDocumentSchema = z.object({
  id: z.string(),
  type: z.string(),
  filename: z.string(),
  content_type: z.string(),
  size: z.number(),
  url: z.string().optional(),
  uploaded_at: z.string(),
});

/**
 * Schema for dispute evidence
 */
export const DisputeEvidenceSchema = z.object({
  submitted_at: z.string().optional(),
  status: z.string(),
  notes: z.string().optional(),
  evidence_items: z.record(z.string()).optional(),
});

/**
 * Schema for dispute object
 */
export const DisputeSchema = z.object({
  id: z.string(),
  transaction_data: DisputeTransactionDataSchema,
  documents: z.array(DisputeDocumentSchema).optional(),
  evidence: DisputeEvidenceSchema.optional(),
});

/**
 * Schema for list disputes response data
 */
export const ListDisputesResponseDataSchema = z.object({
  disputes: z.array(DisputeSchema),
  meta: z.object({
    count: z.number(),
    limit: z.number(),
    offset: z.number(),
  }),
});

/**
 * Schema for get dispute response data
 */
export const GetDisputeResponseDataSchema = DisputeSchema;

/**
 * Constants for dispute statuses
 */
export const DisputeStatusValues = [
  'open',
  'under_review',
  'resolved',
  'lost',
  'won',
  'expired',
] as const;

/**
 * Schema for dispute status validation
 */
export const DisputeStatusSchema = z.enum(DisputeStatusValues);

/**
 * Common dispute reason codes
 */
export const DisputeReasonCodeValues = [
  'fraud',
  'unrecognized',
  'duplicate',
  'credit_not_processed',
  'services_not_provided',
  'general',
  'product_not_received',
  'product_unacceptable',
  'canceled_recurring',
  'account_number',
] as const;

/**
 * Schema for dispute reason code validation
 */
export const DisputeReasonCodeSchema = z.enum(DisputeReasonCodeValues);
