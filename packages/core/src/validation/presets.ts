import { isEmptyInputValue, EMAIL_REGEXP } from './utils';
import { withErrorType, withWarningType } from './decorators';
import {
  ValidatorFn,
  ValidatorOrValidatorFactory,
  ValidatorFnFactory
} from './types';

const getPresets = (
  modifyFn: (o: any) => any
): [string, ValidatorOrValidatorFactory][] => [
  [
    'required',
    ((field) => {
      return isEmptyInputValue(field.value)
        ? modifyFn({ required: true })
        : null;
    }) as ValidatorFn
  ],
  [
    'min',
    ((min: number) => (field) => {
      if (isEmptyInputValue(field.value) || isEmptyInputValue(min)) {
        return null; // don't validate empty values to allow optional controls
      }
      const value = Number.parseFloat(field.value as any);
      // Fields with NaN values after parsing should be treated as not having a
      // minimum, per the HTML forms spec: https://www.w3.org/TR/html5/forms.html#attr-input-min
      return !Number.isNaN(value) && value < min
        ? modifyFn({ min: { min: min, actual: field.value } })
        : null;
    }) as ValidatorFnFactory
  ],
  [
    'max',
    ((max: number) => (field) => {
      if (isEmptyInputValue(field.value) || isEmptyInputValue(max)) {
        return null; // don't validate empty values to allow optional controls
      }
      const value = Number.parseFloat(field.value as any);
      // Fields with NaN values after parsing should be treated as not having a
      // maximum, per the HTML forms spec: https://www.w3.org/TR/html5/forms.html#attr-input-max
      return !Number.isNaN(value) && value > max
        ? modifyFn({ max: { max: max, actual: field.value } })
        : null;
    }) as ValidatorFnFactory
  ],

  [
    'email',
    ((field) => {
      if (isEmptyInputValue(field.value)) {
        return null; // don't validate empty values to allow optional controls
      }
      return EMAIL_REGEXP.test(field.value as any)
        ? null
        : modifyFn({ email: true });
    }) as ValidatorFn
  ]
];

export default [
  ...getPresets(withErrorType),
  ...getPresets(withWarningType).map(([key, f]) => ['warning:' + key, f])
] as [string, ValidatorOrValidatorFactory][];
