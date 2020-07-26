import React from 'react';
import { createForm } from '@formular/core';
import { act, cleanup } from '@testing-library/react';

const timeout = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const sleep = async (ms: number) => {
  await act(async () => {
    await timeout(ms);
  });
};

describe('form', () => {
  afterEach(cleanup);

  it('should work', () => {
    console.log(<div x-form={123}>hello</div>);
  });
});
