import { z } from 'zod';

/**
 * Schema for validating deposit list query parameters
 */
export const ListDepositsQueryParamsSchema = z.object({
  limit: z.number().int().positive().max(1000).optional(),
  offset: z.number().int().nonnegative().optional(),
  mid: z.string().optional(),
  deposit_date_start: z.string().optional(),
  deposit_date_end: z.string().optional(),
  settlement_date_start: z.string().optional(),
  settlement_date_end: z.string().optional(),
  batch_id: z.string().optional(),
  sort_by: z.string().optional(),
  sort_order: z.union([z.literal('asc'), z.literal('desc')]).optional(),
});

/**
 * Schema for validating year parameter
 */
export const YearParamSchema = z.number().int().min(2000).max(2100);

/**
 * Schema for validating status parameter
 */
export const StatusParamSchema = z.string().min(1);

/**
 * Schema for validating deposit ID parameter
 */
export const DepositIdParamSchema = z.string().min(1);

/**
 * Combined schema for listDeposits method parameters
 */
export const ListDepositsParamsSchema = z.object({
  year: YearParamSchema,
  status: StatusParamSchema,
  queryParams: ListDepositsQueryParamsSchema.optional(),
});

/**
 * Schema for deposit transaction object
 */
export const DepositTransactionSchema = z.object({
  transaction_id: z.string(),
  amount: z.string(),
  currency: z.string(),
  type: z.string(),
  status: z.string(),
  created_at: z.string(),
  reference_id: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * Schema for deposit details object
 */
export const DepositDetailsSchema = z.object({
  id: z.string(),
  mid: z.string(),
  amount: z.string(),
  currency: z.string(),
  status: z.string(),
  deposit_date: z.string(),
  settlement_date: z.string().optional(),
  batch_id: z.string().optional(),
  transaction_count: z.number().optional(),
  metadata: z.record(z.any()).optional(),
  transactions: z.array(DepositTransactionSchema).optional(),
});

/**
 * Schema for deposit object
 */
export const DepositSchema = z.object({
  id: z.string(),
  mid: z.string(),
  amount: z.string(),
  currency: z.string(),
  status: z.string(),
  deposit_date: z.string(),
  settlement_date: z.string().optional(),
  batch_id: z.string().optional(),
  transaction_count: z.number().optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * Schema for list deposits response data
 */
export const ListDepositsResponseDataSchema = z.object({
  deposits: z.array(DepositSchema),
  meta: z.object({
    count: z.number(),
    limit: z.number(),
    offset: z.number(),
  }),
});

/**
 * Schema for get deposit response data
 */
export const GetDepositResponseDataSchema = DepositDetailsSchema;
