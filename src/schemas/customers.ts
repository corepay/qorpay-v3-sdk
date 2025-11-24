import { z } from 'zod';

export const CustomerRequestSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  address1: z.string().optional(),
  address2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().length(2).optional(),
  metadata: z.record(z.any()).optional(),
});

export const CustomerListQueryParamsSchema = z.object({
  limit: z.number().optional(),
  offset: z.number().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  created_start: z.string().optional(),
  created_end: z.string().optional(),
  sort_by: z.string().optional(),
  sort_order: z.union([z.literal('asc'), z.literal('desc')]).optional(),
});
