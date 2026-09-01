import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const homePage = await readFile(new URL('../src/app/page.tsx', import.meta.url), 'utf8');
const homeSections = await readFile(new URL('../src/components/home/HomeSections.tsx', import.meta.url), 'utf8');
const conditionGrid = await readFile(new URL('../src/components/home/CategoryConditionGrid.tsx', import.meta.url), 'utf8');

test('every homepage ad feed requests newest items first', () => {
  const requests = [...homePage.matchAll(/api<Ad\[\]>\('([^']+)'/g)].map((match) => match[1]);

  assert.equal(requests.length, 10);
  requests.forEach((request) => assert.match(request, /(?:\?|&)sort=-created_at(?:&|$)/));
  assert.equal(requests.filter((request) => request.includes('since_hours=24')).length, 2);
});

test('homepage defaults to all conditions and sorts the merged feed by recency', () => {
  assert.match(conditionGrid, /export type Condition = 'all' \| 'used' \| 'new'/);
  assert.match(homeSections, /useState<Condition>\('all'\)/);
  assert.match(homeSections, /function createdAtTimestamp\(ad: Ad\)/);
  assert.match(homeSections, /createdAtTimestamp\(b\) - createdAtTimestamp\(a\)/);
  assert.match(homeSections, /\[\.\.\.section\.used, \.\.\.section\.new\]/);
  assert.match(conditionGrid, /condition === 'all'\s*\? category\.ads_count/);
});
