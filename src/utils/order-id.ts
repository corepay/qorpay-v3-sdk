/**
 * @file src/utils/order-id.ts
 * @description Utility functions for generating order IDs.
 */

/**
 * Generates a random order ID with the specified length.
 *
 * @param length - The length of the order ID to generate (default: 10)
 * @returns A random alphanumeric order ID
 */
export function generateOrderId(length: number = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

/**
 * Ensures an order ID exists, generating one if not provided.
 *
 * @param orderId - Optional order ID from user
 * @param length - Length for generated order ID (default: 10)
 * @returns The provided order ID or a generated one
 */
export function ensureOrderId(orderId?: string, length: number = 10): string {
  return orderId || generateOrderId(length);
}