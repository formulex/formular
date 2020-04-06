import { LocaleConfig } from './types';
import { ValidationErrors } from '../types';
import template from 'lodash.template';

const localeVarRegExp = /\$\{((?:.|\r?\n)+?)\}/g;

export const enUS: LocaleConfig = {
  default: '${name} is not a valid field',
  required: '${name} is required',
  min: '${name} cannot be less than ${min}',
  max: '${name} cannot be greater than ${max}',
  email: '${name} is not a valid email format'
};

export const zhCN: LocaleConfig = {
  default: '${name}不是一个合法字段',
  required: '${name}是必填字段',
  min: '${name}不能小于${min}',
  max: '${name}不能大于${min}',
  email: '${name}不是正确的邮箱格式'
};

export const getMessageResolver = ({ locale }: { locale: LocaleConfig }) => (
  path: string,
  { name }: { name: string },
  result: ValidationErrors
): string =>
  template(locale[path] || locale.default, {
    interpolate: localeVarRegExp
  })({
    name,
    ...(result[path] || {})
  });
