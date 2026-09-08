import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const menu = await readFile(new URL('../src/components/admin/v2/RowActionsMenu.tsx', import.meta.url), 'utf8');
const card = await readFile(new URL('../src/components/home/CategoryCard.tsx', import.meta.url), 'utf8');

test('row actions portal flips above the trigger near the viewport bottom', () => {
  assert.match(menu, /createPortal/);
  assert.match(menu, /window\.innerHeight - rect\.bottom/);
  assert.match(menu, /rect\.top - estimatedHeight - 6/);
  assert.match(menu, /window\.addEventListener\('scroll', placeMenu, true\)/);
  assert.match(menu, /z-\[300\]/);
});

test('category artwork stays fully visible over a cover backdrop', () => {
  assert.match(card, /object-cover opacity-30 blur-lg/);
  assert.match(card, /alt={category\.name}[\s\S]*object-contain/);
  assert.doesNotMatch(card, /alt={category\.name}[\s\S]*className="object-cover/);
});
