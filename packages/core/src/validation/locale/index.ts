import { MessageCollection } from './types';
import template from 'lodash.template';

const messagesVarRegExp = /\$\{((?:.|\r?\n)+?)\}/g;

export const enUS: MessageCollection = {
  default: 'This field is not a valid field',
  required: 'This field is required',
  min: 'This field cannot be less than ${min}',
  max: 'This field cannot be greater than ${max}',
  email: 'This field is not a valid email format'
};

export const zhCN: MessageCollection = {
  default: '该字段不是一个合法字段',
  required: '该字段是必填字段',
  min: '该字段不能小于${min}',
  max: '该字段不能大于${max}',
  email: '该字段不是正确的邮箱格式'
};

export const getResolver = (message: string) =>
  template(message, { interpolate: messagesVarRegExp });
