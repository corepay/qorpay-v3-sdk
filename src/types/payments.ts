/**
 * @file src/types/payments.ts
 * @description Type definitions for QorPay V3 Payment operations.
 * Includes card payments, ACH, cash, and gift cards.
 */

import type {
  BaseQorPayResponse,
  Currency,
  Maybe,
  OrderId,
  ReferenceId,
  Timestamp,
  TransactionId,
} from './common';

/**
 * Wrapper for request bodies that use a `transaction_data` object.
 * @template T The type of the actual transaction data.
 */
export interface TransactionDataWrapper<T> {
  transaction_data: T;
}

// --- Shared/Common Payment Sub-Interfaces ---

/**
 * Represents billing address information.
 */
export interface BillingAddress {
  /** The card billing street address 1. */
  baddress?: Maybe<string>;
  /** The card billing street address 2. */
  baddress2?: Maybe<string>;
  /** The card billing address city name. */
  bcity?: Maybe<string>;
  /** The ISO 3166-2 alpha-2 code for the card billing address state. */
  bstate?: Maybe<string>;
  /** The numeric 5 digit (US) postal code or 6 alpha/numeric character international postal code. */
  bzip?: Maybe<string>;
  /** The ISO 3166-2 alpha-2 code for the card billing address country. */
  bcountry?: Maybe<string>;
}

/**
 * Represents customer contact information.
 */
export interface CustomerDetails {
  /** Customer first name. Max length 60. */
  cfirstname?: Maybe<string>;
  /** Customer last name. */
  clastname?: Maybe<string>;
  /** Customer email address. Max length 120. */
  cemail?: Maybe<string>;
  /** Customer phone number. Max length 20. */
  cphone?: Maybe<string>;
}

/**
 * Base fields for most card payment requests.
 */
export interface CardPaymentBase {
  /** The merchant id (MID) assigned by QorCommerce. Max length 24. */
  mid: string;
  /**
   * Total amount to process.
   * Example for $12.00: "12", "12.0", or "12.00".
   * Example for $10.50: "10.5" or "10.50".
   */
  amount: string;
  /**
   * Unique order ID. If none provided, gateway inserts a 36-char unique ID.
   * Duplicate orderid will result in a Declined transaction.
   */
  orderid?: Maybe<OrderId>;
  /** IP address of the client or server. Max length 16. Example: "148.18.27.134". */
  ipaddress?: Maybe<string>;
  /** ISO 4217 alphabetic currency code. */
  currency?: Maybe<Currency>;
  /** A reference id that will be echoed back in the message response. */
  reference_id?: Maybe<ReferenceId>;
  /** Set a value to route a transaction to a pre-defined provider. */
  topt?: Maybe<string>;
  /** Terminal ID for processing (required for MarketPlace transactions). */
  tid?: Maybe<string>;
  /** Merchant invoice number. */
  invoiceid?: Maybe<string>;
  /** The amount of the total sum of this transaction that is made up of the service_charge. */
  service_charge?: Maybe<string>;
}

/**
 * Detailed card information for requests.
 */
export interface CardDetailsData {
  /** Card account number (no spaces/special chars) or card token. Max length 16. */
  creditcard: string;
  /** Card Verification Value (CVV). 3-4 digits. Max length 4. */
  cvv?: Maybe<string>;
  /** Card expiration 2-digit month (e.g., "04"). */
  month?: Maybe<string>;
  /** Card expiration 2-digit year (e.g., "22"). */
  year?: Maybe<string>;
  /** Full cardholder name or company printed/embossed on the card. */
  cardfullname?: Maybe<string>;
  /** Set to true to store card in vault and return a token. */
  store_card?: Maybe<boolean>;
  /** Risk score if using a risk prevention system. */
  risk_score?: Maybe<number>;
}

/**
 * Represents an item in a Level 2/3 transaction.
 * Based on `request-item-object` schema.
 */
