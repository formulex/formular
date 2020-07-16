import { createForm } from '@formular/core';
import { reaction } from 'mobx';

const sleep = (ms: number = 0) => new Promise((r) => setTimeout(r, ms));

describe('validation.trigger', () => {
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

  it('should validate on change when validateTrigger is change', async () => {
    const validate = jest.fn(async (rule, value) => {
      if (!value) {
        throw new Error('必填');
      }
    });
    const form = createForm();

    const spy = jest.fn();
    const spyStatus = jest.fn();
    form.registerField(
      'foo',
      (field) => {
        const r1 = reaction(
          () => [...field.validation.errors],
          () => spy(field),
          { fireImmediately: true }
        );
        const r2 = reaction(
          () => field.validation.status,
          () => spyStatus(field),
          { fireImmediately: true }
        );
        return () => {
          r1();
          r2();
        };
      },
      { validateTrigger: 'change', rule: { validator: validate } }
    );

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].validation.errors).toStrictEqual([]);
    expect(spyStatus).toHaveBeenCalledTimes(1);
    expect(spyStatus.mock.calls[0][0].validation.status).toStrictEqual(
      'PENDING'
    );
    await sleep();
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[1][0].validation.errors).toStrictEqual(['必填']);
    expect(validate).toHaveBeenCalledTimes(1);
    expect(spyStatus).toHaveBeenCalledTimes(2);
    expect(spyStatus.mock.calls[1][0].validation.status).toStrictEqual(
      'INVALID'
    );

    form.focus('foo');
    expect(spy).toHaveBeenCalledTimes(2);
    expect(validate).toHaveBeenCalledTimes(1); // not called on focus
    expect(spyStatus).toHaveBeenCalledTimes(2);

    form.change('foo', 't');

    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].validation.errors).toStrictEqual([]);
    expect(validate).toHaveBeenCalledTimes(2);
    expect(spyStatus).toHaveBeenCalledTimes(3);
    expect(spyStatus.mock.calls[2][0].validation.status).toStrictEqual(
      'PENDING'
    );
    await sleep();
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].validation.errors).toStrictEqual([]);
    expect(validate).toHaveBeenCalledTimes(2);
    expect(spyStatus).toHaveBeenCalledTimes(4);
    expect(spyStatus.mock.calls[3][0].validation.status).toStrictEqual('VALID');

    form.change('foo', 'ty');
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].validation.errors).toStrictEqual([]);
    expect(validate).toHaveBeenCalledTimes(3);
    expect(spyStatus).toHaveBeenCalledTimes(5);
    expect(spyStatus.mock.calls[4][0].validation.status).toStrictEqual(
      'PENDING'
    );
    await sleep();
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].validation.errors).toStrictEqual([]);
    expect(validate).toHaveBeenCalledTimes(3);
    expect(spyStatus).toHaveBeenCalledTimes(6);
    expect(spyStatus.mock.calls[5][0].validation.status).toStrictEqual('VALID');

    form.change('foo', 'typ');
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].validation.errors).toStrictEqual([]);
    expect(validate).toHaveBeenCalledTimes(4);
    expect(spyStatus).toHaveBeenCalledTimes(7);
    expect(spyStatus.mock.calls[6][0].validation.status).toStrictEqual(
      'PENDING'
    );
    await sleep();
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].validation.errors).toStrictEqual([]);
    expect(validate).toHaveBeenCalledTimes(4);
    expect(spyStatus).toHaveBeenCalledTimes(8);
    expect(spyStatus.mock.calls[7][0].validation.status).toStrictEqual('VALID');

    form.change('foo', 'typi');
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].validation.errors).toStrictEqual([]);
    expect(validate).toHaveBeenCalledTimes(5);
    expect(spyStatus).toHaveBeenCalledTimes(9);
    expect(spyStatus.mock.calls[8][0].validation.status).toStrictEqual(
      'PENDING'
    );
    await sleep();
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].validation.errors).toStrictEqual([]);
    expect(validate).toHaveBeenCalledTimes(5);
    expect(spyStatus).toHaveBeenCalledTimes(10);
    expect(spyStatus.mock.calls[9][0].validation.status).toStrictEqual('VALID');

    form.change('foo', 'typin');
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].validation.errors).toStrictEqual([]);
    expect(validate).toHaveBeenCalledTimes(6);
    expect(spyStatus).toHaveBeenCalledTimes(11);
    expect(spyStatus.mock.calls[10][0].validation.status).toStrictEqual(
      'PENDING'
    );
    await sleep();
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].validation.errors).toStrictEqual([]);
    expect(validate).toHaveBeenCalledTimes(6);
    expect(spyStatus).toHaveBeenCalledTimes(12);
    expect(spyStatus.mock.calls[11][0].validation.status).toStrictEqual(
      'VALID'
    );

    form.change('foo', 'typing');
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].validation.errors).toStrictEqual([]);
    expect(validate).toHaveBeenCalledTimes(7);
    expect(spyStatus).toHaveBeenCalledTimes(13);
    expect(spyStatus.mock.calls[12][0].validation.status).toStrictEqual(
      'PENDING'
    );
    await sleep();
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].validation.errors).toStrictEqual([]);
    expect(validate).toHaveBeenCalledTimes(7);
    expect(spyStatus).toHaveBeenCalledTimes(14);
    expect(spyStatus.mock.calls[13][0].validation.status).toStrictEqual(
      'VALID'
    );

    // not called on blur
    form.blur('foo');
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].validation.errors).toStrictEqual([]);
    expect(validate).toHaveBeenCalledTimes(7);
    expect(spyStatus).toHaveBeenCalledTimes(14);
    expect(spyStatus.mock.calls[13][0].validation.status).toStrictEqual(
      'VALID'
    );
    await sleep();
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].validation.errors).toStrictEqual([]);
    expect(validate).toHaveBeenCalledTimes(7);
    expect(spyStatus).toHaveBeenCalledTimes(14);
    expect(spyStatus.mock.calls[13][0].validation.status).toStrictEqual(
      'VALID'
    );

    // now user goes to empty the field
    form.focus('foo');
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].validation.errors).toStrictEqual([]);
    expect(validate).toHaveBeenCalledTimes(7);
    expect(spyStatus).toHaveBeenCalledTimes(14);
    expect(spyStatus.mock.calls[13][0].validation.status).toStrictEqual(
      'VALID'
    );
    await sleep();
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].validation.errors).toStrictEqual([]);
    expect(validate).toHaveBeenCalledTimes(7);
    expect(spyStatus).toHaveBeenCalledTimes(14);
    expect(spyStatus.mock.calls[13][0].validation.status).toStrictEqual(
      'VALID'
    );

    form.change('foo', '');
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].validation.errors).toStrictEqual([]);
    expect(validate).toHaveBeenCalledTimes(8);
    expect(spyStatus).toHaveBeenCalledTimes(15);
    expect(spyStatus.mock.calls[14][0].validation.status).toStrictEqual(
      'PENDING'
    );
    await sleep();
    expect(spy).toHaveBeenCalledTimes(4);
    expect(spy.mock.calls[3][0].validation.errors).toStrictEqual(['必填']);
    expect(validate).toHaveBeenCalledTimes(8);
    expect(spyStatus).toHaveBeenCalledTimes(16);
    expect(spyStatus.mock.calls[15][0].validation.status).toStrictEqual(
      'INVALID'
    );

    form.blur('foo');
    expect(spy).toHaveBeenCalledTimes(4);
    expect(spy.mock.calls[3][0].validation.errors).toStrictEqual(['必填']);
    expect(validate).toHaveBeenCalledTimes(8);
    expect(spyStatus).toHaveBeenCalledTimes(16);
    expect(spyStatus.mock.calls[15][0].validation.status).toStrictEqual(
      'INVALID'
    );
    await sleep();
    expect(spy).toHaveBeenCalledTimes(4);
    expect(spy.mock.calls[3][0].validation.errors).toStrictEqual(['必填']);
    expect(validate).toHaveBeenCalledTimes(8);
    expect(spyStatus).toHaveBeenCalledTimes(16);
    expect(spyStatus.mock.calls[15][0].validation.status).toStrictEqual(
      'INVALID'
    );
  });

  it('should validate on change when validateTrigger is blur', async () => {
    const validate = jest.fn(async (rule, value) => {
      if (!value) {
        throw new Error('必填');
      }
    });
    const form = createForm();

    const spy = jest.fn();
    const spyStatus = jest.fn();
    form.registerField(
      'foo',
      (field) => {
        const r1 = reaction(
          () => [...field.validation.errors],
          () => spy(field),
          { fireImmediately: true }
        );
        const r2 = reaction(
          () => field.validation.status,
          () => spyStatus(field),
          { fireImmediately: true }
        );
        return () => {
          r1();
          r2();
        };
      },
      { validateTrigger: 'blur', rule: { validator: validate } }
    );

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].validation.errors).toStrictEqual([]);
    expect(spyStatus).toHaveBeenCalledTimes(1);
    expect(spyStatus.mock.calls[0][0].validation.status).toStrictEqual(
      'PENDING'
    );
    await sleep();
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[1][0].validation.errors).toStrictEqual(['必填']);
    expect(validate).toHaveBeenCalledTimes(1);
    expect(spyStatus).toHaveBeenCalledTimes(2);
    expect(spyStatus.mock.calls[1][0].validation.status).toStrictEqual(
      'INVALID'
    );

    form.focus('foo');
    expect(spy).toHaveBeenCalledTimes(2);
    expect(validate).toHaveBeenCalledTimes(1); // not called on focus
    expect(spyStatus).toHaveBeenCalledTimes(2);

    form.change('foo', 't');

    expect(spy).toHaveBeenCalledTimes(2);
    // error not updated
    expect(spy.mock.calls[1][0].validation.errors).toStrictEqual(['必填']);
    expect(validate).toHaveBeenCalledTimes(1);
    expect(spyStatus).toHaveBeenCalledTimes(2);
    expect(spyStatus.mock.calls[1][0].validation.status).toStrictEqual(
      'INVALID'
    );
    await sleep();
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[1][0].validation.errors).toStrictEqual(['必填']);
    expect(validate).toHaveBeenCalledTimes(1);
    expect(spyStatus).toHaveBeenCalledTimes(2);
    expect(spyStatus.mock.calls[1][0].validation.status).toStrictEqual(
      'INVALID'
    );

    form.change('foo', 'ty');
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[1][0].validation.errors).toStrictEqual(['必填']);
    expect(validate).toHaveBeenCalledTimes(1);
    expect(spyStatus).toHaveBeenCalledTimes(2);
    expect(spyStatus.mock.calls[1][0].validation.status).toStrictEqual(
      'INVALID'
    );
    await sleep();
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[1][0].validation.errors).toStrictEqual(['必填']);
    expect(validate).toHaveBeenCalledTimes(1);
    expect(spyStatus).toHaveBeenCalledTimes(2);
    expect(spyStatus.mock.calls[1][0].validation.status).toStrictEqual(
      'INVALID'
    );

    form.change('foo', 'typ');
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[1][0].validation.errors).toStrictEqual(['必填']);
    expect(validate).toHaveBeenCalledTimes(1);
    expect(spyStatus).toHaveBeenCalledTimes(2);
    expect(spyStatus.mock.calls[1][0].validation.status).toStrictEqual(
      'INVALID'
    );
    await sleep();
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[1][0].validation.errors).toStrictEqual(['必填']);
    expect(validate).toHaveBeenCalledTimes(1);
    expect(spyStatus).toHaveBeenCalledTimes(2);
    expect(spyStatus.mock.calls[1][0].validation.status).toStrictEqual(
      'INVALID'
    );

    form.change('foo', 'typi');
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[1][0].validation.errors).toStrictEqual(['必填']);
    expect(validate).toHaveBeenCalledTimes(1);
    expect(spyStatus).toHaveBeenCalledTimes(2);
    expect(spyStatus.mock.calls[1][0].validation.status).toStrictEqual(
      'INVALID'
    );
    await sleep();
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[1][0].validation.errors).toStrictEqual(['必填']);
    expect(validate).toHaveBeenCalledTimes(1);
    expect(spyStatus).toHaveBeenCalledTimes(2);
    expect(spyStatus.mock.calls[1][0].validation.status).toStrictEqual(
      'INVALID'
    );

    form.change('foo', 'typin');
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[1][0].validation.errors).toStrictEqual(['必填']);
    expect(validate).toHaveBeenCalledTimes(1);
    expect(spyStatus).toHaveBeenCalledTimes(2);
    expect(spyStatus.mock.calls[1][0].validation.status).toStrictEqual(
      'INVALID'
    );
    await sleep();
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[1][0].validation.errors).toStrictEqual(['必填']);
    expect(validate).toHaveBeenCalledTimes(1);
    expect(spyStatus).toHaveBeenCalledTimes(2);
    expect(spyStatus.mock.calls[1][0].validation.status).toStrictEqual(
      'INVALID'
    );

    form.change('foo', 'typing');
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[1][0].validation.errors).toStrictEqual(['必填']);
    expect(validate).toHaveBeenCalledTimes(1);
    expect(spyStatus).toHaveBeenCalledTimes(2);
    expect(spyStatus.mock.calls[1][0].validation.status).toStrictEqual(
      'INVALID'
    );
    await sleep();
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[1][0].validation.errors).toStrictEqual(['必填']);
    expect(validate).toHaveBeenCalledTimes(1);
    expect(spyStatus).toHaveBeenCalledTimes(2);
    expect(spyStatus.mock.calls[1][0].validation.status).toStrictEqual(
      'INVALID'
    );

    // called on blur
    form.blur('foo');
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].validation.errors).toStrictEqual([]);
    expect(validate).toHaveBeenCalledTimes(2);
    expect(spyStatus).toHaveBeenCalledTimes(3);
    expect(spyStatus.mock.calls[2][0].validation.status).toStrictEqual(
      'PENDING'
    );
    await sleep();
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].validation.errors).toStrictEqual([]);
    expect(validate).toHaveBeenCalledTimes(2);
    expect(spyStatus).toHaveBeenCalledTimes(4);
    expect(spyStatus.mock.calls[3][0].validation.status).toStrictEqual('VALID');

    // now user goes to empty the field
    form.focus('foo');
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].validation.errors).toStrictEqual([]);
    expect(validate).toHaveBeenCalledTimes(2);
    expect(spyStatus).toHaveBeenCalledTimes(4);
    expect(spyStatus.mock.calls[3][0].validation.status).toStrictEqual('VALID');
    await sleep();
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].validation.errors).toStrictEqual([]);
    expect(validate).toHaveBeenCalledTimes(2);
    expect(spyStatus).toHaveBeenCalledTimes(4);
    expect(spyStatus.mock.calls[3][0].validation.status).toStrictEqual('VALID');

    form.change('foo', '');
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].validation.errors).toStrictEqual([]);
    expect(validate).toHaveBeenCalledTimes(2);
    expect(spyStatus).toHaveBeenCalledTimes(4);
    expect(spyStatus.mock.calls[3][0].validation.status).toStrictEqual('VALID');
    await sleep();
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].validation.errors).toStrictEqual([]);
    expect(validate).toHaveBeenCalledTimes(2);
    expect(spyStatus).toHaveBeenCalledTimes(4);
    expect(spyStatus.mock.calls[3][0].validation.status).toStrictEqual('VALID');

    form.blur('foo');
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[2][0].validation.errors).toStrictEqual([]);
    expect(validate).toHaveBeenCalledTimes(3);
    expect(spyStatus).toHaveBeenCalledTimes(5);
    expect(spyStatus.mock.calls[4][0].validation.status).toStrictEqual(
      'PENDING'
    );
    await sleep();
    expect(spy).toHaveBeenCalledTimes(4);
    expect(spy.mock.calls[3][0].validation.errors).toStrictEqual(['必填']);
    expect(validate).toHaveBeenCalledTimes(3);
    expect(spyStatus).toHaveBeenCalledTimes(6);
    expect(spyStatus.mock.calls[5][0].validation.status).toStrictEqual(
      'INVALID'
    );
  });
});
