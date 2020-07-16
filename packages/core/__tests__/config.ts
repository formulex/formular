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

  it('should update perishable on setConfig("perishable", value)', () => {
    const form = createForm();

    const spy = jest.fn();
    form.subscribe(({ form }) =>
      reaction(
        () => form.values,
        () => spy(form),
        { fireImmediately: true }
      )
    );
    const foo = jest.fn();
    const foz = jest.fn();
    const unregisterFoo = form.registerField('foo', (field) =>
      reaction(
        () => field.value,
        () => foo(field),
        { fireImmediately: true }
      )
    );
    const unregisterFoz = form.registerField('foz', (field) =>
      reaction(
        () => field.value,
        () => foz(field),
        { fireImmediately: true }
      )
    );

    // should initialize with initial value
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].values).toEqual({});
    expect(foo).toHaveBeenCalledTimes(1);
    expect(foo.mock.calls[0][0].value).toBeUndefined();
    expect(foz).toHaveBeenCalledTimes(1);
    expect(foz.mock.calls[0][0].value).toBeUndefined();

    form.change('foo', 'bar');

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[1][0].values).toEqual({ foo: 'bar' });
    expect(foo).toHaveBeenCalledTimes(2);
    expect(foo.mock.calls[1][0].value).toBe('bar');
    expect(foz).toHaveBeenCalledTimes(1);

    form.change('foz', 'baz');

    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].values).toEqual({ foo: 'bar', foz: 'baz' });
    expect(foo).toHaveBeenCalledTimes(2);
    expect(foz).toHaveBeenCalledTimes(2);
    expect(foz.mock.calls[1][0].value).toBe('baz');

    unregisterFoo();

    // No one notified
    expect(spy).toHaveBeenCalledTimes(3);
    expect(foo).toHaveBeenCalledTimes(2);
    expect(foz).toHaveBeenCalledTimes(2);

    form.setPerishable(true);

    unregisterFoz();

    // foz deleted
    expect(spy).toHaveBeenCalledTimes(4);
    expect(spy.mock.calls[3][0].values).toEqual({ foo: 'bar' });
    expect(foo).toHaveBeenCalledTimes(2);
    expect(foz).toHaveBeenCalledTimes(2); // but field not notified
  });
});