export interface ItemL2L3 {
  /** The Item name. Max length 40. */
  name: string;
  /** The item description. Max length 255. */
  description?: Maybe<string>;
  /** The item Uniform Commercial Code (UCC code). Max length 12. */
  ucc?: Maybe<string>;
  /** The item Universal Product Code (UPC). Max length 12. */
  upc?: Maybe<string>;
  /** Price per item unit. Min 0.00005, Max 99999.99. */
  unit_price?: Maybe<number>;
  /** Number of items sold. Min 0.00005, Max 99999.99. */
  units_sold?: Maybe<number>;
  /** Item unit of measurement (e.g., "each", "carton"). */
  unit_measurement?: Maybe<string>;
  /** Total amount for this item (unit_price * units_sold + taxes/fees/discounts). */
  total_amount: string;
}

// --- Card Payment Types ---

/**
 * Request data for a manual/keyed credit/debit card sale (eComm).
 * Combines `request-card-sale-required`, `request-card-detail`, `request-customer-card-sale`.
 */
export type PaymentSaleManualRequestData = CardPaymentBase &
  CardDetailsData &
  BillingAddress &
  CustomerDetails;

/**
 * Request data for a purchase with a Cash Discount.
 */
export interface PaymentSaleCashDiscountRequestData {
  mid?: Maybe<string>;
  amount: string;
  cash_discount_amount?: Maybe<string>;
  cash_discount_percentage?: Maybe<number>;
  service_charge?: Maybe<string>;
  creditcard: string;
  cvv: string;
  currency?: Maybe<string>;
  invoiceid?: Maybe<string>;
  orderid: OrderId;
  ipaddress?: Maybe<string>;
  cfirstname?: Maybe<string>;
  clastname?: Maybe<string>;
  cemail?: Maybe<string>;
  cphone?: Maybe<string>;
  risk_score?: Maybe<number>;
  reference_id?: Maybe<ReferenceId>;
  topt?: Maybe<string>;
}

/**
 * Request data for a swiped card sale (Track Data).
 * Based on `request-credit-card-track` elements.
 */
export interface PaymentSaleSwipeRequestData extends CardPaymentBase {
  /** Track data provided by the card reader. */
  trackdata: string;
  /** KSN for encrypted track data, if provided by terminal. Max length 20. */
  ksnTrack?: Maybe<string>;
  store_card?: Maybe<boolean>;
}

/**
 * Request data for a sale using a Payment Token.
 */
export interface PaymentSaleTokenRequestData
  extends Omit<CardPaymentBase, 'mid'> {
  mid?: Maybe<string>;
  /** The card token. */
  creditcard: string; // This is the token
  cvv?: Maybe<string>;
  cfirstname?: Maybe<string>;
  clastname?: Maybe<string>;
  cemail?: Maybe<string>;
  cphone?: Maybe<string>;
  risk_score?: Maybe<number>;
}

/**
 * Request data for a sale with Level 2 or 3 Transaction Data.
 */
export interface PaymentSaleLvl3RequestData extends CardPaymentBase {
  islvl3?: Maybe<boolean>;
  creditcard: string;
  cvv: string;
  month: string;
  year: string;
  bzip: string;
  cardfullname?: Maybe<string>;
  baddress?: Maybe<string>;
  baddress2?: Maybe<string>;
  bcity?: Maybe<string>;
  bstate?: Maybe<string>;
  bcountry?: Maybe<string>;
  cfirstname?: Maybe<string>;
  clastname?: Maybe<string>;
  cemail?: Maybe<string>;
  cphone?: Maybe<string>;
  total_tax?: Maybe<number>; // Spec says integer, but usually decimal for currency
  purchase_order?: Maybe<string>;
  shipping_amount?: Maybe<number>; // Spec says integer
  shipping_zip?: Maybe<string>;
  shipping_country?: Maybe<string>; // ISO 3166-2 alpha-2
  items?: Maybe<ItemL2L3[]>;
}

