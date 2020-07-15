import { createForm } from '@formular/core';
import { reaction } from 'mobx';

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
            reaction(fieldSubscriptions[name](field), () => spy(field), {
              fireImmediately: true
            }),
          fieldConfig[name]
        );
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledTimes(1);
        const { blur, change, focus } = spy.mock.calls[0][0];
        result[name] = {
          blur,
          change,
          focus,
          spy,
          field: spy.mock.calls[0][0]
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

    // should initialize with error
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].validation.errors).toStrictEqual([]);

    await new Promise((r) => setTimeout(r, 0));
    expect(form.values).toStrictEqual({});
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[1][0].validation.errors).toStrictEqual([
      "'daddy' is required"
    ]);

    change('bar');
    expect(form.values).toStrictEqual({ foo: 'bar' });
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].validation.errors).toStrictEqual([]);
    await new Promise((r) => setTimeout(r, 0));
    expect(form.values).toStrictEqual({ foo: 'bar' });

    // field is now valid: no error
    expect(spy).toHaveBeenCalledTimes(3);
    // expect(spy.mock.calls[3][0].validation.errors).toStrictEqual([]);

    change('baz');
    expect(form.values).toStrictEqual({ foo: 'baz' });
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].validation.errors).toStrictEqual([]);
    await new Promise((r) => setTimeout(r, 0));
    expect(form.values).toStrictEqual({ foo: 'baz' });

    // still valid, no change
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].validation.errors).toStrictEqual([]);

    change(undefined);
    expect(form.values).toStrictEqual({});
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].validation.errors).toStrictEqual([]);
    await new Promise((r) => setTimeout(r, 0));
    expect(form.values).toStrictEqual({});

    // invalid again: have error
    expect(spy).toHaveBeenCalledTimes(4);
    expect(spy.mock.calls[3][0].validation.errors).toStrictEqual([
      "'daddy' is required"
    ]);
  });
});
