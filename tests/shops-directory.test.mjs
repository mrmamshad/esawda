import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const header = await readFile(new URL('../src/components/layout/Header.tsx', import.meta.url), 'utf8');
const drawer = await readFile(new URL('../src/components/layout/MobileDrawer.tsx', import.meta.url), 'utf8');
const page = await readFile(new URL('../src/app/shops/page.tsx', import.meta.url), 'utf8');

test('desktop and mobile navigation expose Shops after Products', () => {
  const products = header.indexOf("label: 'Products'");
  const shops = header.indexOf("label: 'Shops'");

  assert.ok(products >= 0);
  assert.ok(shops > products);
  assert.match(header, /href: '\/shops'/);
  assert.match(drawer, /href: '\/shops'[\s\S]*label: 'Browse shops'/);
});

test('shops page uses separate shop categories and shop profiles', () => {
  assert.match(page, /api<ShopCategory\[]>\('\/shop-categories'/);
  assert.match(page, /api<Shop\[]>\('\/shops\?'/);
  assert.match(page, /<ShopCategorySidebar/);
  assert.match(page, /<ShopCard key={shop\.id} shop={shop}/);
  assert.doesNotMatch(page, /api<Category\[]>/);
  assert.doesNotMatch(page, /<ListingCard/);
});
