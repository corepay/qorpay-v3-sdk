import { z } from 'zod';

// --- Shared/Common Payment Schemas ---

export const BillingAddressSchema = z.object({
  baddress: z.string().optional().nullable(),
  baddress2: z.string().optional().nullable(),
  bcity: z.string().optional().nullable(),
  bstate: z.string().length(2).optional().nullable(),
  bzip: z.string().optional().nullable(),
  bcountry: z.string().length(2).optional().nullable(),
});

export const CustomerDetailsSchema = z.object({
  cfirstname: z.string().max(60).optional().nullable(),
  clastname: z.string().optional().nullable(),
  cemail: z.string().email().max(120).optional().nullable(),
  cphone: z.string().max(20).optional().nullable(),
});

export const CardPaymentBaseSchema = z.object({
  mid: z.string().max(24),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format'),
  orderid: z.string().optional().nullable(),
  ipaddress: z.string().max(16).optional().nullable(),
  currency: z.string().length(3).optional().nullable(),
  reference_id: z.string().optional().nullable(),
  topt: z.string().optional().nullable(),
  tid: z.string().optional().nullable(),
  invoiceid: z.string().optional().nullable(),
  service_charge: z.string().optional().nullable(),
});

export const CardDetailsDataSchema = z.object({
  creditcard: z.string().max(16),
  cvv: z.string().max(4).optional().nullable(),
  month: z.string().length(2).optional().nullable(),
  year: z.string().length(2).optional().nullable(),
  cardfullname: z.string().optional().nullable(),
  store_card: z.boolean().optional().nullable(),
  risk_score: z.number().optional().nullable(),
});

// --- Card Payment Schemas ---

export const PaymentSaleManualRequestSchema = CardPaymentBaseSchema.merge(
  CardDetailsDataSchema
)
  .merge(BillingAddressSchema)
  .merge(CustomerDetailsSchema);

export const PaymentSaleCashDiscountRequestSchema = z.object({
  mid: z.string().optional().nullable(),
  amount: z.string(),
  cash_discount_amount: z.string().optional().nullable(),
  cash_discount_percentage: z.number().optional().nullable(),
  service_charge: z.string().optional().nullable(),
  creditcard: z.string(),
  cvv: z.string(),
  currency: z.string().optional().nullable(),
  invoiceid: z.string().optional().nullable(),
  orderid: z.string(),
  ipaddress: z.string().optional().nullable(),
  cfirstname: z.string().optional().nullable(),
  clastname: z.string().optional().nullable(),
  cemail: z.string().optional().nullable(),
  cphone: z.string().optional().nullable(),
  risk_score: z.number().optional().nullable(),
  reference_id: z.string().optional().nullable(),
  topt: z.string().optional().nullable(),
});

export const PaymentSaleSwipeRequestSchema = CardPaymentBaseSchema.extend({
  trackdata: z.string(),
  ksnTrack: z.string().max(20).optional().nullable(),
  store_card: z.boolean().optional().nullable(),
});

export const PaymentSaleTokenRequestSchema = CardPaymentBaseSchema.omit({
  mid: true,
}).extend({
  mid: z.string().optional().nullable(),
  creditcard: z.string(),
  cvv: z.string().optional().nullable(),
  cfirstname: z.string().optional().nullable(),
  clastname: z.string().optional().nullable(),
  cemail: z.string().optional().nullable(),
  cphone: z.string().optional().nullable(),
  risk_score: z.number().optional().nullable(),
});

export const RecurringDetailsSchema = z.object({
  frequency: z
    .enum([
      'daily',
      'weekly',
      'biweekly',
      'monthly',
      'quarterly',
      'semiannually',
      'annually',
    ])
    .optional()
    .nullable(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  total_occurrences: z.number().optional().nullable(),
});

export const PaymentRecurringSetupRequestSchema =
  PaymentSaleManualRequestSchema.extend({
    recurring: RecurringDetailsSchema.optional().nullable(),
  });

export const PaymentRecurringExistingRequestSchema =
  CardPaymentBaseSchema.extend({
    creditcard: z.string(),
    cvv: z.string().optional().nullable(),
    is_recurring: z.boolean().optional().nullable(),
    first_trxn: z.string().optional().nullable(),
    cfirstname: z.string().optional().nullable(),
    clastname: z.string().optional().nullable(),
    cemail: z.string().optional().nullable(),
    cphone: z.string().optional().nullable(),
  });

export const PaymentRecurringMyRequestSchema = z.object({
  mid: z.string(),
  topt: z.string().optional().nullable(),
  transaction_id: z.string(),
  reference_id: z.string().optional().nullable(),
  cvv: z.string(),
  amount: z.string().optional().nullable(),
});

export const AuthHospitalityParamsSchema = z.object({
  startDate: z.string().length(6),
  endDate: z.string().length(6),
  duration: z.number(),
  rate: z.number(),
  referenceNum: z.string().max(20),
  extraCharge: z.number().optional().nullable(),
  flag: z.number().optional().nullable(),
  initialAuthAmount: z.string().optional().nullable(),
});

export const PaymentAuthRequestSchema = PaymentSaleManualRequestSchema.merge(
  AuthHospitalityParamsSchema.partial()
);

export const PaymentAuthTokenRequestSchema = CardPaymentBaseSchema.merge(
  CardDetailsDataSchema.omit({
    month: true,
    year: true,
    cardfullname: true,
    store_card: true,
  })
)
  .merge(CustomerDetailsSchema)
  .merge(BillingAddressSchema)
  .merge(AuthHospitalityParamsSchema.partial())
  .extend({
    creditcard: z.string(),
  });

export const PaymentVoidRequestSchema = z.object({
  transaction_id: z.string(),
  reference_id: z.string().optional().nullable(),
});

export const PaymentRefundRequestSchema = z.object({
  mid: z.string(),
  amount: z.string(),
  transaction_id: z.string(),
  orderid: z.string(),
  reference_id: z.string().optional().nullable(),
});

export const PaymentCaptureRequestSchema = z.object({
  mid: z.string(),
  amount: z.string(),
  transaction_id: z.string(),
  orderid: z.string().optional().nullable(),
  reference_id: z.string().optional().nullable(),
});