/**
 * 3D Secure (3DSv2) specific data.
 */
export interface ThreeDSecureData {
  /** 3-D Secure Cardholder Authentication Verification Value (MasterCard's UCAF value). Max 40. */
  CAVV: string;
  /** 3-D Secure Transaction Identifier. Max 40. */
  XID: string;
  /**
   * Electronic Commerce Indicator.
   * "01": SSL 3-D Secure authentication (cardholder enrolled).
   * "02": SSL 3-D Secure authentication (cardholder not enrolled or partial authenticated).
   */
  ECIFlag: '01' | '02' | string; // string for flexibility if other values exist
}

/**
 * Request data for a sale using 3D Secure (3DSv2).
 */
export interface PaymentSale3DSRequestData
  extends CardPaymentBase,
    BillingAddress,
    CustomerDetails,
    ThreeDSecureData {
  creditcard: string;
  cvv: string;
  month: string;
  year: string;
  cardfullname?: Maybe<string>;
  risk_score?: Maybe<number>;
  store_card?: Maybe<number | boolean>; // Spec says integer, but boolean makes more sense
}

/**
 * Request data for a PIN Debit purchase.
 * Combines `request-card-sale-required`, `request-credit-card-track`, `request-customer-card-sale`.
 */
export interface PaymentSalePinRequestData
  extends CardPaymentBase,
    CustomerDetails {
  /** Track data from card reader. */
  trackdata: string;
  /** KSN for encrypted track data. Max 20. */
  ksnTrack?: Maybe<string>;
  /** Encrypted PIN block. */
  PIN: string;
  /** KSN for PIN block encryption. */
  knsPIN: string; // Assuming this is a typo for ksnPIN
}

/**
 * Request data for a Point of Sale (POS) purchase.
 * Combines `request-card-sale-required`, `request-card-detail`, `request-customer-card-sale`.
 */
export type PaymentSalePosRequestData = PaymentSaleManualRequestData;

/**
 * Request data for setting up a new recurring purchase.
 * Similar to `PaymentSaleManualRequestData`.
 */
export type PaymentRecurringSetupRequestData = PaymentSaleManualRequestData;

/**
 * Request data for processing an existing recurring purchase (QorCommerce initiated).
 */
export interface PaymentRecurringExistingRequestData extends CardPaymentBase {
  creditcard: string; // Card account number or token
  cvv?: Maybe<string>;
  is_recurring?: Maybe<boolean>; // Default true
  /** Transaction ID of the first recurring payment in the series. */
  first_trxn?: Maybe<TransactionId>;
  cfirstname?: Maybe<string>;
  clastname?: Maybe<string>;
  cemail?: Maybe<string>;
  cphone?: Maybe<string>;
}

/**
 * Request data for re-processing your existing purchase (merchant initiated).
 */
export interface PaymentRecurringMyRequestData {
  mid: string;
  topt?: Maybe<string>;
  /** Transaction ID of your original approved payment to be re-processed. */
  transaction_id: TransactionId;
  reference_id?: Maybe<ReferenceId>;
  /** Card Verification Value. */
  cvv: string;
  /**
   * The amount for this specific recurring charge.
   * Note: The OpenAPI spec example includes `amount` but the properties list does not.
   * Assuming it might be needed if the amount can change per recurrence.
   */
  amount?: Maybe<string>;
}

/**
 * Hospitality-specific parameters for authorizations.
 * Based on `request-auth-hospitality-params`.
 */
