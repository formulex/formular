import { createForm } from '@formular/core';

const sleep = (ms: number = 0) => new Promise((r) => setTimeout(r, ms));

describe('validation.formAPI', () => {
  const checkRule = (_, value) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (value === '1') {
          resolve();
        } else {
          reject(new Error('must be 1'));
        }
      }, 100);
    });

  let form;

  beforeEach(() => {
    form = createForm();
    form.registerField('normal');
    form.registerField('async', () => {}, { rule: { validator: checkRule } });
  });

  it('should work with validateFields', async () => {
    try {
      await form.validateFields();
      throw new Error('should not pass');
    } catch ({ values, errorFields }) {
      expect(values.normal).toEqual(undefined);
      expect(values.async).toEqual(undefined);
      expect(errorFields.length).toBe(1);

      const entity = errorFields[0];
      expect(entity.name).toEqual('async');
      expect(entity.errors).toEqual(['must be 1']);
    }
  });

  it('validateFields works for ok', async () => {
    form.change('async', '1');
    await sleep();
    const values = await form.validateFields();
    expect(values.normal).toBe(undefined);
    expect(values.async).toBe('1');
  });

  it('will error if change when validateFields', async (done) => {
    form.validateFields().catch(({ errorFields, outOfDate }) => {
      expect(errorFields.length).toBeTruthy();
      expect(outOfDate).toBeTruthy();
    });
    form.validateFields().catch(({ errorFields, outOfDate }) => {
      expect(errorFields.length).toBeTruthy();
      expect(outOfDate).toBeFalsy();
      done();
    });

    form.change('async', '1');
  });
});
