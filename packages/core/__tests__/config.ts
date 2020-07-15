import { createForm } from '@formular/core';
import { reaction } from 'mobx';

describe('config', () => {
  it('should initialize the form on setConfig("initialValues", values)', () => {
    const form = createForm({
      initialValues: {
        foo: 'bar',
        goo: 'moo'
      }
    });
    const spy = jest.fn();
    form.registerField('foo', (field) =>
      reaction(
        () => [field.initialValue, field.value],
        () => spy(field),
        { fireImmediately: true }
      )
    );

    // should initialize with initial value
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].initialValue).toBe('bar');

    form.reset();

    // same initial value, duh
    expect(spy).toHaveBeenCalledTimes(1);

    spy.mock.calls[0][0].change('baz');

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[1][0].initialValue).toBe('bar');
    expect(spy.mock.calls[1][0].value).toBe('baz');

    form.initialize({ foo: 'bax' });

    // new initial value, and dirty value overwritten
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].initialValue).toBe('bax');
    expect(spy.mock.calls[2][0].value).toBe('bax');
  });
});
