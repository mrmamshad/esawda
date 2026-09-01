import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const formPath = new URL('../src/components/shop/v2/ShopApplyForm.tsx', import.meta.url);
const source = await readFile(formPath, 'utf8');

test('shop application sends the document fields required by the API', () => {
  assert.match(source, /fd\.append\('documents\[nid\]', nidFile\)/);
  assert.match(source, /fd\.append\('documents\[trade_licence\]', tradeLicenceFile\)/);
  assert.doesNotMatch(source, /fd\.append\('documents\[\]'/);
});

test('both required documents are validated before guest registration', () => {
  const documentValidation = source.indexOf('if (!nidFile || !tradeLicenceFile)');
  const guestRegistration = source.indexOf("api<{ user: User; token: string }>('/auth/register'");

  assert.notEqual(documentValidation, -1);
  assert.notEqual(guestRegistration, -1);
  assert.ok(documentValidation < guestRegistration);
  assert.match(source, /label="NID"/);
  assert.match(source, /label="Trade licence"/);
});
