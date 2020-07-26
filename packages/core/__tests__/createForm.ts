import { createForm } from '@formular/core';
import { reaction } from 'mobx';
import assert from 'assert';
import { pick } from 'lodash';

describe('createForm', () => {
  // it('should export version', () => {
  //   expect(version).toBeDefined();
  // });

  it('should create a form with no initial values', () => {
    const form = createForm();
    expect(form.initialValues).toEqual({});
    expect(form.values).toEqual({});
  });

  it('should create a form with initial values', () => {
    const initialValues = {
      name: 'HeskeyBaozi',
      age: 23,
      friends: ['Snowkylin', 'Voidwolf', 'Godluck'],
      meta: { learning: ['React'], fav: 'pokemon' },
      array: [
        { name: 'Linhu', type: 'tiger' },
        { name: 'Shuqi', type: 'cat' }
      ]
    };
    const form = createForm({ initialValues });
    expect(form.initialValues).not.toBe(initialValues);
    expect(form.initialValues).toEqual(initialValues);
    expect(form.values).not.toBe(initialValues);
    expect(form.values).toEqual(initialValues);
  });

  it('should allow a change to an not-yet-registered field when validation is present', () => {
    const form = createForm();
    form.registerField('whatever', () => () => {}, { initialValue: true });
    form.registerField('noInitialValue', () => () => {});
    form.change('foo', 'bar');
    expect(form.values).toEqual({ whatever: true, foo: 'bar' });
    expect(form.initialValues).toEqual({ whatever: true });
  });

  it('should allow initial values to come from field when registered', () => {
    const form = createForm();
    const foo = jest.fn();
    const cat = jest.fn();
    form.registerField('foo', foo, { initialValue: 'bar' });
    expect(form.initialValues).toEqual({ foo: 'bar' });
    expect(form.values).toEqual({ foo: 'bar' });
    form.registerField('cat', cat, { initialValue: 42 });
    expect(form.initialValues).toEqual({ foo: 'bar', cat: 42 });
    expect(form.values).toEqual({ foo: 'bar', cat: 42 });

    expect(foo).toHaveBeenCalledTimes(1);
    expect(foo.mock.calls[0][0]).toMatchObject(form.resolve('foo'));
    expect(cat).toHaveBeenCalledTimes(1);
    expect(cat.mock.calls[0][0]).toMatchObject(form.resolve('cat'));
  });

  it('should only initialize field if no field value yet exists', () => {
    const form = createForm({});
    const foo1 = jest.fn();
    form.registerField(
      'foo',
      (field) =>
        reaction(
          () => field.value,
          () => foo1(field),
          { fireImmediately: true }
        ),
      { initialValue: 'bar' }
    );
    expect(form.initialValues).toEqual({ foo: 'bar' });
    expect(form.values).toEqual({ foo: 'bar' });
    expect(foo1).toHaveBeenCalled();
    expect(foo1).toHaveBeenCalledTimes(1);

    assert.deepStrictEqual(
      pick(foo1.mock.calls[0][0], ['value', 'initialValue', 'modified']),
      {
        value: 'bar',
        initialValue: 'bar',
        modified: false
      }
    );

    form.change('foo', 'baz');
    expect(foo1).toHaveBeenCalledTimes(2);
    assert.deepStrictEqual(
      pick(foo1.mock.calls[1][0], ['value', 'initialValue', 'modified']),
      {
        value: 'baz',
        initialValue: 'bar',
        modified: true
      }
    );

    const foo2 = jest.fn();
    form.registerField(
      'foo',
      (field) =>
        reaction(
          () => field.value,
          () => foo2(field),
          { fireImmediately: true }
        ),
      { initialValue: 'bar' }
    );
    expect(foo2).toHaveBeenCalled();
    expect(foo2).toHaveBeenCalledTimes(1);
    assert.deepStrictEqual(
      pick(foo2.mock.calls[0][0], ['value', 'initialValue', 'modified']),
      {
        value: 'baz',
        initialValue: 'bar',
        modified: true
      }
    );
    expect(foo1).toHaveBeenCalledTimes(2);
  });
});
