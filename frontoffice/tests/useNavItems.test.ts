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
      '/prospects',
      '/athletes',
      '/programs-coach',
      '/programs-athlete',
      '/nutrition-coach',
      '/nutrition-athlete',
      '/help-center/coach',
      '/sandbox',
    ]);
  });

  it('returns coach menu without admin/athlete exclusives', () => {
    assert.deepEqual(extractPaths('coach'), [
      '/',
      '/prospects',
      '/athletes',
      '/programs-coach',
      '/nutrition-coach',
      '/help-center/coach',
    ]);
  });

  it('returns athlete menu without admin-only routes', () => {
    assert.deepEqual(extractPaths('athlete'), [
      '/',
      '/programs-athlete',
      '/nutrition-athlete',
      '/athlete-information',
      '/help-center/athlete',
    ]);
  });
});
