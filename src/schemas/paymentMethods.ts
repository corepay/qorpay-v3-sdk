// src/schemas/paymentMethods.ts
import { z } from 'zod';

/*** Request Schemas ***/
export const CreatePaymentMethodSchema = z
  .object({
    customerId: z.string(),
    type: z.enum(['card', 'ach']),
    card: z
      .object({
        number: z.string().regex(/^\d{12,19}$/),
        expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/),
        expiryYear: z.string().regex(/^\d{2}$/),
        cvv: z.string().optional(),
        name: z.string().optional(),
      })
      .optional(),
    ach: z
      .object({
        accountNumber: z.string(),
        routingNumber: z.string(),
        accountType: z.enum(['checking', 'savings']),
        name: z.string().optional(),
      })
      .optional(),
    metadata: z.record(z.any()).optional(),
  })
  .refine(
    (data) => {
      if (data.type === 'card') {
        return !!data.card;
      }
      if (data.type === 'ach') {
        return !!data.ach;
      }
      return true;
    },
    {
      message:
        "When type is 'card' a card object must be provided, and when type is 'ach' an ach object must be provided.",
    }
  );

export const UpdatePaymentMethodSchema = z.object({
  id: z.string(),
  metadata: z.record(z.any()).optional(),
  card: z
    .object({
      expiryMonth: z
        .string()
        .regex(/^(0[1-9]|1[0-2])$/)
        .optional(),
      expiryYear: z
        .string()
        .regex(/^\d{2}$/)
        .optional(),
      name: z.string().optional(),
    })
    .partial()
    .optional(),
  ach: z
    .object({
      name: z.string().optional(),
    })
    .partial()
    .optional(),
});

export const ListExpiringPaymentMethodsSchema = z.object({
  withinMonths: z.number().int().min(1).max(24).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
});

/*** Response Schemas (optional) ***/
export const PaymentMethodSchema = z.object({
  id: z.string(),
  type: z.enum(['card', 'ach']),
  customerId: z.string(),
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]).optional(),
  card: z
    .object({
      brand: z.string(),
      last4: z.string(),
      expiryMonth: z.string(),
      expiryYear: z.string(),
    })
    .optional(),
  ach: z
    .object({
      accountType: z.enum(['checking', 'savings']),
      last4: z.string(),
      routingNumber: z.string(),
      bankName: z.string().optional(),
    })
    .optional(),
  metadata: z.record(z.any()).optional(),
});