export interface AuthHospitalityParams {
  /** Start date for stay/rental (YYMMDD). Max 6. Example: "190408". */
  startDate: string;
  /** End date for stay/rental (YYMMDD). Max 6. Example: "190416". */
  endDate: string;
  /** Integer unit of time (e.g., 4 for hours, days, months). Used with `rate`. */
  duration: number;
  /** Decimal amount to charge per `duration` unit (e.g., 34.99 for $34.99). */
  rate: number;
  /** Folio Number (Lodging) or Rental Agreement Number (Auto Rental). Max 20. */
  referenceNum: string;
  /**
   * Integer for additional charge item:
   * 2=Restaurant, 3=Gift Shop, 4=Mini Bar, 5=Telephone, 6=Other, 7=Laundry.
   */
  extraCharge?: Maybe<number>;
  /** Integer to flag specific events: 1=Incremental Auth, 2=No Show, 3=Auth Reversal. */
  flag?: Maybe<number>;
  /** Initial authorization amount. */
  initialAuthAmount?: Maybe<string>;
}

/**
 * Request data for an Authorization (pre-auth).
 * Combines `request-card-sale-required`, `request-card-detail`, `request-customer-card-sale`, `request-auth-hospitality-params`.
 */
export type PaymentAuthRequestData = PaymentSaleManualRequestData &
  Partial<AuthHospitalityParams>;

/**
 * Request data for an Authorization (pre-auth) using a Payment Token.
 * Combines `request-card-sale-required`, `request-card-detail-token`, `request-customer-card-sale`, `request-auth-hospitality-params`.
 */
export interface PaymentAuthTokenRequestData
  extends CardPaymentBase,
    Omit<CardDetailsData, 'month' | 'year' | 'cardfullname' | 'store_card'>, // Token doesn't need exp or full name for auth typically
    CustomerDetails,
    BillingAddress, // Billing address might still be relevant for AVS with token
    Partial<AuthHospitalityParams> {
  /** The card token. */
  creditcard: string;
}

/**
 * Request data for voiding/canceling a Sale or Authorization.
 */
export interface PaymentVoidRequestData {
  /** `transaction_id` from a prior Sale or Authorization transaction. */
  transaction_id: TransactionId;
  reference_id?: Maybe<ReferenceId>;
}

/**
 * Request data for refunding a Sale or Capture.
 * Based on `request-capture-refund`.
 */
export interface PaymentRefundRequestData {
  mid: string;
  amount: string;
  transaction_id: TransactionId;
  orderid: OrderId;
  reference_id?: Maybe<ReferenceId>;
}

/**
 * Request data for capturing funds previously Pre-Authorized.
 * Based on `request-capture-auth`.
 */
export interface PaymentCaptureRequestData {
  mid: string;
  amount: string;
  transaction_id: TransactionId;
  orderid?: Maybe<OrderId>; // Spec example for capture doesn't list orderid as required, but refund does
  reference_id?: Maybe<ReferenceId>;
}

/**
 * Common response payload for Sale and Auth operations.
 * Based on `response-sale-auth`.
 */
export interface SaleAuthResponsePayload extends BaseQorPayResponse {
  status: 'approved' | 'declined' | 'error' | string;
  /** Date and time of the transaction (e.g., "2020-11-03 07:13:55"). */
  transaction_date?: Maybe<Timestamp>;
  /** Gateway unique transaction identifier. */
  transaction_id?: Maybe<TransactionId>;
  /** Total amount approved and charged. */
  amount_approved?: Maybe<string>;
  /** Host processor authorization code. */
  authcode?: Maybe<string>;
  /** Card token if `store_card` was true in request. */
  token?: Maybe<string>;
}

/**
 * Response payload for void, refund, capture operations that return status, code, message.
 * This can often be represented by `QorPayStandardResponse` from common types.
 */
export type PaymentActionResponsePayload = BaseQorPayResponse;

// --- ACH / Bank Transfer Payment Types ---

/**
 * Request data for an ACH Debit (Sale).
 * Based on `input-ach-debit`.
 */
