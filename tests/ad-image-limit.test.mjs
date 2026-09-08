import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../src/app/shop/(panel)/ads/new/AdForm.tsx', import.meta.url), 'utf8');

test('post form allows zero to four total product images', () => {
  assert.match(source, /MAX_PRODUCT_IMAGES = 4/);
  assert.doesNotMatch(source, /files\.length < 1/);
  assert.match(source, /files\.length > MAX_PRODUCT_IMAGES/);
  assert.match(source, /selectedImageCount/);
  assert.match(source, /remainingImageSlots/);
});

test('main and optional image uploads share the four-slot budget', () => {
  assert.match(source, /Upload Main Image/);
  assert.match(source, /Upload Additional Images/);
  assert.match(source, /remainingImageSlots === 0/);
  assert.match(source, /`\+ Add \$\{remainingImageSlots\} More Image/);
  assert.match(source, /All 4 Images Selected/);
  assert.match(source, /files\.slice\(0, remainingImageSlots\)/);
  assert.match(source, /MAX_PRODUCT_IMAGES - \(featuredImage \? 1 : 0\)/);
  assert.ok(source.indexOf('className="mb-3 grid') < source.indexOf('disabled={disabled}'));
});

test('image picker exposes only backend-supported formats', () => {
  assert.match(source, /accept="image\/jpeg,image\/png,image\/webp"/);
  assert.match(source, /All images are optional/);
});
