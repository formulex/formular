import { createForm } from '@formular/core';
import { reaction } from 'mobx';

const sleep = (ms: number = 0) => new Promise((r) => setTimeout(r, ms));

describe('validation.errors', () => {
  it('should remove field-level validation errors when a field is unregistered', async () => {
    const form = createForm();
    const spy = jest.fn();
    form.subscribe(({ form }) =>
      reaction(
        () => form.errors,
        () => spy(form),
        { fireImmediately: true }
      )
    );

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].errors).toEqual({});

    const unregister = form.registerField('username', () => () => {}, {
      rules: {
        validator: async (rule, value) => {
          if (!value) {
            throw new Error('Required');
          }
        }
      }
    });
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[1][0].errors).toEqual({ username: [] });

    await sleep();
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].errors).toStrictEqual({
      username: ['Required']
    });

    unregister();

    expect(spy).toHaveBeenCalledTimes(4);
    expect(spy.mock.calls[3][0].errors).toStrictEqual({});
  });
});
