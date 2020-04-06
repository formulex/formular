// use tj/co
// See: https://github.com/tj/co/blob/master/index.js

import {
  withContext,
  ResolverContextManager,
  ResolverContext
} from './resolvers';

let slice = Array.prototype.slice;

/**
 * Wrap the given generator `fn` into a
 * function that returns a promise.
 * This is a separate function so that
 * every `co()` call doesn't create a new,
 * unnecessary closure.
 *
 * @param {GeneratorFunction} fn
 * @return {Function}
 * @api public
 */

export function scopeFlow<R = any>(this: any, fn: Function) {
  createPromise.__generatorFunction__ = fn;
  return createPromise as () => Promise<R>;
  function createPromise(this: any) {
    return runAsyncEffect.call(this, fn.apply(this, arguments as any));
  }
}

export const oflow = scopeFlow;

/**
 * Execute the generator function or a generator
 * and return a promise.
 *
 * @param {Function} fn
 * @return {Promise}
 * @api public
 */

export function runAsyncEffect<R = any>(
  this: any,
  gen: GeneratorFunction | any
) {
  let ctx = this;
  let args = slice.call(arguments, 1);

  let tempContext: ResolverContext | null = null;

  if (ResolverContextManager.top) {
    tempContext = new ResolverContext(ResolverContextManager.top.scopeNode);
  }
  if (!tempContext) {
    throw new Error('Async effect should have at least one context.');
  }

  function runWithContext(f: () => any) {
    ResolverContextManager.push(tempContext as ResolverContext);
    const result = withContext(f)();
    ResolverContextManager.pop();
    return result;
  }

  // we wrap everything in a promise to avoid promise chaining,
  // which leads to memory leak errors.
  // see https://github.com/tj/co/issues/180
  return new Promise<R>(function(resolve, reject) {
    if (typeof gen === 'function') gen = gen.apply(ctx, args);
    if (!gen || typeof gen.next !== 'function') return resolve(gen);

    onFulfilled();

    /**
     * @param {Mixed} res
     * @return {Promise}
     * @api private
     */

    function onFulfilled(res?: any) {
      let ret;
      try {
        runWithContext(() => {
          ret = gen.next(res);
        });
      } catch (e) {
        return reject(e);
      }
      next(ret);
      return null;
    }

    /**
     * @param {Error} err
     * @return {Promise}
     * @api private
     */

    function onRejected(err: any) {
      let ret;
      try {
        runWithContext(() => {
          ret = gen.throw(err);
        });
      } catch (e) {
        return reject(e);
      }
      next(ret);
    }

    /**
     * Get the next value in the generator,
     * return a promise.
     *
     * @param {Object} ret
     * @return {Promise}
     * @api private
     */

    function next(ret: any) {
      if (ret.done) {
        return resolve(ret.value);
      }
      let value = toPromise.call(ctx, ret.value);
      if (value && isPromise(value)) return value.then(onFulfilled, onRejected);
      return onRejected(
        new TypeError(
          'You may only yield a function, promise, generator, array, or object, ' +
            'but the following object was passed: "' +
            String(ret.value) +
            '"'
        )
      );
    }
  });
}

/**
 * Convert a `yield`ed value into a promise.
 *
 * @param {Mixed} obj
 * @return {Promise}
 * @api private
 */

function toPromise(this: any, obj: any) {
  if (!obj) return obj;
  if (isPromise(obj)) return obj;
  if (isGeneratorFunction(obj) || isGenerator(obj))
    return scopeFlow.call(this, obj);
  if ('function' == typeof obj) return thunkToPromise.call(this, obj);
  if (Array.isArray(obj)) return arrayToPromise.call(this, obj);
  if (isObject(obj)) return objectToPromise.call(this, obj);
  return obj;
}

/**
 * Convert a thunk to a promise.
 *
 * @param {Function}
 * @return {Promise}
 * @api private
 */

function thunkToPromise(this: any, fn: Function) {
  let ctx = this;
  return new Promise(function(resolve, reject) {
    fn.call(ctx, function(err: any, res: any) {
      if (err) return reject(err);
      if (arguments.length > 2) res = slice.call(arguments, 1);
      resolve(res);
    });
  });
}

/**
 * Convert an array of "yieldables" to a promise.
 * Uses `Promise.all()` internally.
 *
 * @param {Array} obj
 * @return {Promise}
 * @api private
 */

function arrayToPromise(this: any, obj: any) {
  return Promise.all(obj.map(toPromise, this));
}

/**
 * Convert an object of "yieldables" to a promise.
 * Uses `Promise.all()` internally.
 *
 * @param {Object} obj
 * @return {Promise}
 * @api private
 */

function objectToPromise(this: any, obj: any) {
  let results = new obj.constructor();
  let keys = Object.keys(obj);
  let promises: any[] = [];
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    let promise = toPromise.call(this, obj[key]);
    if (promise && isPromise(promise)) defer(promise, key);
    else results[key] = obj[key];
  }
  return Promise.all(promises).then(function() {
    return results;
  });

  function defer(promise: any, key: any) {
    // predefine the key in the result
    results[key] = undefined;
    promises.push(
      promise.then(function(res: any) {
        results[key] = res;
      })
    );
  }
}

/**
 * Check if `obj` is a promise.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isPromise(obj: any) {
  return 'function' == typeof obj.then;
}

/**
 * Check if `obj` is a generator.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */

function isGenerator(obj: any) {
  return 'function' == typeof obj.next && 'function' == typeof obj.throw;
}

/**
 * Check if `obj` is a generator function.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */

function isGeneratorFunction(obj: any) {
  let constructor = obj.constructor;
  if (!constructor) return false;
  if (
    'GeneratorFunction' === constructor.name ||
    'GeneratorFunction' === constructor.displayName
  )
    return true;
  return isGenerator(constructor.prototype);
}

/**
 * Check for plain object.
 *
 * @param {Mixed} val
 * @return {Boolean}
 * @api private
 */

function isObject(val: any) {
  return Object == val.constructor;
}
