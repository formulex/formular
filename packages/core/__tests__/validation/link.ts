import { createForm } from '@formular/core';
import { reaction } from 'mobx';

describe('validation.link', () => {
  it("should update a field's error if it was changed by another field's value change (field-level)", async () => {
    const form = createForm();
    const password = jest.fn();
    form.registerField('password', (field) =>
      reaction(
        () => {},
        () => password(field),
        { fireImmediately: true }
      )
    );
    const confirm = jest.fn();
    form.registerField('confirm', (field) =>
      reaction(
        () => [...field.validation.errors],
        () => confirm(field),
        { fireImmediately: true }
      )
    );

    const passwordValueSpy = jest.fn();
    const confirmValueSpy = jest.fn();

    form.subscribe(function* ({ field, value }) {
      yield reaction(
        () => value('password'),
        (password) => {
          passwordValueSpy();
          field('password')?.validation.setEffectErrors(
            password !== value('confirm') ? ['Does not match'] : []
          );
        }
      );

      yield reaction(
        () => value('confirm'),
        (confirm) => {
          confirmValueSpy();
          field('confirm')?.validation.setEffectErrors(
            confirm !== value('password') ? ['Does not match'] : []
          );
        }
      );
    });

    expect(password).toHaveBeenCalledTimes(1);
    expect(confirm).toHaveBeenCalledTimes(1);
    const changePassword = password.mock.calls[0][0].change;
    const changeConfirm = confirm.mock.calls[0][0].change;

    // confirm does not have error
    expect(password).toHaveBeenCalledTimes(1);
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(confirm.mock.calls[0][0].validation.errors).toStrictEqual([]);

    // user enters password into password field
    changePassword('secret');

    // password not updated because not subscribing to anything
    expect(password).toHaveBeenCalledTimes(1);

    expect(passwordValueSpy).toHaveBeenCalledTimes(1);

    // confirm now has error
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(confirm.mock.calls[0][0].validation.errors).toStrictEqual([]);
    expect(password.mock.calls[0][0].validation.errors).toStrictEqual([
      'Does not match'
    ]);

    changeConfirm('secret');

    // confirm no longer has error
    expect(password).toHaveBeenCalledTimes(1);
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(confirm.mock.calls[0][0].validation.errors).toStrictEqual([]);

    changeConfirm('not-secret');

    // confirm has error again
    expect(password).toHaveBeenCalledTimes(1);
    expect(confirm).toHaveBeenCalledTimes(2);
    expect(confirm.mock.calls[1][0].validation.errors).toStrictEqual([
      'Does not match'
    ]);
  });
});
