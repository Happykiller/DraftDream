import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildNavItems } from '../src/layouts/hooks/useNavItems.js';

type Role = 'admin' | 'coach' | 'athlete';

const identity = (key: string) => key;

function extractPaths(role: Role): string[] {
  return buildNavItems(role, identity).map((item) => item.path);
}

describe('buildNavItems role permutations', () => {
  it('returns admin menu with all entries in order', () => {
    assert.deepEqual(extractPaths('admin'), [
      '/',
      '/clients',
      '/programs-coach',
      '/programs-athlete',
      '/sandbox',
    ]);
  });

  it('returns coach menu without admin/athlete exclusives', () => {
    assert.deepEqual(extractPaths('coach'), [
      '/',
      '/clients',
      '/programs-coach',
    ]);
  });

  it('returns athlete menu without admin-only routes', () => {
    assert.deepEqual(extractPaths('athlete'), [
      '/',
      '/programs-athlete',
    ]);
  });
});
