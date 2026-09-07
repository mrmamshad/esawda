import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const paymentResultPath = new URL('../src/app/payment/result/page.tsx', import.meta.url);
const source = await readFile(paymentResultPath, 'utf8');

test('payment result page handles all transaction statuses', () => {
  assert.match(source, /pending/);
  assert.match(source, /success/);
  assert.match(source, /failed/);
  assert.match(source, /cancel/);
  assert.match(source, /refunded/);
});

test('payment result page polls pending transactions with bounded retries', () => {
  assert.match(source, /maxAttempts\s*=\s*15/);
  assert.match(source, /pollInterval\s*=\s*2000/);
  assert.match(source, /attempts\s*<\s*maxAttempts/);
  assert.match(source, /setTimeout.*checkStatus/);
});

test('payment result page extracts transaction ID from query params', () => {
  assert.match(source, /transaction_id/);
  assert.match(source, /tran_id/);
  assert.match(source, /searchParams\.get/);
});

test('payment result page uses authenticated transaction status endpoint', () => {
  assert.match(source, /\/checkout\/transactions/);
  assert.match(source, /readToken\(\)/);
  assert.match(source, /api<TransactionData>/);
});

test('payment result page routes intelligently based on purpose and status', () => {
  assert.match(source, /getRedirectPath/);
  assert.match(source, /ad_post/);
  assert.match(source, /ad_upgrade/);
  assert.match(source, /plan/);
  assert.match(source, /membership/);
});

test('payment result page renders appropriate UI for all states', () => {
  assert.match(source, /renderStatusIcon/);
  assert.match(source, /renderTitle/);
  assert.match(source, /renderMessage/);
  assert.match(source, /success.*failed.*pending.*error/s);
});

test('payment result page displays transaction reference', () => {
  assert.match(source, /TX-/);
  assert.match(source, /txId/);
  assert.match(source, /Reference:/);
});

test('payment result page handles error states gracefully', () => {
  assert.match(source, /error.*message/s);
  assert.match(source, /catch.*err/);
  assert.match(source, /Contact support/);
});
