/**
 * Generate HTTP Idempotency-Key for checkout operations.
 * Format: {userId}-{timestamp}-{random}
 * Ensures the same user request is idempotent across retries.
 */

export function generateIdempotencyKey(userId?: number | string): string {
  const id = userId ? String(userId) : 'guest';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `${id}-${timestamp}-${random}`;
}
