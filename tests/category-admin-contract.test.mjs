import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const editor = await readFile(new URL('../src/app/admin/(panel)/categories/CategoryEditor.tsx', import.meta.url), 'utf8');
const table = await readFile(new URL('../src/app/admin/(panel)/categories/CategoriesTableClient.tsx', import.meta.url), 'utf8');
const page = await readFile(new URL('../src/app/admin/(panel)/categories/page.tsx', import.meta.url), 'utf8');

test('category editor controls every mutable category field', () => {
  for (const field of ['cat_name', 'slug', 'icon', 'cat_order', 'picture', 'remove_picture']) {
    assert.match(editor, new RegExp(`['\"]${field}['\"]`));
  }
  assert.match(editor, /new FormData\(\)/);
  assert.match(editor, /_method.*PATCH/);
  assert.match(editor, /image\/jpeg,image\/png,image\/webp/);
  assert.match(editor, /4 \* 1024 \* 1024/);
});

test('category table exposes image, usage, edit, and safe delete controls', () => {
  assert.match(table, /picture_url/);
  assert.match(table, /posts_count/);
  assert.match(table, /sub_categories_count/);
  assert.match(table, /label: 'Edit'/);
  assert.match(table, /label: 'Delete'/);
  assert.match(table, /Categories in use cannot be deleted/);
});

test('admin page advertises complete category control', () => {
  assert.match(page, /icons, images, URLs, and display order/);
});
