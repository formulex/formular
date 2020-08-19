import { createForm } from '@formular/core';
import { reaction } from 'mobx';

describe('subscribe', () => {
  const prepareFormSubscriber = (
    fieldName: string,
    setup,
    spy,
    config = {}
  ) => {
    const form = createForm({ ...config });
    form.subscribe(setup);
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledTimes(1);

    let blur;
    let change;
    let focus;
    form.registerField(
      fieldName,
      (fieldState) => {
        blur = fieldState.blur;
        change = fieldState.change;
        focus = fieldState.focus;
      },
      {}
    );
    return { blur, change, focus };
  };

  it('should allow noop subscription and only call setup function once', () => {
    const form = createForm();

    const formSpy = jest.fn();
    const unsubscribe = form.subscribe(formSpy);
    expect(formSpy).toHaveBeenCalledTimes(1);
    form.change('foo', 'bar');
    expect(formSpy).toHaveBeenCalledTimes(1);
    unsubscribe();
    expect(formSpy).toHaveBeenCalledTimes(1);
  });

  it('should no longer send form updates after unsubscribing', () => {
    const form = createForm();

    const formSpy = jest.fn();
    const fieldSpy = jest.fn();
    const unsubscribe = form.subscribe(({ form }) =>
      reaction(
        () => form.values,
        () => formSpy(form),
        { fireImmediately: true }
      )
    );
    form.registerField('foo', (field) =>
      reaction(
        () => field.value,
        () => fieldSpy(field),
        { fireImmediately: true }
      )
    );

    // called with initial state
    expect(formSpy).toHaveBeenCalledTimes(1);
    expect(formSpy.mock.calls[0][0].values.foo).toBeUndefined();
    expect(fieldSpy).toHaveBeenCalledTimes(1);
    expect(fieldSpy.mock.calls[0][0].value).toBeUndefined();

    // update field value
    form.change('foo', 'bar');

    // form subscriber notified
    expect(formSpy).toHaveBeenCalledTimes(2);
    expect(formSpy.mock.calls[1][0].values.foo).toBe('bar');
    expect(fieldSpy).toHaveBeenCalledTimes(2);
    expect(fieldSpy.mock.calls[1][0].value).toBe('bar');

    // unsubscribe
    unsubscribe();

    // change value again
    form.change('foo', 'baz');

    // form listener NOT called again
    expect(formSpy).toHaveBeenCalledTimes(2);

    // field still called
    expect(fieldSpy).toHaveBeenCalledTimes(3);
    expect(fieldSpy.mock.calls[2][0].value).toBe('baz');
  });

  it('should allow form.change() to change any value, not just registered fields', () => {
    const form = createForm();

    const formSpy = jest.fn();
    form.subscribe(({ form }) =>
      reaction(
        () => form.values,
        () => formSpy(form),
        { fireImmediately: true }
      )
    );

    // called with initial state
    expect(formSpy).toHaveBeenCalledTimes(1);
    expect(formSpy.mock.calls[0][0].values.foo).toBeUndefined();

    // update field value
    form.change('foo', 'bar');

    // form subscriber notified
    expect(formSpy).toHaveBeenCalledTimes(2);
    expect(formSpy.mock.calls[1][0].values).toEqual({ foo: 'bar' });

    // update field again, just for good measure
    form.change('foo', 'baz');

    expect(formSpy).toHaveBeenCalledTimes(3);
    expect(formSpy.mock.calls[2][0].values).toEqual({ foo: 'baz' });
  });

  it('should no longer send field updates after unsubscribing', () => {
    const form = createForm();

    const spy = jest.fn();
    const unsubscribe = form.registerField('foo', (field) =>
      reaction(
        () => field.value,
        () => spy(field),
        { fireImmediately: true }
      )
    );

    // called with initial state
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].value).toBeUndefined();

    // update field value
    form.change('foo', 'bar');

    // field got new value
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[1][0].value).toBe('bar');

    // unsubscribe
    unsubscribe();

    // change value again
    form.change('foo', 'baz');

    // field listener NOT called again
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should allow subscribing to form values', () => {
    const spy = jest.fn();
    const { change } = prepareFormSubscriber(
      'foo',
      ({ form }) =>
        reaction(
          () => form.values,
          () => spy(form),
          { fireImmediately: true }
        ),
      spy
    );

    expect(spy).toHaveBeenCalledTimes(1);

    change('bar');

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[1][0].values).not.toBeUndefined();
    expect(spy.mock.calls[1][0].values.foo).toBe('bar');

    // let's change it again, just for fun
    change('baz');
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].values).not.toBeUndefined();
    expect(spy.mock.calls[2][0].values.foo).toBe('baz');

    // and clear it out?
    change(undefined);
    expect(spy).toHaveBeenCalledTimes(4);
    expect(spy.mock.calls[3][0].values).toEqual({});
  });

  it('should schedule form notifications for after current notifications are complete', () => {
    const form = createForm();
    const subscriber1 = jest.fn(({ values }) => {
      if (values.foo && values.foo % 2 === 1) {
        // increment foo to make it even
        form.change('foo', values.foo + 1);
      }
    });
    const subscriber2 = jest.fn();
    form.subscribe(({ form }) =>
      reaction(
        (r) => {
          r.trace();
          return form.values;
        },
        (values) => subscriber1({ values }),
        { fireImmediately: true, name: 'subscriber1' }
      )
    );
    form.subscribe(({ form }) =>
      reaction(
        (r) => {
          r.trace();
          return form.values;
        },
        (values) => {
          subscriber2({ values });
        },
        { fireImmediately: true, name: 'subscriber2' }
      )
    );
    expect(subscriber1).toHaveBeenCalled();
    expect(subscriber1).toHaveBeenCalledTimes(1);
    expect(subscriber1.mock.calls[0][0].values).toEqual({});
    expect(subscriber2).toHaveBeenCalled();
    expect(subscriber2).toHaveBeenCalledTimes(1);
    expect(subscriber2.mock.calls[0][0].values).toEqual({});

    form.change('foo', 1);

    expect(subscriber1).toHaveBeenCalledTimes(3);
    expect(subscriber1.mock.calls[1][0].values).toEqual({ foo: 1 });
    expect(subscriber1.mock.calls[2][0].values).toEqual({ foo: 2 });
    expect(subscriber2).toHaveBeenCalledTimes(2); // global state is in batch
    expect(subscriber2.mock.calls[1][0].values).toEqual({ foo: 2 });
  });

  it('should not mind if a field gets unregistered by a field notification', () => {
    let unregisterBar: undefined | (() => void) = undefined;
    const form = createForm();
    const foo = jest.fn(({ value }) => {
      if (value === 42) {
        unregisterBar();
        form.resetFields();
      }
    });
    const bar = jest.fn();
    form.registerField('foo', (field) =>
      reaction(
        () => field.value,
        () => foo(field),
        { fireImmediately: true }
      )
    );
    unregisterBar = form.registerField('bar', (field) =>
      reaction(
        () => field.value,
        () => bar(field),
        { fireImmediately: true }
      )
    );

    expect(foo).toHaveBeenCalled();
    expect(foo).toHaveBeenCalledTimes(1);
    expect(bar).toHaveBeenCalled();
    expect(bar).toHaveBeenCalledTimes(1);

    form.change('bar', 7);
    expect(foo).toHaveBeenCalledTimes(1);
    expect(bar).toHaveBeenCalledTimes(2);

    form.change('foo', 42);
    expect(foo).toHaveBeenCalledTimes(3);
    expect(bar).toHaveBeenCalledTimes(2);
  });

  it('should allow field state to be reset', () => {
    const form = createForm();
    const foo = jest.fn();
    form.registerField('foo', (field) =>
      reaction(
        () => [field.touched, field.visited],
        () => foo(field),
        { fireImmediately: true }
      )
    );

    expect(foo).toHaveBeenCalled();
    expect(foo).toHaveBeenCalledTimes(1);
    expect(foo.mock.calls[0][0].touched).toBe(false);
    expect(foo.mock.calls[0][0].visited).toBe(false);

    form.focus('foo');

    expect(foo).toHaveBeenCalledTimes(2);
    expect(foo.mock.calls[1][0].touched).toBe(false);
    expect(foo.mock.calls[1][0].visited).toBe(true);

    form.blur('foo');

    expect(foo).toHaveBeenCalledTimes(3);
    expect(foo.mock.calls[2][0].touched).toBe(true);
    expect(foo.mock.calls[2][0].visited).toBe(true);

    form.resetFields(['foo']);

    expect(foo).toHaveBeenCalledTimes(4);
    expect(foo.mock.calls[3][0].touched).toBe(false);
    expect(foo.mock.calls[3][0].visited).toBe(false);
  });
});
