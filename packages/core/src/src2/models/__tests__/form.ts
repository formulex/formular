import assert from 'assert';
import { createForm, isFormInstance } from '../form';
import { autorun } from 'mobx';

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

    it('should be silent', () => {
      const onFinish = jest.fn();
      const subscriber = jest.fn();
      const fieldEffect1 = jest.fn();
      const fieldEffect2 = jest.fn();
      const form = createForm({ onFinish, initialValues: { hello: 'world' } });
      assert.deepEqual(form.values, {});

      autorun(() => {
        subscriber(form.values);
      });
      expect(subscriber).toBeCalledTimes(1);

      expect(fieldEffect1).not.toBeCalled();
      form.registerField('name', fieldEffect1, {});
      expect(subscriber).toBeCalledTimes(2);
      expect(fieldEffect1).toBeCalledTimes(1);
      assert.deepEqual(form.values, { name: undefined });

      expect(fieldEffect2).not.toBeCalled();
      form.registerField('hello', fieldEffect2);
      expect(subscriber).toBeCalledTimes(3);
      expect(fieldEffect2).toBeCalledTimes(1);

      assert.deepEqual(form.values, { hello: 'world', name: undefined });
    });
  });
});
