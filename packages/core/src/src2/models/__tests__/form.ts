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
      const form = createForm({ onFinish, initialValues: { hello: 'world' } });
      assert.deepEqual(form.values, { hello: 'world' });
    });
  });
});