export interface AchDebitRequestData {
  mid: string;
  reference_id?: Maybe<ReferenceId>;
  topt?: Maybe<string>;
  amount: string;
  orderid?: Maybe<OrderId>;
  /** Standard Entry Class (SEC) Code. See QorPay docs. Max 3. */
  seccode: string;
  /** Check number (required if seccode = RCK). Max 8. */
  checknumber?: Maybe<string>;
  /** Check date (MMDDYY or MMDDYYYY). Max 8. Example: "040319". */
  checkdate?: Maybe<string>;
  /** Transaction date (MMDDYY or MMDDYYYY). Max 8. Example: "040319". */
  transactiondate?: Maybe<string>;
  /** Bank checking account routing number (ABA). Max 10. */
  routing_number: string; // Changed from abanumber for consistency
  /** Checking account number or account token. Max 40. */
  account_number: string;
  /** Bank account type. */
  account_type: 'checking' | 'savings' | 'money market';
  /** Name or nickname for this account. Max 80. */
  name_on_account: string;
  /** Name of the bank. Max 80. */
  bankname?: Maybe<string>;
  /** Bank city name. Max 40. */
  bankcity?: Maybe<string>;
  /** ISO 3166-2 alpha-2 code for the bank state. Max 2. */
  bankstate?: Maybe<string>;
  /** Merchant Customer ID. Max 40. */
  customerid?: Maybe<string>;
  cfirstname?: Maybe<string>;
  clastname?: Maybe<string>;
  cphone?: Maybe<string>;
  cemail?: Maybe<string>;
  /** Account holder street 1 address. Max 120. */
  caddress?: Maybe<string>;
  /** Account holder street 2 address. Max 20. */
  caddress2?: Maybe<string>;
  /** Account holder city name. Max 40. */
  ccity?: Maybe<string>;
  /** ISO 3166-2 alpha-2 code for the account holder state. */
  cstate?: Maybe<string>;
  /** Account holder zip code. */
  czip?: Maybe<string>;
  /** Free form text memo. Max 255. */
  memo?: Maybe<string>;
  /** If true, stores account info and returns a token. */
  store_accnt?: Maybe<boolean>; // Not explicitly in spec but common for tokenization
}

/**
 * Request data for an ACH Credit (Payout).
 * Based on `input-ach-credit`.
 */
export type AchCreditRequestData = AchDebitRequestData; // Structure is identical in spec

/**
 * Request data for voiding an ACH transaction.
 * Based on `input-void-ach`.
 */
export interface AchVoidRequestData {
  mid: string;
  /** Gateway transaction_id of the original ACH Debit or Credit. */
  transaction_id: TransactionId;
  reference_id?: Maybe<ReferenceId>;
}

/**
 * Request data for refunding an ACH Debit transaction.
 * Based on `input-ach-refund`.
 */
export interface AchRefundRequestData {
  mid: string;
  transaction_id: TransactionId;
  orderid?: Maybe<OrderId>;
  amount?: Maybe<string>; // Spec for /payment/ach/refund has amount in example but not in properties
  reference_id?: Maybe<ReferenceId>;
}

/**
 * Response payload for an ACH Sale (Debit).
 * Based on `response-200-ach-sale`.
 */
export interface AchSaleResponsePayload extends BaseQorPayResponse {
  status: 'approved' | 'declined' | 'error' | string;
  transaction_date?: Maybe<Timestamp>;
  transaction_id?: Maybe<TransactionId>;
  amount_approved?: Maybe<string>;
  /** Account token if `store_accnt` was true. */
  token?: Maybe<string>;
}

/**
 * Response payload for an ACH Credit (Payout).
 * Based on `response-200-ach-credit-payout`.
 */
export interface AchCreditResponsePayload extends BaseQorPayResponse {
  status: 'approved' | 'declined' | 'error' | string;
  transaction_date?: Maybe<Timestamp>;
  transaction_id?: Maybe<TransactionId>;
  amount_approved?: Maybe<string>;
}

/**
 * Response payload for an ACH Void operation.
 * The spec shows a `data` object in the response, but it's empty.
 */
