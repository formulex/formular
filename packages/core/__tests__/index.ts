import { createForm } from '@formular/core';
import assert from 'assert';

describe('Form', () => {
  test('createForm is a function', () => {
    assert(typeof createForm === 'function');
  });
});
