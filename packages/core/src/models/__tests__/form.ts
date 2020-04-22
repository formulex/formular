import assert from 'assert';
import { createForm, isFormInstance } from '../form';

describe('models/form', () => {
  describe('createForm', () => {
    it('should return FormInstance type', () => {
      assert(typeof createForm === 'function');
      const onFinish = jest.fn();
      const form = createForm({ onFinish });
      assert(isFormInstance(form));
      expect(onFinish).toHaveBeenCalledTimes(0);
    });

    it('have initialValues', () => {
      const onFinish = jest.fn();
      const form = createForm({
        onFinish,
        initialValues: { hello: 'world', other: 'mom' }
      });
      assert.deepEqual(form.values, {});

      const fieldEffect = jest.fn();
      form.registerField('hello', fieldEffect, {});
      assert.deepEqual(form.values, { hello: 'world' });

      form.registerField('name', void 0, { initialValue: 'daddy' });
      assert.deepEqual(form.values, { hello: 'world', name: 'daddy' });

      form.registerField('other', void 0, { initialValue: 'dad' });
      assert.deepEqual(form.values, {
        hello: 'world',
        name: 'daddy',
        other: 'dad'
      });
    });
  });
});
