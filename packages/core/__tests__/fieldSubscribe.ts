import { createForm } from '@formular/core';
import { reaction } from 'mobx';
import { cloneDeep } from 'lodash';

describe('field-subscribe', () => {
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
        result[name] = { blur, change, focus, spy };
        return result;
      }, {}),
      form,
      formSpy
    };
  };

  it('should provide a list of registered fields', () => {
    const form = createForm();
    form.registerField('foo', () => () => {}, {});
    form.registerField('bar', () => () => {}, {});
    form.registerField('baz', () => () => {}, {});
    expect(Array.from(form.fields.keys())).toEqual(['foo', 'bar', 'baz']);
  });

  it('should provide a access to field state', () => {
    const form = createForm();
    form.registerField('foo', () => () => {}, {});
    form.registerField('bar', () => () => {}, {});
    form.registerField('baz', () => () => {}, {});
    expect(form.resolve('foo')).toBeDefined();
    expect(form.resolve('foo').name).toBe('foo');
    expect(form.resolve('notafield')).toBeUndefined();
  });

  it('should allow subscribing to active', () => {
    const {
      foo: { blur, focus, spy }
    } = prepareFieldSubscribers(() => () => {}, {
      foo: (field) => () => field.active
    });

    // should initialize to not active
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].active).toBe(false);

    blur();

    // blur does nothing, still inactive
    expect(spy).toHaveBeenCalledTimes(1);

    focus();

    // field is now active
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[1][0].active).toBe(true);

    focus();

    // another focus changes nothing
    expect(spy).toHaveBeenCalledTimes(2);

    blur();

    // field is now inactive
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].active).toBe(false);
  });

  it('should allow subscribing to initial', () => {
    const {
      form,
      foo: { spy }
    } = prepareFieldSubscribers(
      () => () => {},
      {
        foo: (field) => () => field.initialValue
      },
      {},
      {
        initialValues: {
          foo: 'bar'
        }
      }
    );

    // should initialize with initial value
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].initialValue).toBe('bar');

    form.resetFields();

    // same initial value, duh
    expect(spy).toHaveBeenCalledTimes(1);

    form.initialize({ foo: 'baz' });

    // new initial value
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[1][0].initialValue).toBe('baz');
  });

  it('should allow initialization via a callback function', () => {
    const {
      form,
      foo: { spy }
    } = prepareFieldSubscribers(
      () => () => {},
      {
        foo: (field) => () => field.initialValue
      },
      {},
      {
        initialValues: {
          foo: 'bar'
        }
      }
    );

    // should initialize with initial value
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].initialValue).toBe('bar');

    form.resetFields();

    // same initial value, duh
    expect(spy).toHaveBeenCalledTimes(1);

    form.initialize((values) => ({ foo: values.foo + 'buzz' }));

    // new initial value
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[1][0].initialValue).toBe('barbuzz');
  });

  it('should allow reseting even if never initialized', () => {
    const {
      form,
      foo: { spy }
    } = prepareFieldSubscribers(
      () => () => {},
      {
        foo: (field) => () => field.initialValue
      },
      {},
      {}
    );

    // should initialize with initial value
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].initialValue).toBeUndefined();

    form.resetFields();

    // same initial value, duh
    expect(spy).toHaveBeenCalledTimes(1);

    form.initialize({ foo: 'baz' });

    // new initial value
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[1][0].initialValue).toBe('baz');
  });

  it('should allow reseting with specific initial new values', () => {
    const {
      form,
      foo: { spy }
    } = prepareFieldSubscribers(
      () => () => {},
      {
        foo: (field) => () => field.initialValue
      },
      {},
      {}
    );

    // should initialize with initial value
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].initialValue).toBeUndefined();

    form.resetFields();

    // same initial value, duh
    expect(spy).toHaveBeenCalledTimes(1);

    form.initialize({ foo: 'baz' });

    // new initial value
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[1][0].initialValue).toBe('baz');
  });

  it('should allow subscribing to modified', () => {
    const {
      foo: { blur, change, focus, spy }
    } = prepareFieldSubscribers(() => () => {}, {
      foo: (field) => () => field.modified
    });

    // should initialize to not modified
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].modified).toBe(false);

    focus();

    // field is visited, but not yet modified
    expect(spy).toHaveBeenCalledTimes(1);

    blur();

    // field is touched, but not yet modified
    expect(spy).toHaveBeenCalledTimes(1);

    focus();

    // field is active, but not yet modified
    expect(spy).toHaveBeenCalledTimes(1);

    change('dog');

    // field is now modified!
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[1][0].modified).toBe(true);

    // no amount of focusing and bluring and changing will change the touched flag
    focus();
    change('rabbit');
    blur();
    focus();
    change('horse');
    blur();
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should allow subscribing to touched', () => {
    const {
      foo: { blur, focus, spy }
    } = prepareFieldSubscribers(() => () => {}, {
      foo: (field) => () => field.touched
    });

    // should initialize to not touched
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].touched).toBe(false);

    focus();

    // field is visited, but not yet touched
    expect(spy).toHaveBeenCalledTimes(1);

    blur();

    // field is now touched
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[1][0].touched).toBe(true);

    // no amount of focusing and bluring will change the touched flag
    focus();
    blur();
    focus();
    blur();
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should not allow field to be marked touched even if it was not active', () => {
    const {
      foo: { blur, spy }
    } = prepareFieldSubscribers(() => () => {}, {
      foo: (field) => () => field.touched
    });

    // should initialize to not touched
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].touched).toBe(false);

    blur();

    // field is still untouched
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].touched).toBe(false);
  });

  it('should allow subscribing to value', () => {
    const {
      foo: { change, spy }
    } = prepareFieldSubscribers(() => () => {}, {
      foo: (field) => () => field.value
    });

    // should initialize with undefined value
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].value).toBeUndefined();

    change('bar');

    // field has new value
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[1][0].value).toBe('bar');

    change('bar');

    // value didn't change
    expect(spy).toHaveBeenCalledTimes(2);

    change('baz');

    // value changed again
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].value).toBe('baz');
  });

  it('should allow subscribing to visited', () => {
    const {
      foo: { blur, focus, spy }
    } = prepareFieldSubscribers(() => () => {}, {
      foo: (field) => () => field.visited
    });

    // should initialize to not visited
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].visited).toBe(false);

    focus();

    // field is visited
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[1][0].visited).toBe(true);

    // no amount of focusing and bluring will change the touched flag
    blur();
    focus();
    blur();
    focus();
    blur();
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should not destroy field value on unregister by default', () => {
    const form = createForm();
    const spy = jest.fn();
    form.subscribe(({ form }) =>
      reaction(
        () => form.values,
        () => spy(form),
        { fireImmediately: true }
      )
    );
    const field = jest.fn();
    const unregister = form.registerField('foo', (f) =>
      reaction(
        () => f.value,
        () => field(f),
        { fireImmediately: true }
      )
    );

    // no values yet
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].values).toEqual({});
    expect(field).toHaveBeenCalledTimes(1);
    expect(field.mock.calls[0][0].value).toBeUndefined();

    // change value
    form.change('foo', 'bar');

    // value changed
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[1][0].values).toEqual({ foo: 'bar' });
    expect(field).toHaveBeenCalledTimes(2);
    expect(field.mock.calls[1][0].value).toBe('bar');

    // unregister should not remove value
    unregister();

    // no need to notify form or field
    expect(spy).toHaveBeenCalledTimes(2);
    expect(field).toHaveBeenCalledTimes(2);
  });

  it('should destroy field value on unregister when perishable is true', () => {
    const form = createForm({
      perishable: true
    });
    const spy = jest.fn();
    form.subscribe(({ form }) =>
      reaction(
        () => form.values,
        () => spy(form),
        { fireImmediately: true }
      )
    );
    const field = jest.fn();
    const unregister = form.registerField('foo', (f) =>
      reaction(
        () => f.value,
        () => field(f),
        { fireImmediately: true }
      )
    );

    // no values yet
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].values).toEqual({});
    expect(field).toHaveBeenCalledTimes(1);
    expect(field.mock.calls[0][0].value).toBeUndefined();

    // change value
    form.change('foo', 'bar');

    // value changed
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[1][0].values).toEqual({ foo: 'bar' });
    expect(field).toHaveBeenCalledTimes(2);
    expect(field.mock.calls[1][0].value).toBe('bar');

    // unregister should not remove value
    unregister();

    // form notified of change of values
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].values).toEqual({});
    expect(field).toHaveBeenCalledTimes(2);
  });

  it('should destroy array field values on unregister when perishable is true', () => {
    const form = createForm({
      perishable: true
    });
    const spy = jest.fn();
    form.subscribe(({ form }) =>
      reaction(
        () => form.values,
        (values) => spy({ values: cloneDeep(values) }),
        { fireImmediately: true }
      )
    );
    const wolf = jest.fn();
    const dog = jest.fn();

    const unregisterWolf = form.registerField('foo[0].wolf', (field) =>
      reaction(
        () => field.value,
        () => wolf(field),
        { fireImmediately: true }
      )
    );
    const unregisterDog = form.registerField('foo[0].dog', (field) =>
      reaction(
        () => field.value,
        () => dog(field),
        { fireImmediately: true }
      )
    );

    // no values yet
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].values).toEqual({});
    expect(wolf).toHaveBeenCalledTimes(1);
    expect(wolf.mock.calls[0][0].value).toBeUndefined();
    expect(dog).toHaveBeenCalledTimes(1);
    expect(dog.mock.calls[0][0].value).toBeUndefined();

    // change values
    form.change('foo[0].wolf', 'VoidWolf');
    form.change('foo[0].dog', 'Odie');

    // value changed
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[1][0].values).toEqual({
      foo: [{ wolf: 'VoidWolf' }]
    });
    expect(spy.mock.calls[2][0].values).toEqual({
      foo: [{ wolf: 'VoidWolf', dog: 'Odie' }]
    });
    expect(wolf).toHaveBeenCalledTimes(2);
    expect(wolf.mock.calls[1][0].value).toBe('VoidWolf');
    expect(dog).toHaveBeenCalledTimes(2);
    expect(dog.mock.calls[1][0].value).toBe('Odie');

    // unregister should not remove value
    unregisterWolf();
    unregisterDog();

    // form notified of change of values
    expect(spy).toHaveBeenCalledTimes(5);
    expect(spy.mock.calls[3][0].values).toEqual({ foo: [{ dog: 'Odie' }] });
    expect(spy.mock.calls[4][0].values).toEqual({
      foo: [{}]
    });
    expect(wolf).toHaveBeenCalledTimes(2);
    expect(dog).toHaveBeenCalledTimes(2);
  });
});