export interface AchVoidResponsePayload extends BaseQorPayResponse {
  status: 'OK' | 'error' | string; // Spec example uses "OK"
  data?: Maybe<Record<string, never>>; // Empty object
}

/**
 * Response payload for an ACH Refund operation.
 */
export type AchRefundResponsePayload = BaseQorPayResponse;

// --- Cash Payment Types ---

/**
 * Transaction data for a Cash Sale.
 */
export interface CashSaleTransactionData {
  orderid: OrderId;
  invoiceid?: Maybe<string>;
  reference_id?: Maybe<ReferenceId>;
  topt?: Maybe<string>;
  amount: string;
  service_charge?: Maybe<string>;
  currency?: Maybe<Currency>; // Defaults to USD
  cfirstname?: Maybe<string>;
  clastname?: Maybe<string>;
  /** Customer identity type (e.g., "dl", "passport", "other"). */
  cidentity_type?: Maybe<string>;
  /** Customer identity value. */
  cidentity?: Maybe<string>;
  cemail?: Maybe<string>;
  cphone?: Maybe<string>;
  ipaddress?: Maybe<string>;
}

/**
 * Request for recording a Cash Sale.
 * Based on `cash-saleBody`.
 */
export interface CashSaleRequest {
  /** Transaction type, defaults to "cash". */
  type?: 'cash' | string;
  mid: string;
  transaction_data: CashSaleTransactionData;
  items?: Maybe<ItemL2L3[]>;
}

/**
 * Response payload for a Cash Sale.
 * Based on `response-201-cash-sale`.
 */
export interface CashSaleResponsePayload extends BaseQorPayResponse {
  status: 'approved' | 'error' | string;
  transaction_date?: Maybe<Timestamp>;
  transaction_id?: Maybe<TransactionId>;
  amount_recorded?: Maybe<string>;
}

// --- Gift Card Payment Types ---

/**
 * Request data for checking Gift Card balance.
 */
export interface GiftCardBalanceRequestData {
  /** Merchant ID making this request. */
  mid: string;
  /** Gift card account number. */
  creditcard: string;
  /** Set to 2 for balance inquiry. Min 1, Max 10. */
  giftcard: 2 | number;
  reference_id?: Maybe<ReferenceId>;
}

/**
 * Request data for processing a sale using a Gift Card.
 * Based on `request-gift-card-redeem`.
 */
export interface GiftCardSaleRequestData {
  mid: string;
  amount: string;
  orderid?: Maybe<OrderId>;
  ipaddress?: Maybe<string>;
  /** Gift card account number. */
  creditcard: string;
  /**
   * Redemption code.
   * 1 = full redemption, 8 = partial redemption. Min 1, Max 8.
   */
  giftcard: 1 | 8 | number;
  reference_id?: Maybe<ReferenceId>;
}

/**
 * Request data for refunding a Gift Card transaction.
 */
export interface GiftCardRefundRequestData {
  mid: string;
  amount: string;
  transaction_id: TransactionId;
  /** The gift card number. Not explicitly in spec properties but implied. */
  creditcard?: Maybe<string>;
  /** Gift card operation type, often used internally. */
  giftcard?: Maybe<number>;
  reference_id?: Maybe<ReferenceId>;
}

/**
 * Request data for loading/reloading a Gift Card.
 */
export interface GiftCardLoadRequestData extends BillingAddress {
  mid: string; // Spec example has mid, properties do not. Assuming mid is needed.
  amount: string;
  creditcard: string; // This is the gift card number to load
  cvv?: Maybe<string>; // CVV of the payment card used to load, if applicable
  month?: Maybe<string>; // Expiry of payment card
  year?: Maybe<string>; // Expiry of payment card
  cardfullname?: Maybe<string>; // Name on payment card
  orderid?: Maybe<OrderId>;
  ipaddress?: Maybe<string>;
  currency?: Maybe<Currency>;
  reference_id?: Maybe<ReferenceId>;
}

