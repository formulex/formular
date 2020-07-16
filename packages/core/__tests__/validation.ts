import { createForm } from '@formular/core';
import { reaction } from 'mobx';

const sleep = (ms: number = 0) => new Promise((r) => setTimeout(r, ms));

describe('validation', () => {
  const prepareFieldSubscribers = (
    getFormSubscription,
    fieldSubscriptions,
    fieldConfig = {},
    config = {}
  ): any => {
    const form = createForm({ ...config });
    const formSpy = jest.fn();
    form.subscribe(({ form }) =>
      reaction(getFormSubscription(form), () => formSpy(form), {
        fireImmediately: true
      })
    );
    expect(formSpy).toHaveBeenCalled();
    expect(formSpy).toHaveBeenCalledTimes(1);
    expect(formSpy.mock.calls[0][0].values).toEqual(form.initialValues);

    return {
      ...Object.keys(fieldSubscriptions).reduce((result, name) => {
        const spy = jest.fn();
        form.registerField(
          name,
          (field) =>
            reaction(
              fieldSubscriptions[name](field),
              () => {
                spy(field);
                console.log('spy', field.validation.status);
              },
              {
                fireImmediately: true
              }
            ),
          fieldConfig[name]
        );
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledTimes(1);
        const { blur, change, focus } = spy.mock.calls[0][0];
        result[name] = {
          blur,
          change,
          focus,
          spy
        };
        return result;
      }, {}),
      form,
      formSpy
    };
  };

  it('should allow subscribing to error with field-level validation', async () => {
    const { foo, form } = prepareFieldSubscribers(
      () => () => {},
      {
        foo: (field) => () => [...field.validation.errors]
      },
      {
        foo: {
          rule: { required: true },
          messageVariables: { name: 'daddy' }
        }
      }
    );

    const { change, spy } = foo;

    expect(form.values).toStrictEqual({});
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].validation.errors).toStrictEqual([]);

    await sleep();

    expect(form.values).toStrictEqual({});
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[1][0].validation.errors).toStrictEqual([
      "'daddy' is required"
    ]);

    change('bar');
    expect(form.values).toStrictEqual({ foo: 'bar' });
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].validation.errors).toStrictEqual([]);

    await sleep();

    expect(form.values).toStrictEqual({ foo: 'bar' });
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].validation.errors).toStrictEqual([]);

    change('baz');
    expect(form.values).toStrictEqual({ foo: 'baz' });
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].validation.errors).toStrictEqual([]);

    await sleep();

    expect(form.values).toStrictEqual({ foo: 'baz' });
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].validation.errors).toStrictEqual([]);

    change(undefined);
    expect(form.values).toStrictEqual({});
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].validation.errors).toStrictEqual([]);

    await sleep();

    expect(form.values).toStrictEqual({});
    expect(spy).toHaveBeenCalledTimes(4);
    expect(spy.mock.calls[3][0].validation.errors).toStrictEqual([
      "'daddy' is required"
    ]);
  });

  it('should allow subscribing to status with field-level validation', async () => {
    const {
      foo: { change, spy }
    } = prepareFieldSubscribers(
      () => () => {},
      {
        foo: (field) => () => field.validation.status
      },
      {
        foo: {
          rule: { required: true, message: 'Required' }
        }
      }
    );
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].validation.status).toBe('PENDING');
    expect(spy.mock.calls[0][0].validation.errors).toStrictEqual([]);
    await sleep();
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[1][0].validation.status).toBe('INVALID');
    expect(spy.mock.calls[1][0].validation.errors).toStrictEqual(['Required']);
    change('bar');

    // field is now valid
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].validation.status).toBe('PENDING');
    expect(spy.mock.calls[2][0].validation.errors).toStrictEqual([]);
    await sleep();
    expect(spy).toHaveBeenCalledTimes(4);
    expect(spy.mock.calls[3][0].validation.status).toBe('VALID');
    expect(spy.mock.calls[3][0].validation.errors).toStrictEqual([]);

    change('baz');

    // still valid, no change
    expect(spy).toHaveBeenCalledTimes(5);
    expect(spy.mock.calls[4][0].validation.status).toBe('PENDING');
    expect(spy.mock.calls[4][0].validation.errors).toStrictEqual([]);
    await sleep();
    expect(spy).toHaveBeenCalledTimes(6);
    expect(spy.mock.calls[5][0].validation.status).toBe('VALID');
    expect(spy.mock.calls[5][0].validation.errors).toStrictEqual([]);

    change(undefined);

    // invalid again
    expect(spy).toHaveBeenCalledTimes(7);
    expect(spy.mock.calls[6][0].validation.status).toBe('PENDING');
    expect(spy.mock.calls[6][0].validation.errors).toStrictEqual([]);
    await sleep();
    expect(spy).toHaveBeenCalledTimes(8);
    expect(spy.mock.calls[7][0].validation.status).toBe('INVALID');
    expect(spy.mock.calls[7][0].validation.errors).toStrictEqual(['Required']);
  });
});
