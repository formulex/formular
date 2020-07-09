import { createForm } from '@formular/core';
import { reaction, transaction } from 'mobx';

describe('batching', () => {
  it('should not call form or field listeners during batch update', () => {
    const form = createForm();
    const formListener = jest.fn();
    const firstField = jest.fn();
    const secondField = jest.fn();
    form.subscribe(({ form }) =>
      reaction(
        () => form.values,
        () => formListener(form),
        { fireImmediately: true }
      )
    );
    form.registerField('firstField', (field) =>
      reaction(
        () => field.value,
        () => firstField(field),
        { fireImmediately: true }
      )
    );
    form.registerField('secondField', (field) =>
      reaction(
        () => field.value,
        () => secondField(field),
        { fireImmediately: true }
      )
    );

    expect(formListener).toHaveBeenCalledTimes(1);
    expect(firstField).toHaveBeenCalledTimes(1);
    expect(secondField).toHaveBeenCalledTimes(1);

    // not in batch DOES notify
    form.change('firstField', 'foo');
    expect(formListener).toHaveBeenCalledTimes(2);
    expect(firstField).toHaveBeenCalledTimes(2);
    expect(secondField).toHaveBeenCalledTimes(1);

    transaction(() => {
      // Do a bunch of stuff
      form.focus('firstField');
      form.change('firstField', 'what');
      form.blur('firstField');

      form.focus('secondField');
      form.change('secondField', 'bar');
      form.blur('secondField');

      // No listeners called
      expect(formListener).toHaveBeenCalledTimes(2);
      expect(firstField).toHaveBeenCalledTimes(2);
      expect(secondField).toHaveBeenCalledTimes(1);
    });

    // NOW listeners are called
    expect(formListener).toHaveBeenCalledTimes(3);
    expect(firstField).toHaveBeenCalledTimes(3);
    expect(secondField).toHaveBeenCalledTimes(2);

    // not in batch DOES notify
    form.change('secondField', 'cat');

    expect(formListener).toHaveBeenCalledTimes(4);
    expect(firstField).toHaveBeenCalledTimes(3);
    expect(secondField).toHaveBeenCalledTimes(3);
  });

  it('should only call listeners that need to be called after batch', () => {
    const form = createForm();
    const formListener = jest.fn();
    const firstField = jest.fn();
    const secondField = jest.fn();
    form.subscribe(({ form }) =>
      reaction(
        () => form.values,
        () => formListener(form),
        { fireImmediately: true }
      )
    );
    form.registerField('firstField', (field) =>
      reaction(
        () => field.value,
        () => firstField(field),
        { fireImmediately: true }
      )
    );
    form.registerField('secondField', (field) =>
      reaction(
        () => field.value,
        () => secondField(field),
        { fireImmediately: true }
      )
    );
    expect(formListener).toHaveBeenCalledTimes(1);
    expect(firstField).toHaveBeenCalledTimes(1);
    expect(secondField).toHaveBeenCalledTimes(1);

    transaction(() => {
      // only change one field
      form.focus('firstField');
      form.change('firstField', 'what');
      form.blur('firstField');

      // No listeners called
      expect(formListener).toHaveBeenCalledTimes(1);
      expect(firstField).toHaveBeenCalledTimes(1);
      expect(secondField).toHaveBeenCalledTimes(1);
    });

    // only listeners that need to be are called
    expect(formListener).toHaveBeenCalledTimes(2);
    expect(firstField).toHaveBeenCalledTimes(2);
    expect(secondField).toHaveBeenCalledTimes(1); // not called
  });

  it('should perform batching correctly with nested batch calls', () => {
    const form = createForm();
    const formListener = jest.fn();
    const firstField = jest.fn();
    const secondField = jest.fn();
    form.subscribe(({ form }) =>
      reaction(
        () => form.values,
        () => formListener(form),
        { fireImmediately: true }
      )
    );
    form.registerField('firstField', (field) =>
      reaction(
        () => field.value,
        () => firstField(field),
        { fireImmediately: true }
      )
    );
    form.registerField('secondField', (field) =>
      reaction(
        () => field.value,
        () => secondField(field),
        { fireImmediately: true }
      )
    );
    expect(formListener).toHaveBeenCalledTimes(1);
    expect(firstField).toHaveBeenCalledTimes(1);
    expect(secondField).toHaveBeenCalledTimes(1);

    transaction(() => {
      transaction(() => {
        // change a field
        form.focus('firstField');
        form.change('firstField', 'what');
        form.blur('firstField');
      });

      transaction(() => {
        // change it again
        form.focus('firstField');
        form.change('firstField', 'the');
        form.blur('firstField');
      });

      transaction(() => {
        // and a third time
        form.focus('firstField');
        form.change('firstField', 'foo');
        form.blur('firstField');
      });

      // No listeners called
      expect(formListener).toHaveBeenCalledTimes(1);
      expect(firstField).toHaveBeenCalledTimes(1);
      expect(secondField).toHaveBeenCalledTimes(1);
    });

    // only listeners that need to be are called, and only once for the whole batch
    expect(formListener).toHaveBeenCalledTimes(2);
    expect(firstField).toHaveBeenCalledTimes(2);
    expect(secondField).toHaveBeenCalledTimes(1); // not called
  });
});