/**
 * Request data for activating or de-activating a Gift Card.
 * Based on `gift-activateBody`.
 */
export interface GiftCardActivateDeactivateRequestData extends BillingAddress {
  mid: string;
  /** Amount to activate with, or current balance for deactivate. */
  amount: string;
  /** Gift card number. */
  creditcard: string;
  cvv?: Maybe<string>;
  month?: Maybe<string>;
  year?: Maybe<string>;
  cardfullname?: Maybe<string>;
  orderid?: Maybe<OrderId>;
  invoiceid?: Maybe<string>;
  ipaddress?: Maybe<string>;
  currency?: Maybe<Currency>;
  reference_id?: Maybe<ReferenceId>;
  topt?: Maybe<string>;
  /** Gift card operation type. Spec implies this might be used internally. */
  giftcard?: Maybe<number>;
}

/**
 * Response payload for Gift Card operations (sale, balance, etc.).
 * Based on `response-gift-card`.
 */
export interface GiftCardOperationResponsePayload extends BaseQorPayResponse {
  status: 'approved' | 'declined' | 'error' | string;
  transaction_date?: Maybe<Timestamp>;
  transaction_id?: Maybe<TransactionId>;
  amount_approved?: Maybe<string>;
  /** Current balance on the gift card. */
  balance?: Maybe<string>;
  authcode?: Maybe<string>;
}

/**
 * Specific response for gift card balance check if it differs structurally.
 * The generic `GiftCardOperationResponsePayload` should cover it as per current spec.
 */
export type GiftCardBalanceResponsePayload = GiftCardOperationResponsePayload;

/**
 * Response for Gift Card Activate/Deactivate/Load/Refund if they are standard.
 * The default response in spec is empty, implying it might be a standard status/code/message.
 */
export type GiftCardManageResponsePayload = BaseQorPayResponse;

// --- Type Aliases for Export Compatibility ---

/**
 * Card payment type aliases to match expected import names
 */
export type PaymentCardRequest = TransactionDataWrapper<PaymentSaleManualRequestData>;
export type PaymentCardResponse = SaleAuthResponsePayload;
export type PaymentCardObject = SaleAuthResponsePayload;
export type PaymentCardTokenObject = SaleAuthResponsePayload;
export type PaymentCardRefundRequest = TransactionDataWrapper<PaymentRefundRequestData>;
export type PaymentCardRefundResponse = PaymentActionResponsePayload;
export type PaymentCardVoidRequest = TransactionDataWrapper<PaymentVoidRequestData>;
export type PaymentCardVoidResponse = PaymentActionResponsePayload;

/**
 * ACH payment type aliases to match expected import names
 */
export type PaymentAchRequest = TransactionDataWrapper<AchDebitRequestData>;
export type PaymentAchResponse = AchSaleResponsePayload;
export type PaymentAchObject = AchSaleResponsePayload;
export type PaymentAchRefundRequest = TransactionDataWrapper<AchRefundRequestData>;
export type PaymentAchRefundResponse = AchRefundResponsePayload;
export type PaymentAchVoidRequest = TransactionDataWrapper<AchVoidRequestData>;
export type PaymentAchVoidResponse = AchVoidResponsePayload;

/**
 * Cash payment type aliases to match expected import names
 */
export type PaymentCashRequest = CashSaleRequest;
export type PaymentCashResponse = CashSaleResponsePayload;

/**
 * Resource request data type aliases to match expected import names
 */
export type PaymentAchDebitRequestData = AchDebitRequestData;
export type PaymentAchCreditRequestData = AchCreditRequestData;
export type PaymentAchVoidRequestData = AchVoidRequestData;
export type PaymentAchRefundRequestData = AchRefundRequestData;
export type PaymentCashRequestData = CashSaleTransactionData;
