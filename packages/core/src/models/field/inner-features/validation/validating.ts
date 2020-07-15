import type {
  StoreValue,
  RuleObject,
  ValidateOptions,
  ValidateMessages
} from './interface';
import RawAsyncValidator from 'async-validator';
import { defaultValidateMessages } from './messages';
import { setValues } from './utils';

// Remove incorrect original ts define
const AsyncValidator: any = RawAsyncValidator;

/**
 * Replace with template.
 *   `I'm ${name}` + { name: 'bamboo' } = I'm bamboo
 */
function replaceMessage(template: string, kv: Record<string, string>): string {
  return template.replace(/\$\{\w+\}/g, (str: string) => {
    const key = str.slice(2, -1);
    return kv[key];
  });
}

/**
 * We use `async-validator` to validate rules. So have to hot replace the message with validator.
 * { required: '${name} is required' } => { required: () => 'field is required' }
 */
function convertMessages(
  messages: ValidateMessages,
  name: string,
  rule: RuleObject,
  messageVariables?: Record<string, string>
): ValidateMessages {
  const kv = {
    ...(rule as Record<string, string | number>),
    name,
    enum: (rule.enum || []).join(', ')
  };

  const replaceFunc = (
    template: string,
    additionalKV?: Record<string, string>
  ) => () => replaceMessage(template, { ...kv, ...additionalKV });

  /* eslint-disable no-param-reassign */
  function fillTemplate(source: any, target: any = {}) {
    Object.keys(source).forEach((ruleName) => {
      const value = source[ruleName];
      if (typeof value === 'string') {
        target[ruleName] = replaceFunc(value, messageVariables);
      } else if (value && typeof value === 'object') {
        target[ruleName] = {};
        fillTemplate(value, target[ruleName]);
      } else {
        target[ruleName] = value;
      }
    });

    return target;
  }
  /* eslint-enable */

  return fillTemplate(
    setValues({}, defaultValidateMessages, messages)
  ) as ValidateMessages;
}

async function validateRule(
  name: string,
  value: StoreValue,
  rule: RuleObject,
  { validateMessages, ...restValidateOptions }: ValidateOptions,
  messageVariables?: Record<string, string>
): Promise<string[]> {
  const cloneRule = { ...rule };
  // We should special handle array validate
  let subRuleField: RuleObject | null = null;
  if (cloneRule && cloneRule.type === 'array' && cloneRule.defaultField) {
    subRuleField = cloneRule.defaultField;
    delete cloneRule.defaultField;
  }

  const validator = new AsyncValidator({
    [name]: [cloneRule]
  });

  const messages: ValidateMessages = convertMessages(
    validateMessages ?? defaultValidateMessages,
    name,
    cloneRule,
    messageVariables
  );
  validator.messages(messages);

  let result: string[] = [];

  try {
    await Promise.resolve(
      validator.validate({ [name]: value }, { ...restValidateOptions })
    );
  } catch (errObj) {
    if (errObj.errors) {
      result = errObj.errors.map(({ message }: any) => message);
    } else {
      console.error(errObj);
      result = [(messages.default as () => string)()];
    }
  }

  if (!result.length && subRuleField) {
    const subResults: string[][] = await Promise.all(
      (value as StoreValue[]).map((subValue: StoreValue, i: number) =>
        validateRule(
          `${name}.${i}`,
          subValue,
          subRuleField!,
          { validateMessages, ...restValidateOptions },
          messageVariables
        )
      )
    );

    return subResults.reduce((prev, errors) => [...prev, ...errors], []);
  }

  return result;
}

/**
 * We use `async-validator` to validate the value.
 * But only check one value in a time to avoid namePath validate issue.
 */
export function validateRules(
  name: string,
  value: StoreValue,
  rules: RuleObject[],
  options: ValidateOptions,
  validateFirst: boolean | 'parallel',
  messageVariables?: Record<string, string>
) {
  // Fill rule with context
  const filledRules = rules.map((currentRule) => {
    const originValidatorFunc = currentRule.validator;

    if (!originValidatorFunc) {
      return currentRule;
    }
    return {
      ...currentRule,
      validator(
        rule: RuleObject,
        val: StoreValue,
        callback: (error?: string) => void
      ) {
        originValidatorFunc(rule, val)
          .then(() => {
            callback();
          })
          .catch((err) => {
            callback(err);
          });
      }
    };
  }) as RuleObject[];

  let summaryPromise: Promise<string[]>;

  if (validateFirst === true) {
    // >>>>> Validate by serialization
    summaryPromise = new Promise(async (resolve) => {
      /* eslint-disable no-await-in-loop */
      for (let i = 0; i < filledRules.length; i += 1) {
        const errors = await validateRule(
          name,
          value,
          filledRules[i],
          options,
          messageVariables
        );
        if (errors.length) {
          resolve(errors);
          return;
        }
      }
      /* eslint-enable */

      resolve([]);
    });
  } else {
    // >>>>> Validate by parallel
    const rulePromises = filledRules.map((rule) =>
      validateRule(name, value, rule, options, messageVariables)
    );

    summaryPromise = (validateFirst
      ? finishOnFirstFailed(rulePromises)
      : finishOnAllFailed(rulePromises)
    ).then((errors: string[]): string[] | Promise<string[]> => {
      if (!errors.length) {
        return [];
      }

      return Promise.reject<string[]>(errors);
    });
  }

  // Internal catch error to avoid console error log.
  summaryPromise.catch((e) => e);

  return summaryPromise;
}

async function finishOnAllFailed(
  rulePromises: Promise<string[]>[]
): Promise<string[]> {
  return Promise.all(rulePromises).then((errorsList: string[][]):
    | string[]
    | Promise<string[]> => {
    const errors: string[] = [].concat(...(errorsList as any));

    return errors;
  });
}

async function finishOnFirstFailed(
  rulePromises: Promise<string[]>[]
): Promise<string[]> {
  let count = 0;

  return new Promise((resolve) => {
    rulePromises.forEach((promise) => {
      promise.then((errors) => {
        if (errors.length) {
          resolve(errors);
        }

        count += 1;
        if (count === rulePromises.length) {
          resolve([]);
        }
      });
    });
  });
}
