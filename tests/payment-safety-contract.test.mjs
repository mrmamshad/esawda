import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const phone = await read('src/lib/phone.ts');
const consent = await read('src/components/checkout/PaymentConsent.tsx');
const authGate = await read('src/components/interactive/AuthGate.tsx');
const adForm = await read('src/app/shop/(panel)/ads/new/AdForm.tsx');
const drawer = await read('src/components/layout/MobileDrawer.tsx');
const redirect = await read('src/lib/paymentRedirect.ts');

test('payment consent uses the shared Bangladesh phone normalizer', () => {
  assert.match(phone, /startsWith\('880'\).*'0' \+ d\.slice\(3\)/s);
  assert.match(consent, /normalizeBdMobile as normalizeBdPhone/);
  assert.doesNotMatch(consent, /'88' \+ digits\.slice\(1\)/);
});

test('payment consent links every required policy without fixed refund timing', () => {
  assert.match(consent, /Terms & Conditions/);
  assert.match(consent, /Privacy Policy/);
  assert.match(consent, /Refund & Cancellation Policy/);
  assert.doesNotMatch(consent, /5[–-]7 business days/);
});

test('auth tokens are cleared only after an authoritative 401', () => {
  assert.match(authGate, /error instanceof ApiError && error\.status === 401/);
  assert.match(adForm, /error instanceof ApiError && error\.status === 401/);
});

test('tablet navigation keeps the drawer available below lg', () => {
  assert.match(drawer, /btn-focus lg:hidden/);
  assert.match(drawer, /z-\[120\] lg:hidden/);
});

test('all payment flows use the strict shared redirect validator', async () => {
  assert.match(redirect, /startsWith\('\/'\) && !candidate\.startsWith\('\/\/'\)/);
  assert.match(redirect, /url\.protocol !== 'https:'/);
  assert.match(adForm, /isSafePaymentRedirect/);

  for (const path of [
    'src/app/membership/checkout/[planId]/CheckoutForm.tsx',
    'src/app/shop/(panel)/ads/[id]/boost/BoostForm.tsx',
    'src/app/shop/(panel)/plan/ShopPlansClient.tsx',
  ]) {
    assert.match(await read(path), /isSafePaymentRedirect/);
  }
});
