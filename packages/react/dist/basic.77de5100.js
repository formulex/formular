// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"../../node_modules/process/browser.js":[function(require,module,exports) {

// shim for using process in browser
var process = module.exports = {}; // cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
  throw new Error('setTimeout has not been defined');
}

function defaultClearTimeout() {
  throw new Error('clearTimeout has not been defined');
}

(function () {
  try {
    if (typeof setTimeout === 'function') {
      cachedSetTimeout = setTimeout;
    } else {
      cachedSetTimeout = defaultSetTimout;
    }
  } catch (e) {
    cachedSetTimeout = defaultSetTimout;
  }

  try {
    if (typeof clearTimeout === 'function') {
      cachedClearTimeout = clearTimeout;
    } else {
      cachedClearTimeout = defaultClearTimeout;
    }
  } catch (e) {
    cachedClearTimeout = defaultClearTimeout;
  }
})();

function runTimeout(fun) {
  if (cachedSetTimeout === setTimeout) {
    //normal enviroments in sane situations
    return setTimeout(fun, 0);
  } // if setTimeout wasn't available but was latter defined


  if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
    cachedSetTimeout = setTimeout;
    return setTimeout(fun, 0);
  }

  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedSetTimeout(fun, 0);
  } catch (e) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
      return cachedSetTimeout.call(null, fun, 0);
    } catch (e) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
      return cachedSetTimeout.call(this, fun, 0);
    }
  }
}

function runClearTimeout(marker) {
  if (cachedClearTimeout === clearTimeout) {
    //normal enviroments in sane situations
    return clearTimeout(marker);
  } // if clearTimeout wasn't available but was latter defined


  if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
    cachedClearTimeout = clearTimeout;
    return clearTimeout(marker);
  }

  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedClearTimeout(marker);
  } catch (e) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
      return cachedClearTimeout.call(null, marker);
    } catch (e) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
      // Some versions of I.E. have different rules for clearTimeout vs setTimeout
      return cachedClearTimeout.call(this, marker);
    }
  }
}

var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
  if (!draining || !currentQueue) {
    return;
  }

  draining = false;

  if (currentQueue.length) {
    queue = currentQueue.concat(queue);
  } else {
    queueIndex = -1;
  }

  if (queue.length) {
    drainQueue();
  }
}

function drainQueue() {
  if (draining) {
    return;
  }

  var timeout = runTimeout(cleanUpNextTick);
  draining = true;
  var len = queue.length;

  while (len) {
    currentQueue = queue;
    queue = [];

    while (++queueIndex < len) {
      if (currentQueue) {
        currentQueue[queueIndex].run();
      }
    }

    queueIndex = -1;
    len = queue.length;
  }

  currentQueue = null;
  draining = false;
  runClearTimeout(timeout);
}

process.nextTick = function (fun) {
  var args = new Array(arguments.length - 1);

  if (arguments.length > 1) {
    for (var i = 1; i < arguments.length; i++) {
      args[i - 1] = arguments[i];
    }
  }

  queue.push(new Item(fun, args));

  if (queue.length === 1 && !draining) {
    runTimeout(drainQueue);
  }
}; // v8 likes predictible objects


function Item(fun, array) {
  this.fun = fun;
  this.array = array;
}

Item.prototype.run = function () {
  this.fun.apply(null, this.array);
};

process.title = 'browser';
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues

process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) {
  return [];
};

process.binding = function (name) {
  throw new Error('process.binding is not supported');
};

process.cwd = function () {
  return '/';
};

process.chdir = function (dir) {
  throw new Error('process.chdir is not supported');
};

process.umask = function () {
  return 0;
};
},{}],"../../node_modules/@formular/core/node_modules/mobx/lib/mobx.module.js":[function(require,module,exports) {
var process = require("process");
var global = arguments[3];
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FlowCancellationError = FlowCancellationError;
exports._allowStateChanges = allowStateChanges;
exports._allowStateChangesInsideComputed = allowStateChangesInsideComputed;
exports._allowStateReadsEnd = allowStateReadsEnd;
exports._allowStateReadsStart = allowStateReadsStart;
exports._endAction = _endAction;
exports._getAdministration = getAdministration;
exports._getGlobalState = getGlobalState;
exports._interceptReads = interceptReads;
exports._isComputingDerivation = isComputingDerivation;
exports._resetGlobalState = resetGlobalState;
exports._startAction = _startAction;
exports.autorun = autorun;
exports.configure = configure;
exports.createAtom = createAtom;
exports.decorate = decorate;
exports.entries = entries;
exports.extendObservable = extendObservable;
exports.flow = flow;
exports.get = get;
exports.getAtom = getAtom;
exports.getDebugName = getDebugName;
exports.getDependencyTree = getDependencyTree;
exports.getObserverTree = getObserverTree;
exports.has = has;
exports.intercept = intercept;
exports.isAction = isAction;
exports.isArrayLike = isArrayLike;
exports.isComputed = isComputed;
exports.isComputedProp = isComputedProp;
exports.isFlowCancellationError = isFlowCancellationError;
exports.isObservable = isObservable;
exports.isObservableArray = isObservableArray;
exports.isObservableObject = isObservableObject;
exports.isObservableProp = isObservableProp;
exports.keys = keys;
exports.observe = observe;
exports.onBecomeObserved = onBecomeObserved;
exports.onBecomeUnobserved = onBecomeUnobserved;
exports.onReactionError = onReactionError;
exports.reaction = reaction;
exports.remove = remove;
exports.runInAction = runInAction;
exports.set = set;
exports.spy = spy;
exports.toJS = toJS;
exports.trace = trace;
exports.transaction = transaction;
exports.untracked = untracked;
exports.values = values;
exports.when = when;
exports.observable = exports.isObservableSet = exports.isObservableMap = exports.isBoxedObservable = exports.computed = exports.comparer = exports.action = exports.Reaction = exports.ObservableSet = exports.ObservableMap = exports.IDerivationState = exports.$mobx = void 0;

/** MobX - (c) Michel Weststrate 2015 - 2020 - MIT Licensed */

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

/* global Reflect, Promise */
var extendStatics = function (d, b) {
  extendStatics = Object.setPrototypeOf || {
    __proto__: []
  } instanceof Array && function (d, b) {
    d.__proto__ = b;
  } || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
  };

  return extendStatics(d, b);
};

function __extends(d, b) {
  extendStatics(d, b);

  function __() {
    this.constructor = d;
  }

  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function () {
  __assign = Object.assign || function __assign(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

function __values(o) {
  var m = typeof Symbol === "function" && o[Symbol.iterator],
      i = 0;
  if (m) return m.call(o);
  return {
    next: function () {
      if (o && i >= o.length) o = void 0;
      return {
        value: o && o[i++],
        done: !o
      };
    }
  };
}

function __read(o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m) return o;
  var i = m.call(o),
      r,
      ar = [],
      e;

  try {
    while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
  } catch (error) {
    e = {
      error: error
    };
  } finally {
    try {
      if (r && !r.done && (m = i["return"])) m.call(i);
    } finally {
      if (e) throw e.error;
    }
  }

  return ar;
}

function __spread() {
  for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));

  return ar;
}

var OBFUSCATED_ERROR = "An invariant failed, however the error is obfuscated because this is a production build.";
var EMPTY_ARRAY = [];
Object.freeze(EMPTY_ARRAY);
var EMPTY_OBJECT = {};
Object.freeze(EMPTY_OBJECT);

function getNextId() {
  return ++globalState.mobxGuid;
}

function fail(message) {
  invariant(false, message);
  throw "X"; // unreachable
}

function invariant(check, message) {
  if (!check) throw new Error("[mobx] " + (message || OBFUSCATED_ERROR));
}
/**
 * Prints a deprecation message, but only one time.
 * Returns false if the deprecated message was already printed before
 */


var deprecatedMessages = [];

function deprecated(msg, thing) {
  if ("development" === "production") return false;

  if (thing) {
    return deprecated("'" + msg + "', use '" + thing + "' instead.");
  }

  if (deprecatedMessages.indexOf(msg) !== -1) return false;
  deprecatedMessages.push(msg);
  console.error("[mobx] Deprecated: " + msg);
  return true;
}
/**
 * Makes sure that the provided function is invoked at most once.
 */


function once(func) {
  var invoked = false;
  return function () {
    if (invoked) return;
    invoked = true;
    return func.apply(this, arguments);
  };
}

var noop = function () {};

function unique(list) {
  var res = [];
  list.forEach(function (item) {
    if (res.indexOf(item) === -1) res.push(item);
  });
  return res;
}

function isObject(value) {
  return value !== null && typeof value === "object";
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object") return false;
  var proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function addHiddenProp(object, propName, value) {
  Object.defineProperty(object, propName, {
    enumerable: false,
    writable: true,
    configurable: true,
    value: value
  });
}

function addHiddenFinalProp(object, propName, value) {
  Object.defineProperty(object, propName, {
    enumerable: false,
    writable: false,
    configurable: true,
    value: value
  });
}

function isPropertyConfigurable(object, prop) {
  var descriptor = Object.getOwnPropertyDescriptor(object, prop);
  return !descriptor || descriptor.configurable !== false && descriptor.writable !== false;
}

function assertPropertyConfigurable(object, prop) {
  if ("development" !== "production" && !isPropertyConfigurable(object, prop)) fail("Cannot make property '" + prop.toString() + "' observable, it is not configurable and writable in the target object");
}

function createInstanceofPredicate(name, clazz) {
  var propName = "isMobX" + name;
  clazz.prototype[propName] = true;
  return function (x) {
    return isObject(x) && x[propName] === true;
  };
}
/**
 * Returns whether the argument is an array, disregarding observability.
 */


function isArrayLike(x) {
  return Array.isArray(x) || isObservableArray(x);
}

function isES6Map(thing) {
  return thing instanceof Map;
}

function isES6Set(thing) {
  return thing instanceof Set;
}
/**
 * Returns the following: own keys, prototype keys & own symbol keys, if they are enumerable.
 */


function getPlainObjectKeys(object) {
  var enumerables = new Set();

  for (var key in object) enumerables.add(key); // *all* enumerables


  Object.getOwnPropertySymbols(object).forEach(function (k) {
    if (Object.getOwnPropertyDescriptor(object, k).enumerable) enumerables.add(k);
  }); // *own* symbols
  // Note: this implementation is missing enumerable, inherited, symbolic property names! That would however pretty expensive to add,
  // as there is no efficient iterator that returns *all* properties

  return Array.from(enumerables);
}

function stringifyKey(key) {
  if (key && key.toString) return key.toString();else return new String(key).toString();
}

function getMapLikeKeys(map) {
  if (isPlainObject(map)) return Object.keys(map);
  if (Array.isArray(map)) return map.map(function (_a) {
    var _b = __read(_a, 1),
        key = _b[0];

    return key;
  });
  if (isES6Map(map) || isObservableMap(map)) return Array.from(map.keys());
  return fail("Cannot get keys from '" + map + "'");
}

function toPrimitive(value) {
  return value === null ? null : typeof value === "object" ? "" + value : value;
}

var $mobx = Symbol("mobx administration");
exports.$mobx = $mobx;

var Atom =
/** @class */
function () {
  /**
   * Create a new atom. For debugging purposes it is recommended to give it a name.
   * The onBecomeObserved and onBecomeUnobserved callbacks can be used for resource management.
   */
  function Atom(name) {
    if (name === void 0) {
      name = "Atom@" + getNextId();
    }

    this.name = name;
    this.isPendingUnobservation = false; // for effective unobserving. BaseAtom has true, for extra optimization, so its onBecomeUnobserved never gets called, because it's not needed

    this.isBeingObserved = false;
    this.observers = new Set();
    this.diffValue = 0;
    this.lastAccessedBy = 0;
    this.lowestObserverState = IDerivationState.NOT_TRACKING;
  }

  Atom.prototype.onBecomeObserved = function () {
    if (this.onBecomeObservedListeners) {
      this.onBecomeObservedListeners.forEach(function (listener) {
        return listener();
      });
    }
  };

  Atom.prototype.onBecomeUnobserved = function () {
    if (this.onBecomeUnobservedListeners) {
      this.onBecomeUnobservedListeners.forEach(function (listener) {
        return listener();
      });
    }
  };
  /**
   * Invoke this method to notify mobx that your atom has been used somehow.
   * Returns true if there is currently a reactive context.
   */


  Atom.prototype.reportObserved = function () {
    return reportObserved(this);
  };
  /**
   * Invoke this method _after_ this method has changed to signal mobx that all its observers should invalidate.
   */


  Atom.prototype.reportChanged = function () {
    startBatch();
    propagateChanged(this);
    endBatch();
  };

  Atom.prototype.toString = function () {
    return this.name;
  };

  return Atom;
}();

var isAtom = createInstanceofPredicate("Atom", Atom);

function createAtom(name, onBecomeObservedHandler, onBecomeUnobservedHandler) {
  if (onBecomeObservedHandler === void 0) {
    onBecomeObservedHandler = noop;
  }

  if (onBecomeUnobservedHandler === void 0) {
    onBecomeUnobservedHandler = noop;
  }

  var atom = new Atom(name); // default `noop` listener will not initialize the hook Set

  if (onBecomeObservedHandler !== noop) {
    onBecomeObserved(atom, onBecomeObservedHandler);
  }

  if (onBecomeUnobservedHandler !== noop) {
    onBecomeUnobserved(atom, onBecomeUnobservedHandler);
  }

  return atom;
}

function identityComparer(a, b) {
  return a === b;
}

function structuralComparer(a, b) {
  return deepEqual(a, b);
}

function shallowComparer(a, b) {
  return deepEqual(a, b, 1);
}

function defaultComparer(a, b) {
  return Object.is(a, b);
}

var comparer = {
  identity: identityComparer,
  structural: structuralComparer,
  default: defaultComparer,
  shallow: shallowComparer
};
exports.comparer = comparer;
var mobxDidRunLazyInitializersSymbol = Symbol("mobx did run lazy initializers");
var mobxPendingDecorators = Symbol("mobx pending decorators");
var enumerableDescriptorCache = {};
var nonEnumerableDescriptorCache = {};

function createPropertyInitializerDescriptor(prop, enumerable) {
  var cache = enumerable ? enumerableDescriptorCache : nonEnumerableDescriptorCache;
  return cache[prop] || (cache[prop] = {
    configurable: true,
    enumerable: enumerable,
    get: function () {
      initializeInstance(this);
      return this[prop];
    },
    set: function (value) {
      initializeInstance(this);
      this[prop] = value;
    }
  });
}

function initializeInstance(target) {
  var e_1, _a;

  if (target[mobxDidRunLazyInitializersSymbol] === true) return;
  var decorators = target[mobxPendingDecorators];

  if (decorators) {
    addHiddenProp(target, mobxDidRunLazyInitializersSymbol, true); // Build property key array from both strings and symbols

    var keys = __spread(Object.getOwnPropertySymbols(decorators), Object.keys(decorators));

    try {
      for (var keys_1 = __values(keys), keys_1_1 = keys_1.next(); !keys_1_1.done; keys_1_1 = keys_1.next()) {
        var key = keys_1_1.value;
        var d = decorators[key];
        d.propertyCreator(target, d.prop, d.descriptor, d.decoratorTarget, d.decoratorArguments);
      }
    } catch (e_1_1) {
      e_1 = {
        error: e_1_1
      };
    } finally {
      try {
        if (keys_1_1 && !keys_1_1.done && (_a = keys_1.return)) _a.call(keys_1);
      } finally {
        if (e_1) throw e_1.error;
      }
    }
  }
}

function createPropDecorator(propertyInitiallyEnumerable, propertyCreator) {
  return function decoratorFactory() {
    var decoratorArguments;

    var decorator = function decorate(target, prop, descriptor, applyImmediately // This is a special parameter to signal the direct application of a decorator, allow extendObservable to skip the entire type decoration part,
    // as the instance to apply the decorator to equals the target
    ) {
      if (applyImmediately === true) {
        propertyCreator(target, prop, descriptor, target, decoratorArguments);
        return null;
      }

      if ("development" !== "production" && !quacksLikeADecorator(arguments)) fail("This function is a decorator, but it wasn't invoked like a decorator");

      if (!Object.prototype.hasOwnProperty.call(target, mobxPendingDecorators)) {
        var inheritedDecorators = target[mobxPendingDecorators];
        addHiddenProp(target, mobxPendingDecorators, __assign({}, inheritedDecorators));
      }

      target[mobxPendingDecorators][prop] = {
        prop: prop,
        propertyCreator: propertyCreator,
        descriptor: descriptor,
        decoratorTarget: target,
        decoratorArguments: decoratorArguments
      };
      return createPropertyInitializerDescriptor(prop, propertyInitiallyEnumerable);
    };

    if (quacksLikeADecorator(arguments)) {
      // @decorator
      decoratorArguments = EMPTY_ARRAY;
      return decorator.apply(null, arguments);
    } else {
      // @decorator(args)
      decoratorArguments = Array.prototype.slice.call(arguments);
      return decorator;
    }
  };
}

function quacksLikeADecorator(args) {
  return (args.length === 2 || args.length === 3) && (typeof args[1] === "string" || typeof args[1] === "symbol") || args.length === 4 && args[3] === true;
}

function deepEnhancer(v, _, name) {
  // it is an observable already, done
  if (isObservable(v)) return v; // something that can be converted and mutated?

  if (Array.isArray(v)) return observable.array(v, {
    name: name
  });
  if (isPlainObject(v)) return observable.object(v, undefined, {
    name: name
  });
  if (isES6Map(v)) return observable.map(v, {
    name: name
  });
  if (isES6Set(v)) return observable.set(v, {
    name: name
  });
  return v;
}

function shallowEnhancer(v, _, name) {
  if (v === undefined || v === null) return v;
  if (isObservableObject(v) || isObservableArray(v) || isObservableMap(v) || isObservableSet(v)) return v;
  if (Array.isArray(v)) return observable.array(v, {
    name: name,
    deep: false
  });
  if (isPlainObject(v)) return observable.object(v, undefined, {
    name: name,
    deep: false
  });
  if (isES6Map(v)) return observable.map(v, {
    name: name,
    deep: false
  });
  if (isES6Set(v)) return observable.set(v, {
    name: name,
    deep: false
  });
  return fail("development" !== "production" && "The shallow modifier / decorator can only used in combination with arrays, objects, maps and sets");
}

function referenceEnhancer(newValue) {
  // never turn into an observable
  return newValue;
}

function refStructEnhancer(v, oldValue, name) {
  if ("development" !== "production" && isObservable(v)) throw "observable.struct should not be used with observable values";
  if (deepEqual(v, oldValue)) return oldValue;
  return v;
}

function createDecoratorForEnhancer(enhancer) {
  invariant(enhancer);
  var decorator = createPropDecorator(true, function (target, propertyName, descriptor, _decoratorTarget, decoratorArgs) {
    if ("development" !== "production") {
      invariant(!descriptor || !descriptor.get, "@observable cannot be used on getter (property \"" + stringifyKey(propertyName) + "\"), use @computed instead.");
    }

    var initialValue = descriptor ? descriptor.initializer ? descriptor.initializer.call(target) : descriptor.value : undefined;
    asObservableObject(target).addObservableProp(propertyName, initialValue, enhancer);
  });
  var res = // Extra process checks, as this happens during module initialization
  typeof process !== "undefined" && process.env && "development" !== "production" ? function observableDecorator() {
    // This wrapper function is just to detect illegal decorator invocations, deprecate in a next version
    // and simply return the created prop decorator
    if (arguments.length < 2) return fail("Incorrect decorator invocation. @observable decorator doesn't expect any arguments");
    return decorator.apply(null, arguments);
  } : decorator;
  res.enhancer = enhancer;
  return res;
} // Predefined bags of create observable options, to avoid allocating temporarily option objects
// in the majority of cases


var defaultCreateObservableOptions = {
  deep: true,
  name: undefined,
  defaultDecorator: undefined,
  proxy: true
};
Object.freeze(defaultCreateObservableOptions);

function assertValidOption(key) {
  if (!/^(deep|name|equals|defaultDecorator|proxy)$/.test(key)) fail("invalid option for (extend)observable: " + key);
}

function asCreateObservableOptions(thing) {
  if (thing === null || thing === undefined) return defaultCreateObservableOptions;
  if (typeof thing === "string") return {
    name: thing,
    deep: true,
    proxy: true
  };

  if ("development" !== "production") {
    if (typeof thing !== "object") return fail("expected options object");
    Object.keys(thing).forEach(assertValidOption);
  }

  return thing;
}

var deepDecorator = createDecoratorForEnhancer(deepEnhancer);
var shallowDecorator = createDecoratorForEnhancer(shallowEnhancer);
var refDecorator = createDecoratorForEnhancer(referenceEnhancer);
var refStructDecorator = createDecoratorForEnhancer(refStructEnhancer);

function getEnhancerFromOptions(options) {
  return options.defaultDecorator ? options.defaultDecorator.enhancer : options.deep === false ? referenceEnhancer : deepEnhancer;
}
/**
 * Turns an object, array or function into a reactive structure.
 * @param v the value which should become observable.
 */


function createObservable(v, arg2, arg3) {
  // @observable someProp;
  if (typeof arguments[1] === "string" || typeof arguments[1] === "symbol") {
    return deepDecorator.apply(null, arguments);
  } // it is an observable already, done


  if (isObservable(v)) return v; // something that can be converted and mutated?

  var res = isPlainObject(v) ? observable.object(v, arg2, arg3) : Array.isArray(v) ? observable.array(v, arg2) : isES6Map(v) ? observable.map(v, arg2) : isES6Set(v) ? observable.set(v, arg2) : v; // this value could be converted to a new observable data structure, return it

  if (res !== v) return res; // otherwise, just box it

  fail("development" !== "production" && "The provided value could not be converted into an observable. If you want just create an observable reference to the object use 'observable.box(value)'");
}

var observableFactories = {
  box: function (value, options) {
    if (arguments.length > 2) incorrectlyUsedAsDecorator("box");
    var o = asCreateObservableOptions(options);
    return new ObservableValue(value, getEnhancerFromOptions(o), o.name, true, o.equals);
  },
  array: function (initialValues, options) {
    if (arguments.length > 2) incorrectlyUsedAsDecorator("array");
    var o = asCreateObservableOptions(options);
    return createObservableArray(initialValues, getEnhancerFromOptions(o), o.name);
  },
  map: function (initialValues, options) {
    if (arguments.length > 2) incorrectlyUsedAsDecorator("map");
    var o = asCreateObservableOptions(options);
    return new ObservableMap(initialValues, getEnhancerFromOptions(o), o.name);
  },
  set: function (initialValues, options) {
    if (arguments.length > 2) incorrectlyUsedAsDecorator("set");
    var o = asCreateObservableOptions(options);
    return new ObservableSet(initialValues, getEnhancerFromOptions(o), o.name);
  },
  object: function (props, decorators, options) {
    if (typeof arguments[1] === "string") incorrectlyUsedAsDecorator("object");
    var o = asCreateObservableOptions(options);

    if (o.proxy === false) {
      return extendObservable({}, props, decorators, o);
    } else {
      var defaultDecorator = getDefaultDecoratorFromObjectOptions(o);
      var base = extendObservable({}, undefined, undefined, o);
      var proxy = createDynamicObservableObject(base);
      extendObservableObjectWithProperties(proxy, props, decorators, defaultDecorator);
      return proxy;
    }
  },
  ref: refDecorator,
  shallow: shallowDecorator,
  deep: deepDecorator,
  struct: refStructDecorator
};
var observable = createObservable; // weird trick to keep our typings nicely with our funcs, and still extend the observable function

exports.observable = observable;
Object.keys(observableFactories).forEach(function (name) {
  return observable[name] = observableFactories[name];
});

function incorrectlyUsedAsDecorator(methodName) {
  fail( // process.env.NODE_ENV !== "production" &&
  "Expected one or two arguments to observable." + methodName + ". Did you accidentally try to use observable." + methodName + " as decorator?");
}

var computedDecorator = createPropDecorator(false, function (instance, propertyName, descriptor, decoratorTarget, decoratorArgs) {
  var get = descriptor.get,
      set = descriptor.set; // initialValue is the descriptor for get / set props
  // Optimization: faster on decorator target or instance? Assuming target
  // Optimization: find out if declaring on instance isn't just faster. (also makes the property descriptor simpler). But, more memory usage..
  // Forcing instance now, fixes hot reloadig issues on React Native:

  var options = decoratorArgs[0] || {};
  asObservableObject(instance).addComputedProp(instance, propertyName, __assign({
    get: get,
    set: set,
    context: instance
  }, options));
});
var computedStructDecorator = computedDecorator({
  equals: comparer.structural
});
/**
 * Decorator for class properties: @computed get value() { return expr; }.
 * For legacy purposes also invokable as ES5 observable created: `computed(() => expr)`;
 */

var computed = function computed(arg1, arg2, arg3) {
  if (typeof arg2 === "string") {
    // @computed
    return computedDecorator.apply(null, arguments);
  }

  if (arg1 !== null && typeof arg1 === "object" && arguments.length === 1) {
    // @computed({ options })
    return computedDecorator.apply(null, arguments);
  } // computed(expr, options?)


  if ("development" !== "production") {
    invariant(typeof arg1 === "function", "First argument to `computed` should be an expression.");
    invariant(arguments.length < 3, "Computed takes one or two arguments if used as function");
  }

  var opts = typeof arg2 === "object" ? arg2 : {};
  opts.get = arg1;
  opts.set = typeof arg2 === "function" ? arg2 : opts.set;
  opts.name = opts.name || arg1.name || "";
  /* for generated name */

  return new ComputedValue(opts);
};

exports.computed = computed;
computed.struct = computedStructDecorator;
var IDerivationState;
exports.IDerivationState = IDerivationState;

(function (IDerivationState) {
  // before being run or (outside batch and not being observed)
  // at this point derivation is not holding any data about dependency tree
  IDerivationState[IDerivationState["NOT_TRACKING"] = -1] = "NOT_TRACKING"; // no shallow dependency changed since last computation
  // won't recalculate derivation
  // this is what makes mobx fast

  IDerivationState[IDerivationState["UP_TO_DATE"] = 0] = "UP_TO_DATE"; // some deep dependency changed, but don't know if shallow dependency changed
  // will require to check first if UP_TO_DATE or POSSIBLY_STALE
  // currently only ComputedValue will propagate POSSIBLY_STALE
  //
  // having this state is second big optimization:
  // don't have to recompute on every dependency change, but only when it's needed

  IDerivationState[IDerivationState["POSSIBLY_STALE"] = 1] = "POSSIBLY_STALE"; // A shallow dependency has changed since last computation and the derivation
  // will need to recompute when it's needed next.

  IDerivationState[IDerivationState["STALE"] = 2] = "STALE";
})(IDerivationState || (exports.IDerivationState = IDerivationState = {}));

var TraceMode;

(function (TraceMode) {
  TraceMode[TraceMode["NONE"] = 0] = "NONE";
  TraceMode[TraceMode["LOG"] = 1] = "LOG";
  TraceMode[TraceMode["BREAK"] = 2] = "BREAK";
})(TraceMode || (TraceMode = {}));

var CaughtException =
/** @class */
function () {
  function CaughtException(cause) {
    this.cause = cause; // Empty
  }

  return CaughtException;
}();

function isCaughtException(e) {
  return e instanceof CaughtException;
}
/**
 * Finds out whether any dependency of the derivation has actually changed.
 * If dependenciesState is 1 then it will recalculate dependencies,
 * if any dependency changed it will propagate it by changing dependenciesState to 2.
 *
 * By iterating over the dependencies in the same order that they were reported and
 * stopping on the first change, all the recalculations are only called for ComputedValues
 * that will be tracked by derivation. That is because we assume that if the first x
 * dependencies of the derivation doesn't change then the derivation should run the same way
 * up until accessing x-th dependency.
 */


function shouldCompute(derivation) {
  switch (derivation.dependenciesState) {
    case IDerivationState.UP_TO_DATE:
      return false;

    case IDerivationState.NOT_TRACKING:
    case IDerivationState.STALE:
      return true;

    case IDerivationState.POSSIBLY_STALE:
      {
        // state propagation can occur outside of action/reactive context #2195
        var prevAllowStateReads = allowStateReadsStart(true);
        var prevUntracked = untrackedStart(); // no need for those computeds to be reported, they will be picked up in trackDerivedFunction.

        var obs = derivation.observing,
            l = obs.length;

        for (var i = 0; i < l; i++) {
          var obj = obs[i];

          if (isComputedValue(obj)) {
            if (globalState.disableErrorBoundaries) {
              obj.get();
            } else {
              try {
                obj.get();
              } catch (e) {
                // we are not interested in the value *or* exception at this moment, but if there is one, notify all
                untrackedEnd(prevUntracked);
                allowStateReadsEnd(prevAllowStateReads);
                return true;
              }
            } // if ComputedValue `obj` actually changed it will be computed and propagated to its observers.
            // and `derivation` is an observer of `obj`
            // invariantShouldCompute(derivation)


            if (derivation.dependenciesState === IDerivationState.STALE) {
              untrackedEnd(prevUntracked);
              allowStateReadsEnd(prevAllowStateReads);
              return true;
            }
          }
        }

        changeDependenciesStateTo0(derivation);
        untrackedEnd(prevUntracked);
        allowStateReadsEnd(prevAllowStateReads);
        return false;
      }
  }
} // function invariantShouldCompute(derivation: IDerivation) {
//     const newDepState = (derivation as any).dependenciesState
//     if (
//         process.env.NODE_ENV === "production" &&
//         (newDepState === IDerivationState.POSSIBLY_STALE ||
//             newDepState === IDerivationState.NOT_TRACKING)
//     )
//         fail("Illegal dependency state")
// }


function isComputingDerivation() {
  return globalState.trackingDerivation !== null; // filter out actions inside computations
}

function checkIfStateModificationsAreAllowed(atom) {
  var hasObservers = atom.observers.size > 0; // Should never be possible to change an observed observable from inside computed, see #798

  if (globalState.computationDepth > 0 && hasObservers) fail("development" !== "production" && "Computed values are not allowed to cause side effects by changing observables that are already being observed. Tried to modify: " + atom.name); // Should not be possible to change observed state outside strict mode, except during initialization, see #563

  if (!globalState.allowStateChanges && (hasObservers || globalState.enforceActions === "strict")) fail("development" !== "production" && (globalState.enforceActions ? "Since strict-mode is enabled, changing observed observable values outside actions is not allowed. Please wrap the code in an `action` if this change is intended. Tried to modify: " : "Side effects like changing state are not allowed at this point. Are you trying to modify state from, for example, the render function of a React component? Tried to modify: ") + atom.name);
}

function checkIfStateReadsAreAllowed(observable) {
  if ("development" !== "production" && !globalState.allowStateReads && globalState.observableRequiresReaction) {
    console.warn("[mobx] Observable " + observable.name + " being read outside a reactive context");
  }
}
/**
 * Executes the provided function `f` and tracks which observables are being accessed.
 * The tracking information is stored on the `derivation` object and the derivation is registered
 * as observer of any of the accessed observables.
 */


function trackDerivedFunction(derivation, f, context) {
  var prevAllowStateReads = allowStateReadsStart(true); // pre allocate array allocation + room for variation in deps
  // array will be trimmed by bindDependencies

  changeDependenciesStateTo0(derivation);
  derivation.newObserving = new Array(derivation.observing.length + 100);
  derivation.unboundDepsCount = 0;
  derivation.runId = ++globalState.runId;
  var prevTracking = globalState.trackingDerivation;
  globalState.trackingDerivation = derivation;
  var result;

  if (globalState.disableErrorBoundaries === true) {
    result = f.call(context);
  } else {
    try {
      result = f.call(context);
    } catch (e) {
      result = new CaughtException(e);
    }
  }

  globalState.trackingDerivation = prevTracking;
  bindDependencies(derivation);
  warnAboutDerivationWithoutDependencies(derivation);
  allowStateReadsEnd(prevAllowStateReads);
  return result;
}

function warnAboutDerivationWithoutDependencies(derivation) {
  if ("development" === "production") return;
  if (derivation.observing.length !== 0) return;

  if (globalState.reactionRequiresObservable || derivation.requiresObservable) {
    console.warn("[mobx] Derivation " + derivation.name + " is created/updated without reading any observable value");
  }
}
/**
 * diffs newObserving with observing.
 * update observing to be newObserving with unique observables
 * notify observers that become observed/unobserved
 */


function bindDependencies(derivation) {
  // invariant(derivation.dependenciesState !== IDerivationState.NOT_TRACKING, "INTERNAL ERROR bindDependencies expects derivation.dependenciesState !== -1");
  var prevObserving = derivation.observing;
  var observing = derivation.observing = derivation.newObserving;
  var lowestNewObservingDerivationState = IDerivationState.UP_TO_DATE; // Go through all new observables and check diffValue: (this list can contain duplicates):
  //   0: first occurrence, change to 1 and keep it
  //   1: extra occurrence, drop it

  var i0 = 0,
      l = derivation.unboundDepsCount;

  for (var i = 0; i < l; i++) {
    var dep = observing[i];

    if (dep.diffValue === 0) {
      dep.diffValue = 1;
      if (i0 !== i) observing[i0] = dep;
      i0++;
    } // Upcast is 'safe' here, because if dep is IObservable, `dependenciesState` will be undefined,
    // not hitting the condition


    if (dep.dependenciesState > lowestNewObservingDerivationState) {
      lowestNewObservingDerivationState = dep.dependenciesState;
    }
  }

  observing.length = i0;
  derivation.newObserving = null; // newObserving shouldn't be needed outside tracking (statement moved down to work around FF bug, see #614)
  // Go through all old observables and check diffValue: (it is unique after last bindDependencies)
  //   0: it's not in new observables, unobserve it
  //   1: it keeps being observed, don't want to notify it. change to 0

  l = prevObserving.length;

  while (l--) {
    var dep = prevObserving[l];

    if (dep.diffValue === 0) {
      removeObserver(dep, derivation);
    }

    dep.diffValue = 0;
  } // Go through all new observables and check diffValue: (now it should be unique)
  //   0: it was set to 0 in last loop. don't need to do anything.
  //   1: it wasn't observed, let's observe it. set back to 0


  while (i0--) {
    var dep = observing[i0];

    if (dep.diffValue === 1) {
      dep.diffValue = 0;
      addObserver(dep, derivation);
    }
  } // Some new observed derivations may become stale during this derivation computation
  // so they have had no chance to propagate staleness (#916)


  if (lowestNewObservingDerivationState !== IDerivationState.UP_TO_DATE) {
    derivation.dependenciesState = lowestNewObservingDerivationState;
    derivation.onBecomeStale();
  }
}

function clearObserving(derivation) {
  // invariant(globalState.inBatch > 0, "INTERNAL ERROR clearObserving should be called only inside batch");
  var obs = derivation.observing;
  derivation.observing = [];
  var i = obs.length;

  while (i--) removeObserver(obs[i], derivation);

  derivation.dependenciesState = IDerivationState.NOT_TRACKING;
}

function untracked(action) {
  var prev = untrackedStart();

  try {
    return action();
  } finally {
    untrackedEnd(prev);
  }
}

function untrackedStart() {
  var prev = globalState.trackingDerivation;
  globalState.trackingDerivation = null;
  return prev;
}

function untrackedEnd(prev) {
  globalState.trackingDerivation = prev;
}

function allowStateReadsStart(allowStateReads) {
  var prev = globalState.allowStateReads;
  globalState.allowStateReads = allowStateReads;
  return prev;
}

function allowStateReadsEnd(prev) {
  globalState.allowStateReads = prev;
}
/**
 * needed to keep `lowestObserverState` correct. when changing from (2 or 1) to 0
 *
 */


function changeDependenciesStateTo0(derivation) {
  if (derivation.dependenciesState === IDerivationState.UP_TO_DATE) return;
  derivation.dependenciesState = IDerivationState.UP_TO_DATE;
  var obs = derivation.observing;
  var i = obs.length;

  while (i--) obs[i].lowestObserverState = IDerivationState.UP_TO_DATE;
} // we don't use globalState for these in order to avoid possible issues with multiple
// mobx versions


var currentActionId = 0;
var nextActionId = 1;
var functionNameDescriptor = Object.getOwnPropertyDescriptor(function () {}, "name");
var isFunctionNameConfigurable = functionNameDescriptor && functionNameDescriptor.configurable;

function createAction(actionName, fn, ref) {
  if ("development" !== "production") {
    invariant(typeof fn === "function", "`action` can only be invoked on functions");
    if (typeof actionName !== "string" || !actionName) fail("actions should have valid names, got: '" + actionName + "'");
  }

  var res = function () {
    return executeAction(actionName, fn, ref || this, arguments);
  };

  res.isMobxAction = true;

  if ("development" !== "production") {
    if (isFunctionNameConfigurable) {
      Object.defineProperty(res, "name", {
        value: actionName
      });
    }
  }

  return res;
}

function executeAction(actionName, fn, scope, args) {
  var runInfo = _startAction(actionName, scope, args);

  try {
    return fn.apply(scope, args);
  } catch (err) {
    runInfo.error = err;
    throw err;
  } finally {
    _endAction(runInfo);
  }
}

function _startAction(actionName, scope, args) {
  var notifySpy = isSpyEnabled() && !!actionName;
  var startTime = 0;

  if (notifySpy && "development" !== "production") {
    startTime = Date.now();
    var l = args && args.length || 0;
    var flattendArgs = new Array(l);
    if (l > 0) for (var i = 0; i < l; i++) flattendArgs[i] = args[i];
    spyReportStart({
      type: "action",
      name: actionName,
      object: scope,
      arguments: flattendArgs
    });
  }

  var prevDerivation = untrackedStart();
  startBatch();
  var prevAllowStateChanges = allowStateChangesStart(true);
  var prevAllowStateReads = allowStateReadsStart(true);
  var runInfo = {
    prevDerivation: prevDerivation,
    prevAllowStateChanges: prevAllowStateChanges,
    prevAllowStateReads: prevAllowStateReads,
    notifySpy: notifySpy,
    startTime: startTime,
    actionId: nextActionId++,
    parentActionId: currentActionId
  };
  currentActionId = runInfo.actionId;
  return runInfo;
}

function _endAction(runInfo) {
  if (currentActionId !== runInfo.actionId) {
    fail("invalid action stack. did you forget to finish an action?");
  }

  currentActionId = runInfo.parentActionId;

  if (runInfo.error !== undefined) {
    globalState.suppressReactionErrors = true;
  }

  allowStateChangesEnd(runInfo.prevAllowStateChanges);
  allowStateReadsEnd(runInfo.prevAllowStateReads);
  endBatch();
  untrackedEnd(runInfo.prevDerivation);

  if (runInfo.notifySpy && "development" !== "production") {
    spyReportEnd({
      time: Date.now() - runInfo.startTime
    });
  }

  globalState.suppressReactionErrors = false;
}

function allowStateChanges(allowStateChanges, func) {
  var prev = allowStateChangesStart(allowStateChanges);
  var res;

  try {
    res = func();
  } finally {
    allowStateChangesEnd(prev);
  }

  return res;
}

function allowStateChangesStart(allowStateChanges) {
  var prev = globalState.allowStateChanges;
  globalState.allowStateChanges = allowStateChanges;
  return prev;
}

function allowStateChangesEnd(prev) {
  globalState.allowStateChanges = prev;
}

function allowStateChangesInsideComputed(func) {
  var prev = globalState.computationDepth;
  globalState.computationDepth = 0;
  var res;

  try {
    res = func();
  } finally {
    globalState.computationDepth = prev;
  }

  return res;
}

var ObservableValue =
/** @class */
function (_super) {
  __extends(ObservableValue, _super);

  function ObservableValue(value, enhancer, name, notifySpy, equals) {
    if (name === void 0) {
      name = "ObservableValue@" + getNextId();
    }

    if (notifySpy === void 0) {
      notifySpy = true;
    }

    if (equals === void 0) {
      equals = comparer.default;
    }

    var _this = _super.call(this, name) || this;

    _this.enhancer = enhancer;
    _this.name = name;
    _this.equals = equals;
    _this.hasUnreportedChange = false;
    _this.value = enhancer(value, undefined, name);

    if (notifySpy && isSpyEnabled() && "development" !== "production") {
      // only notify spy if this is a stand-alone observable
      spyReport({
        type: "create",
        name: _this.name,
        newValue: "" + _this.value
      });
    }

    return _this;
  }

  ObservableValue.prototype.dehanceValue = function (value) {
    if (this.dehancer !== undefined) return this.dehancer(value);
    return value;
  };

  ObservableValue.prototype.set = function (newValue) {
    var oldValue = this.value;
    newValue = this.prepareNewValue(newValue);

    if (newValue !== globalState.UNCHANGED) {
      var notifySpy = isSpyEnabled();

      if (notifySpy && "development" !== "production") {
        spyReportStart({
          type: "update",
          name: this.name,
          newValue: newValue,
          oldValue: oldValue
        });
      }

      this.setNewValue(newValue);
      if (notifySpy && "development" !== "production") spyReportEnd();
    }
  };

  ObservableValue.prototype.prepareNewValue = function (newValue) {
    checkIfStateModificationsAreAllowed(this);

    if (hasInterceptors(this)) {
      var change = interceptChange(this, {
        object: this,
        type: "update",
        newValue: newValue
      });
      if (!change) return globalState.UNCHANGED;
      newValue = change.newValue;
    } // apply modifier


    newValue = this.enhancer(newValue, this.value, this.name);
    return this.equals(this.value, newValue) ? globalState.UNCHANGED : newValue;
  };

  ObservableValue.prototype.setNewValue = function (newValue) {
    var oldValue = this.value;
    this.value = newValue;
    this.reportChanged();

    if (hasListeners(this)) {
      notifyListeners(this, {
        type: "update",
        object: this,
        newValue: newValue,
        oldValue: oldValue
      });
    }
  };

  ObservableValue.prototype.get = function () {
    this.reportObserved();
    return this.dehanceValue(this.value);
  };

  ObservableValue.prototype.intercept = function (handler) {
    return registerInterceptor(this, handler);
  };

  ObservableValue.prototype.observe = function (listener, fireImmediately) {
    if (fireImmediately) listener({
      object: this,
      type: "update",
      newValue: this.value,
      oldValue: undefined
    });
    return registerListener(this, listener);
  };

  ObservableValue.prototype.toJSON = function () {
    return this.get();
  };

  ObservableValue.prototype.toString = function () {
    return this.name + "[" + this.value + "]";
  };

  ObservableValue.prototype.valueOf = function () {
    return toPrimitive(this.get());
  };

  ObservableValue.prototype[Symbol.toPrimitive] = function () {
    return this.valueOf();
  };

  return ObservableValue;
}(Atom);

var isObservableValue = createInstanceofPredicate("ObservableValue", ObservableValue);
/**
 * A node in the state dependency root that observes other nodes, and can be observed itself.
 *
 * ComputedValue will remember the result of the computation for the duration of the batch, or
 * while being observed.
 *
 * During this time it will recompute only when one of its direct dependencies changed,
 * but only when it is being accessed with `ComputedValue.get()`.
 *
 * Implementation description:
 * 1. First time it's being accessed it will compute and remember result
 *    give back remembered result until 2. happens
 * 2. First time any deep dependency change, propagate POSSIBLY_STALE to all observers, wait for 3.
 * 3. When it's being accessed, recompute if any shallow dependency changed.
 *    if result changed: propagate STALE to all observers, that were POSSIBLY_STALE from the last step.
 *    go to step 2. either way
 *
 * If at any point it's outside batch and it isn't observed: reset everything and go to 1.
 */

exports.isBoxedObservable = isObservableValue;

var ComputedValue =
/** @class */
function () {
  /**
   * Create a new computed value based on a function expression.
   *
   * The `name` property is for debug purposes only.
   *
   * The `equals` property specifies the comparer function to use to determine if a newly produced
   * value differs from the previous value. Two comparers are provided in the library; `defaultComparer`
   * compares based on identity comparison (===), and `structualComparer` deeply compares the structure.
   * Structural comparison can be convenient if you always produce a new aggregated object and
   * don't want to notify observers if it is structurally the same.
   * This is useful for working with vectors, mouse coordinates etc.
   */
  function ComputedValue(options) {
    this.dependenciesState = IDerivationState.NOT_TRACKING;
    this.observing = []; // nodes we are looking at. Our value depends on these nodes

    this.newObserving = null; // during tracking it's an array with new observed observers

    this.isBeingObserved = false;
    this.isPendingUnobservation = false;
    this.observers = new Set();
    this.diffValue = 0;
    this.runId = 0;
    this.lastAccessedBy = 0;
    this.lowestObserverState = IDerivationState.UP_TO_DATE;
    this.unboundDepsCount = 0;
    this.__mapid = "#" + getNextId();
    this.value = new CaughtException(null);
    this.isComputing = false; // to check for cycles

    this.isRunningSetter = false;
    this.isTracing = TraceMode.NONE;
    invariant(options.get, "missing option for computed: get");
    this.derivation = options.get;
    this.name = options.name || "ComputedValue@" + getNextId();
    if (options.set) this.setter = createAction(this.name + "-setter", options.set);
    this.equals = options.equals || (options.compareStructural || options.struct ? comparer.structural : comparer.default);
    this.scope = options.context;
    this.requiresReaction = !!options.requiresReaction;
    this.keepAlive = !!options.keepAlive;
  }

  ComputedValue.prototype.onBecomeStale = function () {
    propagateMaybeChanged(this);
  };

  ComputedValue.prototype.onBecomeObserved = function () {
    if (this.onBecomeObservedListeners) {
      this.onBecomeObservedListeners.forEach(function (listener) {
        return listener();
      });
    }
  };

  ComputedValue.prototype.onBecomeUnobserved = function () {
    if (this.onBecomeUnobservedListeners) {
      this.onBecomeUnobservedListeners.forEach(function (listener) {
        return listener();
      });
    }
  };
  /**
   * Returns the current value of this computed value.
   * Will evaluate its computation first if needed.
   */


  ComputedValue.prototype.get = function () {
    if (this.isComputing) fail("Cycle detected in computation " + this.name + ": " + this.derivation);

    if (globalState.inBatch === 0 && this.observers.size === 0 && !this.keepAlive) {
      if (shouldCompute(this)) {
        this.warnAboutUntrackedRead();
        startBatch(); // See perf test 'computed memoization'

        this.value = this.computeValue(false);
        endBatch();
      }
    } else {
      reportObserved(this);
      if (shouldCompute(this)) if (this.trackAndCompute()) propagateChangeConfirmed(this);
    }

    var result = this.value;
    if (isCaughtException(result)) throw result.cause;
    return result;
  };

  ComputedValue.prototype.peek = function () {
    var res = this.computeValue(false);
    if (isCaughtException(res)) throw res.cause;
    return res;
  };

  ComputedValue.prototype.set = function (value) {
    if (this.setter) {
      invariant(!this.isRunningSetter, "The setter of computed value '" + this.name + "' is trying to update itself. Did you intend to update an _observable_ value, instead of the computed property?");
      this.isRunningSetter = true;

      try {
        this.setter.call(this.scope, value);
      } finally {
        this.isRunningSetter = false;
      }
    } else invariant(false, "development" !== "production" && "[ComputedValue '" + this.name + "'] It is not possible to assign a new value to a computed value.");
  };

  ComputedValue.prototype.trackAndCompute = function () {
    if (isSpyEnabled() && "development" !== "production") {
      spyReport({
        object: this.scope,
        type: "compute",
        name: this.name
      });
    }

    var oldValue = this.value;
    var wasSuspended =
    /* see #1208 */
    this.dependenciesState === IDerivationState.NOT_TRACKING;
    var newValue = this.computeValue(true);
    var changed = wasSuspended || isCaughtException(oldValue) || isCaughtException(newValue) || !this.equals(oldValue, newValue);

    if (changed) {
      this.value = newValue;
    }

    return changed;
  };

  ComputedValue.prototype.computeValue = function (track) {
    this.isComputing = true;
    globalState.computationDepth++;
    var res;

    if (track) {
      res = trackDerivedFunction(this, this.derivation, this.scope);
    } else {
      if (globalState.disableErrorBoundaries === true) {
        res = this.derivation.call(this.scope);
      } else {
        try {
          res = this.derivation.call(this.scope);
        } catch (e) {
          res = new CaughtException(e);
        }
      }
    }

    globalState.computationDepth--;
    this.isComputing = false;
    return res;
  };

  ComputedValue.prototype.suspend = function () {
    if (!this.keepAlive) {
      clearObserving(this);
      this.value = undefined; // don't hold on to computed value!
    }
  };

  ComputedValue.prototype.observe = function (listener, fireImmediately) {
    var _this = this;

    var firstTime = true;
    var prevValue = undefined;
    return autorun(function () {
      var newValue = _this.get();

      if (!firstTime || fireImmediately) {
        var prevU = untrackedStart();
        listener({
          type: "update",
          object: _this,
          newValue: newValue,
          oldValue: prevValue
        });
        untrackedEnd(prevU);
      }

      firstTime = false;
      prevValue = newValue;
    });
  };

  ComputedValue.prototype.warnAboutUntrackedRead = function () {
    if ("development" === "production") return;

    if (this.requiresReaction === true) {
      fail("[mobx] Computed value " + this.name + " is read outside a reactive context");
    }

    if (this.isTracing !== TraceMode.NONE) {
      console.log("[mobx.trace] '" + this.name + "' is being read outside a reactive context. Doing a full recompute");
    }

    if (globalState.computedRequiresReaction) {
      console.warn("[mobx] Computed value " + this.name + " is being read outside a reactive context. Doing a full recompute");
    }
  };

  ComputedValue.prototype.toJSON = function () {
    return this.get();
  };

  ComputedValue.prototype.toString = function () {
    return this.name + "[" + this.derivation.toString() + "]";
  };

  ComputedValue.prototype.valueOf = function () {
    return toPrimitive(this.get());
  };

  ComputedValue.prototype[Symbol.toPrimitive] = function () {
    return this.valueOf();
  };

  return ComputedValue;
}();

var isComputedValue = createInstanceofPredicate("ComputedValue", ComputedValue);
/**
 * These values will persist if global state is reset
 */

var persistentKeys = ["mobxGuid", "spyListeners", "enforceActions", "computedRequiresReaction", "reactionRequiresObservable", "observableRequiresReaction", "allowStateReads", "disableErrorBoundaries", "runId", "UNCHANGED"];

var MobXGlobals =
/** @class */
function () {
  function MobXGlobals() {
    /**
     * MobXGlobals version.
     * MobX compatiblity with other versions loaded in memory as long as this version matches.
     * It indicates that the global state still stores similar information
     *
     * N.B: this version is unrelated to the package version of MobX, and is only the version of the
     * internal state storage of MobX, and can be the same across many different package versions
     */
    this.version = 5;
    /**
     * globally unique token to signal unchanged
     */

    this.UNCHANGED = {};
    /**
     * Currently running derivation
     */

    this.trackingDerivation = null;
    /**
     * Are we running a computation currently? (not a reaction)
     */

    this.computationDepth = 0;
    /**
     * Each time a derivation is tracked, it is assigned a unique run-id
     */

    this.runId = 0;
    /**
     * 'guid' for general purpose. Will be persisted amongst resets.
     */

    this.mobxGuid = 0;
    /**
     * Are we in a batch block? (and how many of them)
     */

    this.inBatch = 0;
    /**
     * Observables that don't have observers anymore, and are about to be
     * suspended, unless somebody else accesses it in the same batch
     *
     * @type {IObservable[]}
     */

    this.pendingUnobservations = [];
    /**
     * List of scheduled, not yet executed, reactions.
     */

    this.pendingReactions = [];
    /**
     * Are we currently processing reactions?
     */

    this.isRunningReactions = false;
    /**
     * Is it allowed to change observables at this point?
     * In general, MobX doesn't allow that when running computations and React.render.
     * To ensure that those functions stay pure.
     */

    this.allowStateChanges = true;
    /**
     * Is it allowed to read observables at this point?
     * Used to hold the state needed for `observableRequiresReaction`
     */

    this.allowStateReads = true;
    /**
     * If strict mode is enabled, state changes are by default not allowed
     */

    this.enforceActions = false;
    /**
     * Spy callbacks
     */

    this.spyListeners = [];
    /**
     * Globally attached error handlers that react specifically to errors in reactions
     */

    this.globalReactionErrorHandlers = [];
    /**
     * Warn if computed values are accessed outside a reactive context
     */

    this.computedRequiresReaction = false;
    /**
     * (Experimental)
     * Warn if you try to create to derivation / reactive context without accessing any observable.
     */

    this.reactionRequiresObservable = false;
    /**
     * (Experimental)
     * Warn if observables are accessed outside a reactive context
     */

    this.observableRequiresReaction = false;
    /**
     * Allows overwriting of computed properties, useful in tests but not prod as it can cause
     * memory leaks. See https://github.com/mobxjs/mobx/issues/1867
     */

    this.computedConfigurable = false;
    /*
     * Don't catch and rethrow exceptions. This is useful for inspecting the state of
     * the stack when an exception occurs while debugging.
     */

    this.disableErrorBoundaries = false;
    /*
     * If true, we are already handling an exception in an action. Any errors in reactions should be suppressed, as
     * they are not the cause, see: https://github.com/mobxjs/mobx/issues/1836
     */

    this.suppressReactionErrors = false;
  }

  return MobXGlobals;
}();

var mockGlobal = {};

function getGlobal() {
  if (typeof window !== "undefined") {
    return window;
  }

  if (typeof global !== "undefined") {
    return global;
  }

  if (typeof self !== "undefined") {
    return self;
  }

  return mockGlobal;
}

var canMergeGlobalState = true;
var isolateCalled = false;

var globalState = function () {
  var global = getGlobal();
  if (global.__mobxInstanceCount > 0 && !global.__mobxGlobals) canMergeGlobalState = false;
  if (global.__mobxGlobals && global.__mobxGlobals.version !== new MobXGlobals().version) canMergeGlobalState = false;

  if (!canMergeGlobalState) {
    setTimeout(function () {
      if (!isolateCalled) {
        fail("There are multiple, different versions of MobX active. Make sure MobX is loaded only once or use `configure({ isolateGlobalState: true })`");
      }
    }, 1);
    return new MobXGlobals();
  } else if (global.__mobxGlobals) {
    global.__mobxInstanceCount += 1;
    if (!global.__mobxGlobals.UNCHANGED) global.__mobxGlobals.UNCHANGED = {}; // make merge backward compatible

    return global.__mobxGlobals;
  } else {
    global.__mobxInstanceCount = 1;
    return global.__mobxGlobals = new MobXGlobals();
  }
}();

function isolateGlobalState() {
  if (globalState.pendingReactions.length || globalState.inBatch || globalState.isRunningReactions) fail("isolateGlobalState should be called before MobX is running any reactions");
  isolateCalled = true;

  if (canMergeGlobalState) {
    if (--getGlobal().__mobxInstanceCount === 0) getGlobal().__mobxGlobals = undefined;
    globalState = new MobXGlobals();
  }
}

function getGlobalState() {
  return globalState;
}
/**
 * For testing purposes only; this will break the internal state of existing observables,
 * but can be used to get back at a stable state after throwing errors
 */


function resetGlobalState() {
  var defaultGlobals = new MobXGlobals();

  for (var key in defaultGlobals) if (persistentKeys.indexOf(key) === -1) globalState[key] = defaultGlobals[key];

  globalState.allowStateChanges = !globalState.enforceActions;
}

function hasObservers(observable) {
  return observable.observers && observable.observers.size > 0;
}

function getObservers(observable) {
  return observable.observers;
} // function invariantObservers(observable: IObservable) {
//     const list = observable.observers
//     const map = observable.observersIndexes
//     const l = list.length
//     for (let i = 0; i < l; i++) {
//         const id = list[i].__mapid
//         if (i) {
//             invariant(map[id] === i, "INTERNAL ERROR maps derivation.__mapid to index in list") // for performance
//         } else {
//             invariant(!(id in map), "INTERNAL ERROR observer on index 0 shouldn't be held in map.") // for performance
//         }
//     }
//     invariant(
//         list.length === 0 || Object.keys(map).length === list.length - 1,
//         "INTERNAL ERROR there is no junk in map"
//     )
// }


function addObserver(observable, node) {
  // invariant(node.dependenciesState !== -1, "INTERNAL ERROR, can add only dependenciesState !== -1");
  // invariant(observable._observers.indexOf(node) === -1, "INTERNAL ERROR add already added node");
  // invariantObservers(observable);
  observable.observers.add(node);
  if (observable.lowestObserverState > node.dependenciesState) observable.lowestObserverState = node.dependenciesState; // invariantObservers(observable);
  // invariant(observable._observers.indexOf(node) !== -1, "INTERNAL ERROR didn't add node");
}

function removeObserver(observable, node) {
  // invariant(globalState.inBatch > 0, "INTERNAL ERROR, remove should be called only inside batch");
  // invariant(observable._observers.indexOf(node) !== -1, "INTERNAL ERROR remove already removed node");
  // invariantObservers(observable);
  observable.observers.delete(node);

  if (observable.observers.size === 0) {
    // deleting last observer
    queueForUnobservation(observable);
  } // invariantObservers(observable);
  // invariant(observable._observers.indexOf(node) === -1, "INTERNAL ERROR remove already removed node2");

}

function queueForUnobservation(observable) {
  if (observable.isPendingUnobservation === false) {
    // invariant(observable._observers.length === 0, "INTERNAL ERROR, should only queue for unobservation unobserved observables");
    observable.isPendingUnobservation = true;
    globalState.pendingUnobservations.push(observable);
  }
}
/**
 * Batch starts a transaction, at least for purposes of memoizing ComputedValues when nothing else does.
 * During a batch `onBecomeUnobserved` will be called at most once per observable.
 * Avoids unnecessary recalculations.
 */


function startBatch() {
  globalState.inBatch++;
}

function endBatch() {
  if (--globalState.inBatch === 0) {
    runReactions(); // the batch is actually about to finish, all unobserving should happen here.

    var list = globalState.pendingUnobservations;

    for (var i = 0; i < list.length; i++) {
      var observable = list[i];
      observable.isPendingUnobservation = false;

      if (observable.observers.size === 0) {
        if (observable.isBeingObserved) {
          // if this observable had reactive observers, trigger the hooks
          observable.isBeingObserved = false;
          observable.onBecomeUnobserved();
        }

        if (observable instanceof ComputedValue) {
          // computed values are automatically teared down when the last observer leaves
          // this process happens recursively, this computed might be the last observabe of another, etc..
          observable.suspend();
        }
      }
    }

    globalState.pendingUnobservations = [];
  }
}

function reportObserved(observable) {
  checkIfStateReadsAreAllowed(observable);
  var derivation = globalState.trackingDerivation;

  if (derivation !== null) {
    /**
     * Simple optimization, give each derivation run an unique id (runId)
     * Check if last time this observable was accessed the same runId is used
     * if this is the case, the relation is already known
     */
    if (derivation.runId !== observable.lastAccessedBy) {
      observable.lastAccessedBy = derivation.runId; // Tried storing newObserving, or observing, or both as Set, but performance didn't come close...

      derivation.newObserving[derivation.unboundDepsCount++] = observable;

      if (!observable.isBeingObserved) {
        observable.isBeingObserved = true;
        observable.onBecomeObserved();
      }
    }

    return true;
  } else if (observable.observers.size === 0 && globalState.inBatch > 0) {
    queueForUnobservation(observable);
  }

  return false;
} // function invariantLOS(observable: IObservable, msg: string) {
//     // it's expensive so better not run it in produciton. but temporarily helpful for testing
//     const min = getObservers(observable).reduce((a, b) => Math.min(a, b.dependenciesState), 2)
//     if (min >= observable.lowestObserverState) return // <- the only assumption about `lowestObserverState`
//     throw new Error(
//         "lowestObserverState is wrong for " +
//             msg +
//             " because " +
//             min +
//             " < " +
//             observable.lowestObserverState
//     )
// }

/**
 * NOTE: current propagation mechanism will in case of self reruning autoruns behave unexpectedly
 * It will propagate changes to observers from previous run
 * It's hard or maybe impossible (with reasonable perf) to get it right with current approach
 * Hopefully self reruning autoruns aren't a feature people should depend on
 * Also most basic use cases should be ok
 */
// Called by Atom when its value changes


function propagateChanged(observable) {
  // invariantLOS(observable, "changed start");
  if (observable.lowestObserverState === IDerivationState.STALE) return;
  observable.lowestObserverState = IDerivationState.STALE; // Ideally we use for..of here, but the downcompiled version is really slow...

  observable.observers.forEach(function (d) {
    if (d.dependenciesState === IDerivationState.UP_TO_DATE) {
      if (d.isTracing !== TraceMode.NONE) {
        logTraceInfo(d, observable);
      }

      d.onBecomeStale();
    }

    d.dependenciesState = IDerivationState.STALE;
  }); // invariantLOS(observable, "changed end");
} // Called by ComputedValue when it recalculate and its value changed


function propagateChangeConfirmed(observable) {
  // invariantLOS(observable, "confirmed start");
  if (observable.lowestObserverState === IDerivationState.STALE) return;
  observable.lowestObserverState = IDerivationState.STALE;
  observable.observers.forEach(function (d) {
    if (d.dependenciesState === IDerivationState.POSSIBLY_STALE) d.dependenciesState = IDerivationState.STALE;else if (d.dependenciesState === IDerivationState.UP_TO_DATE // this happens during computing of `d`, just keep lowestObserverState up to date.
    ) observable.lowestObserverState = IDerivationState.UP_TO_DATE;
  }); // invariantLOS(observable, "confirmed end");
} // Used by computed when its dependency changed, but we don't wan't to immediately recompute.


function propagateMaybeChanged(observable) {
  // invariantLOS(observable, "maybe start");
  if (observable.lowestObserverState !== IDerivationState.UP_TO_DATE) return;
  observable.lowestObserverState = IDerivationState.POSSIBLY_STALE;
  observable.observers.forEach(function (d) {
    if (d.dependenciesState === IDerivationState.UP_TO_DATE) {
      d.dependenciesState = IDerivationState.POSSIBLY_STALE;

      if (d.isTracing !== TraceMode.NONE) {
        logTraceInfo(d, observable);
      }

      d.onBecomeStale();
    }
  }); // invariantLOS(observable, "maybe end");
}

function logTraceInfo(derivation, observable) {
  console.log("[mobx.trace] '" + derivation.name + "' is invalidated due to a change in: '" + observable.name + "'");

  if (derivation.isTracing === TraceMode.BREAK) {
    var lines = [];
    printDepTree(getDependencyTree(derivation), lines, 1); // prettier-ignore

    new Function("debugger;\n/*\nTracing '" + derivation.name + "'\n\nYou are entering this break point because derivation '" + derivation.name + "' is being traced and '" + observable.name + "' is now forcing it to update.\nJust follow the stacktrace you should now see in the devtools to see precisely what piece of your code is causing this update\nThe stackframe you are looking for is at least ~6-8 stack-frames up.\n\n" + (derivation instanceof ComputedValue ? derivation.derivation.toString().replace(/[*]\//g, "/") : "") + "\n\nThe dependencies for this derivation are:\n\n" + lines.join("\n") + "\n*/\n    ")();
  }
}

function printDepTree(tree, lines, depth) {
  if (lines.length >= 1000) {
    lines.push("(and many more)");
    return;
  }

  lines.push("" + new Array(depth).join("\t") + tree.name); // MWE: not the fastest, but the easiest way :)

  if (tree.dependencies) tree.dependencies.forEach(function (child) {
    return printDepTree(child, lines, depth + 1);
  });
}

var Reaction =
/** @class */
function () {
  function Reaction(name, onInvalidate, errorHandler, requiresObservable) {
    if (name === void 0) {
      name = "Reaction@" + getNextId();
    }

    if (requiresObservable === void 0) {
      requiresObservable = false;
    }

    this.name = name;
    this.onInvalidate = onInvalidate;
    this.errorHandler = errorHandler;
    this.requiresObservable = requiresObservable;
    this.observing = []; // nodes we are looking at. Our value depends on these nodes

    this.newObserving = [];
    this.dependenciesState = IDerivationState.NOT_TRACKING;
    this.diffValue = 0;
    this.runId = 0;
    this.unboundDepsCount = 0;
    this.__mapid = "#" + getNextId();
    this.isDisposed = false;
    this._isScheduled = false;
    this._isTrackPending = false;
    this._isRunning = false;
    this.isTracing = TraceMode.NONE;
  }

  Reaction.prototype.onBecomeStale = function () {
    this.schedule();
  };

  Reaction.prototype.schedule = function () {
    if (!this._isScheduled) {
      this._isScheduled = true;
      globalState.pendingReactions.push(this);
      runReactions();
    }
  };

  Reaction.prototype.isScheduled = function () {
    return this._isScheduled;
  };
  /**
   * internal, use schedule() if you intend to kick off a reaction
   */


  Reaction.prototype.runReaction = function () {
    if (!this.isDisposed) {
      startBatch();
      this._isScheduled = false;

      if (shouldCompute(this)) {
        this._isTrackPending = true;

        try {
          this.onInvalidate();

          if (this._isTrackPending && isSpyEnabled() && "development" !== "production") {
            // onInvalidate didn't trigger track right away..
            spyReport({
              name: this.name,
              type: "scheduled-reaction"
            });
          }
        } catch (e) {
          this.reportExceptionInDerivation(e);
        }
      }

      endBatch();
    }
  };

  Reaction.prototype.track = function (fn) {
    if (this.isDisposed) {
      return; // console.warn("Reaction already disposed") // Note: Not a warning / error in mobx 4 either
    }

    startBatch();
    var notify = isSpyEnabled();
    var startTime;

    if (notify && "development" !== "production") {
      startTime = Date.now();
      spyReportStart({
        name: this.name,
        type: "reaction"
      });
    }

    this._isRunning = true;
    var result = trackDerivedFunction(this, fn, undefined);
    this._isRunning = false;
    this._isTrackPending = false;

    if (this.isDisposed) {
      // disposed during last run. Clean up everything that was bound after the dispose call.
      clearObserving(this);
    }

    if (isCaughtException(result)) this.reportExceptionInDerivation(result.cause);

    if (notify && "development" !== "production") {
      spyReportEnd({
        time: Date.now() - startTime
      });
    }

    endBatch();
  };

  Reaction.prototype.reportExceptionInDerivation = function (error) {
    var _this = this;

    if (this.errorHandler) {
      this.errorHandler(error, this);
      return;
    }

    if (globalState.disableErrorBoundaries) throw error;
    var message = "[mobx] Encountered an uncaught exception that was thrown by a reaction or observer component, in: '" + this + "'";

    if (globalState.suppressReactionErrors) {
      console.warn("[mobx] (error in reaction '" + this.name + "' suppressed, fix error of causing action below)"); // prettier-ignore
    } else {
      console.error(message, error);
      /** If debugging brought you here, please, read the above message :-). Tnx! */
    }

    if (isSpyEnabled()) {
      spyReport({
        type: "error",
        name: this.name,
        message: message,
        error: "" + error
      });
    }

    globalState.globalReactionErrorHandlers.forEach(function (f) {
      return f(error, _this);
    });
  };

  Reaction.prototype.dispose = function () {
    if (!this.isDisposed) {
      this.isDisposed = true;

      if (!this._isRunning) {
        // if disposed while running, clean up later. Maybe not optimal, but rare case
        startBatch();
        clearObserving(this);
        endBatch();
      }
    }
  };

  Reaction.prototype.getDisposer = function () {
    var r = this.dispose.bind(this);
    r[$mobx] = this;
    return r;
  };

  Reaction.prototype.toString = function () {
    return "Reaction[" + this.name + "]";
  };

  Reaction.prototype.trace = function (enterBreakPoint) {
    if (enterBreakPoint === void 0) {
      enterBreakPoint = false;
    }

    trace(this, enterBreakPoint);
  };

  return Reaction;
}();

exports.Reaction = Reaction;

function onReactionError(handler) {
  globalState.globalReactionErrorHandlers.push(handler);
  return function () {
    var idx = globalState.globalReactionErrorHandlers.indexOf(handler);
    if (idx >= 0) globalState.globalReactionErrorHandlers.splice(idx, 1);
  };
}
/**
 * Magic number alert!
 * Defines within how many times a reaction is allowed to re-trigger itself
 * until it is assumed that this is gonna be a never ending loop...
 */


var MAX_REACTION_ITERATIONS = 100;

var reactionScheduler = function (f) {
  return f();
};

function runReactions() {
  // Trampolining, if runReactions are already running, new reactions will be picked up
  if (globalState.inBatch > 0 || globalState.isRunningReactions) return;
  reactionScheduler(runReactionsHelper);
}

function runReactionsHelper() {
  globalState.isRunningReactions = true;
  var allReactions = globalState.pendingReactions;
  var iterations = 0; // While running reactions, new reactions might be triggered.
  // Hence we work with two variables and check whether
  // we converge to no remaining reactions after a while.

  while (allReactions.length > 0) {
    if (++iterations === MAX_REACTION_ITERATIONS) {
      console.error("Reaction doesn't converge to a stable state after " + MAX_REACTION_ITERATIONS + " iterations." + (" Probably there is a cycle in the reactive function: " + allReactions[0]));
      allReactions.splice(0); // clear reactions
    }

    var remainingReactions = allReactions.splice(0);

    for (var i = 0, l = remainingReactions.length; i < l; i++) remainingReactions[i].runReaction();
  }

  globalState.isRunningReactions = false;
}

var isReaction = createInstanceofPredicate("Reaction", Reaction);

function setReactionScheduler(fn) {
  var baseScheduler = reactionScheduler;

  reactionScheduler = function (f) {
    return fn(function () {
      return baseScheduler(f);
    });
  };
}

function isSpyEnabled() {
  return "development" !== "production" && !!globalState.spyListeners.length;
}

function spyReport(event) {
  if ("development" === "production") return; // dead code elimination can do the rest

  if (!globalState.spyListeners.length) return;
  var listeners = globalState.spyListeners;

  for (var i = 0, l = listeners.length; i < l; i++) listeners[i](event);
}

function spyReportStart(event) {
  if ("development" === "production") return;

  var change = __assign(__assign({}, event), {
    spyReportStart: true
  });

  spyReport(change);
}

var END_EVENT = {
  spyReportEnd: true
};

function spyReportEnd(change) {
  if ("development" === "production") return;
  if (change) spyReport(__assign(__assign({}, change), {
    spyReportEnd: true
  }));else spyReport(END_EVENT);
}

function spy(listener) {
  if ("development" === "production") {
    console.warn("[mobx.spy] Is a no-op in production builds");
    return function () {};
  } else {
    globalState.spyListeners.push(listener);
    return once(function () {
      globalState.spyListeners = globalState.spyListeners.filter(function (l) {
        return l !== listener;
      });
    });
  }
}

function dontReassignFields() {
  fail("development" !== "production" && "@action fields are not reassignable");
}

function namedActionDecorator(name) {
  return function (target, prop, descriptor) {
    if (descriptor) {
      if ("development" !== "production" && descriptor.get !== undefined) {
        return fail("@action cannot be used with getters");
      } // babel / typescript
      // @action method() { }


      if (descriptor.value) {
        // typescript
        return {
          value: createAction(name, descriptor.value),
          enumerable: false,
          configurable: true,
          writable: true // for typescript, this must be writable, otherwise it cannot inherit :/ (see inheritable actions test)

        };
      } // babel only: @action method = () => {}


      var initializer_1 = descriptor.initializer;
      return {
        enumerable: false,
        configurable: true,
        writable: true,
        initializer: function () {
          // N.B: we can't immediately invoke initializer; this would be wrong
          return createAction(name, initializer_1.call(this));
        }
      };
    } // bound instance methods


    return actionFieldDecorator(name).apply(this, arguments);
  };
}

function actionFieldDecorator(name) {
  // Simple property that writes on first invocation to the current instance
  return function (target, prop, descriptor) {
    Object.defineProperty(target, prop, {
      configurable: true,
      enumerable: false,
      get: function () {
        return undefined;
      },
      set: function (value) {
        addHiddenProp(this, prop, action(name, value));
      }
    });
  };
}

function boundActionDecorator(target, propertyName, descriptor, applyToInstance) {
  if (applyToInstance === true) {
    defineBoundAction(target, propertyName, descriptor.value);
    return null;
  }

  if (descriptor) {
    // if (descriptor.value)
    // Typescript / Babel: @action.bound method() { }
    // also: babel @action.bound method = () => {}
    return {
      configurable: true,
      enumerable: false,
      get: function () {
        defineBoundAction(this, propertyName, descriptor.value || descriptor.initializer.call(this));
        return this[propertyName];
      },
      set: dontReassignFields
    };
  } // field decorator Typescript @action.bound method = () => {}


  return {
    enumerable: false,
    configurable: true,
    set: function (v) {
      defineBoundAction(this, propertyName, v);
    },
    get: function () {
      return undefined;
    }
  };
}

var action = function action(arg1, arg2, arg3, arg4) {
  // action(fn() {})
  if (arguments.length === 1 && typeof arg1 === "function") return createAction(arg1.name || "<unnamed action>", arg1); // action("name", fn() {})

  if (arguments.length === 2 && typeof arg2 === "function") return createAction(arg1, arg2); // @action("name") fn() {}

  if (arguments.length === 1 && typeof arg1 === "string") return namedActionDecorator(arg1); // @action fn() {}

  if (arg4 === true) {
    // apply to instance immediately
    addHiddenProp(arg1, arg2, createAction(arg1.name || arg2, arg3.value, this));
  } else {
    return namedActionDecorator(arg2).apply(null, arguments);
  }
};

exports.action = action;
action.bound = boundActionDecorator;

function runInAction(arg1, arg2) {
  var actionName = typeof arg1 === "string" ? arg1 : arg1.name || "<unnamed action>";
  var fn = typeof arg1 === "function" ? arg1 : arg2;

  if ("development" !== "production") {
    invariant(typeof fn === "function" && fn.length === 0, "`runInAction` expects a function without arguments");
    if (typeof actionName !== "string" || !actionName) fail("actions should have valid names, got: '" + actionName + "'");
  }

  return executeAction(actionName, fn, this, undefined);
}

function isAction(thing) {
  return typeof thing === "function" && thing.isMobxAction === true;
}

function defineBoundAction(target, propertyName, fn) {
  addHiddenProp(target, propertyName, createAction(propertyName, fn.bind(target)));
}
/**
 * Creates a named reactive view and keeps it alive, so that the view is always
 * updated if one of the dependencies changes, even when the view is not further used by something else.
 * @param view The reactive view
 * @returns disposer function, which can be used to stop the view from being updated in the future.
 */


function autorun(view, opts) {
  if (opts === void 0) {
    opts = EMPTY_OBJECT;
  }

  if ("development" !== "production") {
    invariant(typeof view === "function", "Autorun expects a function as first argument");
    invariant(isAction(view) === false, "Autorun does not accept actions since actions are untrackable");
  }

  var name = opts && opts.name || view.name || "Autorun@" + getNextId();
  var runSync = !opts.scheduler && !opts.delay;
  var reaction;

  if (runSync) {
    // normal autorun
    reaction = new Reaction(name, function () {
      this.track(reactionRunner);
    }, opts.onError, opts.requiresObservable);
  } else {
    var scheduler_1 = createSchedulerFromOptions(opts); // debounced autorun

    var isScheduled_1 = false;
    reaction = new Reaction(name, function () {
      if (!isScheduled_1) {
        isScheduled_1 = true;
        scheduler_1(function () {
          isScheduled_1 = false;
          if (!reaction.isDisposed) reaction.track(reactionRunner);
        });
      }
    }, opts.onError, opts.requiresObservable);
  }

  function reactionRunner() {
    view(reaction);
  }

  reaction.schedule();
  return reaction.getDisposer();
}

var run = function (f) {
  return f();
};

function createSchedulerFromOptions(opts) {
  return opts.scheduler ? opts.scheduler : opts.delay ? function (f) {
    return setTimeout(f, opts.delay);
  } : run;
}

function reaction(expression, effect, opts) {
  if (opts === void 0) {
    opts = EMPTY_OBJECT;
  }

  if ("development" !== "production") {
    invariant(typeof expression === "function", "First argument to reaction should be a function");
    invariant(typeof opts === "object", "Third argument of reactions should be an object");
  }

  var name = opts.name || "Reaction@" + getNextId();
  var effectAction = action(name, opts.onError ? wrapErrorHandler(opts.onError, effect) : effect);
  var runSync = !opts.scheduler && !opts.delay;
  var scheduler = createSchedulerFromOptions(opts);
  var firstTime = true;
  var isScheduled = false;
  var value;
  var equals = opts.compareStructural ? comparer.structural : opts.equals || comparer.default;
  var r = new Reaction(name, function () {
    if (firstTime || runSync) {
      reactionRunner();
    } else if (!isScheduled) {
      isScheduled = true;
      scheduler(reactionRunner);
    }
  }, opts.onError, opts.requiresObservable);

  function reactionRunner() {
    isScheduled = false; // Q: move into reaction runner?

    if (r.isDisposed) return;
    var changed = false;
    r.track(function () {
      var nextValue = expression(r);
      changed = firstTime || !equals(value, nextValue);
      value = nextValue;
    });
    if (firstTime && opts.fireImmediately) effectAction(value, r);
    if (!firstTime && changed === true) effectAction(value, r);
    if (firstTime) firstTime = false;
  }

  r.schedule();
  return r.getDisposer();
}

function wrapErrorHandler(errorHandler, baseFn) {
  return function () {
    try {
      return baseFn.apply(this, arguments);
    } catch (e) {
      errorHandler.call(this, e);
    }
  };
}

function onBecomeObserved(thing, arg2, arg3) {
  return interceptHook("onBecomeObserved", thing, arg2, arg3);
}

function onBecomeUnobserved(thing, arg2, arg3) {
  return interceptHook("onBecomeUnobserved", thing, arg2, arg3);
}

function interceptHook(hook, thing, arg2, arg3) {
  var atom = typeof arg3 === "function" ? getAtom(thing, arg2) : getAtom(thing);
  var cb = typeof arg3 === "function" ? arg3 : arg2;
  var listenersKey = hook + "Listeners";

  if (atom[listenersKey]) {
    atom[listenersKey].add(cb);
  } else {
    atom[listenersKey] = new Set([cb]);
  }

  var orig = atom[hook];
  if (typeof orig !== "function") return fail("development" !== "production" && "Not an atom that can be (un)observed");
  return function () {
    var hookListeners = atom[listenersKey];

    if (hookListeners) {
      hookListeners.delete(cb);

      if (hookListeners.size === 0) {
        delete atom[listenersKey];
      }
    }
  };
}

function configure(options) {
  var enforceActions = options.enforceActions,
      computedRequiresReaction = options.computedRequiresReaction,
      computedConfigurable = options.computedConfigurable,
      disableErrorBoundaries = options.disableErrorBoundaries,
      reactionScheduler = options.reactionScheduler,
      reactionRequiresObservable = options.reactionRequiresObservable,
      observableRequiresReaction = options.observableRequiresReaction;

  if (options.isolateGlobalState === true) {
    isolateGlobalState();
  }

  if (enforceActions !== undefined) {
    if (typeof enforceActions === "boolean" || enforceActions === "strict") deprecated("Deprecated value for 'enforceActions', use 'false' => '\"never\"', 'true' => '\"observed\"', '\"strict\"' => \"'always'\" instead");
    var ea = void 0;

    switch (enforceActions) {
      case true:
      case "observed":
        ea = true;
        break;

      case false:
      case "never":
        ea = false;
        break;

      case "strict":
      case "always":
        ea = "strict";
        break;

      default:
        fail("Invalid value for 'enforceActions': '" + enforceActions + "', expected 'never', 'always' or 'observed'");
    }

    globalState.enforceActions = ea;
    globalState.allowStateChanges = ea === true || ea === "strict" ? false : true;
  }

  if (computedRequiresReaction !== undefined) {
    globalState.computedRequiresReaction = !!computedRequiresReaction;
  }

  if (reactionRequiresObservable !== undefined) {
    globalState.reactionRequiresObservable = !!reactionRequiresObservable;
  }

  if (observableRequiresReaction !== undefined) {
    globalState.observableRequiresReaction = !!observableRequiresReaction;
    globalState.allowStateReads = !globalState.observableRequiresReaction;
  }

  if (computedConfigurable !== undefined) {
    globalState.computedConfigurable = !!computedConfigurable;
  }

  if (disableErrorBoundaries !== undefined) {
    if (disableErrorBoundaries === true) console.warn("WARNING: Debug feature only. MobX will NOT recover from errors when `disableErrorBoundaries` is enabled.");
    globalState.disableErrorBoundaries = !!disableErrorBoundaries;
  }

  if (reactionScheduler) {
    setReactionScheduler(reactionScheduler);
  }
}

function decorate(thing, decorators) {
  "development" !== "production" && invariant(isPlainObject(decorators), "Decorators should be a key value map");
  var target = typeof thing === "function" ? thing.prototype : thing;

  var _loop_1 = function (prop) {
    var propertyDecorators = decorators[prop];

    if (!Array.isArray(propertyDecorators)) {
      propertyDecorators = [propertyDecorators];
    }

    "development" !== "production" && invariant(propertyDecorators.every(function (decorator) {
      return typeof decorator === "function";
    }), "Decorate: expected a decorator function or array of decorator functions for '" + prop + "'");
    var descriptor = Object.getOwnPropertyDescriptor(target, prop);
    var newDescriptor = propertyDecorators.reduce(function (accDescriptor, decorator) {
      return decorator(target, prop, accDescriptor);
    }, descriptor);
    if (newDescriptor) Object.defineProperty(target, prop, newDescriptor);
  };

  for (var prop in decorators) {
    _loop_1(prop);
  }

  return thing;
}

function extendObservable(target, properties, decorators, options) {
  if ("development" !== "production") {
    invariant(arguments.length >= 2 && arguments.length <= 4, "'extendObservable' expected 2-4 arguments");
    invariant(typeof target === "object", "'extendObservable' expects an object as first argument");
    invariant(!isObservableMap(target), "'extendObservable' should not be used on maps, use map.merge instead");
  }

  options = asCreateObservableOptions(options);
  var defaultDecorator = getDefaultDecoratorFromObjectOptions(options);
  initializeInstance(target); // Fixes #1740

  asObservableObject(target, options.name, defaultDecorator.enhancer); // make sure object is observable, even without initial props

  if (properties) extendObservableObjectWithProperties(target, properties, decorators, defaultDecorator);
  return target;
}

function getDefaultDecoratorFromObjectOptions(options) {
  return options.defaultDecorator || (options.deep === false ? refDecorator : deepDecorator);
}

function extendObservableObjectWithProperties(target, properties, decorators, defaultDecorator) {
  var e_1, _a, e_2, _b;

  if ("development" !== "production") {
    invariant(!isObservable(properties), "Extending an object with another observable (object) is not supported. Please construct an explicit propertymap, using `toJS` if need. See issue #540");

    if (decorators) {
      var keys = getPlainObjectKeys(decorators);

      try {
        for (var keys_1 = __values(keys), keys_1_1 = keys_1.next(); !keys_1_1.done; keys_1_1 = keys_1.next()) {
          var key = keys_1_1.value;
          if (!(key in properties)) fail("Trying to declare a decorator for unspecified property '" + stringifyKey(key) + "'");
        }
      } catch (e_1_1) {
        e_1 = {
          error: e_1_1
        };
      } finally {
        try {
          if (keys_1_1 && !keys_1_1.done && (_a = keys_1.return)) _a.call(keys_1);
        } finally {
          if (e_1) throw e_1.error;
        }
      }
    }
  }

  startBatch();

  try {
    var keys = getPlainObjectKeys(properties);

    try {
      for (var keys_2 = __values(keys), keys_2_1 = keys_2.next(); !keys_2_1.done; keys_2_1 = keys_2.next()) {
        var key = keys_2_1.value;
        var descriptor = Object.getOwnPropertyDescriptor(properties, key);

        if ("development" !== "production") {
          if (!isPlainObject(properties)) fail("'extendObservabe' only accepts plain objects as second argument");
          if (isComputed(descriptor.value)) fail("Passing a 'computed' as initial property value is no longer supported by extendObservable. Use a getter or decorator instead");
        }

        var decorator = decorators && key in decorators ? decorators[key] : descriptor.get ? computedDecorator : defaultDecorator;
        if ("development" !== "production" && typeof decorator !== "function") fail("Not a valid decorator for '" + stringifyKey(key) + "', got: " + decorator);
        var resultDescriptor = decorator(target, key, descriptor, true);
        if (resultDescriptor // otherwise, assume already applied, due to `applyToInstance`
        ) Object.defineProperty(target, key, resultDescriptor);
      }
    } catch (e_2_1) {
      e_2 = {
        error: e_2_1
      };
    } finally {
      try {
        if (keys_2_1 && !keys_2_1.done && (_b = keys_2.return)) _b.call(keys_2);
      } finally {
        if (e_2) throw e_2.error;
      }
    }
  } finally {
    endBatch();
  }
}

function getDependencyTree(thing, property) {
  return nodeToDependencyTree(getAtom(thing, property));
}

function nodeToDependencyTree(node) {
  var result = {
    name: node.name
  };
  if (node.observing && node.observing.length > 0) result.dependencies = unique(node.observing).map(nodeToDependencyTree);
  return result;
}

function getObserverTree(thing, property) {
  return nodeToObserverTree(getAtom(thing, property));
}

function nodeToObserverTree(node) {
  var result = {
    name: node.name
  };
  if (hasObservers(node)) result.observers = Array.from(getObservers(node)).map(nodeToObserverTree);
  return result;
}

var generatorId = 0;

function FlowCancellationError() {
  this.message = "FLOW_CANCELLED";
}

FlowCancellationError.prototype = Object.create(Error.prototype);

function isFlowCancellationError(error) {
  return error instanceof FlowCancellationError;
}

function flow(generator) {
  if (arguments.length !== 1) fail(!!"development" && "Flow expects 1 argument and cannot be used as decorator");
  var name = generator.name || "<unnamed flow>"; // Implementation based on https://github.com/tj/co/blob/master/index.js

  return function () {
    var ctx = this;
    var args = arguments;
    var runId = ++generatorId;
    var gen = action(name + " - runid: " + runId + " - init", generator).apply(ctx, args);
    var rejector;
    var pendingPromise = undefined;
    var promise = new Promise(function (resolve, reject) {
      var stepId = 0;
      rejector = reject;

      function onFulfilled(res) {
        pendingPromise = undefined;
        var ret;

        try {
          ret = action(name + " - runid: " + runId + " - yield " + stepId++, gen.next).call(gen, res);
        } catch (e) {
          return reject(e);
        }

        next(ret);
      }

      function onRejected(err) {
        pendingPromise = undefined;
        var ret;

        try {
          ret = action(name + " - runid: " + runId + " - yield " + stepId++, gen.throw).call(gen, err);
        } catch (e) {
          return reject(e);
        }

        next(ret);
      }

      function next(ret) {
        if (ret && typeof ret.then === "function") {
          // an async iterator
          ret.then(next, reject);
          return;
        }

        if (ret.done) return resolve(ret.value);
        pendingPromise = Promise.resolve(ret.value);
        return pendingPromise.then(onFulfilled, onRejected);
      }

      onFulfilled(undefined); // kick off the process
    });
    promise.cancel = action(name + " - runid: " + runId + " - cancel", function () {
      try {
        if (pendingPromise) cancelPromise(pendingPromise); // Finally block can return (or yield) stuff..

        var res = gen.return(undefined); // eat anything that promise would do, it's cancelled!

        var yieldedPromise = Promise.resolve(res.value);
        yieldedPromise.then(noop, noop);
        cancelPromise(yieldedPromise); // maybe it can be cancelled :)
        // reject our original promise

        rejector(new FlowCancellationError());
      } catch (e) {
        rejector(e); // there could be a throwing finally block
      }
    });
    return promise;
  };
}

function cancelPromise(promise) {
  if (typeof promise.cancel === "function") promise.cancel();
}

function interceptReads(thing, propOrHandler, handler) {
  var target;

  if (isObservableMap(thing) || isObservableArray(thing) || isObservableValue(thing)) {
    target = getAdministration(thing);
  } else if (isObservableObject(thing)) {
    if (typeof propOrHandler !== "string") return fail("development" !== "production" && "InterceptReads can only be used with a specific property, not with an object in general");
    target = getAdministration(thing, propOrHandler);
  } else {
    return fail("development" !== "production" && "Expected observable map, object or array as first array");
  }

  if (target.dehancer !== undefined) return fail("development" !== "production" && "An intercept reader was already established");
  target.dehancer = typeof propOrHandler === "function" ? propOrHandler : handler;
  return function () {
    target.dehancer = undefined;
  };
}

function intercept(thing, propOrHandler, handler) {
  if (typeof handler === "function") return interceptProperty(thing, propOrHandler, handler);else return interceptInterceptable(thing, propOrHandler);
}

function interceptInterceptable(thing, handler) {
  return getAdministration(thing).intercept(handler);
}

function interceptProperty(thing, property, handler) {
  return getAdministration(thing, property).intercept(handler);
}

function _isComputed(value, property) {
  if (value === null || value === undefined) return false;

  if (property !== undefined) {
    if (isObservableObject(value) === false) return false;
    if (!value[$mobx].values.has(property)) return false;
    var atom = getAtom(value, property);
    return isComputedValue(atom);
  }

  return isComputedValue(value);
}

function isComputed(value) {
  if (arguments.length > 1) return fail("development" !== "production" && "isComputed expects only 1 argument. Use isObservableProp to inspect the observability of a property");
  return _isComputed(value);
}

function isComputedProp(value, propName) {
  if (typeof propName !== "string") return fail("development" !== "production" && "isComputed expected a property name as second argument");
  return _isComputed(value, propName);
}

function _isObservable(value, property) {
  if (value === null || value === undefined) return false;

  if (property !== undefined) {
    if ("development" !== "production" && (isObservableMap(value) || isObservableArray(value))) return fail("isObservable(object, propertyName) is not supported for arrays and maps. Use map.has or array.length instead.");

    if (isObservableObject(value)) {
      return value[$mobx].values.has(property);
    }

    return false;
  } // For first check, see #701


  return isObservableObject(value) || !!value[$mobx] || isAtom(value) || isReaction(value) || isComputedValue(value);
}

function isObservable(value) {
  if (arguments.length !== 1) fail("development" !== "production" && "isObservable expects only 1 argument. Use isObservableProp to inspect the observability of a property");
  return _isObservable(value);
}

function isObservableProp(value, propName) {
  if (typeof propName !== "string") return fail("development" !== "production" && "expected a property name as second argument");
  return _isObservable(value, propName);
}

function keys(obj) {
  if (isObservableObject(obj)) {
    return obj[$mobx].getKeys();
  }

  if (isObservableMap(obj)) {
    return Array.from(obj.keys());
  }

  if (isObservableSet(obj)) {
    return Array.from(obj.keys());
  }

  if (isObservableArray(obj)) {
    return obj.map(function (_, index) {
      return index;
    });
  }

  return fail("development" !== "production" && "'keys()' can only be used on observable objects, arrays, sets and maps");
}

function values(obj) {
  if (isObservableObject(obj)) {
    return keys(obj).map(function (key) {
      return obj[key];
    });
  }

  if (isObservableMap(obj)) {
    return keys(obj).map(function (key) {
      return obj.get(key);
    });
  }

  if (isObservableSet(obj)) {
    return Array.from(obj.values());
  }

  if (isObservableArray(obj)) {
    return obj.slice();
  }

  return fail("development" !== "production" && "'values()' can only be used on observable objects, arrays, sets and maps");
}

function entries(obj) {
  if (isObservableObject(obj)) {
    return keys(obj).map(function (key) {
      return [key, obj[key]];
    });
  }

  if (isObservableMap(obj)) {
    return keys(obj).map(function (key) {
      return [key, obj.get(key)];
    });
  }

  if (isObservableSet(obj)) {
    return Array.from(obj.entries());
  }

  if (isObservableArray(obj)) {
    return obj.map(function (key, index) {
      return [index, key];
    });
  }

  return fail("development" !== "production" && "'entries()' can only be used on observable objects, arrays and maps");
}

function set(obj, key, value) {
  if (arguments.length === 2 && !isObservableSet(obj)) {
    startBatch();
    var values_1 = key;

    try {
      for (var key_1 in values_1) set(obj, key_1, values_1[key_1]);
    } finally {
      endBatch();
    }

    return;
  }

  if (isObservableObject(obj)) {
    var adm = obj[$mobx];
    var existingObservable = adm.values.get(key);

    if (existingObservable) {
      adm.write(key, value);
    } else {
      adm.addObservableProp(key, value, adm.defaultEnhancer);
    }
  } else if (isObservableMap(obj)) {
    obj.set(key, value);
  } else if (isObservableSet(obj)) {
    obj.add(key);
  } else if (isObservableArray(obj)) {
    if (typeof key !== "number") key = parseInt(key, 10);
    invariant(key >= 0, "Not a valid index: '" + key + "'");
    startBatch();
    if (key >= obj.length) obj.length = key + 1;
    obj[key] = value;
    endBatch();
  } else {
    return fail("development" !== "production" && "'set()' can only be used on observable objects, arrays and maps");
  }
}

function remove(obj, key) {
  if (isObservableObject(obj)) {
    obj[$mobx].remove(key);
  } else if (isObservableMap(obj)) {
    obj.delete(key);
  } else if (isObservableSet(obj)) {
    obj.delete(key);
  } else if (isObservableArray(obj)) {
    if (typeof key !== "number") key = parseInt(key, 10);
    invariant(key >= 0, "Not a valid index: '" + key + "'");
    obj.splice(key, 1);
  } else {
    return fail("development" !== "production" && "'remove()' can only be used on observable objects, arrays and maps");
  }
}

function has(obj, key) {
  if (isObservableObject(obj)) {
    // return keys(obj).indexOf(key) >= 0
    var adm = getAdministration(obj);
    return adm.has(key);
  } else if (isObservableMap(obj)) {
    return obj.has(key);
  } else if (isObservableSet(obj)) {
    return obj.has(key);
  } else if (isObservableArray(obj)) {
    return key >= 0 && key < obj.length;
  } else {
    return fail("development" !== "production" && "'has()' can only be used on observable objects, arrays and maps");
  }
}

function get(obj, key) {
  if (!has(obj, key)) return undefined;

  if (isObservableObject(obj)) {
    return obj[key];
  } else if (isObservableMap(obj)) {
    return obj.get(key);
  } else if (isObservableArray(obj)) {
    return obj[key];
  } else {
    return fail("development" !== "production" && "'get()' can only be used on observable objects, arrays and maps");
  }
}

function observe(thing, propOrCb, cbOrFire, fireImmediately) {
  if (typeof cbOrFire === "function") return observeObservableProperty(thing, propOrCb, cbOrFire, fireImmediately);else return observeObservable(thing, propOrCb, cbOrFire);
}

function observeObservable(thing, listener, fireImmediately) {
  return getAdministration(thing).observe(listener, fireImmediately);
}

function observeObservableProperty(thing, property, listener, fireImmediately) {
  return getAdministration(thing, property).observe(listener, fireImmediately);
}

var defaultOptions = {
  detectCycles: true,
  exportMapsAsObjects: true,
  recurseEverything: false
};

function cache(map, key, value, options) {
  if (options.detectCycles) map.set(key, value);
  return value;
}

function toJSHelper(source, options, __alreadySeen) {
  if (!options.recurseEverything && !isObservable(source)) return source;
  if (typeof source !== "object") return source; // Directly return null if source is null

  if (source === null) return null; // Directly return the Date object itself if contained in the observable

  if (source instanceof Date) return source;
  if (isObservableValue(source)) return toJSHelper(source.get(), options, __alreadySeen); // make sure we track the keys of the object

  if (isObservable(source)) keys(source);
  var detectCycles = options.detectCycles === true;

  if (detectCycles && source !== null && __alreadySeen.has(source)) {
    return __alreadySeen.get(source);
  }

  if (isObservableArray(source) || Array.isArray(source)) {
    var res_1 = cache(__alreadySeen, source, [], options);
    var toAdd = source.map(function (value) {
      return toJSHelper(value, options, __alreadySeen);
    });
    res_1.length = toAdd.length;

    for (var i = 0, l = toAdd.length; i < l; i++) res_1[i] = toAdd[i];

    return res_1;
  }

  if (isObservableSet(source) || Object.getPrototypeOf(source) === Set.prototype) {
    if (options.exportMapsAsObjects === false) {
      var res_2 = cache(__alreadySeen, source, new Set(), options);
      source.forEach(function (value) {
        res_2.add(toJSHelper(value, options, __alreadySeen));
      });
      return res_2;
    } else {
      var res_3 = cache(__alreadySeen, source, [], options);
      source.forEach(function (value) {
        res_3.push(toJSHelper(value, options, __alreadySeen));
      });
      return res_3;
    }
  }

  if (isObservableMap(source) || Object.getPrototypeOf(source) === Map.prototype) {
    if (options.exportMapsAsObjects === false) {
      var res_4 = cache(__alreadySeen, source, new Map(), options);
      source.forEach(function (value, key) {
        res_4.set(key, toJSHelper(value, options, __alreadySeen));
      });
      return res_4;
    } else {
      var res_5 = cache(__alreadySeen, source, {}, options);
      source.forEach(function (value, key) {
        res_5[key] = toJSHelper(value, options, __alreadySeen);
      });
      return res_5;
    }
  } // Fallback to the situation that source is an ObservableObject or a plain object


  var res = cache(__alreadySeen, source, {}, options);
  getPlainObjectKeys(source).forEach(function (key) {
    res[key] = toJSHelper(source[key], options, __alreadySeen);
  });
  return res;
}

function toJS(source, options) {
  // backward compatibility
  if (typeof options === "boolean") options = {
    detectCycles: options
  };
  if (!options) options = defaultOptions;
  options.detectCycles = options.detectCycles === undefined ? options.recurseEverything === true : options.detectCycles === true;

  var __alreadySeen;

  if (options.detectCycles) __alreadySeen = new Map();
  return toJSHelper(source, options, __alreadySeen);
}

function trace() {
  var args = [];

  for (var _i = 0; _i < arguments.length; _i++) {
    args[_i] = arguments[_i];
  }

  var enterBreakPoint = false;
  if (typeof args[args.length - 1] === "boolean") enterBreakPoint = args.pop();
  var derivation = getAtomFromArgs(args);

  if (!derivation) {
    return fail("development" !== "production" && "'trace(break?)' can only be used inside a tracked computed value or a Reaction. Consider passing in the computed value or reaction explicitly");
  }

  if (derivation.isTracing === TraceMode.NONE) {
    console.log("[mobx.trace] '" + derivation.name + "' tracing enabled");
  }

  derivation.isTracing = enterBreakPoint ? TraceMode.BREAK : TraceMode.LOG;
}

function getAtomFromArgs(args) {
  switch (args.length) {
    case 0:
      return globalState.trackingDerivation;

    case 1:
      return getAtom(args[0]);

    case 2:
      return getAtom(args[0], args[1]);
  }
}
/**
 * During a transaction no views are updated until the end of the transaction.
 * The transaction will be run synchronously nonetheless.
 *
 * @param action a function that updates some reactive state
 * @returns any value that was returned by the 'action' parameter.
 */


function transaction(action, thisArg) {
  if (thisArg === void 0) {
    thisArg = undefined;
  }

  startBatch();

  try {
    return action.apply(thisArg);
  } finally {
    endBatch();
  }
}

function when(predicate, arg1, arg2) {
  if (arguments.length === 1 || arg1 && typeof arg1 === "object") return whenPromise(predicate, arg1);
  return _when(predicate, arg1, arg2 || {});
}

function _when(predicate, effect, opts) {
  var timeoutHandle;

  if (typeof opts.timeout === "number") {
    timeoutHandle = setTimeout(function () {
      if (!disposer[$mobx].isDisposed) {
        disposer();
        var error = new Error("WHEN_TIMEOUT");
        if (opts.onError) opts.onError(error);else throw error;
      }
    }, opts.timeout);
  }

  opts.name = opts.name || "When@" + getNextId();
  var effectAction = createAction(opts.name + "-effect", effect);
  var disposer = autorun(function (r) {
    if (predicate()) {
      r.dispose();
      if (timeoutHandle) clearTimeout(timeoutHandle);
      effectAction();
    }
  }, opts);
  return disposer;
}

function whenPromise(predicate, opts) {
  if ("development" !== "production" && opts && opts.onError) return fail("the options 'onError' and 'promise' cannot be combined");
  var cancel;
  var res = new Promise(function (resolve, reject) {
    var disposer = _when(predicate, resolve, __assign(__assign({}, opts), {
      onError: reject
    }));

    cancel = function () {
      disposer();
      reject("WHEN_CANCELLED");
    };
  });
  res.cancel = cancel;
  return res;
}

function getAdm(target) {
  return target[$mobx];
}

function isPropertyKey(val) {
  return typeof val === "string" || typeof val === "number" || typeof val === "symbol";
} // Optimization: we don't need the intermediate objects and could have a completely custom administration for DynamicObjects,
// and skip either the internal values map, or the base object with its property descriptors!


var objectProxyTraps = {
  has: function (target, name) {
    if (name === $mobx || name === "constructor" || name === mobxDidRunLazyInitializersSymbol) return true;
    var adm = getAdm(target); // MWE: should `in` operator be reactive? If not, below code path will be faster / more memory efficient
    // TODO: check performance stats!
    // if (adm.values.get(name as string)) return true

    if (isPropertyKey(name)) return adm.has(name);
    return name in target;
  },
  get: function (target, name) {
    if (name === $mobx || name === "constructor" || name === mobxDidRunLazyInitializersSymbol) return target[name];
    var adm = getAdm(target);
    var observable = adm.values.get(name);

    if (observable instanceof Atom) {
      var result = observable.get();

      if (result === undefined) {
        // This fixes #1796, because deleting a prop that has an
        // undefined value won't retrigger a observer (no visible effect),
        // the autorun wouldn't subscribe to future key changes (see also next comment)
        adm.has(name);
      }

      return result;
    } // make sure we start listening to future keys
    // note that we only do this here for optimization


    if (isPropertyKey(name)) adm.has(name);
    return target[name];
  },
  set: function (target, name, value) {
    if (!isPropertyKey(name)) return false;
    set(target, name, value);
    return true;
  },
  deleteProperty: function (target, name) {
    if (!isPropertyKey(name)) return false;
    var adm = getAdm(target);
    adm.remove(name);
    return true;
  },
  ownKeys: function (target) {
    var adm = getAdm(target);
    adm.keysAtom.reportObserved();
    return Reflect.ownKeys(target);
  },
  preventExtensions: function (target) {
    fail("Dynamic observable objects cannot be frozen");
    return false;
  }
};

function createDynamicObservableObject(base) {
  var proxy = new Proxy(base, objectProxyTraps);
  base[$mobx].proxy = proxy;
  return proxy;
}

function hasInterceptors(interceptable) {
  return interceptable.interceptors !== undefined && interceptable.interceptors.length > 0;
}

function registerInterceptor(interceptable, handler) {
  var interceptors = interceptable.interceptors || (interceptable.interceptors = []);
  interceptors.push(handler);
  return once(function () {
    var idx = interceptors.indexOf(handler);
    if (idx !== -1) interceptors.splice(idx, 1);
  });
}

function interceptChange(interceptable, change) {
  var prevU = untrackedStart();

  try {
    // Interceptor can modify the array, copy it to avoid concurrent modification, see #1950
    var interceptors = __spread(interceptable.interceptors || []);

    for (var i = 0, l = interceptors.length; i < l; i++) {
      change = interceptors[i](change);
      invariant(!change || change.type, "Intercept handlers should return nothing or a change object");
      if (!change) break;
    }

    return change;
  } finally {
    untrackedEnd(prevU);
  }
}

function hasListeners(listenable) {
  return listenable.changeListeners !== undefined && listenable.changeListeners.length > 0;
}

function registerListener(listenable, handler) {
  var listeners = listenable.changeListeners || (listenable.changeListeners = []);
  listeners.push(handler);
  return once(function () {
    var idx = listeners.indexOf(handler);
    if (idx !== -1) listeners.splice(idx, 1);
  });
}

function notifyListeners(listenable, change) {
  var prevU = untrackedStart();
  var listeners = listenable.changeListeners;
  if (!listeners) return;
  listeners = listeners.slice();

  for (var i = 0, l = listeners.length; i < l; i++) {
    listeners[i](change);
  }

  untrackedEnd(prevU);
}

var MAX_SPLICE_SIZE = 10000; // See e.g. https://github.com/mobxjs/mobx/issues/859

var arrayTraps = {
  get: function (target, name) {
    if (name === $mobx) return target[$mobx];
    if (name === "length") return target[$mobx].getArrayLength();

    if (typeof name === "number") {
      return arrayExtensions.get.call(target, name);
    }

    if (typeof name === "string" && !isNaN(name)) {
      return arrayExtensions.get.call(target, parseInt(name));
    }

    if (arrayExtensions.hasOwnProperty(name)) {
      return arrayExtensions[name];
    }

    return target[name];
  },
  set: function (target, name, value) {
    if (name === "length") {
      target[$mobx].setArrayLength(value);
    }

    if (typeof name === "number") {
      arrayExtensions.set.call(target, name, value);
    }

    if (typeof name === "symbol" || isNaN(name)) {
      target[name] = value;
    } else {
      // numeric string
      arrayExtensions.set.call(target, parseInt(name), value);
    }

    return true;
  },
  preventExtensions: function (target) {
    fail("Observable arrays cannot be frozen");
    return false;
  }
};

function createObservableArray(initialValues, enhancer, name, owned) {
  if (name === void 0) {
    name = "ObservableArray@" + getNextId();
  }

  if (owned === void 0) {
    owned = false;
  }

  var adm = new ObservableArrayAdministration(name, enhancer, owned);
  addHiddenFinalProp(adm.values, $mobx, adm);
  var proxy = new Proxy(adm.values, arrayTraps);
  adm.proxy = proxy;

  if (initialValues && initialValues.length) {
    var prev = allowStateChangesStart(true);
    adm.spliceWithArray(0, 0, initialValues);
    allowStateChangesEnd(prev);
  }

  return proxy;
}

var ObservableArrayAdministration =
/** @class */
function () {
  function ObservableArrayAdministration(name, enhancer, owned) {
    this.owned = owned;
    this.values = [];
    this.proxy = undefined;
    this.lastKnownLength = 0;
    this.atom = new Atom(name || "ObservableArray@" + getNextId());

    this.enhancer = function (newV, oldV) {
      return enhancer(newV, oldV, name + "[..]");
    };
  }

  ObservableArrayAdministration.prototype.dehanceValue = function (value) {
    if (this.dehancer !== undefined) return this.dehancer(value);
    return value;
  };

  ObservableArrayAdministration.prototype.dehanceValues = function (values) {
    if (this.dehancer !== undefined && values.length > 0) return values.map(this.dehancer);
    return values;
  };

  ObservableArrayAdministration.prototype.intercept = function (handler) {
    return registerInterceptor(this, handler);
  };

  ObservableArrayAdministration.prototype.observe = function (listener, fireImmediately) {
    if (fireImmediately === void 0) {
      fireImmediately = false;
    }

    if (fireImmediately) {
      listener({
        object: this.proxy,
        type: "splice",
        index: 0,
        added: this.values.slice(),
        addedCount: this.values.length,
        removed: [],
        removedCount: 0
      });
    }

    return registerListener(this, listener);
  };

  ObservableArrayAdministration.prototype.getArrayLength = function () {
    this.atom.reportObserved();
    return this.values.length;
  };

  ObservableArrayAdministration.prototype.setArrayLength = function (newLength) {
    if (typeof newLength !== "number" || newLength < 0) throw new Error("[mobx.array] Out of range: " + newLength);
    var currentLength = this.values.length;
    if (newLength === currentLength) return;else if (newLength > currentLength) {
      var newItems = new Array(newLength - currentLength);

      for (var i = 0; i < newLength - currentLength; i++) newItems[i] = undefined; // No Array.fill everywhere...


      this.spliceWithArray(currentLength, 0, newItems);
    } else this.spliceWithArray(newLength, currentLength - newLength);
  };

  ObservableArrayAdministration.prototype.updateArrayLength = function (oldLength, delta) {
    if (oldLength !== this.lastKnownLength) throw new Error("[mobx] Modification exception: the internal structure of an observable array was changed.");
    this.lastKnownLength += delta;
  };

  ObservableArrayAdministration.prototype.spliceWithArray = function (index, deleteCount, newItems) {
    var _this = this;

    checkIfStateModificationsAreAllowed(this.atom);
    var length = this.values.length;
    if (index === undefined) index = 0;else if (index > length) index = length;else if (index < 0) index = Math.max(0, length + index);
    if (arguments.length === 1) deleteCount = length - index;else if (deleteCount === undefined || deleteCount === null) deleteCount = 0;else deleteCount = Math.max(0, Math.min(deleteCount, length - index));
    if (newItems === undefined) newItems = EMPTY_ARRAY;

    if (hasInterceptors(this)) {
      var change = interceptChange(this, {
        object: this.proxy,
        type: "splice",
        index: index,
        removedCount: deleteCount,
        added: newItems
      });
      if (!change) return EMPTY_ARRAY;
      deleteCount = change.removedCount;
      newItems = change.added;
    }

    newItems = newItems.length === 0 ? newItems : newItems.map(function (v) {
      return _this.enhancer(v, undefined);
    });

    if ("development" !== "production") {
      var lengthDelta = newItems.length - deleteCount;
      this.updateArrayLength(length, lengthDelta); // checks if internal array wasn't modified
    }

    var res = this.spliceItemsIntoValues(index, deleteCount, newItems);
    if (deleteCount !== 0 || newItems.length !== 0) this.notifyArraySplice(index, newItems, res);
    return this.dehanceValues(res);
  };

  ObservableArrayAdministration.prototype.spliceItemsIntoValues = function (index, deleteCount, newItems) {
    var _a;

    if (newItems.length < MAX_SPLICE_SIZE) {
      return (_a = this.values).splice.apply(_a, __spread([index, deleteCount], newItems));
    } else {
      var res = this.values.slice(index, index + deleteCount);
      this.values = this.values.slice(0, index).concat(newItems, this.values.slice(index + deleteCount));
      return res;
    }
  };

  ObservableArrayAdministration.prototype.notifyArrayChildUpdate = function (index, newValue, oldValue) {
    var notifySpy = !this.owned && isSpyEnabled();
    var notify = hasListeners(this);
    var change = notify || notifySpy ? {
      object: this.proxy,
      type: "update",
      index: index,
      newValue: newValue,
      oldValue: oldValue
    } : null; // The reason why this is on right hand side here (and not above), is this way the uglifier will drop it, but it won't
    // cause any runtime overhead in development mode without NODE_ENV set, unless spying is enabled

    if (notifySpy && "development" !== "production") spyReportStart(__assign(__assign({}, change), {
      name: this.atom.name
    }));
    this.atom.reportChanged();
    if (notify) notifyListeners(this, change);
    if (notifySpy && "development" !== "production") spyReportEnd();
  };

  ObservableArrayAdministration.prototype.notifyArraySplice = function (index, added, removed) {
    var notifySpy = !this.owned && isSpyEnabled();
    var notify = hasListeners(this);
    var change = notify || notifySpy ? {
      object: this.proxy,
      type: "splice",
      index: index,
      removed: removed,
      added: added,
      removedCount: removed.length,
      addedCount: added.length
    } : null;
    if (notifySpy && "development" !== "production") spyReportStart(__assign(__assign({}, change), {
      name: this.atom.name
    }));
    this.atom.reportChanged(); // conform: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/observe

    if (notify) notifyListeners(this, change);
    if (notifySpy && "development" !== "production") spyReportEnd();
  };

  return ObservableArrayAdministration;
}();

var arrayExtensions = {
  intercept: function (handler) {
    return this[$mobx].intercept(handler);
  },
  observe: function (listener, fireImmediately) {
    if (fireImmediately === void 0) {
      fireImmediately = false;
    }

    var adm = this[$mobx];
    return adm.observe(listener, fireImmediately);
  },
  clear: function () {
    return this.splice(0);
  },
  replace: function (newItems) {
    var adm = this[$mobx];
    return adm.spliceWithArray(0, adm.values.length, newItems);
  },

  /**
   * Converts this array back to a (shallow) javascript structure.
   * For a deep clone use mobx.toJS
   */
  toJS: function () {
    return this.slice();
  },
  toJSON: function () {
    // Used by JSON.stringify
    return this.toJS();
  },

  /*
   * functions that do alter the internal structure of the array, (based on lib.es6.d.ts)
   * since these functions alter the inner structure of the array, the have side effects.
   * Because the have side effects, they should not be used in computed function,
   * and for that reason the do not call dependencyState.notifyObserved
   */
  splice: function (index, deleteCount) {
    var newItems = [];

    for (var _i = 2; _i < arguments.length; _i++) {
      newItems[_i - 2] = arguments[_i];
    }

    var adm = this[$mobx];

    switch (arguments.length) {
      case 0:
        return [];

      case 1:
        return adm.spliceWithArray(index);

      case 2:
        return adm.spliceWithArray(index, deleteCount);
    }

    return adm.spliceWithArray(index, deleteCount, newItems);
  },
  spliceWithArray: function (index, deleteCount, newItems) {
    var adm = this[$mobx];
    return adm.spliceWithArray(index, deleteCount, newItems);
  },
  push: function () {
    var items = [];

    for (var _i = 0; _i < arguments.length; _i++) {
      items[_i] = arguments[_i];
    }

    var adm = this[$mobx];
    adm.spliceWithArray(adm.values.length, 0, items);
    return adm.values.length;
  },
  pop: function () {
    return this.splice(Math.max(this[$mobx].values.length - 1, 0), 1)[0];
  },
  shift: function () {
    return this.splice(0, 1)[0];
  },
  unshift: function () {
    var items = [];

    for (var _i = 0; _i < arguments.length; _i++) {
      items[_i] = arguments[_i];
    }

    var adm = this[$mobx];
    adm.spliceWithArray(0, 0, items);
    return adm.values.length;
  },
  reverse: function () {
    // reverse by default mutates in place before returning the result
    // which makes it both a 'derivation' and a 'mutation'.
    // so we deviate from the default and just make it an dervitation
    if ("development" !== "production") {
      console.warn("[mobx] `observableArray.reverse()` will not update the array in place. Use `observableArray.slice().reverse()` to suppress this warning and perform the operation on a copy, or `observableArray.replace(observableArray.slice().reverse())` to reverse & update in place");
    }

    var clone = this.slice();
    return clone.reverse.apply(clone, arguments);
  },
  sort: function (compareFn) {
    // sort by default mutates in place before returning the result
    // which goes against all good practices. Let's not change the array in place!
    if ("development" !== "production") {
      console.warn("[mobx] `observableArray.sort()` will not update the array in place. Use `observableArray.slice().sort()` to suppress this warning and perform the operation on a copy, or `observableArray.replace(observableArray.slice().sort())` to sort & update in place");
    }

    var clone = this.slice();
    return clone.sort.apply(clone, arguments);
  },
  remove: function (value) {
    var adm = this[$mobx];
    var idx = adm.dehanceValues(adm.values).indexOf(value);

    if (idx > -1) {
      this.splice(idx, 1);
      return true;
    }

    return false;
  },
  get: function (index) {
    var adm = this[$mobx];

    if (adm) {
      if (index < adm.values.length) {
        adm.atom.reportObserved();
        return adm.dehanceValue(adm.values[index]);
      }

      console.warn("[mobx.array] Attempt to read an array index (" + index + ") that is out of bounds (" + adm.values.length + "). Please check length first. Out of bound indices will not be tracked by MobX");
    }

    return undefined;
  },
  set: function (index, newValue) {
    var adm = this[$mobx];
    var values = adm.values;

    if (index < values.length) {
      // update at index in range
      checkIfStateModificationsAreAllowed(adm.atom);
      var oldValue = values[index];

      if (hasInterceptors(adm)) {
        var change = interceptChange(adm, {
          type: "update",
          object: adm.proxy,
          index: index,
          newValue: newValue
        });
        if (!change) return;
        newValue = change.newValue;
      }

      newValue = adm.enhancer(newValue, oldValue);
      var changed = newValue !== oldValue;

      if (changed) {
        values[index] = newValue;
        adm.notifyArrayChildUpdate(index, newValue, oldValue);
      }
    } else if (index === values.length) {
      // add a new item
      adm.spliceWithArray(index, 0, [newValue]);
    } else {
      // out of bounds
      throw new Error("[mobx.array] Index out of bounds, " + index + " is larger than " + values.length);
    }
  }
};
["concat", "every", "filter", "forEach", "indexOf", "join", "lastIndexOf", "map", "reduce", "reduceRight", "slice", "some", "toString", "toLocaleString"].forEach(function (funcName) {
  arrayExtensions[funcName] = function () {
    var adm = this[$mobx];
    adm.atom.reportObserved();
    var res = adm.dehanceValues(adm.values);
    return res[funcName].apply(res, arguments);
  };
});
var isObservableArrayAdministration = createInstanceofPredicate("ObservableArrayAdministration", ObservableArrayAdministration);

function isObservableArray(thing) {
  return isObject(thing) && isObservableArrayAdministration(thing[$mobx]);
}

var _a;

var ObservableMapMarker = {}; // just extend Map? See also https://gist.github.com/nestharus/13b4d74f2ef4a2f4357dbd3fc23c1e54
// But: https://github.com/mobxjs/mobx/issues/1556

var ObservableMap =
/** @class */
function () {
  function ObservableMap(initialData, enhancer, name) {
    if (enhancer === void 0) {
      enhancer = deepEnhancer;
    }

    if (name === void 0) {
      name = "ObservableMap@" + getNextId();
    }

    this.enhancer = enhancer;
    this.name = name;
    this[_a] = ObservableMapMarker;
    this._keysAtom = createAtom(this.name + ".keys()");
    this[Symbol.toStringTag] = "Map";

    if (typeof Map !== "function") {
      throw new Error("mobx.map requires Map polyfill for the current browser. Check babel-polyfill or core-js/es6/map.js");
    }

    this._data = new Map();
    this._hasMap = new Map();
    this.merge(initialData);
  }

  ObservableMap.prototype._has = function (key) {
    return this._data.has(key);
  };

  ObservableMap.prototype.has = function (key) {
    var _this = this;

    if (!globalState.trackingDerivation) return this._has(key);

    var entry = this._hasMap.get(key);

    if (!entry) {
      // todo: replace with atom (breaking change)
      var newEntry = entry = new ObservableValue(this._has(key), referenceEnhancer, this.name + "." + stringifyKey(key) + "?", false);

      this._hasMap.set(key, newEntry);

      onBecomeUnobserved(newEntry, function () {
        return _this._hasMap.delete(key);
      });
    }

    return entry.get();
  };

  ObservableMap.prototype.set = function (key, value) {
    var hasKey = this._has(key);

    if (hasInterceptors(this)) {
      var change = interceptChange(this, {
        type: hasKey ? "update" : "add",
        object: this,
        newValue: value,
        name: key
      });
      if (!change) return this;
      value = change.newValue;
    }

    if (hasKey) {
      this._updateValue(key, value);
    } else {
      this._addValue(key, value);
    }

    return this;
  };

  ObservableMap.prototype.delete = function (key) {
    var _this = this;

    if (hasInterceptors(this)) {
      var change = interceptChange(this, {
        type: "delete",
        object: this,
        name: key
      });
      if (!change) return false;
    }

    if (this._has(key)) {
      var notifySpy = isSpyEnabled();
      var notify = hasListeners(this);
      var change = notify || notifySpy ? {
        type: "delete",
        object: this,
        oldValue: this._data.get(key).value,
        name: key
      } : null;
      if (notifySpy && "development" !== "production") spyReportStart(__assign(__assign({}, change), {
        name: this.name,
        key: key
      }));
      transaction(function () {
        _this._keysAtom.reportChanged();

        _this._updateHasMapEntry(key, false);

        var observable = _this._data.get(key);

        observable.setNewValue(undefined);

        _this._data.delete(key);
      });
      if (notify) notifyListeners(this, change);
      if (notifySpy && "development" !== "production") spyReportEnd();
      return true;
    }

    return false;
  };

  ObservableMap.prototype._updateHasMapEntry = function (key, value) {
    var entry = this._hasMap.get(key);

    if (entry) {
      entry.setNewValue(value);
    }
  };

  ObservableMap.prototype._updateValue = function (key, newValue) {
    var observable = this._data.get(key);

    newValue = observable.prepareNewValue(newValue);

    if (newValue !== globalState.UNCHANGED) {
      var notifySpy = isSpyEnabled();
      var notify = hasListeners(this);
      var change = notify || notifySpy ? {
        type: "update",
        object: this,
        oldValue: observable.value,
        name: key,
        newValue: newValue
      } : null;
      if (notifySpy && "development" !== "production") spyReportStart(__assign(__assign({}, change), {
        name: this.name,
        key: key
      }));
      observable.setNewValue(newValue);
      if (notify) notifyListeners(this, change);
      if (notifySpy && "development" !== "production") spyReportEnd();
    }
  };

  ObservableMap.prototype._addValue = function (key, newValue) {
    var _this = this;

    checkIfStateModificationsAreAllowed(this._keysAtom);
    transaction(function () {
      var observable = new ObservableValue(newValue, _this.enhancer, _this.name + "." + stringifyKey(key), false);

      _this._data.set(key, observable);

      newValue = observable.value; // value might have been changed

      _this._updateHasMapEntry(key, true);

      _this._keysAtom.reportChanged();
    });
    var notifySpy = isSpyEnabled();
    var notify = hasListeners(this);
    var change = notify || notifySpy ? {
      type: "add",
      object: this,
      name: key,
      newValue: newValue
    } : null;
    if (notifySpy && "development" !== "production") spyReportStart(__assign(__assign({}, change), {
      name: this.name,
      key: key
    }));
    if (notify) notifyListeners(this, change);
    if (notifySpy && "development" !== "production") spyReportEnd();
  };

  ObservableMap.prototype.get = function (key) {
    if (this.has(key)) return this.dehanceValue(this._data.get(key).get());
    return this.dehanceValue(undefined);
  };

  ObservableMap.prototype.dehanceValue = function (value) {
    if (this.dehancer !== undefined) {
      return this.dehancer(value);
    }

    return value;
  };

  ObservableMap.prototype.keys = function () {
    this._keysAtom.reportObserved();

    return this._data.keys();
  };

  ObservableMap.prototype.values = function () {
    var self = this;
    var nextIndex = 0;
    var keys = Array.from(this.keys());
    return makeIterable({
      next: function () {
        return nextIndex < keys.length ? {
          value: self.get(keys[nextIndex++]),
          done: false
        } : {
          done: true
        };
      }
    });
  };

  ObservableMap.prototype.entries = function () {
    var self = this;
    var nextIndex = 0;
    var keys = Array.from(this.keys());
    return makeIterable({
      next: function () {
        if (nextIndex < keys.length) {
          var key = keys[nextIndex++];
          return {
            value: [key, self.get(key)],
            done: false
          };
        }

        return {
          done: true
        };
      }
    });
  };

  ObservableMap.prototype[(_a = $mobx, Symbol.iterator)] = function () {
    return this.entries();
  };

  ObservableMap.prototype.forEach = function (callback, thisArg) {
    var e_1, _b;

    try {
      for (var _c = __values(this), _d = _c.next(); !_d.done; _d = _c.next()) {
        var _e = __read(_d.value, 2),
            key = _e[0],
            value = _e[1];

        callback.call(thisArg, value, key, this);
      }
    } catch (e_1_1) {
      e_1 = {
        error: e_1_1
      };
    } finally {
      try {
        if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
      } finally {
        if (e_1) throw e_1.error;
      }
    }
  };
  /** Merge another object into this object, returns this. */


  ObservableMap.prototype.merge = function (other) {
    var _this = this;

    if (isObservableMap(other)) {
      other = other.toJS();
    }

    transaction(function () {
      if (isPlainObject(other)) getPlainObjectKeys(other).forEach(function (key) {
        return _this.set(key, other[key]);
      });else if (Array.isArray(other)) other.forEach(function (_b) {
        var _c = __read(_b, 2),
            key = _c[0],
            value = _c[1];

        return _this.set(key, value);
      });else if (isES6Map(other)) {
        if (other.constructor !== Map) fail("Cannot initialize from classes that inherit from Map: " + other.constructor.name); // prettier-ignore

        other.forEach(function (value, key) {
          return _this.set(key, value);
        });
      } else if (other !== null && other !== undefined) fail("Cannot initialize map from " + other);
    });
    return this;
  };

  ObservableMap.prototype.clear = function () {
    var _this = this;

    transaction(function () {
      untracked(function () {
        var e_2, _b;

        try {
          for (var _c = __values(_this.keys()), _d = _c.next(); !_d.done; _d = _c.next()) {
            var key = _d.value;

            _this.delete(key);
          }
        } catch (e_2_1) {
          e_2 = {
            error: e_2_1
          };
        } finally {
          try {
            if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
          } finally {
            if (e_2) throw e_2.error;
          }
        }
      });
    });
  };

  ObservableMap.prototype.replace = function (values) {
    var _this = this;

    transaction(function () {
      // grab all the keys that are present in the new map but not present in the current map
      // and delete them from the map, then merge the new map
      // this will cause reactions only on changed values
      var newKeys = getMapLikeKeys(values);
      var oldKeys = Array.from(_this.keys());
      var missingKeys = oldKeys.filter(function (k) {
        return newKeys.indexOf(k) === -1;
      });
      missingKeys.forEach(function (k) {
        return _this.delete(k);
      });

      _this.merge(values);
    });
    return this;
  };

  Object.defineProperty(ObservableMap.prototype, "size", {
    get: function () {
      this._keysAtom.reportObserved();

      return this._data.size;
    },
    enumerable: true,
    configurable: true
  });
  /**
   * Returns a plain object that represents this map.
   * Note that all the keys being stringified.
   * If there are duplicating keys after converting them to strings, behaviour is undetermined.
   */

  ObservableMap.prototype.toPOJO = function () {
    var e_3, _b;

    var res = {};

    try {
      for (var _c = __values(this), _d = _c.next(); !_d.done; _d = _c.next()) {
        var _e = __read(_d.value, 2),
            key = _e[0],
            value = _e[1]; // We lie about symbol key types due to https://github.com/Microsoft/TypeScript/issues/1863


        res[typeof key === "symbol" ? key : stringifyKey(key)] = value;
      }
    } catch (e_3_1) {
      e_3 = {
        error: e_3_1
      };
    } finally {
      try {
        if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
      } finally {
        if (e_3) throw e_3.error;
      }
    }

    return res;
  };
  /**
   * Returns a shallow non observable object clone of this map.
   * Note that the values migth still be observable. For a deep clone use mobx.toJS.
   */


  ObservableMap.prototype.toJS = function () {
    return new Map(this);
  };

  ObservableMap.prototype.toJSON = function () {
    // Used by JSON.stringify
    return this.toPOJO();
  };

  ObservableMap.prototype.toString = function () {
    var _this = this;

    return this.name + "[{ " + Array.from(this.keys()).map(function (key) {
      return stringifyKey(key) + ": " + ("" + _this.get(key));
    }).join(", ") + " }]";
  };
  /**
   * Observes this object. Triggers for the events 'add', 'update' and 'delete'.
   * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/observe
   * for callback details
   */


  ObservableMap.prototype.observe = function (listener, fireImmediately) {
    "development" !== "production" && invariant(fireImmediately !== true, "`observe` doesn't support fireImmediately=true in combination with maps.");
    return registerListener(this, listener);
  };

  ObservableMap.prototype.intercept = function (handler) {
    return registerInterceptor(this, handler);
  };

  return ObservableMap;
}();
/* 'var' fixes small-build issue */


exports.ObservableMap = ObservableMap;
var isObservableMap = createInstanceofPredicate("ObservableMap", ObservableMap);
exports.isObservableMap = isObservableMap;

var _a$1;

var ObservableSetMarker = {};

var ObservableSet =
/** @class */
function () {
  function ObservableSet(initialData, enhancer, name) {
    if (enhancer === void 0) {
      enhancer = deepEnhancer;
    }

    if (name === void 0) {
      name = "ObservableSet@" + getNextId();
    }

    this.name = name;
    this[_a$1] = ObservableSetMarker;
    this._data = new Set();
    this._atom = createAtom(this.name);
    this[Symbol.toStringTag] = "Set";

    if (typeof Set !== "function") {
      throw new Error("mobx.set requires Set polyfill for the current browser. Check babel-polyfill or core-js/es6/set.js");
    }

    this.enhancer = function (newV, oldV) {
      return enhancer(newV, oldV, name);
    };

    if (initialData) {
      this.replace(initialData);
    }
  }

  ObservableSet.prototype.dehanceValue = function (value) {
    if (this.dehancer !== undefined) {
      return this.dehancer(value);
    }

    return value;
  };

  ObservableSet.prototype.clear = function () {
    var _this = this;

    transaction(function () {
      untracked(function () {
        var e_1, _b;

        try {
          for (var _c = __values(_this._data.values()), _d = _c.next(); !_d.done; _d = _c.next()) {
            var value = _d.value;

            _this.delete(value);
          }
        } catch (e_1_1) {
          e_1 = {
            error: e_1_1
          };
        } finally {
          try {
            if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
          } finally {
            if (e_1) throw e_1.error;
          }
        }
      });
    });
  };

  ObservableSet.prototype.forEach = function (callbackFn, thisArg) {
    var e_2, _b;

    try {
      for (var _c = __values(this), _d = _c.next(); !_d.done; _d = _c.next()) {
        var value = _d.value;
        callbackFn.call(thisArg, value, value, this);
      }
    } catch (e_2_1) {
      e_2 = {
        error: e_2_1
      };
    } finally {
      try {
        if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
      } finally {
        if (e_2) throw e_2.error;
      }
    }
  };

  Object.defineProperty(ObservableSet.prototype, "size", {
    get: function () {
      this._atom.reportObserved();

      return this._data.size;
    },
    enumerable: true,
    configurable: true
  });

  ObservableSet.prototype.add = function (value) {
    var _this = this;

    checkIfStateModificationsAreAllowed(this._atom);

    if (hasInterceptors(this)) {
      var change = interceptChange(this, {
        type: "add",
        object: this,
        newValue: value
      });
      if (!change) return this; // TODO: ideally, value = change.value would be done here, so that values can be
      // changed by interceptor. Same applies for other Set and Map api's.
    }

    if (!this.has(value)) {
      transaction(function () {
        _this._data.add(_this.enhancer(value, undefined));

        _this._atom.reportChanged();
      });
      var notifySpy = isSpyEnabled();
      var notify = hasListeners(this);
      var change = notify || notifySpy ? {
        type: "add",
        object: this,
        newValue: value
      } : null;
      if (notifySpy && "development" !== "production") spyReportStart(change);
      if (notify) notifyListeners(this, change);
      if (notifySpy && "development" !== "production") spyReportEnd();
    }

    return this;
  };

  ObservableSet.prototype.delete = function (value) {
    var _this = this;

    if (hasInterceptors(this)) {
      var change = interceptChange(this, {
        type: "delete",
        object: this,
        oldValue: value
      });
      if (!change) return false;
    }

    if (this.has(value)) {
      var notifySpy = isSpyEnabled();
      var notify = hasListeners(this);
      var change = notify || notifySpy ? {
        type: "delete",
        object: this,
        oldValue: value
      } : null;
      if (notifySpy && "development" !== "production") spyReportStart(__assign(__assign({}, change), {
        name: this.name
      }));
      transaction(function () {
        _this._atom.reportChanged();

        _this._data.delete(value);
      });
      if (notify) notifyListeners(this, change);
      if (notifySpy && "development" !== "production") spyReportEnd();
      return true;
    }

    return false;
  };

  ObservableSet.prototype.has = function (value) {
    this._atom.reportObserved();

    return this._data.has(this.dehanceValue(value));
  };

  ObservableSet.prototype.entries = function () {
    var nextIndex = 0;
    var keys = Array.from(this.keys());
    var values = Array.from(this.values());
    return makeIterable({
      next: function () {
        var index = nextIndex;
        nextIndex += 1;
        return index < values.length ? {
          value: [keys[index], values[index]],
          done: false
        } : {
          done: true
        };
      }
    });
  };

  ObservableSet.prototype.keys = function () {
    return this.values();
  };

  ObservableSet.prototype.values = function () {
    this._atom.reportObserved();

    var self = this;
    var nextIndex = 0;
    var observableValues = Array.from(this._data.values());
    return makeIterable({
      next: function () {
        return nextIndex < observableValues.length ? {
          value: self.dehanceValue(observableValues[nextIndex++]),
          done: false
        } : {
          done: true
        };
      }
    });
  };

  ObservableSet.prototype.replace = function (other) {
    var _this = this;

    if (isObservableSet(other)) {
      other = other.toJS();
    }

    transaction(function () {
      if (Array.isArray(other)) {
        _this.clear();

        other.forEach(function (value) {
          return _this.add(value);
        });
      } else if (isES6Set(other)) {
        _this.clear();

        other.forEach(function (value) {
          return _this.add(value);
        });
      } else if (other !== null && other !== undefined) {
        fail("Cannot initialize set from " + other);
      }
    });
    return this;
  };

  ObservableSet.prototype.observe = function (listener, fireImmediately) {
    // TODO 'fireImmediately' can be true?
    "development" !== "production" && invariant(fireImmediately !== true, "`observe` doesn't support fireImmediately=true in combination with sets.");
    return registerListener(this, listener);
  };

  ObservableSet.prototype.intercept = function (handler) {
    return registerInterceptor(this, handler);
  };

  ObservableSet.prototype.toJS = function () {
    return new Set(this);
  };

  ObservableSet.prototype.toString = function () {
    return this.name + "[ " + Array.from(this).join(", ") + " ]";
  };

  ObservableSet.prototype[(_a$1 = $mobx, Symbol.iterator)] = function () {
    return this.values();
  };

  return ObservableSet;
}();

exports.ObservableSet = ObservableSet;
var isObservableSet = createInstanceofPredicate("ObservableSet", ObservableSet);
exports.isObservableSet = isObservableSet;

var ObservableObjectAdministration =
/** @class */
function () {
  function ObservableObjectAdministration(target, values, name, defaultEnhancer) {
    if (values === void 0) {
      values = new Map();
    }

    this.target = target;
    this.values = values;
    this.name = name;
    this.defaultEnhancer = defaultEnhancer;
    this.keysAtom = new Atom(name + ".keys");
  }

  ObservableObjectAdministration.prototype.read = function (key) {
    return this.values.get(key).get();
  };

  ObservableObjectAdministration.prototype.write = function (key, newValue) {
    var instance = this.target;
    var observable = this.values.get(key);

    if (observable instanceof ComputedValue) {
      observable.set(newValue);
      return;
    } // intercept


    if (hasInterceptors(this)) {
      var change = interceptChange(this, {
        type: "update",
        object: this.proxy || instance,
        name: key,
        newValue: newValue
      });
      if (!change) return;
      newValue = change.newValue;
    }

    newValue = observable.prepareNewValue(newValue); // notify spy & observers

    if (newValue !== globalState.UNCHANGED) {
      var notify = hasListeners(this);
      var notifySpy = isSpyEnabled();
      var change = notify || notifySpy ? {
        type: "update",
        object: this.proxy || instance,
        oldValue: observable.value,
        name: key,
        newValue: newValue
      } : null;
      if (notifySpy && "development" !== "production") spyReportStart(__assign(__assign({}, change), {
        name: this.name,
        key: key
      }));
      observable.setNewValue(newValue);
      if (notify) notifyListeners(this, change);
      if (notifySpy && "development" !== "production") spyReportEnd();
    }
  };

  ObservableObjectAdministration.prototype.has = function (key) {
    var map = this.pendingKeys || (this.pendingKeys = new Map());
    var entry = map.get(key);
    if (entry) return entry.get();else {
      var exists = !!this.values.get(key); // Possible optimization: Don't have a separate map for non existing keys,
      // but store them in the values map instead, using a special symbol to denote "not existing"

      entry = new ObservableValue(exists, referenceEnhancer, this.name + "." + stringifyKey(key) + "?", false);
      map.set(key, entry);
      return entry.get(); // read to subscribe
    }
  };

  ObservableObjectAdministration.prototype.addObservableProp = function (propName, newValue, enhancer) {
    if (enhancer === void 0) {
      enhancer = this.defaultEnhancer;
    }

    var target = this.target;
    assertPropertyConfigurable(target, propName);

    if (hasInterceptors(this)) {
      var change = interceptChange(this, {
        object: this.proxy || target,
        name: propName,
        type: "add",
        newValue: newValue
      });
      if (!change) return;
      newValue = change.newValue;
    }

    var observable = new ObservableValue(newValue, enhancer, this.name + "." + stringifyKey(propName), false);
    this.values.set(propName, observable);
    newValue = observable.value; // observableValue might have changed it

    Object.defineProperty(target, propName, generateObservablePropConfig(propName));
    this.notifyPropertyAddition(propName, newValue);
  };

  ObservableObjectAdministration.prototype.addComputedProp = function (propertyOwner, // where is the property declared?
  propName, options) {
    var target = this.target;
    options.name = options.name || this.name + "." + stringifyKey(propName);
    this.values.set(propName, new ComputedValue(options));
    if (propertyOwner === target || isPropertyConfigurable(propertyOwner, propName)) Object.defineProperty(propertyOwner, propName, generateComputedPropConfig(propName));
  };

  ObservableObjectAdministration.prototype.remove = function (key) {
    if (!this.values.has(key)) return;
    var target = this.target;

    if (hasInterceptors(this)) {
      var change = interceptChange(this, {
        object: this.proxy || target,
        name: key,
        type: "remove"
      });
      if (!change) return;
    }

    try {
      startBatch();
      var notify = hasListeners(this);
      var notifySpy = isSpyEnabled();
      var oldObservable = this.values.get(key);
      var oldValue = oldObservable && oldObservable.get();
      oldObservable && oldObservable.set(undefined); // notify key and keyset listeners

      this.keysAtom.reportChanged();
      this.values.delete(key);

      if (this.pendingKeys) {
        var entry = this.pendingKeys.get(key);
        if (entry) entry.set(false);
      } // delete the prop


      delete this.target[key];
      var change = notify || notifySpy ? {
        type: "remove",
        object: this.proxy || target,
        oldValue: oldValue,
        name: key
      } : null;
      if (notifySpy && "development" !== "production") spyReportStart(__assign(__assign({}, change), {
        name: this.name,
        key: key
      }));
      if (notify) notifyListeners(this, change);
      if (notifySpy && "development" !== "production") spyReportEnd();
    } finally {
      endBatch();
    }
  };

  ObservableObjectAdministration.prototype.illegalAccess = function (owner, propName) {
    /**
     * This happens if a property is accessed through the prototype chain, but the property was
     * declared directly as own property on the prototype.
     *
     * E.g.:
     * class A {
     * }
     * extendObservable(A.prototype, { x: 1 })
     *
     * classB extens A {
     * }
     * console.log(new B().x)
     *
     * It is unclear whether the property should be considered 'static' or inherited.
     * Either use `console.log(A.x)`
     * or: decorate(A, { x: observable })
     *
     * When using decorate, the property will always be redeclared as own property on the actual instance
     */
    console.warn("Property '" + propName + "' of '" + owner + "' was accessed through the prototype chain. Use 'decorate' instead to declare the prop or access it statically through it's owner");
  };
  /**
   * Observes this object. Triggers for the events 'add', 'update' and 'delete'.
   * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/observe
   * for callback details
   */


  ObservableObjectAdministration.prototype.observe = function (callback, fireImmediately) {
    "development" !== "production" && invariant(fireImmediately !== true, "`observe` doesn't support the fire immediately property for observable objects.");
    return registerListener(this, callback);
  };

  ObservableObjectAdministration.prototype.intercept = function (handler) {
    return registerInterceptor(this, handler);
  };

  ObservableObjectAdministration.prototype.notifyPropertyAddition = function (key, newValue) {
    var notify = hasListeners(this);
    var notifySpy = isSpyEnabled();
    var change = notify || notifySpy ? {
      type: "add",
      object: this.proxy || this.target,
      name: key,
      newValue: newValue
    } : null;
    if (notifySpy && "development" !== "production") spyReportStart(__assign(__assign({}, change), {
      name: this.name,
      key: key
    }));
    if (notify) notifyListeners(this, change);
    if (notifySpy && "development" !== "production") spyReportEnd();

    if (this.pendingKeys) {
      var entry = this.pendingKeys.get(key);
      if (entry) entry.set(true);
    }

    this.keysAtom.reportChanged();
  };

  ObservableObjectAdministration.prototype.getKeys = function () {
    var e_1, _a;

    this.keysAtom.reportObserved(); // return Reflect.ownKeys(this.values) as any

    var res = [];

    try {
      for (var _b = __values(this.values), _c = _b.next(); !_c.done; _c = _b.next()) {
        var _d = __read(_c.value, 2),
            key = _d[0],
            value = _d[1];

        if (value instanceof ObservableValue) res.push(key);
      }
    } catch (e_1_1) {
      e_1 = {
        error: e_1_1
      };
    } finally {
      try {
        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
      } finally {
        if (e_1) throw e_1.error;
      }
    }

    return res;
  };

  return ObservableObjectAdministration;
}();

function asObservableObject(target, name, defaultEnhancer) {
  if (name === void 0) {
    name = "";
  }

  if (defaultEnhancer === void 0) {
    defaultEnhancer = deepEnhancer;
  }

  if (Object.prototype.hasOwnProperty.call(target, $mobx)) return target[$mobx];
  "development" !== "production" && invariant(Object.isExtensible(target), "Cannot make the designated object observable; it is not extensible");
  if (!isPlainObject(target)) name = (target.constructor.name || "ObservableObject") + "@" + getNextId();
  if (!name) name = "ObservableObject@" + getNextId();
  var adm = new ObservableObjectAdministration(target, new Map(), stringifyKey(name), defaultEnhancer);
  addHiddenProp(target, $mobx, adm);
  return adm;
}

var observablePropertyConfigs = Object.create(null);
var computedPropertyConfigs = Object.create(null);

function generateObservablePropConfig(propName) {
  return observablePropertyConfigs[propName] || (observablePropertyConfigs[propName] = {
    configurable: true,
    enumerable: true,
    get: function () {
      return this[$mobx].read(propName);
    },
    set: function (v) {
      this[$mobx].write(propName, v);
    }
  });
}

function getAdministrationForComputedPropOwner(owner) {
  var adm = owner[$mobx];

  if (!adm) {
    // because computed props are declared on proty,
    // the current instance might not have been initialized yet
    initializeInstance(owner);
    return owner[$mobx];
  }

  return adm;
}

function generateComputedPropConfig(propName) {
  return computedPropertyConfigs[propName] || (computedPropertyConfigs[propName] = {
    configurable: globalState.computedConfigurable,
    enumerable: false,
    get: function () {
      return getAdministrationForComputedPropOwner(this).read(propName);
    },
    set: function (v) {
      getAdministrationForComputedPropOwner(this).write(propName, v);
    }
  });
}

var isObservableObjectAdministration = createInstanceofPredicate("ObservableObjectAdministration", ObservableObjectAdministration);

function isObservableObject(thing) {
  if (isObject(thing)) {
    // Initializers run lazily when transpiling to babel, so make sure they are run...
    initializeInstance(thing);
    return isObservableObjectAdministration(thing[$mobx]);
  }

  return false;
}

function getAtom(thing, property) {
  if (typeof thing === "object" && thing !== null) {
    if (isObservableArray(thing)) {
      if (property !== undefined) fail("development" !== "production" && "It is not possible to get index atoms from arrays");
      return thing[$mobx].atom;
    }

    if (isObservableSet(thing)) {
      return thing[$mobx];
    }

    if (isObservableMap(thing)) {
      var anyThing = thing;
      if (property === undefined) return anyThing._keysAtom;

      var observable = anyThing._data.get(property) || anyThing._hasMap.get(property);

      if (!observable) fail("development" !== "production" && "the entry '" + property + "' does not exist in the observable map '" + getDebugName(thing) + "'");
      return observable;
    } // Initializers run lazily when transpiling to babel, so make sure they are run...


    initializeInstance(thing);
    if (property && !thing[$mobx]) thing[property]; // See #1072

    if (isObservableObject(thing)) {
      if (!property) return fail("development" !== "production" && "please specify a property");
      var observable = thing[$mobx].values.get(property);
      if (!observable) fail("development" !== "production" && "no observable property '" + property + "' found on the observable object '" + getDebugName(thing) + "'");
      return observable;
    }

    if (isAtom(thing) || isComputedValue(thing) || isReaction(thing)) {
      return thing;
    }
  } else if (typeof thing === "function") {
    if (isReaction(thing[$mobx])) {
      // disposer function
      return thing[$mobx];
    }
  }

  return fail("development" !== "production" && "Cannot obtain atom from " + thing);
}

function getAdministration(thing, property) {
  if (!thing) fail("Expecting some object");
  if (property !== undefined) return getAdministration(getAtom(thing, property));
  if (isAtom(thing) || isComputedValue(thing) || isReaction(thing)) return thing;
  if (isObservableMap(thing) || isObservableSet(thing)) return thing; // Initializers run lazily when transpiling to babel, so make sure they are run...

  initializeInstance(thing);
  if (thing[$mobx]) return thing[$mobx];
  fail("development" !== "production" && "Cannot obtain administration from " + thing);
}

function getDebugName(thing, property) {
  var named;
  if (property !== undefined) named = getAtom(thing, property);else if (isObservableObject(thing) || isObservableMap(thing) || isObservableSet(thing)) named = getAdministration(thing);else named = getAtom(thing); // valid for arrays as well

  return named.name;
}

var toString = Object.prototype.toString;

function deepEqual(a, b, depth) {
  if (depth === void 0) {
    depth = -1;
  }

  return eq(a, b, depth);
} // Copied from https://github.com/jashkenas/underscore/blob/5c237a7c682fb68fd5378203f0bf22dce1624854/underscore.js#L1186-L1289
// Internal recursive comparison function for `isEqual`.


function eq(a, b, depth, aStack, bStack) {
  // Identical objects are equal. `0 === -0`, but they aren't identical.
  // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
  if (a === b) return a !== 0 || 1 / a === 1 / b; // `null` or `undefined` only equal to itself (strict comparison).

  if (a == null || b == null) return false; // `NaN`s are equivalent, but non-reflexive.

  if (a !== a) return b !== b; // Exhaust primitive checks

  var type = typeof a;
  if (type !== "function" && type !== "object" && typeof b != "object") return false; // Compare `[[Class]]` names.

  var className = toString.call(a);
  if (className !== toString.call(b)) return false;

  switch (className) {
    // Strings, numbers, regular expressions, dates, and booleans are compared by value.
    case "[object RegExp]": // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')

    case "[object String]":
      // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
      // equivalent to `new String("5")`.
      return "" + a === "" + b;

    case "[object Number]":
      // `NaN`s are equivalent, but non-reflexive.
      // Object(NaN) is equivalent to NaN.
      if (+a !== +a) return +b !== +b; // An `egal` comparison is performed for other numeric values.

      return +a === 0 ? 1 / +a === 1 / b : +a === +b;

    case "[object Date]":
    case "[object Boolean]":
      // Coerce dates and booleans to numeric primitive values. Dates are compared by their
      // millisecond representations. Note that invalid dates with millisecond representations
      // of `NaN` are not equivalent.
      return +a === +b;

    case "[object Symbol]":
      return typeof Symbol !== "undefined" && Symbol.valueOf.call(a) === Symbol.valueOf.call(b);

    case "[object Map]":
    case "[object Set]":
      // Maps and Sets are unwrapped to arrays of entry-pairs, adding an incidental level.
      // Hide this extra level by increasing the depth.
      if (depth >= 0) {
        depth++;
      }

      break;
  } // Unwrap any wrapped objects.


  a = unwrap(a);
  b = unwrap(b);
  var areArrays = className === "[object Array]";

  if (!areArrays) {
    if (typeof a != "object" || typeof b != "object") return false; // Objects with different constructors are not equivalent, but `Object`s or `Array`s
    // from different frames are.

    var aCtor = a.constructor,
        bCtor = b.constructor;

    if (aCtor !== bCtor && !(typeof aCtor === "function" && aCtor instanceof aCtor && typeof bCtor === "function" && bCtor instanceof bCtor) && "constructor" in a && "constructor" in b) {
      return false;
    }
  }

  if (depth === 0) {
    return false;
  } else if (depth < 0) {
    depth = -1;
  } // Assume equality for cyclic structures. The algorithm for detecting cyclic
  // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
  // Initializing stack of traversed objects.
  // It's done here since we only need them for objects and arrays comparison.


  aStack = aStack || [];
  bStack = bStack || [];
  var length = aStack.length;

  while (length--) {
    // Linear search. Performance is inversely proportional to the number of
    // unique nested structures.
    if (aStack[length] === a) return bStack[length] === b;
  } // Add the first object to the stack of traversed objects.


  aStack.push(a);
  bStack.push(b); // Recursively compare objects and arrays.

  if (areArrays) {
    // Compare array lengths to determine if a deep comparison is necessary.
    length = a.length;
    if (length !== b.length) return false; // Deep compare the contents, ignoring non-numeric properties.

    while (length--) {
      if (!eq(a[length], b[length], depth - 1, aStack, bStack)) return false;
    }
  } else {
    // Deep compare objects.
    var keys = Object.keys(a);
    var key = void 0;
    length = keys.length; // Ensure that both objects contain the same number of properties before comparing deep equality.

    if (Object.keys(b).length !== length) return false;

    while (length--) {
      // Deep compare each member
      key = keys[length];
      if (!(has$1(b, key) && eq(a[key], b[key], depth - 1, aStack, bStack))) return false;
    }
  } // Remove the first object from the stack of traversed objects.


  aStack.pop();
  bStack.pop();
  return true;
}

function unwrap(a) {
  if (isObservableArray(a)) return a.slice();
  if (isES6Map(a) || isObservableMap(a)) return Array.from(a.entries());
  if (isES6Set(a) || isObservableSet(a)) return Array.from(a.entries());
  return a;
}

function has$1(a, key) {
  return Object.prototype.hasOwnProperty.call(a, key);
}

function makeIterable(iterator) {
  iterator[Symbol.iterator] = getSelf;
  return iterator;
}

function getSelf() {
  return this;
}
/*
The only reason for this file to exist is pure horror:
Without it rollup can make the bundling fail at any point in time; when it rolls up the files in the wrong order
it will cause undefined errors (for example because super classes or local variables not being hoisted).
With this file that will still happen,
but at least in this file we can magically reorder the imports with trial and error until the build succeeds again.
*/

/**
 * (c) Michel Weststrate 2015 - 2018
 * MIT Licensed
 *
 * Welcome to the mobx sources! To get an global overview of how MobX internally works,
 * this is a good place to start:
 * https://medium.com/@mweststrate/becoming-fully-reactive-an-in-depth-explanation-of-mobservable-55995262a254#.xvbh6qd74
 *
 * Source folders:
 * ===============
 *
 * - api/     Most of the public static methods exposed by the module can be found here.
 * - core/    Implementation of the MobX algorithm; atoms, derivations, reactions, dependency trees, optimizations. Cool stuff can be found here.
 * - types/   All the magic that is need to have observable objects, arrays and values is in this folder. Including the modifiers like `asFlat`.
 * - utils/   Utility stuff.
 *
 */


if (typeof Proxy === "undefined" || typeof Symbol === "undefined") {
  throw new Error("[mobx] MobX 5+ requires Proxy and Symbol objects. If your environment doesn't support Symbol or Proxy objects, please downgrade to MobX 4. For React Native Android, consider upgrading JSCore.");
}

try {
  // define process.env if needed
  // if this is not a production build in the first place
  // (in which case the expression below would be substituted with 'production')
  "development";
} catch (e) {
  var g = getGlobal();
  if (typeof process === "undefined") g.process = {};
  g.process.env = {};
}

(function () {
  function testCodeMinification() {}

  if (testCodeMinification.name !== "testCodeMinification" && "development" !== "production" && typeof process !== 'undefined' && undefined !== "true") {
    // trick so it doesn't get replaced
    var varName = ["process", "env", "NODE_ENV"].join(".");
    console.warn("[mobx] you are running a minified build, but '" + varName + "' was not set to 'production' in your bundler. This results in an unnecessarily large and slow bundle");
  }
})();

if (typeof __MOBX_DEVTOOLS_GLOBAL_HOOK__ === "object") {
  // See: https://github.com/andykog/mobx-devtools/
  __MOBX_DEVTOOLS_GLOBAL_HOOK__.injectMobx({
    spy: spy,
    extras: {
      getDebugName: getDebugName
    },
    $mobx: $mobx
  });
}
},{"process":"../../node_modules/process/browser.js"}],"../../node_modules/@formular/core/node_modules/mobx-state-tree/dist/mobx-state-tree.module.js":[function(require,module,exports) {
var process = require("process");
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addDisposer = addDisposer;
exports.addMiddleware = addMiddleware;
exports.applyAction = applyAction;
exports.applyPatch = applyPatch;
exports.applySnapshot = applySnapshot;
exports.cast = cast;
exports.castFlowReturn = castFlowReturn;
exports.castToReferenceSnapshot = castToReferenceSnapshot;
exports.castToSnapshot = castToSnapshot;
exports.clone = clone;
exports.createActionTrackingMiddleware = createActionTrackingMiddleware;
exports.createActionTrackingMiddleware2 = createActionTrackingMiddleware2;
exports.decorate = decorate;
exports.destroy = destroy;
exports.detach = detach;
exports.escapeJsonPath = escapeJsonPath;
exports.flow = flow;
exports.getChildType = getChildType;
exports.getEnv = getEnv;
exports.getIdentifier = getIdentifier;
exports.getLivelinessChecking = getLivelinessChecking;
exports.getMembers = getMembers;
exports.getNodeId = getNodeId;
exports.getParent = getParent;
exports.getParentOfType = getParentOfType;
exports.getPath = getPath;
exports.getPathParts = getPathParts;
exports.getPropertyMembers = getPropertyMembers;
exports.getRelativePath = getRelativePath;
exports.getRoot = getRoot;
exports.getRunningActionContext = getRunningActionContext;
exports.getSnapshot = getSnapshot;
exports.getType = getType;
exports.hasParent = hasParent;
exports.hasParentOfType = hasParentOfType;
exports.isActionContextChildOf = isActionContextChildOf;
exports.isActionContextThisOrChildOf = isActionContextThisOrChildOf;
exports.isAlive = isAlive;
exports.isArrayType = isArrayType;
exports.isFrozenType = isFrozenType;
exports.isIdentifierType = isIdentifierType;
exports.isLateType = isLateType;
exports.isLiteralType = isLiteralType;
exports.isMapType = isMapType;
exports.isModelType = isModelType;
exports.isOptionalType = isOptionalType;
exports.isPrimitiveType = isPrimitiveType;
exports.isProtected = isProtected;
exports.isReferenceType = isReferenceType;
exports.isRefinementType = isRefinementType;
exports.isRoot = isRoot;
exports.isStateTreeNode = isStateTreeNode;
exports.isType = isType;
exports.isUnionType = isUnionType;
exports.isValidReference = isValidReference;
exports.joinJsonPath = joinJsonPath;
exports.onAction = onAction;
exports.onPatch = onPatch;
exports.onSnapshot = onSnapshot;
exports.process = process$1;
exports.protect = protect;
exports.recordActions = recordActions;
exports.recordPatches = recordPatches;
exports.resolveIdentifier = resolveIdentifier;
exports.resolvePath = resolvePath;
exports.setLivelinessChecking = setLivelinessChecking;
exports.setLivelynessChecking = setLivelynessChecking;
exports.splitJsonPath = splitJsonPath;
exports.tryReference = tryReference;
exports.tryResolve = tryResolve;
exports.typecheck = typecheck;
exports.unescapeJsonPath = unescapeJsonPath;
exports.unprotect = unprotect;
exports.walk = walk;
exports.types = void 0;

var _mobx = require("mobx");

var livelinessChecking = "warn";
/**
 * Defines what MST should do when running into reads / writes to objects that have died.
 * By default it will print a warning.
 * Use the `"error"` option to easy debugging to see where the error was thrown and when the offending read / write took place
 *
 * @param mode `"warn"`, `"error"` or `"ignore"`
 */

function setLivelinessChecking(mode) {
  livelinessChecking = mode;
}
/**
 * Returns the current liveliness checking mode.
 *
 * @returns `"warn"`, `"error"` or `"ignore"`
 */


function getLivelinessChecking() {
  return livelinessChecking;
}
/**
 * @deprecated use setLivelinessChecking instead
 * @hidden
 *
 * Defines what MST should do when running into reads / writes to objects that have died.
 * By default it will print a warning.
 * Use the `"error"` option to easy debugging to see where the error was thrown and when the offending read / write took place
 *
 * @param mode `"warn"`, `"error"` or `"ignore"`
 */


function setLivelynessChecking(mode) {
  setLivelinessChecking(mode);
}
/**
 * @hidden
 */


var Hook;

(function (Hook) {
  Hook["afterCreate"] = "afterCreate";
  Hook["afterAttach"] = "afterAttach";
  Hook["afterCreationFinalization"] = "afterCreationFinalization";
  Hook["beforeDetach"] = "beforeDetach";
  Hook["beforeDestroy"] = "beforeDestroy";
})(Hook || (Hook = {}));
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

/* global Reflect, Promise */


var extendStatics = function (d, b) {
  extendStatics = Object.setPrototypeOf || {
    __proto__: []
  } instanceof Array && function (d, b) {
    d.__proto__ = b;
  } || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
  };

  return extendStatics(d, b);
};

function __extends(d, b) {
  extendStatics(d, b);

  function __() {
    this.constructor = d;
  }

  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function () {
  __assign = Object.assign || function __assign(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

function __rest(s, e) {
  var t = {};

  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];

  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
}

function __decorate(decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __values(o) {
  var m = typeof Symbol === "function" && o[Symbol.iterator],
      i = 0;
  if (m) return m.call(o);
  return {
    next: function () {
      if (o && i >= o.length) o = void 0;
      return {
        value: o && o[i++],
        done: !o
      };
    }
  };
}

function __read(o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m) return o;
  var i = m.call(o),
      r,
      ar = [],
      e;

  try {
    while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
  } catch (error) {
    e = {
      error: error
    };
  } finally {
    try {
      if (r && !r.done && (m = i["return"])) m.call(i);
    } finally {
      if (e) throw e.error;
    }
  }

  return ar;
}

function __spread() {
  for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));

  return ar;
}
/**
 * Returns the _actual_ type of the given tree node. (Or throws)
 *
 * @param object
 * @returns
 */


function getType(object) {
  assertIsStateTreeNode(object, 1);
  return getStateTreeNode(object).type;
}
/**
 * Returns the _declared_ type of the given sub property of an object, array or map.
 * In the case of arrays and maps the property name is optional and will be ignored.
 *
 * Example:
 * ```ts
 * const Box = types.model({ x: 0, y: 0 })
 * const box = Box.create()
 *
 * console.log(getChildType(box, "x").name) // 'number'
 * ```
 *
 * @param object
 * @param propertyName
 * @returns
 */


function getChildType(object, propertyName) {
  assertIsStateTreeNode(object, 1);
  return getStateTreeNode(object).getChildType(propertyName);
}
/**
 * Registers a function that will be invoked for each mutation that is applied to the provided model instance, or to any of its children.
 * See [patches](https://github.com/mobxjs/mobx-state-tree#patches) for more details. onPatch events are emitted immediately and will not await the end of a transaction.
 * Patches can be used to deep observe a model tree.
 *
 * @param target the model instance from which to receive patches
 * @param callback the callback that is invoked for each patch. The reversePatch is a patch that would actually undo the emitted patch
 * @returns function to remove the listener
 */


function onPatch(target, callback) {
  // check all arguments
  assertIsStateTreeNode(target, 1);
  assertIsFunction(callback, 2);
  return getStateTreeNode(target).onPatch(callback);
}
/**
 * Registers a function that is invoked whenever a new snapshot for the given model instance is available.
 * The listener will only be fire at the end of the current MobX (trans)action.
 * See [snapshots](https://github.com/mobxjs/mobx-state-tree#snapshots) for more details.
 *
 * @param target
 * @param callback
 * @returns
 */


function onSnapshot(target, callback) {
  // check all arguments
  assertIsStateTreeNode(target, 1);
  assertIsFunction(callback, 2);
  return getStateTreeNode(target).onSnapshot(callback);
}
/**
 * Applies a JSON-patch to the given model instance or bails out if the patch couldn't be applied
 * See [patches](https://github.com/mobxjs/mobx-state-tree#patches) for more details.
 *
 * Can apply a single past, or an array of patches.
 *
 * @param target
 * @param patch
 * @returns
 */


function applyPatch(target, patch) {
  // check all arguments
  assertIsStateTreeNode(target, 1);
  assertArg(patch, function (p) {
    return typeof p === "object";
  }, "object or array", 2);
  getStateTreeNode(target).applyPatches(asArray(patch));
}
/**
 * Small abstraction around `onPatch` and `applyPatch`, attaches a patch listener to a tree and records all the patches.
 * Returns an recorder object with the following signature:
 *
 * Example:
 * ```ts
 * export interface IPatchRecorder {
 *      // the recorded patches
 *      patches: IJsonPatch[]
 *      // the inverse of the recorded patches
 *      inversePatches: IJsonPatch[]
 *      // true if currently recording
 *      recording: boolean
 *      // stop recording patches
 *      stop(): void
 *      // resume recording patches
 *      resume(): void
 *      // apply all the recorded patches on the given target (the original subject if omitted)
 *      replay(target?: IAnyStateTreeNode): void
 *      // reverse apply the recorded patches on the given target  (the original subject if omitted)
 *      // stops the recorder if not already stopped
 *      undo(): void
 * }
 * ```
 *
 * The optional filter function allows to skip recording certain patches.
 *
 * @param subject
 * @param filter
 * @returns
 */


function recordPatches(subject, filter) {
  // check all arguments
  assertIsStateTreeNode(subject, 1);
  var data = {
    patches: [],
    reversedInversePatches: []
  }; // we will generate the immutable copy of patches on demand for public consumption

  var publicData = {};
  var disposer;
  var recorder = {
    get recording() {
      return !!disposer;
    },

    get patches() {
      if (!publicData.patches) {
        publicData.patches = data.patches.slice();
      }

      return publicData.patches;
    },

    get reversedInversePatches() {
      if (!publicData.reversedInversePatches) {
        publicData.reversedInversePatches = data.reversedInversePatches.slice();
      }

      return publicData.reversedInversePatches;
    },

    get inversePatches() {
      if (!publicData.inversePatches) {
        publicData.inversePatches = data.reversedInversePatches.slice().reverse();
      }

      return publicData.inversePatches;
    },

    stop: function () {
      if (disposer) {
        disposer();
        disposer = undefined;
      }
    },
    resume: function () {
      if (disposer) return;
      disposer = onPatch(subject, function (patch, inversePatch) {
        // skip patches that are asked to be filtered if there's a filter in place
        if (filter && !filter(patch, inversePatch, getRunningActionContext())) {
          return;
        }

        data.patches.push(patch);
        data.reversedInversePatches.unshift(inversePatch); // mark immutable public patches as dirty

        publicData.patches = undefined;
        publicData.inversePatches = undefined;
        publicData.reversedInversePatches = undefined;
      });
    },
    replay: function (target) {
      applyPatch(target || subject, data.patches);
    },
    undo: function (target) {
      applyPatch(target || subject, data.reversedInversePatches);
    }
  };
  recorder.resume();
  return recorder;
}
/**
 * The inverse of `unprotect`.
 *
 * @param target
 */


function protect(target) {
  // check all arguments
  assertIsStateTreeNode(target, 1);
  var node = getStateTreeNode(target);
  if (!node.isRoot) throw fail$1("`protect` can only be invoked on root nodes");
  node.isProtectionEnabled = true;
}
/**
 * By default it is not allowed to directly modify a model. Models can only be modified through actions.
 * However, in some cases you don't care about the advantages (like replayability, traceability, etc) this yields.
 * For example because you are building a PoC or don't have any middleware attached to your tree.
 *
 * In that case you can disable this protection by calling `unprotect` on the root of your tree.
 *
 * Example:
 * ```ts
 * const Todo = types.model({
 *     done: false
 * }).actions(self => ({
 *     toggle() {
 *         self.done = !self.done
 *     }
 * }))
 *
 * const todo = Todo.create()
 * todo.done = true // throws!
 * todo.toggle() // OK
 * unprotect(todo)
 * todo.done = false // OK
 * ```
 */


function unprotect(target) {
  // check all arguments
  assertIsStateTreeNode(target, 1);
  var node = getStateTreeNode(target);
  if (!node.isRoot) throw fail$1("`unprotect` can only be invoked on root nodes");
  node.isProtectionEnabled = false;
}
/**
 * Returns true if the object is in protected mode, @see protect
 */


function isProtected(target) {
  return getStateTreeNode(target).isProtected;
}
/**
 * Applies a snapshot to a given model instances. Patch and snapshot listeners will be invoked as usual.
 *
 * @param target
 * @param snapshot
 * @returns
 */


function applySnapshot(target, snapshot) {
  // check all arguments
  assertIsStateTreeNode(target, 1);
  return getStateTreeNode(target).applySnapshot(snapshot);
}
/**
 * Calculates a snapshot from the given model instance. The snapshot will always reflect the latest state but use
 * structural sharing where possible. Doesn't require MobX transactions to be completed.
 *
 * @param target
 * @param applyPostProcess If true (the default) then postProcessSnapshot gets applied.
 * @returns
 */


function getSnapshot(target, applyPostProcess) {
  if (applyPostProcess === void 0) {
    applyPostProcess = true;
  } // check all arguments


  assertIsStateTreeNode(target, 1);
  var node = getStateTreeNode(target);
  if (applyPostProcess) return node.snapshot;
  return freeze(node.type.getSnapshot(node, false));
}
/**
 * Given a model instance, returns `true` if the object has a parent, that is, is part of another object, map or array.
 *
 * @param target
 * @param depth How far should we look upward? 1 by default.
 * @returns
 */


function hasParent(target, depth) {
  if (depth === void 0) {
    depth = 1;
  } // check all arguments


  assertIsStateTreeNode(target, 1);
  assertIsNumber(depth, 2, 0);
  var parent = getStateTreeNode(target).parent;

  while (parent) {
    if (--depth === 0) return true;
    parent = parent.parent;
  }

  return false;
}
/**
 * Returns the immediate parent of this object, or throws.
 *
 * Note that the immediate parent can be either an object, map or array, and
 * doesn't necessarily refer to the parent model.
 *
 * Please note that in child nodes access to the root is only possible
 * once the `afterAttach` hook has fired.
 *
 * @param target
 * @param depth How far should we look upward? 1 by default.
 * @returns
 */


function getParent(target, depth) {
  if (depth === void 0) {
    depth = 1;
  } // check all arguments


  assertIsStateTreeNode(target, 1);
  assertIsNumber(depth, 2, 0);
  var d = depth;
  var parent = getStateTreeNode(target).parent;

  while (parent) {
    if (--d === 0) return parent.storedValue;
    parent = parent.parent;
  }

  throw fail$1("Failed to find the parent of " + getStateTreeNode(target) + " at depth " + depth);
}
/**
 * Given a model instance, returns `true` if the object has a parent of given type, that is, is part of another object, map or array
 *
 * @param target
 * @param type
 * @returns
 */


function hasParentOfType(target, type) {
  // check all arguments
  assertIsStateTreeNode(target, 1);
  assertIsType(type, 2);
  var parent = getStateTreeNode(target).parent;

  while (parent) {
    if (type.is(parent.storedValue)) return true;
    parent = parent.parent;
  }

  return false;
}
/**
 * Returns the target's parent of a given type, or throws.
 *
 * @param target
 * @param type
 * @returns
 */


function getParentOfType(target, type) {
  // check all arguments
  assertIsStateTreeNode(target, 1);
  assertIsType(type, 2);
  var parent = getStateTreeNode(target).parent;

  while (parent) {
    if (type.is(parent.storedValue)) return parent.storedValue;
    parent = parent.parent;
  }

  throw fail$1("Failed to find the parent of " + getStateTreeNode(target) + " of a given type");
}
/**
 * Given an object in a model tree, returns the root object of that tree.
 *
 * Please note that in child nodes access to the root is only possible
 * once the `afterAttach` hook has fired.
 *
 * @param target
 * @returns
 */


function getRoot(target) {
  // check all arguments
  assertIsStateTreeNode(target, 1);
  return getStateTreeNode(target).root.storedValue;
}
/**
 * Returns the path of the given object in the model tree
 *
 * @param target
 * @returns
 */


function getPath(target) {
  // check all arguments
  assertIsStateTreeNode(target, 1);
  return getStateTreeNode(target).path;
}
/**
 * Returns the path of the given object as unescaped string array.
 *
 * @param target
 * @returns
 */


function getPathParts(target) {
  // check all arguments
  assertIsStateTreeNode(target, 1);
  return splitJsonPath(getStateTreeNode(target).path);
}
/**
 * Returns true if the given object is the root of a model tree.
 *
 * @param target
 * @returns
 */


function isRoot(target) {
  // check all arguments
  assertIsStateTreeNode(target, 1);
  return getStateTreeNode(target).isRoot;
}
/**
 * Resolves a path relatively to a given object.
 * Returns undefined if no value can be found.
 *
 * @param target
 * @param path escaped json path
 * @returns
 */


function resolvePath(target, path) {
  // check all arguments
  assertIsStateTreeNode(target, 1);
  assertIsString(path, 2);
  var node = resolveNodeByPath(getStateTreeNode(target), path);
  return node ? node.value : undefined;
}
/**
 * Resolves a model instance given a root target, the type and the identifier you are searching for.
 * Returns undefined if no value can be found.
 *
 * @param type
 * @param target
 * @param identifier
 * @returns
 */


function resolveIdentifier(type, target, identifier) {
  // check all arguments
  assertIsType(type, 1);
  assertIsStateTreeNode(target, 2);
  assertIsValidIdentifier(identifier, 3);
  var node = getStateTreeNode(target).root.identifierCache.resolve(type, normalizeIdentifier(identifier));
  return node ? node.value : undefined;
}
/**
 * Returns the identifier of the target node.
 * This is the *string normalized* identifier, which might not match the type of the identifier attribute
 *
 * @param target
 * @returns
 */


function getIdentifier(target) {
  // check all arguments
  assertIsStateTreeNode(target, 1);
  return getStateTreeNode(target).identifier;
}
/**
 * Tests if a reference is valid (pointing to an existing node and optionally if alive) and returns such reference if it the check passes,
 * else it returns undefined.
 *
 * @param getter Function to access the reference.
 * @param checkIfAlive true to also make sure the referenced node is alive (default), false to skip this check.
 * @returns
 */


function tryReference(getter, checkIfAlive) {
  if (checkIfAlive === void 0) {
    checkIfAlive = true;
  }

  try {
    var node = getter();

    if (node === undefined || node === null) {
      return undefined;
    } else if (isStateTreeNode(node)) {
      if (!checkIfAlive) {
        return node;
      } else {
        return isAlive(node) ? node : undefined;
      }
    } else {
      throw fail$1("The reference to be checked is not one of node, null or undefined");
    }
  } catch (e) {
    if (e instanceof InvalidReferenceError) {
      return undefined;
    }

    throw e;
  }
}
/**
 * Tests if a reference is valid (pointing to an existing node and optionally if alive) and returns if the check passes or not.
 *
 * @param getter Function to access the reference.
 * @param checkIfAlive true to also make sure the referenced node is alive (default), false to skip this check.
 * @returns
 */


function isValidReference(getter, checkIfAlive) {
  if (checkIfAlive === void 0) {
    checkIfAlive = true;
  }

  try {
    var node = getter();

    if (node === undefined || node === null) {
      return false;
    } else if (isStateTreeNode(node)) {
      return checkIfAlive ? isAlive(node) : true;
    } else {
      throw fail$1("The reference to be checked is not one of node, null or undefined");
    }
  } catch (e) {
    if (e instanceof InvalidReferenceError) {
      return false;
    }

    throw e;
  }
}
/**
 * Try to resolve a given path relative to a given node.
 *
 * @param target
 * @param path
 * @returns
 */


function tryResolve(target, path) {
  // check all arguments
  assertIsStateTreeNode(target, 1);
  assertIsString(path, 2);
  var node = resolveNodeByPath(getStateTreeNode(target), path, false);
  if (node === undefined) return undefined;

  try {
    return node.value;
  } catch (e) {
    // For what ever reason not resolvable (e.g. totally not existing path, or value that cannot be fetched)
    // see test / issue: 'try resolve doesn't work #686'
    return undefined;
  }
}
/**
 * Given two state tree nodes that are part of the same tree,
 * returns the shortest jsonpath needed to navigate from the one to the other
 *
 * @param base
 * @param target
 * @returns
 */


function getRelativePath(base, target) {
  // check all arguments
  assertIsStateTreeNode(base, 1);
  assertIsStateTreeNode(target, 2);
  return getRelativePathBetweenNodes(getStateTreeNode(base), getStateTreeNode(target));
}
/**
 * Returns a deep copy of the given state tree node as new tree.
 * Short hand for `snapshot(x) = getType(x).create(getSnapshot(x))`
 *
 * _Tip: clone will create a literal copy, including the same identifiers. To modify identifiers etc during cloning, don't use clone but take a snapshot of the tree, modify it, and create new instance_
 *
 * @param source
 * @param keepEnvironment indicates whether the clone should inherit the same environment (`true`, the default), or not have an environment (`false`). If an object is passed in as second argument, that will act as the environment for the cloned tree.
 * @returns
 */


function clone(source, keepEnvironment) {
  if (keepEnvironment === void 0) {
    keepEnvironment = true;
  } // check all arguments


  assertIsStateTreeNode(source, 1);
  var node = getStateTreeNode(source);
  return node.type.create(node.snapshot, keepEnvironment === true ? node.root.environment : keepEnvironment === false ? undefined : keepEnvironment); // it's an object or something else
}
/**
 * Removes a model element from the state tree, and let it live on as a new state tree
 */


function detach(target) {
  // check all arguments
  assertIsStateTreeNode(target, 1);
  getStateTreeNode(target).detach();
  return target;
}
/**
 * Removes a model element from the state tree, and mark it as end-of-life; the element should not be used anymore
 */


function destroy(target) {
  // check all arguments
  assertIsStateTreeNode(target, 1);
  var node = getStateTreeNode(target);
  if (node.isRoot) node.die();else node.parent.removeChild(node.subpath);
}
/**
 * Returns true if the given state tree node is not killed yet.
 * This means that the node is still a part of a tree, and that `destroy`
 * has not been called. If a node is not alive anymore, the only thing one can do with it
 * is requesting it's last path and snapshot
 *
 * @param target
 * @returns
 */


function isAlive(target) {
  // check all arguments
  assertIsStateTreeNode(target, 1);
  return getStateTreeNode(target).observableIsAlive;
}
/**
 * Use this utility to register a function that should be called whenever the
 * targeted state tree node is destroyed. This is a useful alternative to managing
 * cleanup methods yourself using the `beforeDestroy` hook.
 *
 * This methods returns the same disposer that was passed as argument.
 *
 * Example:
 * ```ts
 * const Todo = types.model({
 *   title: types.string
 * }).actions(self => ({
 *   afterCreate() {
 *     const autoSaveDisposer = reaction(
 *       () => getSnapshot(self),
 *       snapshot => sendSnapshotToServerSomehow(snapshot)
 *     )
 *     // stop sending updates to server if this
 *     // instance is destroyed
 *     addDisposer(self, autoSaveDisposer)
 *   }
 * }))
 * ```
 *
 * @param target
 * @param disposer
 * @returns The same disposer that was passed as argument
 */


function addDisposer(target, disposer) {
  // check all arguments
  assertIsStateTreeNode(target, 1);
  assertIsFunction(disposer, 2);
  var node = getStateTreeNode(target);
  node.addDisposer(disposer);
  return disposer;
}
/**
 * Returns the environment of the current state tree. For more info on environments,
 * see [Dependency injection](https://github.com/mobxjs/mobx-state-tree#dependency-injection)
 *
 * Please note that in child nodes access to the root is only possible
 * once the `afterAttach` hook has fired
 *
 * Returns an empty environment if the tree wasn't initialized with an environment
 *
 * @param target
 * @returns
 */


function getEnv(target) {
  // check all arguments
  assertIsStateTreeNode(target, 1);
  var node = getStateTreeNode(target);
  var env = node.root.environment;
  if (!env) return EMPTY_OBJECT;
  return env;
}
/**
 * Performs a depth first walk through a tree.
 */


function walk(target, processor) {
  // check all arguments
  assertIsStateTreeNode(target, 1);
  assertIsFunction(processor, 2);
  var node = getStateTreeNode(target); // tslint:disable-next-line:no_unused-variable

  node.getChildren().forEach(function (child) {
    if (isStateTreeNode(child.storedValue)) walk(child.storedValue, processor);
  });
  processor(node.storedValue);
}
/**
 * Returns a reflection of the model type properties and name for either a model type or model node.
 *
 * @param typeOrNode
 * @returns
 */


function getPropertyMembers(typeOrNode) {
  var type;

  if (isStateTreeNode(typeOrNode)) {
    type = getType(typeOrNode);
  } else {
    type = typeOrNode;
  }

  assertArg(type, function (t) {
    return isModelType(t);
  }, "model type or model instance", 1);
  return {
    name: type.name,
    properties: __assign({}, type.properties)
  };
}
/**
 * Returns a reflection of the model node, including name, properties, views, volatile and actions.
 *
 * @param target
 * @returns
 */


function getMembers(target) {
  var type = getStateTreeNode(target).type;

  var reflected = __assign(__assign({}, getPropertyMembers(type)), {
    actions: [],
    volatile: [],
    views: []
  });

  var props = Object.getOwnPropertyNames(target);
  props.forEach(function (key) {
    if (key in reflected.properties) return;
    var descriptor = Object.getOwnPropertyDescriptor(target, key);

    if (descriptor.get) {
      if ((0, _mobx.isComputedProp)(target, key)) reflected.views.push(key);else reflected.volatile.push(key);
      return;
    }

    if (descriptor.value._isMSTAction === true) reflected.actions.push(key);else if ((0, _mobx.isObservableProp)(target, key)) reflected.volatile.push(key);else reflected.views.push(key);
  });
  return reflected;
}
/**
 * Casts a node snapshot or instance type to an instance type so it can be assigned to a type instance.
 * Note that this is just a cast for the type system, this is, it won't actually convert a snapshot to an instance,
 * but just fool typescript into thinking so.
 * Either way, casting when outside an assignation operation won't compile.
 *
 * Example:
 * ```ts
 * const ModelA = types.model({
 *   n: types.number
 * }).actions(self => ({
 *   setN(aNumber: number) {
 *     self.n = aNumber
 *   }
 * }))
 *
 * const ModelB = types.model({
 *   innerModel: ModelA
 * }).actions(self => ({
 *   someAction() {
 *     // this will allow the compiler to assign a snapshot to the property
 *     self.innerModel = cast({ a: 5 })
 *   }
 * }))
 * ```
 *
 * @param snapshotOrInstance Snapshot or instance
 * @returns The same object casted as an instance
 */


function cast(snapshotOrInstance) {
  return snapshotOrInstance;
}
/**
 * Casts a node instance type to an snapshot type so it can be assigned to a type snapshot (e.g. to be used inside a create call).
 * Note that this is just a cast for the type system, this is, it won't actually convert an instance to a snapshot,
 * but just fool typescript into thinking so.
 *
 * Example:
 * ```ts
 * const ModelA = types.model({
 *   n: types.number
 * }).actions(self => ({
 *   setN(aNumber: number) {
 *     self.n = aNumber
 *   }
 * }))
 *
 * const ModelB = types.model({
 *   innerModel: ModelA
 * })
 *
 * const a = ModelA.create({ n: 5 });
 * // this will allow the compiler to use a model as if it were a snapshot
 * const b = ModelB.create({ innerModel: castToSnapshot(a)})
 * ```
 *
 * @param snapshotOrInstance Snapshot or instance
 * @returns The same object casted as an input (creation) snapshot
 */


function castToSnapshot(snapshotOrInstance) {
  return snapshotOrInstance;
}
/**
 * Casts a node instance type to a reference snapshot type so it can be assigned to a refernence snapshot (e.g. to be used inside a create call).
 * Note that this is just a cast for the type system, this is, it won't actually convert an instance to a refererence snapshot,
 * but just fool typescript into thinking so.
 *
 * Example:
 * ```ts
 * const ModelA = types.model({
 *   id: types.identifier,
 *   n: types.number
 * }).actions(self => ({
 *   setN(aNumber: number) {
 *     self.n = aNumber
 *   }
 * }))
 *
 * const ModelB = types.model({
 *   refA: types.reference(ModelA)
 * })
 *
 * const a = ModelA.create({ id: 'someId', n: 5 });
 * // this will allow the compiler to use a model as if it were a reference snapshot
 * const b = ModelB.create({ refA: castToReference(a)})
 * ```
 *
 * @param instance Instance
 * @returns The same object casted as an reference snapshot (string or number)
 */


function castToReferenceSnapshot(instance) {
  return instance;
}
/**
 * Returns the unique node id (not to be confused with the instance identifier) for a
 * given instance.
 * This id is a number that is unique for each instance.
 *
 * @export
 * @param target
 * @returns
 */


function getNodeId(target) {
  assertIsStateTreeNode(target, 1);
  return getStateTreeNode(target).nodeId;
}
/**
 * @internal
 * @hidden
 */


var BaseNode =
/** @class */
function () {
  function BaseNode(type, parent, subpath, environment) {
    this.type = type;
    this.environment = environment;
    this._state = NodeLifeCycle.INITIALIZING;
    this.environment = environment;
    this.baseSetParent(parent, subpath);
  }

  Object.defineProperty(BaseNode.prototype, "subpath", {
    get: function () {
      return this._subpath;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(BaseNode.prototype, "subpathUponDeath", {
    get: function () {
      return this._subpathUponDeath;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(BaseNode.prototype, "pathUponDeath", {
    get: function () {
      return this._pathUponDeath;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(BaseNode.prototype, "value", {
    get: function () {
      return this.type.getValue(this);
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(BaseNode.prototype, "state", {
    get: function () {
      return this._state;
    },
    set: function (val) {
      var wasAlive = this.isAlive;
      this._state = val;
      var isAlive = this.isAlive;

      if (this.aliveAtom && wasAlive !== isAlive) {
        this.aliveAtom.reportChanged();
      }
    },
    enumerable: true,
    configurable: true
  });

  BaseNode.prototype.fireInternalHook = function (name) {
    if (this._hookSubscribers) {
      this._hookSubscribers.emit(name, this, name);
    }
  };

  BaseNode.prototype.registerHook = function (hook, hookHandler) {
    if (!this._hookSubscribers) {
      this._hookSubscribers = new EventHandlers();
    }

    return this._hookSubscribers.register(hook, hookHandler);
  };

  Object.defineProperty(BaseNode.prototype, "parent", {
    get: function () {
      return this._parent;
    },
    enumerable: true,
    configurable: true
  });

  BaseNode.prototype.baseSetParent = function (parent, subpath) {
    this._parent = parent;
    this._subpath = subpath;
    this._escapedSubpath = undefined; // regenerate when needed

    if (this.pathAtom) {
      this.pathAtom.reportChanged();
    }
  };

  Object.defineProperty(BaseNode.prototype, "path", {
    /*
     * Returns (escaped) path representation as string
     */
    get: function () {
      return this.getEscapedPath(true);
    },
    enumerable: true,
    configurable: true
  });

  BaseNode.prototype.getEscapedPath = function (reportObserved) {
    if (reportObserved) {
      if (!this.pathAtom) {
        this.pathAtom = (0, _mobx.createAtom)("path");
      }

      this.pathAtom.reportObserved();
    }

    if (!this.parent) return ""; // regenerate escaped subpath if needed

    if (this._escapedSubpath === undefined) {
      this._escapedSubpath = !this._subpath ? "" : escapeJsonPath(this._subpath);
    }

    return this.parent.getEscapedPath(reportObserved) + "/" + this._escapedSubpath;
  };

  Object.defineProperty(BaseNode.prototype, "isRoot", {
    get: function () {
      return this.parent === null;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(BaseNode.prototype, "isAlive", {
    get: function () {
      return this.state !== NodeLifeCycle.DEAD;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(BaseNode.prototype, "isDetaching", {
    get: function () {
      return this.state === NodeLifeCycle.DETACHING;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(BaseNode.prototype, "observableIsAlive", {
    get: function () {
      if (!this.aliveAtom) {
        this.aliveAtom = (0, _mobx.createAtom)("alive");
      }

      this.aliveAtom.reportObserved();
      return this.isAlive;
    },
    enumerable: true,
    configurable: true
  });

  BaseNode.prototype.baseFinalizeCreation = function (whenFinalized) {
    if (devMode()) {
      if (!this.isAlive) {
        // istanbul ignore next
        throw fail("assertion failed: cannot finalize the creation of a node that is already dead");
      }
    } // goal: afterCreate hooks runs depth-first. After attach runs parent first, so on afterAttach the parent has completed already


    if (this.state === NodeLifeCycle.CREATED) {
      if (this.parent) {
        if (this.parent.state !== NodeLifeCycle.FINALIZED) {
          // parent not ready yet, postpone
          return;
        }

        this.fireHook(Hook.afterAttach);
      }

      this.state = NodeLifeCycle.FINALIZED;

      if (whenFinalized) {
        whenFinalized();
      }
    }
  };

  BaseNode.prototype.baseFinalizeDeath = function () {
    if (this._hookSubscribers) {
      this._hookSubscribers.clearAll();
    }

    this._subpathUponDeath = this._subpath;
    this._pathUponDeath = this.getEscapedPath(false);
    this.baseSetParent(null, "");
    this.state = NodeLifeCycle.DEAD;
  };

  BaseNode.prototype.baseAboutToDie = function () {
    this.fireHook(Hook.beforeDestroy);
  };

  return BaseNode;
}();
/**
 * @internal
 * @hidden
 */


var ScalarNode =
/** @class */
function (_super) {
  __extends(ScalarNode, _super);

  function ScalarNode(simpleType, parent, subpath, environment, initialSnapshot) {
    var _this = _super.call(this, simpleType, parent, subpath, environment) || this;

    try {
      _this.storedValue = simpleType.createNewInstance(initialSnapshot);
    } catch (e) {
      // short-cut to die the instance, to avoid the snapshot computed starting to throw...
      _this.state = NodeLifeCycle.DEAD;
      throw e;
    }

    _this.state = NodeLifeCycle.CREATED; // for scalar nodes there's no point in firing this event since it would fire on the constructor, before
    // anybody can actually register for/listen to it
    // this.fireHook(Hook.AfterCreate)

    _this.finalizeCreation();

    return _this;
  }

  Object.defineProperty(ScalarNode.prototype, "root", {
    get: function () {
      // future optimization: store root ref in the node and maintain it
      if (!this.parent) throw fail$1("This scalar node is not part of a tree");
      return this.parent.root;
    },
    enumerable: true,
    configurable: true
  });

  ScalarNode.prototype.setParent = function (newParent, subpath) {
    var parentChanged = this.parent !== newParent;
    var subpathChanged = this.subpath !== subpath;

    if (!parentChanged && !subpathChanged) {
      return;
    }

    if (devMode()) {
      if (!subpath) {
        // istanbul ignore next
        throw fail$1("assertion failed: subpath expected");
      }

      if (!newParent) {
        // istanbul ignore next
        throw fail$1("assertion failed: parent expected");
      }

      if (parentChanged) {
        // istanbul ignore next
        throw fail$1("assertion failed: scalar nodes cannot change their parent");
      }
    }

    this.environment = undefined; // use parent's

    this.baseSetParent(this.parent, subpath);
  };

  Object.defineProperty(ScalarNode.prototype, "snapshot", {
    get: function () {
      return freeze(this.getSnapshot());
    },
    enumerable: true,
    configurable: true
  });

  ScalarNode.prototype.getSnapshot = function () {
    return this.type.getSnapshot(this);
  };

  ScalarNode.prototype.toString = function () {
    var path = (this.isAlive ? this.path : this.pathUponDeath) || "<root>";
    return this.type.name + "@" + path + (this.isAlive ? "" : " [dead]");
  };

  ScalarNode.prototype.die = function () {
    if (!this.isAlive || this.state === NodeLifeCycle.DETACHING) return;
    this.aboutToDie();
    this.finalizeDeath();
  };

  ScalarNode.prototype.finalizeCreation = function () {
    this.baseFinalizeCreation();
  };

  ScalarNode.prototype.aboutToDie = function () {
    this.baseAboutToDie();
  };

  ScalarNode.prototype.finalizeDeath = function () {
    this.baseFinalizeDeath();
  };

  ScalarNode.prototype.fireHook = function (name) {
    this.fireInternalHook(name);
  };

  __decorate([_mobx.action], ScalarNode.prototype, "die", null);

  return ScalarNode;
}(BaseNode);

var nextNodeId = 1;
var snapshotReactionOptions = {
  onError: function (e) {
    throw e;
  }
};
/**
 * @internal
 * @hidden
 */

var ObjectNode =
/** @class */
function (_super) {
  __extends(ObjectNode, _super);

  function ObjectNode(complexType, parent, subpath, environment, initialValue) {
    var _this = _super.call(this, complexType, parent, subpath, environment) || this;

    _this.nodeId = ++nextNodeId;
    _this.isProtectionEnabled = true;
    _this._autoUnbox = true; // unboxing is disabled when reading child nodes

    _this._isRunningAction = false; // only relevant for root

    _this._hasSnapshotReaction = false;
    _this._observableInstanceState = 0
    /* UNINITIALIZED */
    ;
    _this._cachedInitialSnapshotCreated = false;
    _this.unbox = _this.unbox.bind(_this);
    _this._initialSnapshot = freeze(initialValue);
    _this.identifierAttribute = complexType.identifierAttribute;

    if (!parent) {
      _this.identifierCache = new IdentifierCache();
    }

    _this._childNodes = complexType.initializeChildNodes(_this, _this._initialSnapshot); // identifier can not be changed during lifecycle of a node
    // so we safely can read it from initial snapshot

    _this.identifier = null;
    _this.unnormalizedIdentifier = null;

    if (_this.identifierAttribute && _this._initialSnapshot) {
      var id = _this._initialSnapshot[_this.identifierAttribute];

      if (id === undefined) {
        // try with the actual node if not (for optional identifiers)
        var childNode = _this._childNodes[_this.identifierAttribute];

        if (childNode) {
          id = childNode.value;
        }
      }

      if (typeof id !== "string" && typeof id !== "number") {
        throw fail$1("Instance identifier '" + _this.identifierAttribute + "' for type '" + _this.type.name + "' must be a string or a number");
      } // normalize internal identifier to string


      _this.identifier = normalizeIdentifier(id);
      _this.unnormalizedIdentifier = id;
    }

    if (!parent) {
      _this.identifierCache.addNodeToCache(_this);
    } else {
      parent.root.identifierCache.addNodeToCache(_this);
    }

    return _this;
  }

  ObjectNode.prototype.applyPatches = function (patches) {
    this.createObservableInstanceIfNeeded();

    this._applyPatches(patches);
  };

  ObjectNode.prototype.applySnapshot = function (snapshot) {
    this.createObservableInstanceIfNeeded();

    this._applySnapshot(snapshot);
  };

  ObjectNode.prototype.createObservableInstanceIfNeeded = function () {
    var e_1, _a;

    if (this._observableInstanceState !== 0
    /* UNINITIALIZED */
    ) {
        return;
      }

    if (devMode()) {
      if (this.state !== NodeLifeCycle.INITIALIZING) {
        // istanbul ignore next
        throw fail$1("assertion failed: the creation of the observable instance must be done on the initializing phase");
      }
    }

    this._observableInstanceState = 1
    /* CREATING */
    ; // make sure the parent chain is created as well
    // array with parent chain from parent to child

    var parentChain = [];
    var parent = this.parent; // for performance reasons we never go back further than the most direct
    // uninitialized parent
    // this is done to avoid traversing the whole tree to the root when using
    // the same reference again

    while (parent && parent._observableInstanceState === 0
    /* UNINITIALIZED */
    ) {
      parentChain.unshift(parent);
      parent = parent.parent;
    }

    try {
      // initialize the uninitialized parent chain from parent to child
      for (var parentChain_1 = __values(parentChain), parentChain_1_1 = parentChain_1.next(); !parentChain_1_1.done; parentChain_1_1 = parentChain_1.next()) {
        var p = parentChain_1_1.value;
        p.createObservableInstanceIfNeeded();
      }
    } catch (e_1_1) {
      e_1 = {
        error: e_1_1
      };
    } finally {
      try {
        if (parentChain_1_1 && !parentChain_1_1.done && (_a = parentChain_1.return)) _a.call(parentChain_1);
      } finally {
        if (e_1) throw e_1.error;
      }
    }

    var type = this.type;

    try {
      this.storedValue = type.createNewInstance(this._childNodes);
      this.preboot();
      this._isRunningAction = true;
      type.finalizeNewInstance(this, this.storedValue);
    } catch (e) {
      // short-cut to die the instance, to avoid the snapshot computed starting to throw...
      this.state = NodeLifeCycle.DEAD;
      throw e;
    } finally {
      this._isRunningAction = false;
    }

    this._observableInstanceState = 2
    /* CREATED */
    ; // NOTE: we need to touch snapshot, because non-observable
    // "_observableInstanceState" field was touched

    invalidateComputed(this, "snapshot");
    if (this.isRoot) this._addSnapshotReaction();
    this._childNodes = EMPTY_OBJECT;
    this.state = NodeLifeCycle.CREATED;
    this.fireHook(Hook.afterCreate);
    this.finalizeCreation();
  };

  Object.defineProperty(ObjectNode.prototype, "root", {
    get: function () {
      var parent = this.parent;
      return parent ? parent.root : this;
    },
    enumerable: true,
    configurable: true
  });

  ObjectNode.prototype.clearParent = function () {
    if (!this.parent) return; // detach if attached

    this.fireHook(Hook.beforeDetach);
    var previousState = this.state;
    this.state = NodeLifeCycle.DETACHING;
    var root = this.root;
    var newEnv = root.environment;
    var newIdCache = root.identifierCache.splitCache(this);

    try {
      this.parent.removeChild(this.subpath);
      this.baseSetParent(null, "");
      this.environment = newEnv;
      this.identifierCache = newIdCache;
    } finally {
      this.state = previousState;
    }
  };

  ObjectNode.prototype.setParent = function (newParent, subpath) {
    var parentChanged = newParent !== this.parent;
    var subpathChanged = subpath !== this.subpath;

    if (!parentChanged && !subpathChanged) {
      return;
    }

    if (devMode()) {
      if (!subpath) {
        // istanbul ignore next
        throw fail$1("assertion failed: subpath expected");
      }

      if (!newParent) {
        // istanbul ignore next
        throw fail$1("assertion failed: new parent expected");
      }

      if (this.parent && parentChanged) {
        throw fail$1("A node cannot exists twice in the state tree. Failed to add " + this + " to path '" + newParent.path + "/" + subpath + "'.");
      }

      if (!this.parent && newParent.root === this) {
        throw fail$1("A state tree is not allowed to contain itself. Cannot assign " + this + " to path '" + newParent.path + "/" + subpath + "'");
      }

      if (!this.parent && !!this.environment && this.environment !== newParent.root.environment) {
        throw fail$1("A state tree cannot be made part of another state tree as long as their environments are different.");
      }
    }

    if (parentChanged) {
      // attach to new parent
      this.environment = undefined; // will use root's

      newParent.root.identifierCache.mergeCache(this);
      this.baseSetParent(newParent, subpath);
      this.fireHook(Hook.afterAttach);
    } else if (subpathChanged) {
      // moving to a new subpath on the same parent
      this.baseSetParent(this.parent, subpath);
    }
  };

  ObjectNode.prototype.fireHook = function (name) {
    var _this = this;

    this.fireInternalHook(name);
    var fn = this.storedValue && typeof this.storedValue === "object" && this.storedValue[name];

    if (typeof fn === "function") {
      // we check for it to allow old mobx peer dependencies that don't have the method to work (even when still bugged)
      if (_mobx._allowStateChangesInsideComputed) {
        (0, _mobx._allowStateChangesInsideComputed)(function () {
          fn.apply(_this.storedValue);
        });
      } else {
        fn.apply(this.storedValue);
      }
    }
  };

  Object.defineProperty(ObjectNode.prototype, "snapshot", {
    // advantage of using computed for a snapshot is that nicely respects transactions etc.
    get: function () {
      return freeze(this.getSnapshot());
    },
    enumerable: true,
    configurable: true
  }); // NOTE: we use this method to get snapshot without creating @computed overhead

  ObjectNode.prototype.getSnapshot = function () {
    if (!this.isAlive) return this._snapshotUponDeath;
    return this._observableInstanceState === 2
    /* CREATED */
    ? this._getActualSnapshot() : this._getCachedInitialSnapshot();
  };

  ObjectNode.prototype._getActualSnapshot = function () {
    return this.type.getSnapshot(this);
  };

  ObjectNode.prototype._getCachedInitialSnapshot = function () {
    if (!this._cachedInitialSnapshotCreated) {
      var type = this.type;
      var childNodes = this._childNodes;
      var snapshot = this._initialSnapshot;
      this._cachedInitialSnapshot = type.processInitialSnapshot(childNodes, snapshot);
      this._cachedInitialSnapshotCreated = true;
    }

    return this._cachedInitialSnapshot;
  };

  ObjectNode.prototype.isRunningAction = function () {
    if (this._isRunningAction) return true;
    if (this.isRoot) return false;
    return this.parent.isRunningAction();
  };

  ObjectNode.prototype.assertAlive = function (context) {
    var livelinessChecking = getLivelinessChecking();

    if (!this.isAlive && livelinessChecking !== "ignore") {
      var error = this._getAssertAliveError(context);

      switch (livelinessChecking) {
        case "error":
          throw fail$1(error);

        case "warn":
          warnError(error);
      }
    }
  };

  ObjectNode.prototype._getAssertAliveError = function (context) {
    var escapedPath = this.getEscapedPath(false) || this.pathUponDeath || "";
    var subpath = context.subpath && escapeJsonPath(context.subpath) || "";
    var actionContext = context.actionContext || getCurrentActionContext(); // try to use a real action context if possible since it includes the action name

    if (actionContext && actionContext.type !== "action" && actionContext.parentActionEvent) {
      actionContext = actionContext.parentActionEvent;
    }

    var actionFullPath = "";

    if (actionContext && actionContext.name != null) {
      // try to use the context, and if it not available use the node one
      var actionPath = actionContext && actionContext.context && getPath(actionContext.context) || escapedPath;
      actionFullPath = actionPath + "." + actionContext.name + "()";
    }

    return "You are trying to read or write to an object that is no longer part of a state tree. (Object type: '" + this.type.name + "', Path upon death: '" + escapedPath + "', Subpath: '" + subpath + "', Action: '" + actionFullPath + "'). Either detach nodes first, or don't use objects after removing / replacing them in the tree.";
  };

  ObjectNode.prototype.getChildNode = function (subpath) {
    this.assertAlive({
      subpath: subpath
    });
    this._autoUnbox = false;

    try {
      return this._observableInstanceState === 2
      /* CREATED */
      ? this.type.getChildNode(this, subpath) : this._childNodes[subpath];
    } finally {
      this._autoUnbox = true;
    }
  };

  ObjectNode.prototype.getChildren = function () {
    this.assertAlive(EMPTY_OBJECT);
    this._autoUnbox = false;

    try {
      return this._observableInstanceState === 2
      /* CREATED */
      ? this.type.getChildren(this) : convertChildNodesToArray(this._childNodes);
    } finally {
      this._autoUnbox = true;
    }
  };

  ObjectNode.prototype.getChildType = function (propertyName) {
    return this.type.getChildType(propertyName);
  };

  Object.defineProperty(ObjectNode.prototype, "isProtected", {
    get: function () {
      return this.root.isProtectionEnabled;
    },
    enumerable: true,
    configurable: true
  });

  ObjectNode.prototype.assertWritable = function (context) {
    this.assertAlive(context);

    if (!this.isRunningAction() && this.isProtected) {
      throw fail$1("Cannot modify '" + this + "', the object is protected and can only be modified by using an action.");
    }
  };

  ObjectNode.prototype.removeChild = function (subpath) {
    this.type.removeChild(this, subpath);
  }; // bound on the constructor


  ObjectNode.prototype.unbox = function (childNode) {
    if (!childNode) return childNode;
    this.assertAlive({
      subpath: childNode.subpath || childNode.subpathUponDeath
    });
    return this._autoUnbox ? childNode.value : childNode;
  };

  ObjectNode.prototype.toString = function () {
    var path = (this.isAlive ? this.path : this.pathUponDeath) || "<root>";
    var identifier = this.identifier ? "(id: " + this.identifier + ")" : "";
    return this.type.name + "@" + path + identifier + (this.isAlive ? "" : " [dead]");
  };

  ObjectNode.prototype.finalizeCreation = function () {
    var _this = this;

    this.baseFinalizeCreation(function () {
      var e_2, _a;

      try {
        for (var _b = __values(_this.getChildren()), _c = _b.next(); !_c.done; _c = _b.next()) {
          var child = _c.value;
          child.finalizeCreation();
        }
      } catch (e_2_1) {
        e_2 = {
          error: e_2_1
        };
      } finally {
        try {
          if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        } finally {
          if (e_2) throw e_2.error;
        }
      }

      _this.fireInternalHook(Hook.afterCreationFinalization);
    });
  };

  ObjectNode.prototype.detach = function () {
    if (!this.isAlive) throw fail$1("Error while detaching, node is not alive.");
    this.clearParent();
  };

  ObjectNode.prototype.preboot = function () {
    var self = this;
    this._applyPatches = createActionInvoker(this.storedValue, "@APPLY_PATCHES", function (patches) {
      patches.forEach(function (patch) {
        var parts = splitJsonPath(patch.path);
        var node = resolveNodeByPathParts(self, parts.slice(0, -1));
        node.applyPatchLocally(parts[parts.length - 1], patch);
      });
    });
    this._applySnapshot = createActionInvoker(this.storedValue, "@APPLY_SNAPSHOT", function (snapshot) {
      // if the snapshot is the same as the current one, avoid performing a reconcile
      if (snapshot === self.snapshot) return; // else, apply it by calling the type logic

      return self.type.applySnapshot(self, snapshot);
    });
    addHiddenFinalProp(this.storedValue, "$treenode", this);
    addHiddenFinalProp(this.storedValue, "toJSON", toJSON);
  };

  ObjectNode.prototype.die = function () {
    if (!this.isAlive || this.state === NodeLifeCycle.DETACHING) return;
    this.aboutToDie();
    this.finalizeDeath();
  };

  ObjectNode.prototype.aboutToDie = function () {
    if (this._observableInstanceState === 0
    /* UNINITIALIZED */
    ) {
        return;
      }

    this.getChildren().forEach(function (node) {
      node.aboutToDie();
    }); // beforeDestroy should run before the disposers since else we could end up in a situation where
    // a disposer added with addDisposer at this stage (beforeDestroy) is actually never released

    this.baseAboutToDie();

    this._internalEventsEmit("dispose"
    /* Dispose */
    );

    this._internalEventsClear("dispose"
    /* Dispose */
    );
  };

  ObjectNode.prototype.finalizeDeath = function () {
    // invariant: not called directly but from "die"
    this.getChildren().forEach(function (node) {
      node.finalizeDeath();
    });
    this.root.identifierCache.notifyDied(this); // "kill" the computed prop and just store the last snapshot

    var snapshot = this.snapshot;
    this._snapshotUponDeath = snapshot;

    this._internalEventsClearAll();

    this.baseFinalizeDeath();
  };

  ObjectNode.prototype.onSnapshot = function (onChange) {
    this._addSnapshotReaction();

    return this._internalEventsRegister("snapshot"
    /* Snapshot */
    , onChange);
  };

  ObjectNode.prototype.emitSnapshot = function (snapshot) {
    this._internalEventsEmit("snapshot"
    /* Snapshot */
    , snapshot);
  };

  ObjectNode.prototype.onPatch = function (handler) {
    return this._internalEventsRegister("patch"
    /* Patch */
    , handler);
  };

  ObjectNode.prototype.emitPatch = function (basePatch, source) {
    if (this._internalEventsHasSubscribers("patch"
    /* Patch */
    )) {
      var localizedPatch = extend({}, basePatch, {
        path: source.path.substr(this.path.length) + "/" + basePatch.path // calculate the relative path of the patch

      });

      var _a = __read(splitPatch(localizedPatch), 2),
          patch = _a[0],
          reversePatch = _a[1];

      this._internalEventsEmit("patch"
      /* Patch */
      , patch, reversePatch);
    }

    if (this.parent) this.parent.emitPatch(basePatch, source);
  };

  ObjectNode.prototype.hasDisposer = function (disposer) {
    return this._internalEventsHas("dispose"
    /* Dispose */
    , disposer);
  };

  ObjectNode.prototype.addDisposer = function (disposer) {
    if (!this.hasDisposer(disposer)) {
      this._internalEventsRegister("dispose"
      /* Dispose */
      , disposer, true);

      return;
    }

    throw fail$1("cannot add a disposer when it is already registered for execution");
  };

  ObjectNode.prototype.removeDisposer = function (disposer) {
    if (!this._internalEventsHas("dispose"
    /* Dispose */
    , disposer)) {
      throw fail$1("cannot remove a disposer which was never registered for execution");
    }

    this._internalEventsUnregister("dispose"
    /* Dispose */
    , disposer);
  };

  ObjectNode.prototype.removeMiddleware = function (middleware) {
    if (this.middlewares) {
      var index = this.middlewares.indexOf(middleware);

      if (index >= 0) {
        this.middlewares.splice(index, 1);
      }
    }
  };

  ObjectNode.prototype.addMiddleWare = function (handler, includeHooks) {
    var _this = this;

    if (includeHooks === void 0) {
      includeHooks = true;
    }

    var middleware = {
      handler: handler,
      includeHooks: includeHooks
    };
    if (!this.middlewares) this.middlewares = [middleware];else this.middlewares.push(middleware);
    return function () {
      _this.removeMiddleware(middleware);
    };
  };

  ObjectNode.prototype.applyPatchLocally = function (subpath, patch) {
    this.assertWritable({
      subpath: subpath
    });
    this.createObservableInstanceIfNeeded();
    this.type.applyPatchLocally(this, subpath, patch);
  };

  ObjectNode.prototype._addSnapshotReaction = function () {
    var _this = this;

    if (!this._hasSnapshotReaction) {
      var snapshotDisposer = (0, _mobx.reaction)(function () {
        return _this.snapshot;
      }, function (snapshot) {
        return _this.emitSnapshot(snapshot);
      }, snapshotReactionOptions);
      this.addDisposer(snapshotDisposer);
      this._hasSnapshotReaction = true;
    }
  }; // we proxy the methods to avoid creating an EventHandlers instance when it is not needed


  ObjectNode.prototype._internalEventsHasSubscribers = function (event) {
    return !!this._internalEvents && this._internalEvents.hasSubscribers(event);
  };

  ObjectNode.prototype._internalEventsRegister = function (event, eventHandler, atTheBeginning) {
    if (atTheBeginning === void 0) {
      atTheBeginning = false;
    }

    if (!this._internalEvents) {
      this._internalEvents = new EventHandlers();
    }

    return this._internalEvents.register(event, eventHandler, atTheBeginning);
  };

  ObjectNode.prototype._internalEventsHas = function (event, eventHandler) {
    return !!this._internalEvents && this._internalEvents.has(event, eventHandler);
  };

  ObjectNode.prototype._internalEventsUnregister = function (event, eventHandler) {
    if (this._internalEvents) {
      this._internalEvents.unregister(event, eventHandler);
    }
  };

  ObjectNode.prototype._internalEventsEmit = function (event) {
    var _a;

    var args = [];

    for (var _i = 1; _i < arguments.length; _i++) {
      args[_i - 1] = arguments[_i];
    }

    if (this._internalEvents) {
      (_a = this._internalEvents).emit.apply(_a, __spread([event], args));
    }
  };

  ObjectNode.prototype._internalEventsClear = function (event) {
    if (this._internalEvents) {
      this._internalEvents.clear(event);
    }
  };

  ObjectNode.prototype._internalEventsClearAll = function () {
    if (this._internalEvents) {
      this._internalEvents.clearAll();
    }
  };

  __decorate([_mobx.action], ObjectNode.prototype, "createObservableInstanceIfNeeded", null);

  __decorate([_mobx.computed], ObjectNode.prototype, "snapshot", null);

  __decorate([_mobx.action], ObjectNode.prototype, "detach", null);

  __decorate([_mobx.action], ObjectNode.prototype, "die", null);

  return ObjectNode;
}(BaseNode);
/**
 * @internal
 * @hidden
 */


var TypeFlags;

(function (TypeFlags) {
  TypeFlags[TypeFlags["String"] = 1] = "String";
  TypeFlags[TypeFlags["Number"] = 2] = "Number";
  TypeFlags[TypeFlags["Boolean"] = 4] = "Boolean";
  TypeFlags[TypeFlags["Date"] = 8] = "Date";
  TypeFlags[TypeFlags["Literal"] = 16] = "Literal";
  TypeFlags[TypeFlags["Array"] = 32] = "Array";
  TypeFlags[TypeFlags["Map"] = 64] = "Map";
  TypeFlags[TypeFlags["Object"] = 128] = "Object";
  TypeFlags[TypeFlags["Frozen"] = 256] = "Frozen";
  TypeFlags[TypeFlags["Optional"] = 512] = "Optional";
  TypeFlags[TypeFlags["Reference"] = 1024] = "Reference";
  TypeFlags[TypeFlags["Identifier"] = 2048] = "Identifier";
  TypeFlags[TypeFlags["Late"] = 4096] = "Late";
  TypeFlags[TypeFlags["Refinement"] = 8192] = "Refinement";
  TypeFlags[TypeFlags["Union"] = 16384] = "Union";
  TypeFlags[TypeFlags["Null"] = 32768] = "Null";
  TypeFlags[TypeFlags["Undefined"] = 65536] = "Undefined";
  TypeFlags[TypeFlags["Integer"] = 131072] = "Integer";
  TypeFlags[TypeFlags["Custom"] = 262144] = "Custom";
  TypeFlags[TypeFlags["SnapshotProcessor"] = 524288] = "SnapshotProcessor";
})(TypeFlags || (TypeFlags = {}));
/**
 * @internal
 * @hidden
 */


var cannotDetermineSubtype = "cannotDetermine";
/**
 * A base type produces a MST node (Node in the state tree)
 *
 * @internal
 * @hidden
 */

var BaseType =
/** @class */
function () {
  function BaseType(name) {
    this.isType = true;
    this.name = name;
  }

  BaseType.prototype.create = function (snapshot, environment) {
    typecheckInternal(this, snapshot);
    return this.instantiate(null, "", environment, snapshot).value;
  };

  BaseType.prototype.getSnapshot = function (node, applyPostProcess) {
    // istanbul ignore next
    throw fail$1("unimplemented method");
  };

  BaseType.prototype.isAssignableFrom = function (type) {
    return type === this;
  };

  BaseType.prototype.validate = function (value, context) {
    var node = getStateTreeNodeSafe(value);

    if (node) {
      var valueType = getType(value);
      return this.isAssignableFrom(valueType) ? typeCheckSuccess() : typeCheckFailure(context, value); // it is tempting to compare snapshots, but in that case we should always clone on assignments...
    }

    return this.isValidSnapshot(value, context);
  };

  BaseType.prototype.is = function (thing) {
    return this.validate(thing, [{
      path: "",
      type: this
    }]).length === 0;
  };

  Object.defineProperty(BaseType.prototype, "Type", {
    get: function () {
      // istanbul ignore next
      throw fail$1("Factory.Type should not be actually called. It is just a Type signature that can be used at compile time with Typescript, by using `typeof type.Type`");
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(BaseType.prototype, "TypeWithoutSTN", {
    get: function () {
      // istanbul ignore next
      throw fail$1("Factory.TypeWithoutSTN should not be actually called. It is just a Type signature that can be used at compile time with Typescript, by using `typeof type.TypeWithoutSTN`");
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(BaseType.prototype, "SnapshotType", {
    get: function () {
      // istanbul ignore next
      throw fail$1("Factory.SnapshotType should not be actually called. It is just a Type signature that can be used at compile time with Typescript, by using `typeof type.SnapshotType`");
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(BaseType.prototype, "CreationType", {
    get: function () {
      // istanbul ignore next
      throw fail$1("Factory.CreationType should not be actually called. It is just a Type signature that can be used at compile time with Typescript, by using `typeof type.CreationType`");
    },
    enumerable: true,
    configurable: true
  });

  __decorate([_mobx.action], BaseType.prototype, "create", null);

  return BaseType;
}();
/**
 * A complex type produces a MST node (Node in the state tree)
 *
 * @internal
 * @hidden
 */


var ComplexType =
/** @class */
function (_super) {
  __extends(ComplexType, _super);

  function ComplexType(name) {
    return _super.call(this, name) || this;
  }

  ComplexType.prototype.create = function (snapshot, environment) {
    if (snapshot === void 0) {
      snapshot = this.getDefaultSnapshot();
    }

    return _super.prototype.create.call(this, snapshot, environment);
  };

  ComplexType.prototype.getValue = function (node) {
    node.createObservableInstanceIfNeeded();
    return node.storedValue;
  };

  ComplexType.prototype.tryToReconcileNode = function (current, newValue) {
    if (current.isDetaching) return false;

    if (current.snapshot === newValue) {
      // newValue is the current snapshot of the node, noop
      return true;
    }

    if (isStateTreeNode(newValue) && getStateTreeNode(newValue) === current) {
      // the current node is the same as the new one
      return true;
    }

    if (current.type === this && isMutable(newValue) && !isStateTreeNode(newValue) && (!current.identifierAttribute || current.identifier === normalizeIdentifier(newValue[current.identifierAttribute]))) {
      // the newValue has no node, so can be treated like a snapshot
      // we can reconcile
      current.applySnapshot(newValue);
      return true;
    }

    return false;
  };

  ComplexType.prototype.reconcile = function (current, newValue, parent, subpath) {
    var nodeReconciled = this.tryToReconcileNode(current, newValue);

    if (nodeReconciled) {
      current.setParent(parent, subpath);
      return current;
    } // current node cannot be recycled in any way


    current.die(); // noop if detaching
    // attempt to reuse the new one

    if (isStateTreeNode(newValue) && this.isAssignableFrom(getType(newValue))) {
      // newValue is a Node as well, move it here..
      var newNode = getStateTreeNode(newValue);
      newNode.setParent(parent, subpath);
      return newNode;
    } // nothing to do, we have to create a new node


    return this.instantiate(parent, subpath, undefined, newValue);
  };

  ComplexType.prototype.getSubTypes = function () {
    return null;
  };

  __decorate([_mobx.action], ComplexType.prototype, "create", null);

  return ComplexType;
}(BaseType);
/**
 * @internal
 * @hidden
 */


var SimpleType =
/** @class */
function (_super) {
  __extends(SimpleType, _super);

  function SimpleType() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  SimpleType.prototype.createNewInstance = function (snapshot) {
    return snapshot;
  };

  SimpleType.prototype.getValue = function (node) {
    // if we ever find a case where scalar nodes can be accessed without iterating through its parent
    // uncomment this to make sure the parent chain is created when this is accessed
    // if (node.parent) {
    //     node.parent.createObservableInstanceIfNeeded()
    // }
    return node.storedValue;
  };

  SimpleType.prototype.getSnapshot = function (node) {
    return node.storedValue;
  };

  SimpleType.prototype.reconcile = function (current, newValue, parent, subpath) {
    // reconcile only if type and value are still the same, and only if the node is not detaching
    if (!current.isDetaching && current.type === this && current.storedValue === newValue) {
      return current;
    }

    var res = this.instantiate(parent, subpath, undefined, newValue);
    current.die(); // noop if detaching

    return res;
  };

  SimpleType.prototype.getSubTypes = function () {
    return null;
  };

  return SimpleType;
}(BaseType);
/**
 * Returns if a given value represents a type.
 *
 * @param value Value to check.
 * @returns `true` if the value is a type.
 */


function isType(value) {
  return typeof value === "object" && value && value.isType === true;
}
/**
 * @internal
 * @hidden
 */


function assertIsType(type, argNumber) {
  assertArg(type, isType, "mobx-state-tree type", argNumber);
}

var runningActions = new Map();
/**
 * Note: Consider migrating to `createActionTrackingMiddleware2`, it is easier to use.
 *
 * Convenience utility to create action based middleware that supports async processes more easily.
 * All hooks are called for both synchronous and asynchronous actions. Except that either `onSuccess` or `onFail` is called
 *
 * The create middleware tracks the process of an action (assuming it passes the `filter`).
 * `onResume` can return any value, which will be passed as second argument to any other hook. This makes it possible to keep state during a process.
 *
 * See the `atomic` middleware for an example
 *
 * @param hooks
 * @returns
 */

function createActionTrackingMiddleware(hooks) {
  return function actionTrackingMiddleware(call, next, abort) {
    switch (call.type) {
      case "action":
        {
          if (!hooks.filter || hooks.filter(call) === true) {
            var context = hooks.onStart(call);
            hooks.onResume(call, context);
            runningActions.set(call.id, {
              call: call,
              context: context,
              async: false
            });

            try {
              var res = next(call);
              hooks.onSuspend(call, context);

              if (runningActions.get(call.id).async === false) {
                runningActions.delete(call.id);
                hooks.onSuccess(call, context, res);
              }

              return res;
            } catch (e) {
              runningActions.delete(call.id);
              hooks.onFail(call, context, e);
              throw e;
            }
          } else {
            return next(call);
          }
        }

      case "flow_spawn":
        {
          var root = runningActions.get(call.rootId);
          root.async = true;
          return next(call);
        }

      case "flow_resume":
      case "flow_resume_error":
        {
          var root = runningActions.get(call.rootId);
          hooks.onResume(call, root.context);

          try {
            return next(call);
          } finally {
            hooks.onSuspend(call, root.context);
          }
        }

      case "flow_throw":
        {
          var root = runningActions.get(call.rootId);
          runningActions.delete(call.rootId);
          hooks.onFail(call, root.context, call.args[0]);
          return next(call);
        }

      case "flow_return":
        {
          var root = runningActions.get(call.rootId);
          runningActions.delete(call.rootId);
          hooks.onSuccess(call, root.context, call.args[0]);
          return next(call);
        }
    }
  };
}

var RunningAction =
/** @class */
function () {
  function RunningAction(hooks, call) {
    this.hooks = hooks;
    this.call = call;
    this.flowsPending = 0;
    this.running = true;

    if (hooks) {
      hooks.onStart(call);
    }
  }

  RunningAction.prototype.finish = function (error) {
    if (this.running) {
      this.running = false;

      if (this.hooks) {
        this.hooks.onFinish(this.call, error);
      }
    }
  };

  RunningAction.prototype.incFlowsPending = function () {
    this.flowsPending++;
  };

  RunningAction.prototype.decFlowsPending = function () {
    this.flowsPending--;
  };

  Object.defineProperty(RunningAction.prototype, "hasFlowsPending", {
    get: function () {
      return this.flowsPending > 0;
    },
    enumerable: true,
    configurable: true
  });
  return RunningAction;
}();
/**
 * Convenience utility to create action based middleware that supports async processes more easily.
 * The flow is like this:
 * - for each action: if filter passes -> `onStart` -> (inner actions recursively) -> `onFinish`
 *
 * Example: if we had an action `a` that called inside an action `b1`, then `b2` the flow would be:
 * - `filter(a)`
 * - `onStart(a)`
 *   - `filter(b1)`
 *   - `onStart(b1)`
 *   - `onFinish(b1)`
 *   - `filter(b2)`
 *   - `onStart(b2)`
 *   - `onFinish(b2)`
 * - `onFinish(a)`
 *
 * The flow is the same no matter if the actions are sync or async.
 *
 * See the `atomic` middleware for an example
 *
 * @param hooks
 * @returns
 */


function createActionTrackingMiddleware2(middlewareHooks) {
  var runningActions = new WeakMap();
  return function actionTrackingMiddleware(call, next) {
    // find parentRunningAction
    var parentRunningAction = call.parentActionEvent ? runningActions.get(call.parentActionEvent) : undefined;

    if (call.type === "action") {
      var newCall = __assign(__assign({}, call), {
        // make a shallow copy of the parent action env
        env: parentRunningAction && parentRunningAction.call.env,
        parentCall: parentRunningAction && parentRunningAction.call
      });

      var passesFilter = !middlewareHooks.filter || middlewareHooks.filter(newCall);
      var hooks = passesFilter ? middlewareHooks : undefined;
      var runningAction = new RunningAction(hooks, newCall);
      runningActions.set(call, runningAction);
      var res = void 0;

      try {
        res = next(call);
      } catch (e) {
        runningAction.finish(e);
        throw e;
      }

      if (!runningAction.hasFlowsPending) {
        // sync action finished
        runningAction.finish();
      }

      return res;
    } else {
      if (!parentRunningAction) {
        return next(call);
      }

      switch (call.type) {
        case "flow_spawn":
          {
            parentRunningAction.incFlowsPending();
            return next(call);
          }

        case "flow_resume":
        case "flow_resume_error":
          {
            return next(call);
          }

        case "flow_throw":
          {
            var error = call.args[0];

            try {
              return next(call);
            } finally {
              parentRunningAction.decFlowsPending();

              if (!parentRunningAction.hasFlowsPending) {
                parentRunningAction.finish(error);
              }
            }
          }

        case "flow_return":
          {
            try {
              return next(call);
            } finally {
              parentRunningAction.decFlowsPending();

              if (!parentRunningAction.hasFlowsPending) {
                parentRunningAction.finish();
              }
            }
          }
      }
    }
  };
}

function serializeArgument(node, actionName, index, arg) {
  if (arg instanceof Date) return {
    $MST_DATE: arg.getTime()
  };
  if (isPrimitive(arg)) return arg; // We should not serialize MST nodes, even if we can, because we don't know if the receiving party can handle a raw snapshot instead of an
  // MST type instance. So if one wants to serialize a MST node that was pass in, either explitly pass: 1: an id, 2: a (relative) path, 3: a snapshot

  if (isStateTreeNode(arg)) return serializeTheUnserializable("[MSTNode: " + getType(arg).name + "]");
  if (typeof arg === "function") return serializeTheUnserializable("[function]");
  if (typeof arg === "object" && !isPlainObject(arg) && !isArray(arg)) return serializeTheUnserializable("[object " + (arg && arg.constructor && arg.constructor.name || "Complex Object") + "]");

  try {
    // Check if serializable, cycle free etc...
    // MWE: there must be a better way....
    JSON.stringify(arg); // or throws

    return arg;
  } catch (e) {
    return serializeTheUnserializable("" + e);
  }
}

function deserializeArgument(adm, value) {
  if (value && typeof value === "object" && "$MST_DATE" in value) return new Date(value["$MST_DATE"]);
  return value;
}

function serializeTheUnserializable(baseType) {
  return {
    $MST_UNSERIALIZABLE: true,
    type: baseType
  };
}
/**
 * Applies an action or a series of actions in a single MobX transaction.
 * Does not return any value
 * Takes an action description as produced by the `onAction` middleware.
 *
 * @param target
 * @param actions
 */


function applyAction(target, actions) {
  // check all arguments
  assertIsStateTreeNode(target, 1);
  assertArg(actions, function (a) {
    return typeof a === "object";
  }, "object or array", 2);
  (0, _mobx.runInAction)(function () {
    asArray(actions).forEach(function (action) {
      return baseApplyAction(target, action);
    });
  });
}

function baseApplyAction(target, action) {
  var resolvedTarget = tryResolve(target, action.path || "");
  if (!resolvedTarget) throw fail$1("Invalid action path: " + (action.path || ""));
  var node = getStateTreeNode(resolvedTarget); // Reserved functions

  if (action.name === "@APPLY_PATCHES") {
    return applyPatch.call(null, resolvedTarget, action.args[0]);
  }

  if (action.name === "@APPLY_SNAPSHOT") {
    return applySnapshot.call(null, resolvedTarget, action.args[0]);
  }

  if (!(typeof resolvedTarget[action.name] === "function")) throw fail$1("Action '" + action.name + "' does not exist in '" + node.path + "'");
  return resolvedTarget[action.name].apply(resolvedTarget, action.args ? action.args.map(function (v) {
    return deserializeArgument(node, v);
  }) : []);
}
/**
 * Small abstraction around `onAction` and `applyAction`, attaches an action listener to a tree and records all the actions emitted.
 * Returns an recorder object with the following signature:
 *
 * Example:
 * ```ts
 * export interface IActionRecorder {
 *      // the recorded actions
 *      actions: ISerializedActionCall[]
 *      // true if currently recording
 *      recording: boolean
 *      // stop recording actions
 *      stop(): void
 *      // resume recording actions
 *      resume(): void
 *      // apply all the recorded actions on the given object
 *      replay(target: IAnyStateTreeNode): void
 * }
 * ```
 *
 * The optional filter function allows to skip recording certain actions.
 *
 * @param subject
 * @returns
 */


function recordActions(subject, filter) {
  // check all arguments
  assertIsStateTreeNode(subject, 1);
  var actions = [];

  var listener = function (call) {
    var recordThis = filter ? filter(call, getRunningActionContext()) : true;

    if (recordThis) {
      actions.push(call);
    }
  };

  var disposer;
  var recorder = {
    actions: actions,

    get recording() {
      return !!disposer;
    },

    stop: function () {
      if (disposer) {
        disposer();
        disposer = undefined;
      }
    },
    resume: function () {
      if (disposer) return;
      disposer = onAction(subject, listener);
    },
    replay: function (target) {
      applyAction(target, actions);
    }
  };
  recorder.resume();
  return recorder;
}
/**
 * Registers a function that will be invoked for each action that is called on the provided model instance, or to any of its children.
 * See [actions](https://github.com/mobxjs/mobx-state-tree#actions) for more details. onAction events are emitted only for the outermost called action in the stack.
 * Action can also be intercepted by middleware using addMiddleware to change the function call before it will be run.
 *
 * Not all action arguments might be serializable. For unserializable arguments, a struct like `{ $MST_UNSERIALIZABLE: true, type: "someType" }` will be generated.
 * MST Nodes are considered non-serializable as well (they could be serialized as there snapshot, but it is uncertain whether an replaying party will be able to handle such a non-instantiated snapshot).
 * Rather, when using `onAction` middleware, one should consider in passing arguments which are 1: an id, 2: a (relative) path, or 3: a snapshot. Instead of a real MST node.
 *
 * Example:
 * ```ts
 * const Todo = types.model({
 *   task: types.string
 * })
 *
 * const TodoStore = types.model({
 *   todos: types.array(Todo)
 * }).actions(self => ({
 *   add(todo) {
 *     self.todos.push(todo);
 *   }
 * }))
 *
 * const s = TodoStore.create({ todos: [] })
 *
 * let disposer = onAction(s, (call) => {
 *   console.log(call);
 * })
 *
 * s.add({ task: "Grab a coffee" })
 * // Logs: { name: "add", path: "", args: [{ task: "Grab a coffee" }] }
 * ```
 *
 * @param target
 * @param listener
 * @param attachAfter (default false) fires the listener *after* the action has executed instead of before.
 * @returns
 */


function onAction(target, listener, attachAfter) {
  if (attachAfter === void 0) {
    attachAfter = false;
  } // check all arguments


  assertIsStateTreeNode(target, 1);

  if (devMode()) {
    if (!isRoot(target)) warnError("Warning: Attaching onAction listeners to non root nodes is dangerous: No events will be emitted for actions initiated higher up in the tree.");
    if (!isProtected(target)) warnError("Warning: Attaching onAction listeners to non protected nodes is dangerous: No events will be emitted for direct modifications without action.");
  }

  return addMiddleware(target, function handler(rawCall, next) {
    if (rawCall.type === "action" && rawCall.id === rawCall.rootId) {
      var sourceNode_1 = getStateTreeNode(rawCall.context);
      var info = {
        name: rawCall.name,
        path: getRelativePathBetweenNodes(getStateTreeNode(target), sourceNode_1),
        args: rawCall.args.map(function (arg, index) {
          return serializeArgument(sourceNode_1, rawCall.name, index, arg);
        })
      };

      if (attachAfter) {
        var res = next(rawCall);
        listener(info);
        return res;
      } else {
        listener(info);
        return next(rawCall);
      }
    } else {
      return next(rawCall);
    }
  });
}

var nextActionId = 1;
var currentActionContext;
/**
 * @internal
 * @hidden
 */

function getCurrentActionContext() {
  return currentActionContext;
}
/**
 * @internal
 * @hidden
 */


function getNextActionId() {
  return nextActionId++;
} // TODO: optimize away entire action context if there is no middleware in tree?

/**
 * @internal
 * @hidden
 */


function runWithActionContext(context, fn) {
  var node = getStateTreeNode(context.context);

  if (context.type === "action") {
    node.assertAlive({
      actionContext: context
    });
  }

  var baseIsRunningAction = node._isRunningAction;
  node._isRunningAction = true;
  var previousContext = currentActionContext;
  currentActionContext = context;

  try {
    return runMiddleWares(node, context, fn);
  } finally {
    currentActionContext = previousContext;
    node._isRunningAction = baseIsRunningAction;
  }
}
/**
 * @internal
 * @hidden
 */


function getParentActionContext(parentContext) {
  if (!parentContext) return undefined;
  if (parentContext.type === "action") return parentContext;
  return parentContext.parentActionEvent;
}
/**
 * @internal
 * @hidden
 */


function createActionInvoker(target, name, fn) {
  var res = function () {
    var id = getNextActionId();
    var parentContext = currentActionContext;
    var parentActionContext = getParentActionContext(parentContext);
    return runWithActionContext({
      type: "action",
      name: name,
      id: id,
      args: argsToArray(arguments),
      context: target,
      tree: getRoot(target),
      rootId: parentContext ? parentContext.rootId : id,
      parentId: parentContext ? parentContext.id : 0,
      allParentIds: parentContext ? __spread(parentContext.allParentIds, [parentContext.id]) : [],
      parentEvent: parentContext,
      parentActionEvent: parentActionContext
    }, fn);
  };

  res._isMSTAction = true;
  return res;
}
/**
 * Middleware can be used to intercept any action is invoked on the subtree where it is attached.
 * If a tree is protected (by default), this means that any mutation of the tree will pass through your middleware.
 *
 * For more details, see the [middleware docs](../middleware.md)
 *
 * @param target Node to apply the middleware to.
 * @param middleware Middleware to apply.
 * @returns A callable function to dispose the middleware.
 */


function addMiddleware(target, handler, includeHooks) {
  if (includeHooks === void 0) {
    includeHooks = true;
  }

  var node = getStateTreeNode(target);

  if (devMode()) {
    if (!node.isProtectionEnabled) {
      warnError("It is recommended to protect the state tree before attaching action middleware, as otherwise it cannot be guaranteed that all changes are passed through middleware. See `protect`");
    }
  }

  return node.addMiddleWare(handler, includeHooks);
}
/**
 * Binds middleware to a specific action.
 *
 * Example:
 * ```ts
 * type.actions(self => {
 *   function takeA____() {
 *       self.toilet.donate()
 *       self.wipe()
 *       self.wipe()
 *       self.toilet.flush()
 *   }
 *   return {
 *     takeA____: decorate(atomic, takeA____)
 *   }
 * })
 * ```
 *
 * @param handler
 * @param fn
 * @param includeHooks
 * @returns The original function
 */


function decorate(handler, fn, includeHooks) {
  if (includeHooks === void 0) {
    includeHooks = true;
  }

  var middleware = {
    handler: handler,
    includeHooks: includeHooks
  };
  fn.$mst_middleware = fn.$mst_middleware || [];
  fn.$mst_middleware.push(middleware);
  return fn;
}

var CollectedMiddlewares =
/** @class */
function () {
  function CollectedMiddlewares(node, fn) {
    this.arrayIndex = 0;
    this.inArrayIndex = 0;
    this.middlewares = []; // we just push middleware arrays into an array of arrays to avoid making copies

    if (fn.$mst_middleware) {
      this.middlewares.push(fn.$mst_middleware);
    }

    var n = node; // Find all middlewares. Optimization: cache this?

    while (n) {
      if (n.middlewares) this.middlewares.push(n.middlewares);
      n = n.parent;
    }
  }

  Object.defineProperty(CollectedMiddlewares.prototype, "isEmpty", {
    get: function () {
      return this.middlewares.length <= 0;
    },
    enumerable: true,
    configurable: true
  });

  CollectedMiddlewares.prototype.getNextMiddleware = function () {
    var array = this.middlewares[this.arrayIndex];
    if (!array) return undefined;
    var item = array[this.inArrayIndex++];

    if (!item) {
      this.arrayIndex++;
      this.inArrayIndex = 0;
      return this.getNextMiddleware();
    }

    return item;
  };

  return CollectedMiddlewares;
}();

function runMiddleWares(node, baseCall, originalFn) {
  var middlewares = new CollectedMiddlewares(node, originalFn); // Short circuit

  if (middlewares.isEmpty) return (0, _mobx.action)(originalFn).apply(null, baseCall.args);
  var result = null;

  function runNextMiddleware(call) {
    var middleware = middlewares.getNextMiddleware();
    var handler = middleware && middleware.handler;

    if (!handler) {
      return (0, _mobx.action)(originalFn).apply(null, call.args);
    } // skip hooks if asked to


    if (!middleware.includeHooks && Hook[call.name]) {
      return runNextMiddleware(call);
    }

    var nextInvoked = false;

    function next(call2, callback) {
      nextInvoked = true; // the result can contain
      // - the non manipulated return value from an action
      // - the non manipulated abort value
      // - one of the above but manipulated through the callback function

      result = runNextMiddleware(call2);

      if (callback) {
        result = callback(result);
      }
    }

    var abortInvoked = false;

    function abort(value) {
      abortInvoked = true; // overwrite the result
      // can be manipulated through middlewares earlier in the queue using the callback fn

      result = value;
    }

    handler(call, next, abort);

    if (devMode()) {
      if (!nextInvoked && !abortInvoked) {
        var node2 = getStateTreeNode(call.tree);
        throw fail$1("Neither the next() nor the abort() callback within the middleware " + handler.name + " for the action: \"" + call.name + "\" on the node: " + node2.type.name + " was invoked.");
      } else if (nextInvoked && abortInvoked) {
        var node2 = getStateTreeNode(call.tree);
        throw fail$1("The next() and abort() callback within the middleware " + handler.name + " for the action: \"" + call.name + "\" on the node: " + node2.type.name + " were invoked.");
      }
    }

    return result;
  }

  return runNextMiddleware(baseCall);
}
/**
 * Returns the currently executing MST action context, or undefined if none.
 */


function getRunningActionContext() {
  var current = getCurrentActionContext();

  while (current && current.type !== "action") {
    current = current.parentActionEvent;
  }

  return current;
}

function _isActionContextThisOrChildOf(actionContext, sameOrParent, includeSame) {
  var parentId = typeof sameOrParent === "number" ? sameOrParent : sameOrParent.id;
  var current = includeSame ? actionContext : actionContext.parentActionEvent;

  while (current) {
    if (current.id === parentId) {
      return true;
    }

    current = current.parentActionEvent;
  }

  return false;
}
/**
 * Returns if the given action context is a parent of this action context.
 */


function isActionContextChildOf(actionContext, parent) {
  return _isActionContextThisOrChildOf(actionContext, parent, false);
}
/**
 * Returns if the given action context is this or a parent of this action context.
 */


function isActionContextThisOrChildOf(actionContext, parentOrThis) {
  return _isActionContextThisOrChildOf(actionContext, parentOrThis, true);
}

function safeStringify(value) {
  try {
    return JSON.stringify(value);
  } catch (e) {
    // istanbul ignore next
    return "<Unserializable: " + e + ">";
  }
}
/**
 * @internal
 * @hidden
 */


function prettyPrintValue(value) {
  return typeof value === "function" ? "<function" + (value.name ? " " + value.name : "") + ">" : isStateTreeNode(value) ? "<" + value + ">" : "`" + safeStringify(value) + "`";
}

function shortenPrintValue(valueInString) {
  return valueInString.length < 280 ? valueInString : valueInString.substring(0, 272) + "......" + valueInString.substring(valueInString.length - 8);
}

function toErrorString(error) {
  var value = error.value;
  var type = error.context[error.context.length - 1].type;
  var fullPath = error.context.map(function (_a) {
    var path = _a.path;
    return path;
  }).filter(function (path) {
    return path.length > 0;
  }).join("/");
  var pathPrefix = fullPath.length > 0 ? "at path \"/" + fullPath + "\" " : "";
  var currentTypename = isStateTreeNode(value) ? "value of type " + getStateTreeNode(value).type.name + ":" : isPrimitive(value) ? "value" : "snapshot";
  var isSnapshotCompatible = type && isStateTreeNode(value) && type.is(getStateTreeNode(value).snapshot);
  return "" + pathPrefix + currentTypename + " " + prettyPrintValue(value) + " is not assignable " + (type ? "to type: `" + type.name + "`" : "") + (error.message ? " (" + error.message + ")" : "") + (type ? isPrimitiveType(type) || isPrimitive(value) ? "." : ", expected an instance of `" + type.name + "` or a snapshot like `" + type.describe() + "` instead." + (isSnapshotCompatible ? " (Note that a snapshot of the provided value is compatible with the targeted type)" : "") : ".");
}
/**
 * @internal
 * @hidden
 */


function getContextForPath(context, path, type) {
  return context.concat([{
    path: path,
    type: type
  }]);
}
/**
 * @internal
 * @hidden
 */


function typeCheckSuccess() {
  return EMPTY_ARRAY;
}
/**
 * @internal
 * @hidden
 */


function typeCheckFailure(context, value, message) {
  return [{
    context: context,
    value: value,
    message: message
  }];
}
/**
 * @internal
 * @hidden
 */


function flattenTypeErrors(errors) {
  return errors.reduce(function (a, i) {
    return a.concat(i);
  }, []);
} // TODO; doublecheck: typecheck should only needed to be invoked from: type.create and array / map / value.property will change

/**
 * @internal
 * @hidden
 */


function typecheckInternal(type, value) {
  // runs typeChecking if it is in dev-mode or through a process.env.ENABLE_TYPE_CHECK flag
  if (isTypeCheckingEnabled()) {
    typecheck(type, value);
  }
}
/**
 * Run's the typechecker for the given type on the given value, which can be a snapshot or an instance.
 * Throws if the given value is not according the provided type specification.
 * Use this if you need typechecks even in a production build (by default all automatic runtime type checks will be skipped in production builds)
 *
 * @param type Type to check against.
 * @param value Value to be checked, either a snapshot or an instance.
 */


function typecheck(type, value) {
  var errors = type.validate(value, [{
    path: "",
    type: type
  }]);

  if (errors.length > 0) {
    throw fail$1(validationErrorsToString(type, value, errors));
  }
}

function validationErrorsToString(type, value, errors) {
  if (errors.length === 0) {
    return undefined;
  }

  return "Error while converting " + shortenPrintValue(prettyPrintValue(value)) + " to `" + type.name + "`:\n\n    " + errors.map(toErrorString).join("\n    ");
}

var identifierCacheId = 0;
/**
 * @internal
 * @hidden
 */

var IdentifierCache =
/** @class */
function () {
  function IdentifierCache() {
    this.cacheId = identifierCacheId++; // n.b. in cache all identifiers are normalized to strings

    this.cache = _mobx.observable.map(); // last time the cache (array) for a given time changed
    // n.b. it is not really the time, but just an integer that gets increased after each modification to the array

    this.lastCacheModificationPerId = _mobx.observable.map();
  }

  IdentifierCache.prototype.updateLastCacheModificationPerId = function (identifier) {
    var lcm = this.lastCacheModificationPerId.get(identifier); // we start at 1 since 0 means no update since cache creation

    this.lastCacheModificationPerId.set(identifier, lcm === undefined ? 1 : lcm + 1);
  };

  IdentifierCache.prototype.getLastCacheModificationPerId = function (identifier) {
    var modificationId = this.lastCacheModificationPerId.get(identifier) || 0;
    return this.cacheId + "-" + modificationId;
  };

  IdentifierCache.prototype.addNodeToCache = function (node, lastCacheUpdate) {
    if (lastCacheUpdate === void 0) {
      lastCacheUpdate = true;
    }

    if (node.identifierAttribute) {
      var identifier = node.identifier;

      if (!this.cache.has(identifier)) {
        this.cache.set(identifier, _mobx.observable.array([], mobxShallow));
      }

      var set = this.cache.get(identifier);
      if (set.indexOf(node) !== -1) throw fail$1("Already registered");
      set.push(node);

      if (lastCacheUpdate) {
        this.updateLastCacheModificationPerId(identifier);
      }
    }
  };

  IdentifierCache.prototype.mergeCache = function (node) {
    var _this = this;

    (0, _mobx.values)(node.identifierCache.cache).forEach(function (nodes) {
      return nodes.forEach(function (child) {
        _this.addNodeToCache(child);
      });
    });
  };

  IdentifierCache.prototype.notifyDied = function (node) {
    if (node.identifierAttribute) {
      var id = node.identifier;
      var set = this.cache.get(id);

      if (set) {
        set.remove(node); // remove empty sets from cache

        if (!set.length) {
          this.cache.delete(id);
        }

        this.updateLastCacheModificationPerId(node.identifier);
      }
    }
  };

  IdentifierCache.prototype.splitCache = function (node) {
    var _this = this;

    var res = new IdentifierCache();
    var basePath = node.path;
    (0, _mobx.entries)(this.cache).forEach(function (_a) {
      var _b = __read(_a, 2),
          id = _b[0],
          nodes = _b[1];

      var modified = false;

      for (var i = nodes.length - 1; i >= 0; i--) {
        if (nodes[i].path.indexOf(basePath) === 0) {
          res.addNodeToCache(nodes[i], false); // no need to update lastUpdated since it is a whole new cache

          nodes.splice(i, 1);
          modified = true;
        }
      }

      if (modified) {
        _this.updateLastCacheModificationPerId(id);
      }
    });
    return res;
  };

  IdentifierCache.prototype.has = function (type, identifier) {
    var set = this.cache.get(identifier);
    if (!set) return false;
    return set.some(function (candidate) {
      return type.isAssignableFrom(candidate.type);
    });
  };

  IdentifierCache.prototype.resolve = function (type, identifier) {
    var set = this.cache.get(identifier);
    if (!set) return null;
    var matches = set.filter(function (candidate) {
      return type.isAssignableFrom(candidate.type);
    });

    switch (matches.length) {
      case 0:
        return null;

      case 1:
        return matches[0];

      default:
        throw fail$1("Cannot resolve a reference to type '" + type.name + "' with id: '" + identifier + "' unambigously, there are multiple candidates: " + matches.map(function (n) {
          return n.path;
        }).join(", "));
    }
  };

  return IdentifierCache;
}();
/**
 * @internal
 * @hidden
 */


function createObjectNode(type, parent, subpath, environment, initialValue) {
  var existingNode = getStateTreeNodeSafe(initialValue);

  if (existingNode) {
    if (existingNode.parent) {
      // istanbul ignore next
      throw fail$1("Cannot add an object to a state tree if it is already part of the same or another state tree. Tried to assign an object to '" + (parent ? parent.path : "") + "/" + subpath + "', but it lives already at '" + existingNode.path + "'");
    }

    if (parent) {
      existingNode.setParent(parent, subpath);
    } // else it already has no parent since it is a pre-requisite


    return existingNode;
  } // not a node, a snapshot


  return new ObjectNode(type, parent, subpath, environment, initialValue);
}
/**
 * @internal
 * @hidden
 */


function createScalarNode(type, parent, subpath, environment, initialValue) {
  return new ScalarNode(type, parent, subpath, environment, initialValue);
}
/**
 * @internal
 * @hidden
 */


function isNode(value) {
  return value instanceof ScalarNode || value instanceof ObjectNode;
}
/**
 * @internal
 * @hidden
 */


var NodeLifeCycle;

(function (NodeLifeCycle) {
  NodeLifeCycle[NodeLifeCycle["INITIALIZING"] = 0] = "INITIALIZING";
  NodeLifeCycle[NodeLifeCycle["CREATED"] = 1] = "CREATED";
  NodeLifeCycle[NodeLifeCycle["FINALIZED"] = 2] = "FINALIZED";
  NodeLifeCycle[NodeLifeCycle["DETACHING"] = 3] = "DETACHING";
  NodeLifeCycle[NodeLifeCycle["DEAD"] = 4] = "DEAD"; // no coming back from this one
})(NodeLifeCycle || (NodeLifeCycle = {}));
/**
 * Returns true if the given value is a node in a state tree.
 * More precisely, that is, if the value is an instance of a
 * `types.model`, `types.array` or `types.map`.
 *
 * @param value
 * @returns true if the value is a state tree node.
 */


function isStateTreeNode(value) {
  return !!(value && value.$treenode);
}
/**
 * @internal
 * @hidden
 */


function assertIsStateTreeNode(value, argNumber) {
  assertArg(value, isStateTreeNode, "mobx-state-tree node", argNumber);
}
/**
 * @internal
 * @hidden
 */


function getStateTreeNode(value) {
  if (!isStateTreeNode(value)) {
    // istanbul ignore next
    throw fail$1("Value " + value + " is no MST Node");
  }

  return value.$treenode;
}
/**
 * @internal
 * @hidden
 */


function getStateTreeNodeSafe(value) {
  return value && value.$treenode || null;
}
/**
 * @internal
 * @hidden
 */


function toJSON() {
  return getStateTreeNode(this).snapshot;
}

var doubleDot = function (_) {
  return "..";
};
/**
 * @internal
 * @hidden
 */


function getRelativePathBetweenNodes(base, target) {
  // PRE condition target is (a child of) base!
  if (base.root !== target.root) {
    throw fail$1("Cannot calculate relative path: objects '" + base + "' and '" + target + "' are not part of the same object tree");
  }

  var baseParts = splitJsonPath(base.path);
  var targetParts = splitJsonPath(target.path);
  var common = 0;

  for (; common < baseParts.length; common++) {
    if (baseParts[common] !== targetParts[common]) break;
  } // TODO: assert that no targetParts paths are "..", "." or ""!


  return baseParts.slice(common).map(doubleDot).join("/") + joinJsonPath(targetParts.slice(common));
}
/**
 * @internal
 * @hidden
 */


function resolveNodeByPath(base, path, failIfResolveFails) {
  if (failIfResolveFails === void 0) {
    failIfResolveFails = true;
  }

  return resolveNodeByPathParts(base, splitJsonPath(path), failIfResolveFails);
}
/**
 * @internal
 * @hidden
 */


function resolveNodeByPathParts(base, pathParts, failIfResolveFails) {
  if (failIfResolveFails === void 0) {
    failIfResolveFails = true;
  }

  var current = base;

  for (var i = 0; i < pathParts.length; i++) {
    var part = pathParts[i];

    if (part === "..") {
      current = current.parent;
      if (current) continue; // not everything has a parent
    } else if (part === ".") {
      continue;
    } else if (current) {
      if (current instanceof ScalarNode) {
        // check if the value of a scalar resolves to a state tree node (e.g. references)
        // then we can continue resolving...
        try {
          var value = current.value;

          if (isStateTreeNode(value)) {
            current = getStateTreeNode(value); // fall through
          }
        } catch (e) {
          if (!failIfResolveFails) {
            return undefined;
          }

          throw e;
        }
      }

      if (current instanceof ObjectNode) {
        var subType = current.getChildType(part);

        if (subType) {
          current = current.getChildNode(part);
          if (current) continue;
        }
      }
    }

    if (failIfResolveFails) throw fail$1("Could not resolve '" + part + "' in path '" + (joinJsonPath(pathParts.slice(0, i)) || "/") + "' while resolving '" + joinJsonPath(pathParts) + "'");else return undefined;
  }

  return current;
}
/**
 * @internal
 * @hidden
 */


function convertChildNodesToArray(childNodes) {
  if (!childNodes) return EMPTY_ARRAY;
  var keys = Object.keys(childNodes);
  if (!keys.length) return EMPTY_ARRAY;
  var result = new Array(keys.length);
  keys.forEach(function (key, index) {
    result[index] = childNodes[key];
  });
  return result;
} // based on: https://github.com/mobxjs/mobx-utils/blob/master/src/async-action.ts

/*
    All contents of this file are deprecated.

    The term `process` has been replaced with `flow` to avoid conflicts with the
    global `process` object.

    Refer to `flow.ts` for any further changes to this implementation.
*/


var DEPRECATION_MESSAGE = "See https://github.com/mobxjs/mobx-state-tree/issues/399 for more information. " + "Note that the middleware event types starting with `process` now start with `flow`.";
/**
 * @hidden
 *
 * @deprecated has been renamed to `flow()`.
 * See https://github.com/mobxjs/mobx-state-tree/issues/399 for more information.
 * Note that the middleware event types starting with `process` now start with `flow`.
 *
 * @returns {Promise}
 */

function process$1(asyncAction) {
  deprecated("process", "`process()` has been renamed to `flow()`. " + DEPRECATION_MESSAGE);
  return flow(asyncAction);
}
/**
 * @internal
 * @hidden
 */


var EMPTY_ARRAY = Object.freeze([]);
/**
 * @internal
 * @hidden
 */

var EMPTY_OBJECT = Object.freeze({});
/**
 * @internal
 * @hidden
 */

var mobxShallow = typeof _mobx.$mobx === "string" ? {
  deep: false
} : {
  deep: false,
  proxy: false
};
Object.freeze(mobxShallow);
/**
 * @internal
 * @hidden
 */

function fail$1(message) {
  if (message === void 0) {
    message = "Illegal state";
  }

  return new Error("[mobx-state-tree] " + message);
}
/**
 * @internal
 * @hidden
 */


function identity(_) {
  return _;
}
/**
 * pollyfill (for IE) suggested in MDN:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
 * @internal
 * @hidden
 */


var isInteger = Number.isInteger || function (value) {
  return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
};
/**
 * @internal
 * @hidden
 */


function isArray(val) {
  return Array.isArray(val) || (0, _mobx.isObservableArray)(val);
}
/**
 * @internal
 * @hidden
 */


function asArray(val) {
  if (!val) return EMPTY_ARRAY;
  if (isArray(val)) return val;
  return [val];
}
/**
 * @internal
 * @hidden
 */


function extend(a) {
  var b = [];

  for (var _i = 1; _i < arguments.length; _i++) {
    b[_i - 1] = arguments[_i];
  }

  for (var i = 0; i < b.length; i++) {
    var current = b[i];

    for (var key in current) a[key] = current[key];
  }

  return a;
}
/**
 * @internal
 * @hidden
 */


function isPlainObject(value) {
  if (value === null || typeof value !== "object") return false;
  var proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}
/**
 * @internal
 * @hidden
 */


function isMutable(value) {
  return value !== null && typeof value === "object" && !(value instanceof Date) && !(value instanceof RegExp);
}
/**
 * @internal
 * @hidden
 */


function isPrimitive(value, includeDate) {
  if (includeDate === void 0) {
    includeDate = true;
  }

  if (value === null || value === undefined) return true;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || includeDate && value instanceof Date) return true;
  return false;
}
/**
 * @internal
 * @hidden
 * Freeze a value and return it (if not in production)
 */


function freeze(value) {
  if (!devMode()) return value;
  return isPrimitive(value) || (0, _mobx.isObservableArray)(value) ? value : Object.freeze(value);
}
/**
 * @internal
 * @hidden
 * Recursively freeze a value (if not in production)
 */


function deepFreeze(value) {
  if (!devMode()) return value;
  freeze(value);

  if (isPlainObject(value)) {
    Object.keys(value).forEach(function (propKey) {
      if (!isPrimitive(value[propKey]) && !Object.isFrozen(value[propKey])) {
        deepFreeze(value[propKey]);
      }
    });
  }

  return value;
}
/**
 * @internal
 * @hidden
 */


function isSerializable(value) {
  return typeof value !== "function";
}
/**
 * @internal
 * @hidden
 */


function addHiddenFinalProp(object, propName, value) {
  Object.defineProperty(object, propName, {
    enumerable: false,
    writable: false,
    configurable: true,
    value: value
  });
}
/**
 * @internal
 * @hidden
 */


function addHiddenWritableProp(object, propName, value) {
  Object.defineProperty(object, propName, {
    enumerable: false,
    writable: true,
    configurable: true,
    value: value
  });
}
/**
 * @internal
 * @hidden
 */


var EventHandler =
/** @class */
function () {
  function EventHandler() {
    this.handlers = [];
  }

  Object.defineProperty(EventHandler.prototype, "hasSubscribers", {
    get: function () {
      return this.handlers.length > 0;
    },
    enumerable: true,
    configurable: true
  });

  EventHandler.prototype.register = function (fn, atTheBeginning) {
    var _this = this;

    if (atTheBeginning === void 0) {
      atTheBeginning = false;
    }

    if (atTheBeginning) {
      this.handlers.unshift(fn);
    } else {
      this.handlers.push(fn);
    }

    return function () {
      _this.unregister(fn);
    };
  };

  EventHandler.prototype.has = function (fn) {
    return this.handlers.indexOf(fn) >= 0;
  };

  EventHandler.prototype.unregister = function (fn) {
    var index = this.handlers.indexOf(fn);

    if (index >= 0) {
      this.handlers.splice(index, 1);
    }
  };

  EventHandler.prototype.clear = function () {
    this.handlers.length = 0;
  };

  EventHandler.prototype.emit = function () {
    var args = [];

    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    } // make a copy just in case it changes


    var handlers = this.handlers.slice();
    handlers.forEach(function (f) {
      return f.apply(void 0, __spread(args));
    });
  };

  return EventHandler;
}();
/**
 * @internal
 * @hidden
 */


var EventHandlers =
/** @class */
function () {
  function EventHandlers() {}

  EventHandlers.prototype.hasSubscribers = function (event) {
    var handler = this.eventHandlers && this.eventHandlers[event];
    return !!handler && handler.hasSubscribers;
  };

  EventHandlers.prototype.register = function (event, fn, atTheBeginning) {
    if (atTheBeginning === void 0) {
      atTheBeginning = false;
    }

    if (!this.eventHandlers) {
      this.eventHandlers = {};
    }

    var handler = this.eventHandlers[event];

    if (!handler) {
      handler = this.eventHandlers[event] = new EventHandler();
    }

    return handler.register(fn, atTheBeginning);
  };

  EventHandlers.prototype.has = function (event, fn) {
    var handler = this.eventHandlers && this.eventHandlers[event];
    return !!handler && handler.has(fn);
  };

  EventHandlers.prototype.unregister = function (event, fn) {
    var handler = this.eventHandlers && this.eventHandlers[event];

    if (handler) {
      handler.unregister(fn);
    }
  };

  EventHandlers.prototype.clear = function (event) {
    if (this.eventHandlers) {
      delete this.eventHandlers[event];
    }
  };

  EventHandlers.prototype.clearAll = function () {
    this.eventHandlers = undefined;
  };

  EventHandlers.prototype.emit = function (event) {
    var _a;

    var args = [];

    for (var _i = 1; _i < arguments.length; _i++) {
      args[_i - 1] = arguments[_i];
    }

    var handler = this.eventHandlers && this.eventHandlers[event];

    if (handler) {
      (_a = handler).emit.apply(_a, __spread(args));
    }
  };

  return EventHandlers;
}();
/**
 * @internal
 * @hidden
 */


function argsToArray(args) {
  var res = new Array(args.length);

  for (var i = 0; i < args.length; i++) res[i] = args[i];

  return res;
}
/**
 * @internal
 * @hidden
 */


function invalidateComputed(target, propName) {
  var atom = (0, _mobx.getAtom)(target, propName);
  atom.trackAndCompute();
}
/**
 * @internal
 * @hidden
 */


function stringStartsWith(str, beginning) {
  return str.indexOf(beginning) === 0;
}
/**
 * @internal
 * @hidden
 */


var deprecated = function (id, message) {
  // skip if running production
  if (!devMode()) return; // warn if hasn't been warned before

  if (deprecated.ids && !deprecated.ids.hasOwnProperty(id)) {
    warnError("Deprecation warning: " + message);
  } // mark as warned to avoid duplicate warn message


  if (deprecated.ids) deprecated.ids[id] = true;
};

deprecated.ids = {};
/**
 * @internal
 * @hidden
 */

function warnError(msg) {
  console.warn(new Error("[mobx-state-tree] " + msg));
}
/**
 * @internal
 * @hidden
 */


function isTypeCheckingEnabled() {
  return devMode() || typeof process !== "undefined" && process.env && undefined === "true";
}
/**
 * @internal
 * @hidden
 */


function devMode() {
  return "development" !== "production";
}
/**
 * @internal
 * @hidden
 */


function assertArg(value, fn, typeName, argNumber) {
  if (devMode()) {
    if (!fn(value)) {
      // istanbul ignore next
      throw fail$1("expected " + typeName + " as argument " + asArray(argNumber).join(" or ") + ", got " + value + " instead");
    }
  }
}
/**
 * @internal
 * @hidden
 */


function assertIsFunction(value, argNumber) {
  assertArg(value, function (fn) {
    return typeof fn === "function";
  }, "function", argNumber);
}
/**
 * @internal
 * @hidden
 */


function assertIsNumber(value, argNumber, min, max) {
  assertArg(value, function (n) {
    return typeof n === "number";
  }, "number", argNumber);

  if (min !== undefined) {
    assertArg(value, function (n) {
      return n >= min;
    }, "number greater than " + min, argNumber);
  }

  if (max !== undefined) {
    assertArg(value, function (n) {
      return n <= max;
    }, "number lesser than " + max, argNumber);
  }
}
/**
 * @internal
 * @hidden
 */


function assertIsString(value, argNumber, canBeEmpty) {
  if (canBeEmpty === void 0) {
    canBeEmpty = true;
  }

  assertArg(value, function (s) {
    return typeof s === "string";
  }, "string", argNumber);

  if (!canBeEmpty) {
    assertArg(value, function (s) {
      return s !== "";
    }, "not empty string", argNumber);
  }
}
/**
 * See [asynchronous actions](https://github.com/mobxjs/mobx-state-tree/blob/master/docs/async-actions.md).
 *
 * @returns The flow as a promise.
 */


function flow(generator) {
  return createFlowSpawner(generator.name, generator);
}
/**
 * @deprecated Not needed since TS3.6.
 * Used for TypeScript to make flows that return a promise return the actual promise result.
 *
 * @param val
 * @returns
 */


function castFlowReturn(val) {
  return val;
}
/**
 * @internal
 * @hidden
 */


function createFlowSpawner(name, generator) {
  var spawner = function flowSpawner() {
    // Implementation based on https://github.com/tj/co/blob/master/index.js
    var runId = getNextActionId();
    var parentContext = getCurrentActionContext();

    if (!parentContext) {
      throw fail$1("a mst flow must always have a parent context");
    }

    var parentActionContext = getParentActionContext(parentContext);

    if (!parentActionContext) {
      throw fail$1("a mst flow must always have a parent action context");
    }

    var contextBase = {
      name: name,
      id: runId,
      tree: parentContext.tree,
      context: parentContext.context,
      parentId: parentContext.id,
      allParentIds: __spread(parentContext.allParentIds, [parentContext.id]),
      rootId: parentContext.rootId,
      parentEvent: parentContext,
      parentActionEvent: parentActionContext
    };
    var args = arguments;

    function wrap(fn, type, arg) {
      fn.$mst_middleware = spawner.$mst_middleware; // pick up any middleware attached to the flow

      runWithActionContext(__assign(__assign({}, contextBase), {
        type: type,
        args: [arg]
      }), fn);
    }

    return new Promise(function (resolve, reject) {
      var gen;

      var init = function asyncActionInit() {
        gen = generator.apply(null, arguments);
        onFulfilled(undefined); // kick off the flow
      };

      init.$mst_middleware = spawner.$mst_middleware;
      runWithActionContext(__assign(__assign({}, contextBase), {
        type: "flow_spawn",
        args: argsToArray(args)
      }), init);

      function onFulfilled(res) {
        var ret;

        try {
          // prettier-ignore
          wrap(function (r) {
            ret = gen.next(r);
          }, "flow_resume", res);
        } catch (e) {
          // prettier-ignore
          setImmediate(function () {
            wrap(function (r) {
              reject(e);
            }, "flow_throw", e);
          });
          return;
        }

        next(ret);
        return;
      }

      function onRejected(err) {
        var ret;

        try {
          // prettier-ignore
          wrap(function (r) {
            ret = gen.throw(r);
          }, "flow_resume_error", err); // or yieldError?
        } catch (e) {
          // prettier-ignore
          setImmediate(function () {
            wrap(function (r) {
              reject(e);
            }, "flow_throw", e);
          });
          return;
        }

        next(ret);
      }

      function next(ret) {
        if (ret.done) {
          // prettier-ignore
          setImmediate(function () {
            wrap(function (r) {
              resolve(r);
            }, "flow_return", ret.value);
          });
          return;
        } // TODO: support more type of values? See https://github.com/tj/co/blob/249bbdc72da24ae44076afd716349d2089b31c4c/index.js#L100


        if (!ret.value || typeof ret.value.then !== "function") {
          // istanbul ignore next
          throw fail$1("Only promises can be yielded to `async`, got: " + ret);
        }

        return ret.value.then(onFulfilled, onRejected);
      }
    });
  };

  return spawner;
}
/**
 * @internal
 * @hidden
 */


function splitPatch(patch) {
  if (!("oldValue" in patch)) throw fail$1("Patches without `oldValue` field cannot be inversed");
  return [stripPatch(patch), invertPatch(patch)];
}
/**
 * @internal
 * @hidden
 */


function stripPatch(patch) {
  // strips `oldvalue` information from the patch, so that it becomes a patch conform the json-patch spec
  // this removes the ability to undo the patch
  switch (patch.op) {
    case "add":
      return {
        op: "add",
        path: patch.path,
        value: patch.value
      };

    case "remove":
      return {
        op: "remove",
        path: patch.path
      };

    case "replace":
      return {
        op: "replace",
        path: patch.path,
        value: patch.value
      };
  }
}

function invertPatch(patch) {
  switch (patch.op) {
    case "add":
      return {
        op: "remove",
        path: patch.path
      };

    case "remove":
      return {
        op: "add",
        path: patch.path,
        value: patch.oldValue
      };

    case "replace":
      return {
        op: "replace",
        path: patch.path,
        value: patch.oldValue
      };
  }
}
/**
 * Simple simple check to check it is a number.
 */


function isNumber(x) {
  return typeof x === "number";
}
/**
 * Escape slashes and backslashes.
 *
 * http://tools.ietf.org/html/rfc6901
 */


function escapeJsonPath(path) {
  if (isNumber(path) === true) {
    return "" + path;
  }

  if (path.indexOf("/") === -1 && path.indexOf("~") === -1) return path;
  return path.replace(/~/g, "~0").replace(/\//g, "~1");
}
/**
 * Unescape slashes and backslashes.
 */


function unescapeJsonPath(path) {
  return path.replace(/~1/g, "/").replace(/~0/g, "~");
}
/**
 * Generates a json-path compliant json path from path parts.
 *
 * @param path
 * @returns
 */


function joinJsonPath(path) {
  // `/` refers to property with an empty name, while `` refers to root itself!
  if (path.length === 0) return "";

  var getPathStr = function (p) {
    return p.map(escapeJsonPath).join("/");
  };

  if (path[0] === "." || path[0] === "..") {
    // relative
    return getPathStr(path);
  } else {
    // absolute
    return "/" + getPathStr(path);
  }
}
/**
 * Splits and decodes a json path into several parts.
 *
 * @param path
 * @returns
 */


function splitJsonPath(path) {
  // `/` refers to property with an empty name, while `` refers to root itself!
  var parts = path.split("/").map(unescapeJsonPath);
  var valid = path === "" || path === "." || path === ".." || stringStartsWith(path, "/") || stringStartsWith(path, "./") || stringStartsWith(path, "../");

  if (!valid) {
    throw fail$1("a json path must be either rooted, empty or relative, but got '" + path + "'");
  } // '/a/b/c' -> ["a", "b", "c"]
  // '../../b/c' -> ["..", "..", "b", "c"]
  // '' -> []
  // '/' -> ['']
  // './a' -> [".", "a"]
  // /./a' -> [".", "a"] equivalent to './a'


  if (parts[0] === "") {
    parts.shift();
  }

  return parts;
}

var SnapshotProcessor =
/** @class */
function (_super) {
  __extends(SnapshotProcessor, _super);

  function SnapshotProcessor(_subtype, _processors, name) {
    var _this = _super.call(this, name || _subtype.name) || this;

    _this._subtype = _subtype;
    _this._processors = _processors;
    return _this;
  }

  Object.defineProperty(SnapshotProcessor.prototype, "flags", {
    get: function () {
      return this._subtype.flags | TypeFlags.SnapshotProcessor;
    },
    enumerable: true,
    configurable: true
  });

  SnapshotProcessor.prototype.describe = function () {
    return "snapshotProcessor(" + this._subtype.describe() + ")";
  };

  SnapshotProcessor.prototype.preProcessSnapshot = function (sn) {
    if (this._processors.preProcessor) {
      return this._processors.preProcessor.call(null, sn);
    }

    return sn;
  };

  SnapshotProcessor.prototype.postProcessSnapshot = function (sn) {
    if (this._processors.postProcessor) {
      return this._processors.postProcessor.call(null, sn);
    }

    return sn;
  };

  SnapshotProcessor.prototype._fixNode = function (node) {
    var _this = this; // the node has to use these methods rather than the original type ones


    proxyNodeTypeMethods(node.type, this, "isAssignableFrom", "create");
    var oldGetSnapshot = node.getSnapshot;

    node.getSnapshot = function () {
      return _this.postProcessSnapshot(oldGetSnapshot.call(node));
    };
  };

  SnapshotProcessor.prototype.instantiate = function (parent, subpath, environment, initialValue) {
    var processedInitialValue = isStateTreeNode(initialValue) ? initialValue : this.preProcessSnapshot(initialValue);

    var node = this._subtype.instantiate(parent, subpath, environment, processedInitialValue);

    this._fixNode(node);

    return node;
  };

  SnapshotProcessor.prototype.reconcile = function (current, newValue, parent, subpath) {
    var node = this._subtype.reconcile(current, isStateTreeNode(newValue) ? newValue : this.preProcessSnapshot(newValue), parent, subpath);

    if (node !== current) {
      this._fixNode(node);
    }

    return node;
  };

  SnapshotProcessor.prototype.getSnapshot = function (node, applyPostProcess) {
    if (applyPostProcess === void 0) {
      applyPostProcess = true;
    }

    var sn = this._subtype.getSnapshot(node);

    return applyPostProcess ? this.postProcessSnapshot(sn) : sn;
  };

  SnapshotProcessor.prototype.isValidSnapshot = function (value, context) {
    var processedSn = this.preProcessSnapshot(value);
    return this._subtype.validate(processedSn, context);
  };

  SnapshotProcessor.prototype.getSubTypes = function () {
    return this._subtype;
  };

  SnapshotProcessor.prototype.is = function (thing) {
    return this._subtype.validate(isType(thing) ? this._subtype : this.preProcessSnapshot(thing), [{
      path: "",
      type: this._subtype
    }]).length === 0;
  };

  return SnapshotProcessor;
}(BaseType);

function proxyNodeTypeMethods(nodeType, snapshotProcessorType) {
  var e_1, _a;

  var methods = [];

  for (var _i = 2; _i < arguments.length; _i++) {
    methods[_i - 2] = arguments[_i];
  }

  try {
    for (var methods_1 = __values(methods), methods_1_1 = methods_1.next(); !methods_1_1.done; methods_1_1 = methods_1.next()) {
      var method = methods_1_1.value;
      nodeType[method] = snapshotProcessorType[method].bind(snapshotProcessorType);
    }
  } catch (e_1_1) {
    e_1 = {
      error: e_1_1
    };
  } finally {
    try {
      if (methods_1_1 && !methods_1_1.done && (_a = methods_1.return)) _a.call(methods_1);
    } finally {
      if (e_1) throw e_1.error;
    }
  }
}
/**
 * `types.snapshotProcessor` - Runs a pre/post snapshot processor before/after serializing a given type.
 *
 * Example:
 * ```ts
 * const Todo1 = types.model({ text: types.string })
 * // in the backend the text type must be null when empty
 * interface BackendTodo {
 *     text: string | null
 * }
 * const Todo2 = types.snapshotProcessor(Todo1, {
 *     // from snapshot to instance
 *     preProcessor(sn: BackendTodo) {
 *         return {
 *             text: sn.text || "";
 *         }
 *     },
 *     // from instance to snapshot
 *     postProcessor(sn): BackendTodo {
 *         return {
 *             text: !sn.text ? null : sn.text
 *         }
 *     }
 * })
 * ```
 *
 * @param type Type to run the processors over.
 * @param processors Processors to run.
 * @param name Type name, or undefined to inherit the inner type one.
 * @returns
 */


function snapshotProcessor(type, processors, name) {
  assertIsType(type, 1);

  if (devMode()) {
    if (processors.postProcessor && typeof processors.postProcessor !== "function") {
      // istanbul ignore next
      throw fail("postSnapshotProcessor must be a function");
    }

    if (processors.preProcessor && typeof processors.preProcessor !== "function") {
      // istanbul ignore next
      throw fail("preSnapshotProcessor must be a function");
    }
  }

  return new SnapshotProcessor(type, processors, name);
}

var needsIdentifierError = "Map.put can only be used to store complex values that have an identifier type attribute";

function tryCollectModelTypes(type, modelTypes) {
  var e_1, _a;

  var subtypes = type.getSubTypes();

  if (subtypes === cannotDetermineSubtype) {
    return false;
  }

  if (subtypes) {
    var subtypesArray = asArray(subtypes);

    try {
      for (var subtypesArray_1 = __values(subtypesArray), subtypesArray_1_1 = subtypesArray_1.next(); !subtypesArray_1_1.done; subtypesArray_1_1 = subtypesArray_1.next()) {
        var subtype = subtypesArray_1_1.value;
        if (!tryCollectModelTypes(subtype, modelTypes)) return false;
      }
    } catch (e_1_1) {
      e_1 = {
        error: e_1_1
      };
    } finally {
      try {
        if (subtypesArray_1_1 && !subtypesArray_1_1.done && (_a = subtypesArray_1.return)) _a.call(subtypesArray_1);
      } finally {
        if (e_1) throw e_1.error;
      }
    }
  }

  if (type instanceof ModelType) {
    modelTypes.push(type);
  }

  return true;
}
/**
 * @internal
 * @hidden
 */


var MapIdentifierMode;

(function (MapIdentifierMode) {
  MapIdentifierMode[MapIdentifierMode["UNKNOWN"] = 0] = "UNKNOWN";
  MapIdentifierMode[MapIdentifierMode["YES"] = 1] = "YES";
  MapIdentifierMode[MapIdentifierMode["NO"] = 2] = "NO";
})(MapIdentifierMode || (MapIdentifierMode = {}));

var MSTMap =
/** @class */
function (_super) {
  __extends(MSTMap, _super);

  function MSTMap(initialData) {
    return _super.call(this, initialData, _mobx.observable.ref.enhancer) || this;
  }

  MSTMap.prototype.get = function (key) {
    // maybe this is over-enthousiastic? normalize numeric keys to strings
    return _super.prototype.get.call(this, "" + key);
  };

  MSTMap.prototype.has = function (key) {
    return _super.prototype.has.call(this, "" + key);
  };

  MSTMap.prototype.delete = function (key) {
    return _super.prototype.delete.call(this, "" + key);
  };

  MSTMap.prototype.set = function (key, value) {
    return _super.prototype.set.call(this, "" + key, value);
  };

  MSTMap.prototype.put = function (value) {
    if (!value) throw fail$1("Map.put cannot be used to set empty values");

    if (isStateTreeNode(value)) {
      var node = getStateTreeNode(value);

      if (devMode()) {
        if (!node.identifierAttribute) {
          throw fail$1(needsIdentifierError);
        }
      }

      if (node.identifier === null) {
        throw fail$1(needsIdentifierError);
      }

      this.set(node.identifier, value);
      return value;
    } else if (!isMutable(value)) {
      throw fail$1("Map.put can only be used to store complex values");
    } else {
      var mapNode = getStateTreeNode(this);
      var mapType = mapNode.type;

      if (mapType.identifierMode !== MapIdentifierMode.YES) {
        throw fail$1(needsIdentifierError);
      }

      var idAttr = mapType.mapIdentifierAttribute;
      var id = value[idAttr];

      if (!isValidIdentifier(id)) {
        // try again but this time after creating a node for the value
        // since it might be an optional identifier
        var newNode = this.put(mapType.getChildType().create(value, mapNode.environment));
        return this.put(getSnapshot(newNode));
      }

      var key = normalizeIdentifier(id);
      this.set(key, value);
      return this.get(key);
    }
  };

  return MSTMap;
}(_mobx.ObservableMap);
/**
 * @internal
 * @hidden
 */


var MapType =
/** @class */
function (_super) {
  __extends(MapType, _super);

  function MapType(name, _subType, hookInitializers) {
    if (hookInitializers === void 0) {
      hookInitializers = [];
    }

    var _this = _super.call(this, name) || this;

    _this._subType = _subType;
    _this.identifierMode = MapIdentifierMode.UNKNOWN;
    _this.mapIdentifierAttribute = undefined;
    _this.flags = TypeFlags.Map;
    _this.hookInitializers = [];

    _this._determineIdentifierMode();

    _this.hookInitializers = hookInitializers;
    return _this;
  }

  MapType.prototype.hooks = function (hooks) {
    var hookInitializers = this.hookInitializers.length > 0 ? this.hookInitializers.concat(hooks) : [hooks];
    return new MapType(this.name, this._subType, hookInitializers);
  };

  MapType.prototype.instantiate = function (parent, subpath, environment, initialValue) {
    this._determineIdentifierMode();

    return createObjectNode(this, parent, subpath, environment, initialValue);
  };

  MapType.prototype._determineIdentifierMode = function () {
    if (this.identifierMode !== MapIdentifierMode.UNKNOWN) {
      return;
    }

    var modelTypes = [];

    if (tryCollectModelTypes(this._subType, modelTypes)) {
      var identifierAttribute_1 = undefined;
      modelTypes.forEach(function (type) {
        if (type.identifierAttribute) {
          if (identifierAttribute_1 && identifierAttribute_1 !== type.identifierAttribute) {
            throw fail$1("The objects in a map should all have the same identifier attribute, expected '" + identifierAttribute_1 + "', but child of type '" + type.name + "' declared attribute '" + type.identifierAttribute + "' as identifier");
          }

          identifierAttribute_1 = type.identifierAttribute;
        }
      });

      if (identifierAttribute_1) {
        this.identifierMode = MapIdentifierMode.YES;
        this.mapIdentifierAttribute = identifierAttribute_1;
      } else {
        this.identifierMode = MapIdentifierMode.NO;
      }
    }
  };

  MapType.prototype.initializeChildNodes = function (objNode, initialSnapshot) {
    if (initialSnapshot === void 0) {
      initialSnapshot = {};
    }

    var subType = objNode.type._subType;
    var result = {};
    Object.keys(initialSnapshot).forEach(function (name) {
      result[name] = subType.instantiate(objNode, name, undefined, initialSnapshot[name]);
    });
    return result;
  };

  MapType.prototype.createNewInstance = function (childNodes) {
    return new MSTMap(childNodes);
  };

  MapType.prototype.finalizeNewInstance = function (node, instance) {
    (0, _mobx._interceptReads)(instance, node.unbox);
    var type = node.type;
    type.hookInitializers.forEach(function (initializer) {
      var hooks = initializer(instance);
      Object.keys(hooks).forEach(function (name) {
        var hook = hooks[name];
        var actionInvoker = createActionInvoker(instance, name, hook);
        (!devMode() ? addHiddenFinalProp : addHiddenWritableProp)(instance, name, actionInvoker);
      });
    });
    (0, _mobx.intercept)(instance, this.willChange);
    (0, _mobx.observe)(instance, this.didChange);
  };

  MapType.prototype.describe = function () {
    return "Map<string, " + this._subType.describe() + ">";
  };

  MapType.prototype.getChildren = function (node) {
    // return (node.storedValue as ObservableMap<any>).values()
    return (0, _mobx.values)(node.storedValue);
  };

  MapType.prototype.getChildNode = function (node, key) {
    var childNode = node.storedValue.get("" + key);
    if (!childNode) throw fail$1("Not a child " + key);
    return childNode;
  };

  MapType.prototype.willChange = function (change) {
    var node = getStateTreeNode(change.object);
    var key = change.name;
    node.assertWritable({
      subpath: key
    });
    var mapType = node.type;
    var subType = mapType._subType;

    switch (change.type) {
      case "update":
        {
          var newValue = change.newValue;
          var oldValue = change.object.get(key);
          if (newValue === oldValue) return null;
          typecheckInternal(subType, newValue);
          change.newValue = subType.reconcile(node.getChildNode(key), change.newValue, node, key);
          mapType.processIdentifier(key, change.newValue);
        }
        break;

      case "add":
        {
          typecheckInternal(subType, change.newValue);
          change.newValue = subType.instantiate(node, key, undefined, change.newValue);
          mapType.processIdentifier(key, change.newValue);
        }
        break;
    }

    return change;
  };

  MapType.prototype.processIdentifier = function (expected, node) {
    if (this.identifierMode === MapIdentifierMode.YES && node instanceof ObjectNode) {
      var identifier = node.identifier;
      if (identifier !== expected) throw fail$1("A map of objects containing an identifier should always store the object under their own identifier. Trying to store key '" + identifier + "', but expected: '" + expected + "'");
    }
  };

  MapType.prototype.getSnapshot = function (node) {
    var res = {};
    node.getChildren().forEach(function (childNode) {
      res[childNode.subpath] = childNode.snapshot;
    });
    return res;
  };

  MapType.prototype.processInitialSnapshot = function (childNodes) {
    var processed = {};
    Object.keys(childNodes).forEach(function (key) {
      processed[key] = childNodes[key].getSnapshot();
    });
    return processed;
  };

  MapType.prototype.didChange = function (change) {
    var node = getStateTreeNode(change.object);

    switch (change.type) {
      case "update":
        return void node.emitPatch({
          op: "replace",
          path: escapeJsonPath(change.name),
          value: change.newValue.snapshot,
          oldValue: change.oldValue ? change.oldValue.snapshot : undefined
        }, node);

      case "add":
        return void node.emitPatch({
          op: "add",
          path: escapeJsonPath(change.name),
          value: change.newValue.snapshot,
          oldValue: undefined
        }, node);

      case "delete":
        // a node got deleted, get the old snapshot and make the node die
        var oldSnapshot = change.oldValue.snapshot;
        change.oldValue.die(); // emit the patch

        return void node.emitPatch({
          op: "remove",
          path: escapeJsonPath(change.name),
          oldValue: oldSnapshot
        }, node);
    }
  };

  MapType.prototype.applyPatchLocally = function (node, subpath, patch) {
    var target = node.storedValue;

    switch (patch.op) {
      case "add":
      case "replace":
        target.set(subpath, patch.value);
        break;

      case "remove":
        target.delete(subpath);
        break;
    }
  };

  MapType.prototype.applySnapshot = function (node, snapshot) {
    typecheckInternal(this, snapshot);
    var target = node.storedValue;
    var currentKeys = {};
    Array.from(target.keys()).forEach(function (key) {
      currentKeys[key] = false;
    });

    if (snapshot) {
      // Don't use target.replace, as it will throw away all existing items first
      for (var key in snapshot) {
        target.set(key, snapshot[key]);
        currentKeys["" + key] = true;
      }
    }

    Object.keys(currentKeys).forEach(function (key) {
      if (currentKeys[key] === false) target.delete(key);
    });
  };

  MapType.prototype.getChildType = function () {
    return this._subType;
  };

  MapType.prototype.isValidSnapshot = function (value, context) {
    var _this = this;

    if (!isPlainObject(value)) {
      return typeCheckFailure(context, value, "Value is not a plain object");
    }

    return flattenTypeErrors(Object.keys(value).map(function (path) {
      return _this._subType.validate(value[path], getContextForPath(context, path, _this._subType));
    }));
  };

  MapType.prototype.getDefaultSnapshot = function () {
    return EMPTY_OBJECT;
  };

  MapType.prototype.removeChild = function (node, subpath) {
    node.storedValue.delete(subpath);
  };

  __decorate([_mobx.action], MapType.prototype, "applySnapshot", null);

  return MapType;
}(ComplexType);
/**
 * `types.map` - Creates a key based collection type who's children are all of a uniform declared type.
 * If the type stored in a map has an identifier, it is mandatory to store the child under that identifier in the map.
 *
 * This type will always produce [observable maps](https://mobx.js.org/refguide/map.html)
 *
 * Example:
 * ```ts
 * const Todo = types.model({
 *   id: types.identifier,
 *   task: types.string
 * })
 *
 * const TodoStore = types.model({
 *   todos: types.map(Todo)
 * })
 *
 * const s = TodoStore.create({ todos: {} })
 * unprotect(s)
 * s.todos.set(17, { task: "Grab coffee", id: 17 })
 * s.todos.put({ task: "Grab cookie", id: 18 }) // put will infer key from the identifier
 * console.log(s.todos.get(17).task) // prints: "Grab coffee"
 * ```
 *
 * @param subtype
 * @returns
 */


function map(subtype) {
  return new MapType("map<string, " + subtype.name + ">", subtype);
}
/**
 * Returns if a given value represents a map type.
 *
 * @param type
 * @returns `true` if it is a map type.
 */


function isMapType(type) {
  return isType(type) && (type.flags & TypeFlags.Map) > 0;
}
/**
 * @internal
 * @hidden
 */


var ArrayType =
/** @class */
function (_super) {
  __extends(ArrayType, _super);

  function ArrayType(name, _subType, hookInitializers) {
    if (hookInitializers === void 0) {
      hookInitializers = [];
    }

    var _this = _super.call(this, name) || this;

    _this._subType = _subType;
    _this.flags = TypeFlags.Array;
    _this.hookInitializers = [];
    _this.hookInitializers = hookInitializers;
    return _this;
  }

  ArrayType.prototype.hooks = function (hooks) {
    var hookInitializers = this.hookInitializers.length > 0 ? this.hookInitializers.concat(hooks) : [hooks];
    return new ArrayType(this.name, this._subType, hookInitializers);
  };

  ArrayType.prototype.instantiate = function (parent, subpath, environment, initialValue) {
    return createObjectNode(this, parent, subpath, environment, initialValue);
  };

  ArrayType.prototype.initializeChildNodes = function (objNode, snapshot) {
    if (snapshot === void 0) {
      snapshot = [];
    }

    var subType = objNode.type._subType;
    var result = {};
    snapshot.forEach(function (item, index) {
      var subpath = "" + index;
      result[subpath] = subType.instantiate(objNode, subpath, undefined, item);
    });
    return result;
  };

  ArrayType.prototype.createNewInstance = function (childNodes) {
    return _mobx.observable.array(convertChildNodesToArray(childNodes), mobxShallow);
  };

  ArrayType.prototype.finalizeNewInstance = function (node, instance) {
    (0, _mobx._getAdministration)(instance).dehancer = node.unbox;
    var type = node.type;
    type.hookInitializers.forEach(function (initializer) {
      var hooks = initializer(instance);
      Object.keys(hooks).forEach(function (name) {
        var hook = hooks[name];
        var actionInvoker = createActionInvoker(instance, name, hook);
        (!devMode() ? addHiddenFinalProp : addHiddenWritableProp)(instance, name, actionInvoker);
      });
    });
    (0, _mobx.intercept)(instance, this.willChange);
    (0, _mobx.observe)(instance, this.didChange);
  };

  ArrayType.prototype.describe = function () {
    return this._subType.describe() + "[]";
  };

  ArrayType.prototype.getChildren = function (node) {
    return node.storedValue.slice();
  };

  ArrayType.prototype.getChildNode = function (node, key) {
    var index = Number(key);
    if (index < node.storedValue.length) return node.storedValue[index];
    throw fail$1("Not a child: " + key);
  };

  ArrayType.prototype.willChange = function (change) {
    var node = getStateTreeNode(change.object);
    node.assertWritable({
      subpath: "" + change.index
    });
    var subType = node.type._subType;
    var childNodes = node.getChildren();

    switch (change.type) {
      case "update":
        {
          if (change.newValue === change.object[change.index]) return null;
          var updatedNodes = reconcileArrayChildren(node, subType, [childNodes[change.index]], [change.newValue], [change.index]);

          if (!updatedNodes) {
            return null;
          }

          change.newValue = updatedNodes[0];
        }
        break;

      case "splice":
        {
          var index_1 = change.index,
              removedCount = change.removedCount,
              added = change.added;
          var addedNodes = reconcileArrayChildren(node, subType, childNodes.slice(index_1, index_1 + removedCount), added, added.map(function (_, i) {
            return index_1 + i;
          }));

          if (!addedNodes) {
            return null;
          }

          change.added = addedNodes; // update paths of remaining items

          for (var i = index_1 + removedCount; i < childNodes.length; i++) {
            childNodes[i].setParent(node, "" + (i + added.length - removedCount));
          }
        }
        break;
    }

    return change;
  };

  ArrayType.prototype.getSnapshot = function (node) {
    return node.getChildren().map(function (childNode) {
      return childNode.snapshot;
    });
  };

  ArrayType.prototype.processInitialSnapshot = function (childNodes) {
    var processed = [];
    Object.keys(childNodes).forEach(function (key) {
      processed.push(childNodes[key].getSnapshot());
    });
    return processed;
  };

  ArrayType.prototype.didChange = function (change) {
    var node = getStateTreeNode(change.object);

    switch (change.type) {
      case "update":
        return void node.emitPatch({
          op: "replace",
          path: "" + change.index,
          value: change.newValue.snapshot,
          oldValue: change.oldValue ? change.oldValue.snapshot : undefined
        }, node);

      case "splice":
        for (var i = change.removedCount - 1; i >= 0; i--) node.emitPatch({
          op: "remove",
          path: "" + (change.index + i),
          oldValue: change.removed[i].snapshot
        }, node);

        for (var i = 0; i < change.addedCount; i++) node.emitPatch({
          op: "add",
          path: "" + (change.index + i),
          value: node.getChildNode("" + (change.index + i)).snapshot,
          oldValue: undefined
        }, node);

        return;
    }
  };

  ArrayType.prototype.applyPatchLocally = function (node, subpath, patch) {
    var target = node.storedValue;
    var index = subpath === "-" ? target.length : Number(subpath);

    switch (patch.op) {
      case "replace":
        target[index] = patch.value;
        break;

      case "add":
        target.splice(index, 0, patch.value);
        break;

      case "remove":
        target.splice(index, 1);
        break;
    }
  };

  ArrayType.prototype.applySnapshot = function (node, snapshot) {
    typecheckInternal(this, snapshot);
    var target = node.storedValue;
    target.replace(snapshot);
  };

  ArrayType.prototype.getChildType = function () {
    return this._subType;
  };

  ArrayType.prototype.isValidSnapshot = function (value, context) {
    var _this = this;

    if (!isArray(value)) {
      return typeCheckFailure(context, value, "Value is not an array");
    }

    return flattenTypeErrors(value.map(function (item, index) {
      return _this._subType.validate(item, getContextForPath(context, "" + index, _this._subType));
    }));
  };

  ArrayType.prototype.getDefaultSnapshot = function () {
    return EMPTY_ARRAY;
  };

  ArrayType.prototype.removeChild = function (node, subpath) {
    node.storedValue.splice(Number(subpath), 1);
  };

  __decorate([_mobx.action], ArrayType.prototype, "applySnapshot", null);

  return ArrayType;
}(ComplexType);
/**
 * `types.array` - Creates an index based collection type who's children are all of a uniform declared type.
 *
 * This type will always produce [observable arrays](https://mobx.js.org/refguide/array.html)
 *
 * Example:
 * ```ts
 * const Todo = types.model({
 *   task: types.string
 * })
 *
 * const TodoStore = types.model({
 *   todos: types.array(Todo)
 * })
 *
 * const s = TodoStore.create({ todos: [] })
 * unprotect(s) // needed to allow modifying outside of an action
 * s.todos.push({ task: "Grab coffee" })
 * console.log(s.todos[0]) // prints: "Grab coffee"
 * ```
 *
 * @param subtype
 * @returns
 */


function array(subtype) {
  assertIsType(subtype, 1);
  return new ArrayType(subtype.name + "[]", subtype);
}

function reconcileArrayChildren(parent, childType, oldNodes, newValues, newPaths) {
  var nothingChanged = true;

  for (var i = 0;; i++) {
    var hasNewNode = i <= newValues.length - 1;
    var oldNode = oldNodes[i];
    var newValue = hasNewNode ? newValues[i] : undefined;
    var newPath = "" + newPaths[i]; // for some reason, instead of newValue we got a node, fallback to the storedValue
    // TODO: https://github.com/mobxjs/mobx-state-tree/issues/340#issuecomment-325581681

    if (isNode(newValue)) newValue = newValue.storedValue;

    if (!oldNode && !hasNewNode) {
      // both are empty, end
      break;
    } else if (!hasNewNode) {
      // new one does not exists
      nothingChanged = false;
      oldNodes.splice(i, 1);

      if (oldNode instanceof ObjectNode) {
        // since it is going to be returned by pop/splice/shift better create it before killing it
        // so it doesn't end up in an undead state
        oldNode.createObservableInstanceIfNeeded();
      }

      oldNode.die();
      i--;
    } else if (!oldNode) {
      // there is no old node, create it
      // check if already belongs to the same parent. if so, avoid pushing item in. only swapping can occur.
      if (isStateTreeNode(newValue) && getStateTreeNode(newValue).parent === parent) {
        // this node is owned by this parent, but not in the reconcilable set, so it must be double
        throw fail$1("Cannot add an object to a state tree if it is already part of the same or another state tree. Tried to assign an object to '" + parent.path + "/" + newPath + "', but it lives already at '" + getStateTreeNode(newValue).path + "'");
      }

      nothingChanged = false;
      var newNode = valueAsNode(childType, parent, newPath, newValue);
      oldNodes.splice(i, 0, newNode);
    } else if (areSame(oldNode, newValue)) {
      // both are the same, reconcile
      oldNodes[i] = valueAsNode(childType, parent, newPath, newValue, oldNode);
    } else {
      // nothing to do, try to reorder
      var oldMatch = undefined; // find a possible candidate to reuse

      for (var j = i; j < oldNodes.length; j++) {
        if (areSame(oldNodes[j], newValue)) {
          oldMatch = oldNodes.splice(j, 1)[0];
          break;
        }
      }

      nothingChanged = false;
      var newNode = valueAsNode(childType, parent, newPath, newValue, oldMatch);
      oldNodes.splice(i, 0, newNode);
    }
  }

  return nothingChanged ? null : oldNodes;
}
/**
 * Convert a value to a node at given parent and subpath. Attempts to reuse old node if possible and given.
 */


function valueAsNode(childType, parent, subpath, newValue, oldNode) {
  // ensure the value is valid-ish
  typecheckInternal(childType, newValue);

  function getNewNode() {
    // the new value has a MST node
    if (isStateTreeNode(newValue)) {
      var childNode = getStateTreeNode(newValue);
      childNode.assertAlive(EMPTY_OBJECT); // the node lives here

      if (childNode.parent !== null && childNode.parent === parent) {
        childNode.setParent(parent, subpath);
        return childNode;
      }
    } // there is old node and new one is a value/snapshot


    if (oldNode) {
      return childType.reconcile(oldNode, newValue, parent, subpath);
    } // nothing to do, create from scratch


    return childType.instantiate(parent, subpath, undefined, newValue);
  }

  var newNode = getNewNode();

  if (oldNode && oldNode !== newNode) {
    if (oldNode instanceof ObjectNode) {
      // since it is going to be returned by pop/splice/shift better create it before killing it
      // so it doesn't end up in an undead state
      oldNode.createObservableInstanceIfNeeded();
    }

    oldNode.die();
  }

  return newNode;
}
/**
 * Check if a node holds a value.
 */


function areSame(oldNode, newValue) {
  // never consider dead old nodes for reconciliation
  if (!oldNode.isAlive) {
    return false;
  } // the new value has the same node


  if (isStateTreeNode(newValue)) {
    var newNode = getStateTreeNode(newValue);
    return newNode.isAlive && newNode === oldNode;
  } // the provided value is the snapshot of the old node


  if (oldNode.snapshot === newValue) {
    return true;
  } // new value is a snapshot with the correct identifier


  return oldNode instanceof ObjectNode && oldNode.identifier !== null && oldNode.identifierAttribute && isPlainObject(newValue) && oldNode.identifier === normalizeIdentifier(newValue[oldNode.identifierAttribute]) && oldNode.type.is(newValue);
}
/**
 * Returns if a given value represents an array type.
 *
 * @param type
 * @returns `true` if the type is an array type.
 */


function isArrayType(type) {
  return isType(type) && (type.flags & TypeFlags.Array) > 0;
}

var PRE_PROCESS_SNAPSHOT = "preProcessSnapshot";
var POST_PROCESS_SNAPSHOT = "postProcessSnapshot";

function objectTypeToString() {
  return getStateTreeNode(this).toString();
}

var defaultObjectOptions = {
  name: "AnonymousModel",
  properties: {},
  initializers: EMPTY_ARRAY
};

function toPropertiesObject(declaredProps) {
  // loop through properties and ensures that all items are types
  return Object.keys(declaredProps).reduce(function (props, key) {
    var _a, _b, _c; // warn if user intended a HOOK


    if (key in Hook) throw fail$1("Hook '" + key + "' was defined as property. Hooks should be defined as part of the actions"); // the user intended to use a view

    var descriptor = Object.getOwnPropertyDescriptor(props, key);

    if ("get" in descriptor) {
      throw fail$1("Getters are not supported as properties. Please use views instead");
    } // undefined and null are not valid


    var value = descriptor.value;

    if (value === null || value === undefined) {
      throw fail$1("The default value of an attribute cannot be null or undefined as the type cannot be inferred. Did you mean `types.maybe(someType)`?"); // its a primitive, convert to its type
    } else if (isPrimitive(value)) {
      return Object.assign({}, props, (_a = {}, _a[key] = optional(getPrimitiveFactoryFromValue(value), value), _a)); // map defaults to empty object automatically for models
    } else if (value instanceof MapType) {
      return Object.assign({}, props, (_b = {}, _b[key] = optional(value, {}), _b));
    } else if (value instanceof ArrayType) {
      return Object.assign({}, props, (_c = {}, _c[key] = optional(value, []), _c)); // its already a type
    } else if (isType(value)) {
      return props; // its a function, maybe the user wanted a view?
    } else if (devMode() && typeof value === "function") {
      throw fail$1("Invalid type definition for property '" + key + "', it looks like you passed a function. Did you forget to invoke it, or did you intend to declare a view / action?"); // no other complex values
    } else if (devMode() && typeof value === "object") {
      throw fail$1("Invalid type definition for property '" + key + "', it looks like you passed an object. Try passing another model type or a types.frozen."); // WTF did you pass in mate?
    } else {
      throw fail$1("Invalid type definition for property '" + key + "', cannot infer a type from a value like '" + value + "' (" + typeof value + ")");
    }
  }, declaredProps);
}
/**
 * @internal
 * @hidden
 */


var ModelType =
/** @class */
function (_super) {
  __extends(ModelType, _super);

  function ModelType(opts) {
    var _this = _super.call(this, opts.name || defaultObjectOptions.name) || this;

    _this.flags = TypeFlags.Object;

    _this.named = function (name) {
      return _this.cloneAndEnhance({
        name: name
      });
    };

    _this.props = function (properties) {
      return _this.cloneAndEnhance({
        properties: properties
      });
    };

    _this.preProcessSnapshot = function (preProcessor) {
      var currentPreprocessor = _this.preProcessor;
      if (!currentPreprocessor) return _this.cloneAndEnhance({
        preProcessor: preProcessor
      });else return _this.cloneAndEnhance({
        preProcessor: function (snapshot) {
          return currentPreprocessor(preProcessor(snapshot));
        }
      });
    };

    _this.postProcessSnapshot = function (postProcessor) {
      var currentPostprocessor = _this.postProcessor;
      if (!currentPostprocessor) return _this.cloneAndEnhance({
        postProcessor: postProcessor
      });else return _this.cloneAndEnhance({
        postProcessor: function (snapshot) {
          return postProcessor(currentPostprocessor(snapshot));
        }
      });
    };

    Object.assign(_this, defaultObjectOptions, opts); // ensures that any default value gets converted to its related type

    _this.properties = toPropertiesObject(_this.properties);
    freeze(_this.properties); // make sure nobody messes with it

    _this.propertyNames = Object.keys(_this.properties);
    _this.identifierAttribute = _this._getIdentifierAttribute();
    return _this;
  }

  ModelType.prototype._getIdentifierAttribute = function () {
    var identifierAttribute = undefined;
    this.forAllProps(function (propName, propType) {
      if (propType.flags & TypeFlags.Identifier) {
        if (identifierAttribute) throw fail$1("Cannot define property '" + propName + "' as object identifier, property '" + identifierAttribute + "' is already defined as identifier property");
        identifierAttribute = propName;
      }
    });
    return identifierAttribute;
  };

  ModelType.prototype.cloneAndEnhance = function (opts) {
    return new ModelType({
      name: opts.name || this.name,
      properties: Object.assign({}, this.properties, opts.properties),
      initializers: this.initializers.concat(opts.initializers || []),
      preProcessor: opts.preProcessor || this.preProcessor,
      postProcessor: opts.postProcessor || this.postProcessor
    });
  };

  ModelType.prototype.actions = function (fn) {
    var _this = this;

    var actionInitializer = function (self) {
      _this.instantiateActions(self, fn(self));

      return self;
    };

    return this.cloneAndEnhance({
      initializers: [actionInitializer]
    });
  };

  ModelType.prototype.instantiateActions = function (self, actions) {
    // check if return is correct
    if (!isPlainObject(actions)) throw fail$1("actions initializer should return a plain object containing actions"); // bind actions to the object created

    Object.keys(actions).forEach(function (name) {
      // warn if preprocessor was given
      if (name === PRE_PROCESS_SNAPSHOT) throw fail$1("Cannot define action '" + PRE_PROCESS_SNAPSHOT + "', it should be defined using 'type.preProcessSnapshot(fn)' instead"); // warn if postprocessor was given

      if (name === POST_PROCESS_SNAPSHOT) throw fail$1("Cannot define action '" + POST_PROCESS_SNAPSHOT + "', it should be defined using 'type.postProcessSnapshot(fn)' instead");
      var action2 = actions[name]; // apply hook composition

      var baseAction = self[name];

      if (name in Hook && baseAction) {
        var specializedAction_1 = action2;

        action2 = function () {
          baseAction.apply(null, arguments);
          specializedAction_1.apply(null, arguments);
        };
      } // the goal of this is to make sure actions using "this" can call themselves,
      // while still allowing the middlewares to register them


      var middlewares = action2.$mst_middleware; // make sure middlewares are not lost

      var boundAction = action2.bind(actions);
      boundAction.$mst_middleware = middlewares;
      var actionInvoker = createActionInvoker(self, name, boundAction);
      actions[name] = actionInvoker;
      (!devMode() ? addHiddenFinalProp : addHiddenWritableProp)(self, name, actionInvoker);
    });
  };

  ModelType.prototype.volatile = function (fn) {
    var _this = this;

    var stateInitializer = function (self) {
      _this.instantiateVolatileState(self, fn(self));

      return self;
    };

    return this.cloneAndEnhance({
      initializers: [stateInitializer]
    });
  };

  ModelType.prototype.instantiateVolatileState = function (self, state) {
    // check views return
    if (!isPlainObject(state)) throw fail$1("volatile state initializer should return a plain object containing state");
    (0, _mobx.set)(self, state);
  };

  ModelType.prototype.extend = function (fn) {
    var _this = this;

    var initializer = function (self) {
      var _a = fn(self),
          actions = _a.actions,
          views = _a.views,
          state = _a.state,
          rest = __rest(_a, ["actions", "views", "state"]);

      for (var key in rest) throw fail$1("The `extend` function should return an object with a subset of the fields 'actions', 'views' and 'state'. Found invalid key '" + key + "'");

      if (state) _this.instantiateVolatileState(self, state);
      if (views) _this.instantiateViews(self, views);
      if (actions) _this.instantiateActions(self, actions);
      return self;
    };

    return this.cloneAndEnhance({
      initializers: [initializer]
    });
  };

  ModelType.prototype.views = function (fn) {
    var _this = this;

    var viewInitializer = function (self) {
      _this.instantiateViews(self, fn(self));

      return self;
    };

    return this.cloneAndEnhance({
      initializers: [viewInitializer]
    });
  };

  ModelType.prototype.instantiateViews = function (self, views) {
    // check views return
    if (!isPlainObject(views)) throw fail$1("views initializer should return a plain object containing views");
    Object.keys(views).forEach(function (key) {
      // is this a computed property?
      var descriptor = Object.getOwnPropertyDescriptor(views, key);

      if ("get" in descriptor) {
        if ((0, _mobx.isComputedProp)(self, key)) {
          var computedValue = (0, _mobx._getAdministration)(self, key); // TODO: mobx currently does not allow redefining computes yet, pending #1121
          // FIXME: this binds to the internals of mobx!

          computedValue.derivation = descriptor.get;
          computedValue.scope = self;
          if (descriptor.set) computedValue.setter = (0, _mobx.action)(computedValue.name + "-setter", descriptor.set);
        } else {
          (0, _mobx.computed)(self, key, descriptor, true);
        }
      } else if (typeof descriptor.value === "function") {
        (!devMode() ? addHiddenFinalProp : addHiddenWritableProp)(self, key, descriptor.value);
      } else {
        throw fail$1("A view member should either be a function or getter based property");
      }
    });
  };

  ModelType.prototype.instantiate = function (parent, subpath, environment, initialValue) {
    var value = isStateTreeNode(initialValue) ? initialValue : this.applySnapshotPreProcessor(initialValue);
    return createObjectNode(this, parent, subpath, environment, value); // Optimization: record all prop- view- and action names after first construction, and generate an optimal base class
    // that pre-reserves all these fields for fast object-member lookups
  };

  ModelType.prototype.initializeChildNodes = function (objNode, initialSnapshot) {
    if (initialSnapshot === void 0) {
      initialSnapshot = {};
    }

    var type = objNode.type;
    var result = {};
    type.forAllProps(function (name, childType) {
      result[name] = childType.instantiate(objNode, name, undefined, initialSnapshot[name]);
    });
    return result;
  };

  ModelType.prototype.createNewInstance = function (childNodes) {
    return _mobx.observable.object(childNodes, EMPTY_OBJECT, mobxShallow);
  };

  ModelType.prototype.finalizeNewInstance = function (node, instance) {
    addHiddenFinalProp(instance, "toString", objectTypeToString);
    this.forAllProps(function (name) {
      (0, _mobx._interceptReads)(instance, name, node.unbox);
    });
    this.initializers.reduce(function (self, fn) {
      return fn(self);
    }, instance);
    (0, _mobx.intercept)(instance, this.willChange);
    (0, _mobx.observe)(instance, this.didChange);
  };

  ModelType.prototype.willChange = function (chg) {
    // TODO: mobx typings don't seem to take into account that newValue can be set even when removing a prop
    var change = chg;
    var node = getStateTreeNode(change.object);
    var subpath = change.name;
    node.assertWritable({
      subpath: subpath
    });
    var childType = node.type.properties[subpath]; // only properties are typed, state are stored as-is references

    if (childType) {
      typecheckInternal(childType, change.newValue);
      change.newValue = childType.reconcile(node.getChildNode(subpath), change.newValue, node, subpath);
    }

    return change;
  };

  ModelType.prototype.didChange = function (chg) {
    // TODO: mobx typings don't seem to take into account that newValue can be set even when removing a prop
    var change = chg;
    var childNode = getStateTreeNode(change.object);
    var childType = childNode.type.properties[change.name];

    if (!childType) {
      // don't emit patches for volatile state
      return;
    }

    var oldChildValue = change.oldValue ? change.oldValue.snapshot : undefined;
    childNode.emitPatch({
      op: "replace",
      path: escapeJsonPath(change.name),
      value: change.newValue.snapshot,
      oldValue: oldChildValue
    }, childNode);
  };

  ModelType.prototype.getChildren = function (node) {
    var _this = this;

    var res = [];
    this.forAllProps(function (name) {
      res.push(_this.getChildNode(node, name));
    });
    return res;
  };

  ModelType.prototype.getChildNode = function (node, key) {
    if (!(key in this.properties)) throw fail$1("Not a value property: " + key);
    var childNode = (0, _mobx._getAdministration)(node.storedValue, key).value; // TODO: blegh!

    if (!childNode) throw fail$1("Node not available for property " + key);
    return childNode;
  };

  ModelType.prototype.getSnapshot = function (node, applyPostProcess) {
    var _this = this;

    if (applyPostProcess === void 0) {
      applyPostProcess = true;
    }

    var res = {};
    this.forAllProps(function (name, type) {
      (0, _mobx.getAtom)(node.storedValue, name).reportObserved();
      res[name] = _this.getChildNode(node, name).snapshot;
    });

    if (applyPostProcess) {
      return this.applySnapshotPostProcessor(res);
    }

    return res;
  };

  ModelType.prototype.processInitialSnapshot = function (childNodes) {
    var processed = {};
    Object.keys(childNodes).forEach(function (key) {
      processed[key] = childNodes[key].getSnapshot();
    });
    return this.applySnapshotPostProcessor(processed);
  };

  ModelType.prototype.applyPatchLocally = function (node, subpath, patch) {
    if (!(patch.op === "replace" || patch.op === "add")) {
      throw fail$1("object does not support operation " + patch.op);
    }

    node.storedValue[subpath] = patch.value;
  };

  ModelType.prototype.applySnapshot = function (node, snapshot) {
    var preProcessedSnapshot = this.applySnapshotPreProcessor(snapshot);
    typecheckInternal(this, preProcessedSnapshot);
    this.forAllProps(function (name) {
      node.storedValue[name] = preProcessedSnapshot[name];
    });
  };

  ModelType.prototype.applySnapshotPreProcessor = function (snapshot) {
    var processor = this.preProcessor;
    return processor ? processor.call(null, snapshot) : snapshot;
  };

  ModelType.prototype.applySnapshotPostProcessor = function (snapshot) {
    var postProcessor = this.postProcessor;
    if (postProcessor) return postProcessor.call(null, snapshot);
    return snapshot;
  };

  ModelType.prototype.getChildType = function (propertyName) {
    assertIsString(propertyName, 1);
    return this.properties[propertyName];
  };

  ModelType.prototype.isValidSnapshot = function (value, context) {
    var _this = this;

    var snapshot = this.applySnapshotPreProcessor(value);

    if (!isPlainObject(snapshot)) {
      return typeCheckFailure(context, snapshot, "Value is not a plain object");
    }

    return flattenTypeErrors(this.propertyNames.map(function (key) {
      return _this.properties[key].validate(snapshot[key], getContextForPath(context, key, _this.properties[key]));
    }));
  };

  ModelType.prototype.forAllProps = function (fn) {
    var _this = this;

    this.propertyNames.forEach(function (key) {
      return fn(key, _this.properties[key]);
    });
  };

  ModelType.prototype.describe = function () {
    var _this = this; // optimization: cache


    return "{ " + this.propertyNames.map(function (key) {
      return key + ": " + _this.properties[key].describe();
    }).join("; ") + " }";
  };

  ModelType.prototype.getDefaultSnapshot = function () {
    return EMPTY_OBJECT;
  };

  ModelType.prototype.removeChild = function (node, subpath) {
    node.storedValue[subpath] = undefined;
  };

  __decorate([_mobx.action], ModelType.prototype, "applySnapshot", null);

  return ModelType;
}(ComplexType);
/**
 * `types.model` - Creates a new model type by providing a name, properties, volatile state and actions.
 *
 * See the [model type](https://github.com/mobxjs/mobx-state-tree#creating-models) description or the [getting started](https://github.com/mobxjs/mobx-state-tree/blob/master/docs/getting-started.md#getting-started-1) tutorial.
 */


function model() {
  var args = [];

  for (var _i = 0; _i < arguments.length; _i++) {
    args[_i] = arguments[_i];
  }

  var name = typeof args[0] === "string" ? args.shift() : "AnonymousModel";
  var properties = args.shift() || {};
  return new ModelType({
    name: name,
    properties: properties
  });
}
/**
 * `types.compose` - Composes a new model from one or more existing model types.
 * This method can be invoked in two forms:
 * Given 2 or more model types, the types are composed into a new Type.
 * Given first parameter as a string and 2 or more model types,
 * the types are composed into a new Type with the given name
 */


function compose() {
  var args = [];

  for (var _i = 0; _i < arguments.length; _i++) {
    args[_i] = arguments[_i];
  } // TODO: just join the base type names if no name is provided


  var hasTypename = typeof args[0] === "string";
  var typeName = hasTypename ? args[0] : "AnonymousModel";

  if (hasTypename) {
    args.shift();
  } // check all parameters


  if (devMode()) {
    args.forEach(function (type, i) {
      assertArg(type, isModelType, "mobx-state-tree model type", hasTypename ? i + 2 : i + 1);
    });
  }

  return args.reduce(function (prev, cur) {
    return prev.cloneAndEnhance({
      name: prev.name + "_" + cur.name,
      properties: cur.properties,
      initializers: cur.initializers,
      preProcessor: function (snapshot) {
        return cur.applySnapshotPreProcessor(prev.applySnapshotPreProcessor(snapshot));
      },
      postProcessor: function (snapshot) {
        return cur.applySnapshotPostProcessor(prev.applySnapshotPostProcessor(snapshot));
      }
    });
  }).named(typeName);
}
/**
 * Returns if a given value represents a model type.
 *
 * @param type
 * @returns
 */


function isModelType(type) {
  return isType(type) && (type.flags & TypeFlags.Object) > 0;
} // TODO: implement CoreType using types.custom ?

/**
 * @internal
 * @hidden
 */


var CoreType =
/** @class */
function (_super) {
  __extends(CoreType, _super);

  function CoreType(name, flags, checker, initializer) {
    if (initializer === void 0) {
      initializer = identity;
    }

    var _this = _super.call(this, name) || this;

    _this.flags = flags;
    _this.checker = checker;
    _this.initializer = initializer;
    _this.flags = flags;
    return _this;
  }

  CoreType.prototype.describe = function () {
    return this.name;
  };

  CoreType.prototype.instantiate = function (parent, subpath, environment, initialValue) {
    return createScalarNode(this, parent, subpath, environment, initialValue);
  };

  CoreType.prototype.createNewInstance = function (snapshot) {
    return this.initializer(snapshot);
  };

  CoreType.prototype.isValidSnapshot = function (value, context) {
    if (isPrimitive(value) && this.checker(value)) {
      return typeCheckSuccess();
    }

    var typeName = this.name === "Date" ? "Date or a unix milliseconds timestamp" : this.name;
    return typeCheckFailure(context, value, "Value is not a " + typeName);
  };

  return CoreType;
}(SimpleType);
/**
 * `types.string` - Creates a type that can only contain a string value.
 * This type is used for string values by default
 *
 * Example:
 * ```ts
 * const Person = types.model({
 *   firstName: types.string,
 *   lastName: "Doe"
 * })
 * ```
 */
// tslint:disable-next-line:variable-name


var string = new CoreType("string", TypeFlags.String, function (v) {
  return typeof v === "string";
});
/**
 * `types.number` - Creates a type that can only contain a numeric value.
 * This type is used for numeric values by default
 *
 * Example:
 * ```ts
 * const Vector = types.model({
 *   x: types.number,
 *   y: 1.5
 * })
 * ```
 */
// tslint:disable-next-line:variable-name

var number = new CoreType("number", TypeFlags.Number, function (v) {
  return typeof v === "number";
});
/**
 * `types.integer` - Creates a type that can only contain an integer value.
 * This type is used for integer values by default
 *
 * Example:
 * ```ts
 * const Size = types.model({
 *   width: types.integer,
 *   height: 10
 * })
 * ```
 */
// tslint:disable-next-line:variable-name

var integer = new CoreType("integer", TypeFlags.Integer, function (v) {
  return isInteger(v);
});
/**
 * `types.boolean` - Creates a type that can only contain a boolean value.
 * This type is used for boolean values by default
 *
 * Example:
 * ```ts
 * const Thing = types.model({
 *   isCool: types.boolean,
 *   isAwesome: false
 * })
 * ```
 */
// tslint:disable-next-line:variable-name

var boolean = new CoreType("boolean", TypeFlags.Boolean, function (v) {
  return typeof v === "boolean";
});
/**
 * `types.null` - The type of the value `null`
 */

var nullType = new CoreType("null", TypeFlags.Null, function (v) {
  return v === null;
});
/**
 * `types.undefined` - The type of the value `undefined`
 */

var undefinedType = new CoreType("undefined", TypeFlags.Undefined, function (v) {
  return v === undefined;
});

var _DatePrimitive = new CoreType("Date", TypeFlags.Date, function (v) {
  return typeof v === "number" || v instanceof Date;
}, function (v) {
  return v instanceof Date ? v : new Date(v);
});

_DatePrimitive.getSnapshot = function (node) {
  return node.storedValue.getTime();
};
/**
 * `types.Date` - Creates a type that can only contain a javascript Date value.
 *
 * Example:
 * ```ts
 * const LogLine = types.model({
 *   timestamp: types.Date,
 * })
 *
 * LogLine.create({ timestamp: new Date() })
 * ```
 */


var DatePrimitive = _DatePrimitive;
/**
 * @internal
 * @hidden
 */

function getPrimitiveFactoryFromValue(value) {
  switch (typeof value) {
    case "string":
      return string;

    case "number":
      return number;
    // In the future, isInteger(value) ? integer : number would be interesting, but would be too breaking for now

    case "boolean":
      return boolean;

    case "object":
      if (value instanceof Date) return DatePrimitive;
  }

  throw fail$1("Cannot determine primitive type from value " + value);
}
/**
 * Returns if a given value represents a primitive type.
 *
 * @param type
 * @returns
 */


function isPrimitiveType(type) {
  return isType(type) && (type.flags & (TypeFlags.String | TypeFlags.Number | TypeFlags.Integer | TypeFlags.Boolean | TypeFlags.Date)) > 0;
}
/**
 * @internal
 * @hidden
 */


var Literal =
/** @class */
function (_super) {
  __extends(Literal, _super);

  function Literal(value) {
    var _this = _super.call(this, JSON.stringify(value)) || this;

    _this.flags = TypeFlags.Literal;
    _this.value = value;
    return _this;
  }

  Literal.prototype.instantiate = function (parent, subpath, environment, initialValue) {
    return createScalarNode(this, parent, subpath, environment, initialValue);
  };

  Literal.prototype.describe = function () {
    return JSON.stringify(this.value);
  };

  Literal.prototype.isValidSnapshot = function (value, context) {
    if (isPrimitive(value) && value === this.value) {
      return typeCheckSuccess();
    }

    return typeCheckFailure(context, value, "Value is not a literal " + JSON.stringify(this.value));
  };

  return Literal;
}(SimpleType);
/**
 * `types.literal` - The literal type will return a type that will match only the exact given type.
 * The given value must be a primitive, in order to be serialized to a snapshot correctly.
 * You can use literal to match exact strings for example the exact male or female string.
 *
 * Example:
 * ```ts
 * const Person = types.model({
 *     name: types.string,
 *     gender: types.union(types.literal('male'), types.literal('female'))
 * })
 * ```
 *
 * @param value The value to use in the strict equal check
 * @returns
 */


function literal(value) {
  // check that the given value is a primitive
  assertArg(value, isPrimitive, "primitive", 1);
  return new Literal(value);
}
/**
 * Returns if a given value represents a literal type.
 *
 * @param type
 * @returns
 */


function isLiteralType(type) {
  return isType(type) && (type.flags & TypeFlags.Literal) > 0;
}

var Refinement =
/** @class */
function (_super) {
  __extends(Refinement, _super);

  function Refinement(name, _subtype, _predicate, _message) {
    var _this = _super.call(this, name) || this;

    _this._subtype = _subtype;
    _this._predicate = _predicate;
    _this._message = _message;
    return _this;
  }

  Object.defineProperty(Refinement.prototype, "flags", {
    get: function () {
      return this._subtype.flags | TypeFlags.Refinement;
    },
    enumerable: true,
    configurable: true
  });

  Refinement.prototype.describe = function () {
    return this.name;
  };

  Refinement.prototype.instantiate = function (parent, subpath, environment, initialValue) {
    // create the child type
    return this._subtype.instantiate(parent, subpath, environment, initialValue);
  };

  Refinement.prototype.isAssignableFrom = function (type) {
    return this._subtype.isAssignableFrom(type);
  };

  Refinement.prototype.isValidSnapshot = function (value, context) {
    var subtypeErrors = this._subtype.validate(value, context);

    if (subtypeErrors.length > 0) return subtypeErrors;
    var snapshot = isStateTreeNode(value) ? getStateTreeNode(value).snapshot : value;

    if (!this._predicate(snapshot)) {
      return typeCheckFailure(context, value, this._message(value));
    }

    return typeCheckSuccess();
  };

  Refinement.prototype.reconcile = function (current, newValue, parent, subpath) {
    return this._subtype.reconcile(current, newValue, parent, subpath);
  };

  Refinement.prototype.getSubTypes = function () {
    return this._subtype;
  };

  return Refinement;
}(BaseType);
/**
 * `types.refinement` - Creates a type that is more specific than the base type, e.g. `types.refinement(types.string, value => value.length > 5)` to create a type of strings that can only be longer then 5.
 *
 * @param name
 * @param type
 * @param predicate
 * @returns
 */


function refinement() {
  var args = [];

  for (var _i = 0; _i < arguments.length; _i++) {
    args[_i] = arguments[_i];
  }

  var name = typeof args[0] === "string" ? args.shift() : isType(args[0]) ? args[0].name : null;
  var type = args[0];
  var predicate = args[1];
  var message = args[2] ? args[2] : function (v) {
    return "Value does not respect the refinement predicate";
  }; // ensures all parameters are correct

  assertIsType(type, [1, 2]);
  assertIsString(name, 1);
  assertIsFunction(predicate, [2, 3]);
  assertIsFunction(message, [3, 4]);
  return new Refinement(name, type, predicate, message);
}
/**
 * Returns if a given value is a refinement type.
 *
 * @param type
 * @returns
 */


function isRefinementType(type) {
  return (type.flags & TypeFlags.Refinement) > 0;
}
/**
 * `types.enumeration` - Can be used to create an string based enumeration.
 * (note: this methods is just sugar for a union of string literals)
 *
 * Example:
 * ```ts
 * const TrafficLight = types.model({
 *   color: types.enumeration("Color", ["Red", "Orange", "Green"])
 * })
 * ```
 *
 * @param name descriptive name of the enumeration (optional)
 * @param options possible values this enumeration can have
 * @returns
 */


function enumeration(name, options) {
  var realOptions = typeof name === "string" ? options : name; // check all options

  if (devMode()) {
    realOptions.forEach(function (option, i) {
      assertIsString(option, i + 1);
    });
  }

  var type = union.apply(void 0, __spread(realOptions.map(function (option) {
    return literal("" + option);
  })));
  if (typeof name === "string") type.name = name;
  return type;
}
/**
 * @internal
 * @hidden
 */


var Union =
/** @class */
function (_super) {
  __extends(Union, _super);

  function Union(name, _types, options) {
    var _this = _super.call(this, name) || this;

    _this._types = _types;
    _this._eager = true;
    options = __assign({
      eager: true,
      dispatcher: undefined
    }, options);
    _this._dispatcher = options.dispatcher;
    if (!options.eager) _this._eager = false;
    return _this;
  }

  Object.defineProperty(Union.prototype, "flags", {
    get: function () {
      var result = TypeFlags.Union;

      this._types.forEach(function (type) {
        result |= type.flags;
      });

      return result;
    },
    enumerable: true,
    configurable: true
  });

  Union.prototype.isAssignableFrom = function (type) {
    return this._types.some(function (subType) {
      return subType.isAssignableFrom(type);
    });
  };

  Union.prototype.describe = function () {
    return "(" + this._types.map(function (factory) {
      return factory.describe();
    }).join(" | ") + ")";
  };

  Union.prototype.instantiate = function (parent, subpath, environment, initialValue) {
    var type = this.determineType(initialValue, undefined);
    if (!type) throw fail$1("No matching type for union " + this.describe()); // can happen in prod builds

    return type.instantiate(parent, subpath, environment, initialValue);
  };

  Union.prototype.reconcile = function (current, newValue, parent, subpath) {
    var type = this.determineType(newValue, current.type);
    if (!type) throw fail$1("No matching type for union " + this.describe()); // can happen in prod builds

    return type.reconcile(current, newValue, parent, subpath);
  };

  Union.prototype.determineType = function (value, reconcileCurrentType) {
    // try the dispatcher, if defined
    if (this._dispatcher) {
      return this._dispatcher(value);
    } // find the most accomodating type
    // if we are using reconciliation try the current node type first (fix for #1045)


    if (reconcileCurrentType) {
      if (reconcileCurrentType.is(value)) {
        return reconcileCurrentType;
      }

      return this._types.filter(function (t) {
        return t !== reconcileCurrentType;
      }).find(function (type) {
        return type.is(value);
      });
    } else {
      return this._types.find(function (type) {
        return type.is(value);
      });
    }
  };

  Union.prototype.isValidSnapshot = function (value, context) {
    if (this._dispatcher) {
      return this._dispatcher(value).validate(value, context);
    }

    var allErrors = [];
    var applicableTypes = 0;

    for (var i = 0; i < this._types.length; i++) {
      var type = this._types[i];
      var errors = type.validate(value, context);

      if (errors.length === 0) {
        if (this._eager) return typeCheckSuccess();else applicableTypes++;
      } else {
        allErrors.push(errors);
      }
    }

    if (applicableTypes === 1) return typeCheckSuccess();
    return typeCheckFailure(context, value, "No type is applicable for the union").concat(flattenTypeErrors(allErrors));
  };

  Union.prototype.getSubTypes = function () {
    return this._types;
  };

  return Union;
}(BaseType);
/**
 * `types.union` - Create a union of multiple types. If the correct type cannot be inferred unambiguously from a snapshot, provide a dispatcher function of the form `(snapshot) => Type`.
 *
 * @param optionsOrType
 * @param otherTypes
 * @returns
 */


function union(optionsOrType) {
  var otherTypes = [];

  for (var _i = 1; _i < arguments.length; _i++) {
    otherTypes[_i - 1] = arguments[_i];
  }

  var options = isType(optionsOrType) ? undefined : optionsOrType;
  var types = isType(optionsOrType) ? __spread([optionsOrType], otherTypes) : otherTypes;
  var name = "(" + types.map(function (type) {
    return type.name;
  }).join(" | ") + ")"; // check all options

  if (devMode()) {
    if (options) {
      assertArg(options, function (o) {
        return isPlainObject(o);
      }, "object { eager?: boolean, dispatcher?: Function }", 1);
    }

    types.forEach(function (type, i) {
      assertIsType(type, options ? i + 2 : i + 1);
    });
  }

  return new Union(name, types, options);
}
/**
 * Returns if a given value represents a union type.
 *
 * @param type
 * @returns
 */


function isUnionType(type) {
  return (type.flags & TypeFlags.Union) > 0;
}
/**
 * @hidden
 * @internal
 */


var OptionalValue =
/** @class */
function (_super) {
  __extends(OptionalValue, _super);

  function OptionalValue(_subtype, _defaultValue, optionalValues) {
    var _this = _super.call(this, _subtype.name) || this;

    _this._subtype = _subtype;
    _this._defaultValue = _defaultValue;
    _this.optionalValues = optionalValues;
    return _this;
  }

  Object.defineProperty(OptionalValue.prototype, "flags", {
    get: function () {
      return this._subtype.flags | TypeFlags.Optional;
    },
    enumerable: true,
    configurable: true
  });

  OptionalValue.prototype.describe = function () {
    return this._subtype.describe() + "?";
  };

  OptionalValue.prototype.instantiate = function (parent, subpath, environment, initialValue) {
    if (this.optionalValues.indexOf(initialValue) >= 0) {
      var defaultInstanceOrSnapshot = this.getDefaultInstanceOrSnapshot();
      return this._subtype.instantiate(parent, subpath, environment, defaultInstanceOrSnapshot);
    }

    return this._subtype.instantiate(parent, subpath, environment, initialValue);
  };

  OptionalValue.prototype.reconcile = function (current, newValue, parent, subpath) {
    return this._subtype.reconcile(current, this.optionalValues.indexOf(newValue) < 0 && this._subtype.is(newValue) ? newValue : this.getDefaultInstanceOrSnapshot(), parent, subpath);
  };

  OptionalValue.prototype.getDefaultInstanceOrSnapshot = function () {
    var defaultInstanceOrSnapshot = typeof this._defaultValue === "function" ? this._defaultValue() : this._defaultValue; // while static values are already snapshots and checked on types.optional
    // generator functions must always be rechecked just in case

    if (typeof this._defaultValue === "function") {
      typecheckInternal(this, defaultInstanceOrSnapshot);
    }

    return defaultInstanceOrSnapshot;
  };

  OptionalValue.prototype.isValidSnapshot = function (value, context) {
    // defaulted values can be skipped
    if (this.optionalValues.indexOf(value) >= 0) {
      return typeCheckSuccess();
    } // bounce validation to the sub-type


    return this._subtype.validate(value, context);
  };

  OptionalValue.prototype.isAssignableFrom = function (type) {
    return this._subtype.isAssignableFrom(type);
  };

  OptionalValue.prototype.getSubTypes = function () {
    return this._subtype;
  };

  return OptionalValue;
}(BaseType);

function checkOptionalPreconditions(type, defaultValueOrFunction) {
  // make sure we never pass direct instances
  if (typeof defaultValueOrFunction !== "function" && isStateTreeNode(defaultValueOrFunction)) {
    throw fail$1("default value cannot be an instance, pass a snapshot or a function that creates an instance/snapshot instead");
  }

  assertIsType(type, 1);

  if (devMode()) {
    // we only check default values if they are passed directly
    // if they are generator functions they will be checked once they are generated
    // we don't check generator function results here to avoid generating a node just for type-checking purposes
    // which might generate side-effects
    if (typeof defaultValueOrFunction !== "function") {
      typecheckInternal(type, defaultValueOrFunction);
    }
  }
}
/**
 * `types.optional` - Can be used to create a property with a default value.
 *
 * Depending on the third argument (`optionalValues`) there are two ways of operation:
 * - If the argument is not provided, then if a value is not provided in the snapshot (`undefined` or missing),
 *   it will default to the provided `defaultValue`
 * - If the argument is provided, then if the value in the snapshot matches one of the optional values inside the array then it will
 *   default to the provided `defaultValue`. Additionally, if one of the optional values inside the array is `undefined` then a missing
 *   property is also valid.
 *
 *   Note that it is also possible to include values of the same type as the intended subtype as optional values,
 *   in this case the optional value will be transformed into the `defaultValue` (e.g. `types.optional(types.string, "unnamed", [undefined, ""])`
 *   will transform the snapshot values `undefined` (and therefore missing) and empty strings into the string `"unnamed"` when it gets
 *   instantiated).
 *
 * If `defaultValue` is a function, the function will be invoked for every new instance.
 * Applying a snapshot in which the optional value is one of the optional values (or `undefined`/_not_ present if none are provided) causes the
 * value to be reset.
 *
 * Example:
 * ```ts
 * const Todo = types.model({
 *   title: types.string,
 *   subtitle1: types.optional(types.string, "", [null]),
 *   subtitle2: types.optional(types.string, "", [null, undefined]),
 *   done: types.optional(types.boolean, false),
 *   created: types.optional(types.Date, () => new Date()),
 * })
 *
 * // if done is missing / undefined it will become false
 * // if created is missing / undefined it will get a freshly generated timestamp
 * // if subtitle1 is null it will default to "", but it cannot be missing or undefined
 * // if subtitle2 is null or undefined it will default to ""; since it can be undefined it can also be missing
 * const todo = Todo.create({ title: "Get coffee", subtitle1: null })
 * ```
 *
 * @param type
 * @param defaultValueOrFunction
 * @param optionalValues an optional array with zero or more primitive values (string, number, boolean, null or undefined)
 *                       that will be converted into the default. `[ undefined ]` is assumed when none is provided
 * @returns
 */


function optional(type, defaultValueOrFunction, optionalValues) {
  checkOptionalPreconditions(type, defaultValueOrFunction);
  return new OptionalValue(type, defaultValueOrFunction, optionalValues ? optionalValues : undefinedAsOptionalValues);
}

var undefinedAsOptionalValues = [undefined];
/**
 * Returns if a value represents an optional type.
 *
 * @template IT
 * @param type
 * @returns
 */

function isOptionalType(type) {
  return isType(type) && (type.flags & TypeFlags.Optional) > 0;
}

var optionalUndefinedType = optional(undefinedType, undefined);
var optionalNullType = optional(nullType, null);
/**
 * `types.maybe` - Maybe will make a type nullable, and also optional.
 * The value `undefined` will be used to represent nullability.
 *
 * @param type
 * @returns
 */

function maybe(type) {
  assertIsType(type, 1);
  return union(type, optionalUndefinedType);
}
/**
 * `types.maybeNull` - Maybe will make a type nullable, and also optional.
 * The value `null` will be used to represent no value.
 *
 * @param type
 * @returns
 */


function maybeNull(type) {
  assertIsType(type, 1);
  return union(type, optionalNullType);
}

var Late =
/** @class */
function (_super) {
  __extends(Late, _super);

  function Late(name, _definition) {
    var _this = _super.call(this, name) || this;

    _this._definition = _definition;
    return _this;
  }

  Object.defineProperty(Late.prototype, "flags", {
    get: function () {
      return (this._subType ? this._subType.flags : 0) | TypeFlags.Late;
    },
    enumerable: true,
    configurable: true
  });

  Late.prototype.getSubType = function (mustSucceed) {
    if (!this._subType) {
      var t = undefined;

      try {
        t = this._definition();
      } catch (e) {
        if (e instanceof ReferenceError) // can happen in strict ES5 code when a definition is self refering
          t = undefined;else throw e;
      }

      if (mustSucceed && t === undefined) throw fail$1("Late type seems to be used too early, the definition (still) returns undefined");

      if (t) {
        if (devMode() && !isType(t)) throw fail$1("Failed to determine subtype, make sure types.late returns a type definition.");
        this._subType = t;
      }
    }

    return this._subType;
  };

  Late.prototype.instantiate = function (parent, subpath, environment, initialValue) {
    return this.getSubType(true).instantiate(parent, subpath, environment, initialValue);
  };

  Late.prototype.reconcile = function (current, newValue, parent, subpath) {
    return this.getSubType(true).reconcile(current, newValue, parent, subpath);
  };

  Late.prototype.describe = function () {
    var t = this.getSubType(false);
    return t ? t.name : "<uknown late type>";
  };

  Late.prototype.isValidSnapshot = function (value, context) {
    var t = this.getSubType(false);

    if (!t) {
      // See #916; the variable the definition closure is pointing to wasn't defined yet, so can't be evaluted yet here
      return typeCheckSuccess();
    }

    return t.validate(value, context);
  };

  Late.prototype.isAssignableFrom = function (type) {
    var t = this.getSubType(false);
    return t ? t.isAssignableFrom(type) : false;
  };

  Late.prototype.getSubTypes = function () {
    var subtype = this.getSubType(false);
    return subtype ? subtype : cannotDetermineSubtype;
  };

  return Late;
}(BaseType);
/**
 * `types.late` - Defines a type that gets implemented later. This is useful when you have to deal with circular dependencies.
 * Please notice that when defining circular dependencies TypeScript isn't smart enough to inference them.
 *
 * Example:
 * ```ts
 *   // TypeScript isn't smart enough to infer self referencing types.
 *  const Node = types.model({
 *       children: types.array(types.late((): IAnyModelType => Node)) // then typecast each array element to Instance<typeof Node>
 *  })
 * ```
 *
 * @param name The name to use for the type that will be returned.
 * @param type A function that returns the type that will be defined.
 * @returns
 */


function late(nameOrType, maybeType) {
  var name = typeof nameOrType === "string" ? nameOrType : "late(" + nameOrType.toString() + ")";
  var type = typeof nameOrType === "string" ? maybeType : nameOrType; // checks that the type is actually a late type

  if (devMode()) {
    if (!(typeof type === "function" && type.length === 0)) throw fail$1("Invalid late type, expected a function with zero arguments that returns a type, got: " + type);
  }

  return new Late(name, type);
}
/**
 * Returns if a given value represents a late type.
 *
 * @param type
 * @returns
 */


function isLateType(type) {
  return isType(type) && (type.flags & TypeFlags.Late) > 0;
}
/**
 * @internal
 * @hidden
 */


var Frozen =
/** @class */
function (_super) {
  __extends(Frozen, _super);

  function Frozen(subType) {
    var _this = _super.call(this, subType ? "frozen(" + subType.name + ")" : "frozen") || this;

    _this.subType = subType;
    _this.flags = TypeFlags.Frozen;
    return _this;
  }

  Frozen.prototype.describe = function () {
    return "<any immutable value>";
  };

  Frozen.prototype.instantiate = function (parent, subpath, environment, value) {
    // create the node
    return createScalarNode(this, parent, subpath, environment, deepFreeze(value));
  };

  Frozen.prototype.isValidSnapshot = function (value, context) {
    if (!isSerializable(value)) {
      return typeCheckFailure(context, value, "Value is not serializable and cannot be frozen");
    }

    if (this.subType) return this.subType.validate(value, context);
    return typeCheckSuccess();
  };

  return Frozen;
}(SimpleType);

var untypedFrozenInstance = new Frozen();
/**
 * `types.frozen` - Frozen can be used to store any value that is serializable in itself (that is valid JSON).
 * Frozen values need to be immutable or treated as if immutable. They need be serializable as well.
 * Values stored in frozen will snapshotted as-is by MST, and internal changes will not be tracked.
 *
 * This is useful to store complex, but immutable values like vectors etc. It can form a powerful bridge to parts of your application that should be immutable, or that assume data to be immutable.
 *
 * Note: if you want to store free-form state that is mutable, or not serializeable, consider using volatile state instead.
 *
 * Frozen properties can be defined in three different ways
 * 1. `types.frozen(SubType)` - provide a valid MST type and frozen will check if the provided data conforms the snapshot for that type
 * 2. `types.frozen({ someDefaultValue: true})` - provide a primitive value, object or array, and MST will infer the type from that object, and also make it the default value for the field
 * 3. `types.frozen<TypeScriptType>()` - provide a typescript type, to help in strongly typing the field (design time only)
 *
 * Example:
 * ```ts
 * const GameCharacter = types.model({
 *   name: string,
 *   location: types.frozen({ x: 0, y: 0})
 * })
 *
 * const hero = GameCharacter.create({
 *   name: "Mario",
 *   location: { x: 7, y: 4 }
 * })
 *
 * hero.location = { x: 10, y: 2 } // OK
 * hero.location.x = 7 // Not ok!
 * ```
 *
 * ```ts
 * type Point = { x: number, y: number }
 *    const Mouse = types.model({
 *         loc: types.frozen<Point>()
 *    })
 * ```
 *
 * @param defaultValueOrType
 * @returns
 */

function frozen(arg) {
  if (arguments.length === 0) return untypedFrozenInstance;else if (isType(arg)) return new Frozen(arg);else return optional(untypedFrozenInstance, arg);
}
/**
 * Returns if a given value represents a frozen type.
 *
 * @param type
 * @returns
 */


function isFrozenType(type) {
  return isType(type) && (type.flags & TypeFlags.Frozen) > 0;
}

function getInvalidationCause(hook) {
  switch (hook) {
    case Hook.beforeDestroy:
      return "destroy";

    case Hook.beforeDetach:
      return "detach";

    default:
      return undefined;
  }
}

var StoredReference =
/** @class */
function () {
  function StoredReference(value, targetType) {
    this.targetType = targetType;

    if (isValidIdentifier(value)) {
      this.identifier = value;
    } else if (isStateTreeNode(value)) {
      var targetNode = getStateTreeNode(value);
      if (!targetNode.identifierAttribute) throw fail$1("Can only store references with a defined identifier attribute.");
      var id = targetNode.unnormalizedIdentifier;

      if (id === null || id === undefined) {
        throw fail$1("Can only store references to tree nodes with a defined identifier.");
      }

      this.identifier = id;
    } else {
      throw fail$1("Can only store references to tree nodes or identifiers, got: '" + value + "'");
    }
  }

  StoredReference.prototype.updateResolvedReference = function (node) {
    var normalizedId = normalizeIdentifier(this.identifier);
    var root = node.root;
    var lastCacheModification = root.identifierCache.getLastCacheModificationPerId(normalizedId);

    if (!this.resolvedReference || this.resolvedReference.lastCacheModification !== lastCacheModification) {
      var targetType = this.targetType; // reference was initialized with the identifier of the target

      var target = root.identifierCache.resolve(targetType, normalizedId);

      if (!target) {
        throw new InvalidReferenceError("[mobx-state-tree] Failed to resolve reference '" + this.identifier + "' to type '" + this.targetType.name + "' (from node: " + node.path + ")");
      }

      this.resolvedReference = {
        node: target,
        lastCacheModification: lastCacheModification
      };
    }
  };

  Object.defineProperty(StoredReference.prototype, "resolvedValue", {
    get: function () {
      this.updateResolvedReference(this.node);
      return this.resolvedReference.node.value;
    },
    enumerable: true,
    configurable: true
  });
  return StoredReference;
}();
/**
 * @internal
 * @hidden
 */


var InvalidReferenceError =
/** @class */
function (_super) {
  __extends(InvalidReferenceError, _super);

  function InvalidReferenceError(m) {
    var _this = _super.call(this, m) || this;

    Object.setPrototypeOf(_this, InvalidReferenceError.prototype);
    return _this;
  }

  return InvalidReferenceError;
}(Error);
/**
 * @internal
 * @hidden
 */


var BaseReferenceType =
/** @class */
function (_super) {
  __extends(BaseReferenceType, _super);

  function BaseReferenceType(targetType, onInvalidated) {
    var _this = _super.call(this, "reference(" + targetType.name + ")") || this;

    _this.targetType = targetType;
    _this.onInvalidated = onInvalidated;
    _this.flags = TypeFlags.Reference;
    return _this;
  }

  BaseReferenceType.prototype.describe = function () {
    return this.name;
  };

  BaseReferenceType.prototype.isAssignableFrom = function (type) {
    return this.targetType.isAssignableFrom(type);
  };

  BaseReferenceType.prototype.isValidSnapshot = function (value, context) {
    return isValidIdentifier(value) ? typeCheckSuccess() : typeCheckFailure(context, value, "Value is not a valid identifier, which is a string or a number");
  };

  BaseReferenceType.prototype.fireInvalidated = function (cause, storedRefNode, referenceId, refTargetNode) {
    // to actually invalidate a reference we need an alive parent,
    // since it is a scalar value (immutable-ish) and we need to change it
    // from the parent
    var storedRefParentNode = storedRefNode.parent;

    if (!storedRefParentNode || !storedRefParentNode.isAlive) {
      return;
    }

    var storedRefParentValue = storedRefParentNode.storedValue;

    if (!storedRefParentValue) {
      return;
    }

    this.onInvalidated({
      cause: cause,
      parent: storedRefParentValue,
      invalidTarget: refTargetNode ? refTargetNode.storedValue : undefined,
      invalidId: referenceId,
      replaceRef: function (newRef) {
        applyPatch(storedRefNode.root.storedValue, {
          op: "replace",
          value: newRef,
          path: storedRefNode.path
        });
      },
      removeRef: function () {
        if (isModelType(storedRefParentNode.type)) {
          this.replaceRef(undefined);
        } else {
          applyPatch(storedRefNode.root.storedValue, {
            op: "remove",
            path: storedRefNode.path
          });
        }
      }
    });
  };

  BaseReferenceType.prototype.addTargetNodeWatcher = function (storedRefNode, referenceId) {
    var _this = this; // this will make sure the target node becomes created


    var refTargetValue = this.getValue(storedRefNode);

    if (!refTargetValue) {
      return undefined;
    }

    var refTargetNode = getStateTreeNode(refTargetValue);

    var hookHandler = function (_, refTargetNodeHook) {
      var cause = getInvalidationCause(refTargetNodeHook);

      if (!cause) {
        return;
      }

      _this.fireInvalidated(cause, storedRefNode, referenceId, refTargetNode);
    };

    var refTargetDetachHookDisposer = refTargetNode.registerHook(Hook.beforeDetach, hookHandler);
    var refTargetDestroyHookDisposer = refTargetNode.registerHook(Hook.beforeDestroy, hookHandler);
    return function () {
      refTargetDetachHookDisposer();
      refTargetDestroyHookDisposer();
    };
  };

  BaseReferenceType.prototype.watchTargetNodeForInvalidations = function (storedRefNode, identifier, customGetSet) {
    var _this = this;

    if (!this.onInvalidated) {
      return;
    }

    var onRefTargetDestroyedHookDisposer; // get rid of the watcher hook when the stored ref node is destroyed
    // detached is ignored since scalar nodes (where the reference resides) cannot be detached

    storedRefNode.registerHook(Hook.beforeDestroy, function () {
      if (onRefTargetDestroyedHookDisposer) {
        onRefTargetDestroyedHookDisposer();
      }
    });

    var startWatching = function (sync) {
      // re-create hook in case the stored ref gets reattached
      if (onRefTargetDestroyedHookDisposer) {
        onRefTargetDestroyedHookDisposer();
      } // make sure the target node is actually there and initialized


      var storedRefParentNode = storedRefNode.parent;
      var storedRefParentValue = storedRefParentNode && storedRefParentNode.storedValue;

      if (storedRefParentNode && storedRefParentNode.isAlive && storedRefParentValue) {
        var refTargetNodeExists = void 0;

        if (customGetSet) {
          refTargetNodeExists = !!customGetSet.get(identifier, storedRefParentValue);
        } else {
          refTargetNodeExists = storedRefNode.root.identifierCache.has(_this.targetType, normalizeIdentifier(identifier));
        }

        if (!refTargetNodeExists) {
          // we cannot change the reference in sync mode
          // since we are in the middle of a reconciliation/instantiation and the change would be overwritten
          // for those cases just let the wrong reference be assigned and fail upon usage
          // (like current references do)
          // this means that effectively this code will only run when it is created from a snapshot
          if (!sync) {
            _this.fireInvalidated("invalidSnapshotReference", storedRefNode, identifier, null);
          }
        } else {
          onRefTargetDestroyedHookDisposer = _this.addTargetNodeWatcher(storedRefNode, identifier);
        }
      }
    };

    if (storedRefNode.state === NodeLifeCycle.FINALIZED) {
      // already attached, so the whole tree is ready
      startWatching(true);
    } else {
      if (!storedRefNode.isRoot) {
        // start watching once the whole tree is ready
        storedRefNode.root.registerHook(Hook.afterCreationFinalization, function () {
          // make sure to attach it so it can start listening
          if (storedRefNode.parent) {
            storedRefNode.parent.createObservableInstanceIfNeeded();
          }
        });
      } // start watching once the node is attached somewhere / parent changes


      storedRefNode.registerHook(Hook.afterAttach, function () {
        startWatching(false);
      });
    }
  };

  return BaseReferenceType;
}(SimpleType);
/**
 * @internal
 * @hidden
 */


var IdentifierReferenceType =
/** @class */
function (_super) {
  __extends(IdentifierReferenceType, _super);

  function IdentifierReferenceType(targetType, onInvalidated) {
    return _super.call(this, targetType, onInvalidated) || this;
  }

  IdentifierReferenceType.prototype.getValue = function (storedRefNode) {
    if (!storedRefNode.isAlive) return undefined;
    var storedRef = storedRefNode.storedValue;
    return storedRef.resolvedValue;
  };

  IdentifierReferenceType.prototype.getSnapshot = function (storedRefNode) {
    var ref = storedRefNode.storedValue;
    return ref.identifier;
  };

  IdentifierReferenceType.prototype.instantiate = function (parent, subpath, environment, initialValue) {
    var identifier = isStateTreeNode(initialValue) ? getIdentifier(initialValue) : initialValue;
    var storedRef = new StoredReference(initialValue, this.targetType);
    var storedRefNode = createScalarNode(this, parent, subpath, environment, storedRef);
    storedRef.node = storedRefNode;
    this.watchTargetNodeForInvalidations(storedRefNode, identifier, undefined);
    return storedRefNode;
  };

  IdentifierReferenceType.prototype.reconcile = function (current, newValue, parent, subpath) {
    if (!current.isDetaching && current.type === this) {
      var compareByValue = isStateTreeNode(newValue);
      var ref = current.storedValue;

      if (!compareByValue && ref.identifier === newValue || compareByValue && ref.resolvedValue === newValue) {
        current.setParent(parent, subpath);
        return current;
      }
    }

    var newNode = this.instantiate(parent, subpath, undefined, newValue);
    current.die(); // noop if detaching

    return newNode;
  };

  return IdentifierReferenceType;
}(BaseReferenceType);
/**
 * @internal
 * @hidden
 */


var CustomReferenceType =
/** @class */
function (_super) {
  __extends(CustomReferenceType, _super);

  function CustomReferenceType(targetType, options, onInvalidated) {
    var _this = _super.call(this, targetType, onInvalidated) || this;

    _this.options = options;
    return _this;
  }

  CustomReferenceType.prototype.getValue = function (storedRefNode) {
    if (!storedRefNode.isAlive) return undefined;
    var referencedNode = this.options.get(storedRefNode.storedValue, storedRefNode.parent ? storedRefNode.parent.storedValue : null);
    return referencedNode;
  };

  CustomReferenceType.prototype.getSnapshot = function (storedRefNode) {
    return storedRefNode.storedValue;
  };

  CustomReferenceType.prototype.instantiate = function (parent, subpath, environment, newValue) {
    var identifier = isStateTreeNode(newValue) ? this.options.set(newValue, parent ? parent.storedValue : null) : newValue;
    var storedRefNode = createScalarNode(this, parent, subpath, environment, identifier);
    this.watchTargetNodeForInvalidations(storedRefNode, identifier, this.options);
    return storedRefNode;
  };

  CustomReferenceType.prototype.reconcile = function (current, newValue, parent, subpath) {
    var newIdentifier = isStateTreeNode(newValue) ? this.options.set(newValue, current ? current.storedValue : null) : newValue;

    if (!current.isDetaching && current.type === this && current.storedValue === newIdentifier) {
      current.setParent(parent, subpath);
      return current;
    }

    var newNode = this.instantiate(parent, subpath, undefined, newIdentifier);
    current.die(); // noop if detaching

    return newNode;
  };

  return CustomReferenceType;
}(BaseReferenceType);
/**
 * `types.reference` - Creates a reference to another type, which should have defined an identifier.
 * See also the [reference and identifiers](https://github.com/mobxjs/mobx-state-tree#references-and-identifiers) section.
 */


function reference(subType, options) {
  assertIsType(subType, 1);

  if (devMode()) {
    if (arguments.length === 2 && typeof arguments[1] === "string") {
      // istanbul ignore next
      throw fail$1("References with base path are no longer supported. Please remove the base path.");
    }
  }

  var getSetOptions = options ? options : undefined;
  var onInvalidated = options ? options.onInvalidated : undefined;

  if (getSetOptions && (getSetOptions.get || getSetOptions.set)) {
    if (devMode()) {
      if (!getSetOptions.get || !getSetOptions.set) {
        throw fail$1("reference options must either contain both a 'get' and a 'set' method or none of them");
      }
    }

    return new CustomReferenceType(subType, {
      get: getSetOptions.get,
      set: getSetOptions.set
    }, onInvalidated);
  } else {
    return new IdentifierReferenceType(subType, onInvalidated);
  }
}
/**
 * Returns if a given value represents a reference type.
 *
 * @param type
 * @returns
 */


function isReferenceType(type) {
  return (type.flags & TypeFlags.Reference) > 0;
}
/**
 * `types.safeReference` - A safe reference is like a standard reference, except that it accepts the undefined value by default
 * and automatically sets itself to undefined (when the parent is a model) / removes itself from arrays and maps
 * when the reference it is pointing to gets detached/destroyed.
 *
 * The optional options parameter object accepts a parameter named `acceptsUndefined`, which is set to true by default, so it is suitable
 * for model properties.
 * When used inside collections (arrays/maps), it is recommended to set this option to false so it can't take undefined as value,
 * which is usually the desired in those cases.
 *
 * Strictly speaking it is a `types.maybe(types.reference(X))` (when `acceptsUndefined` is set to true, the default) and
 * `types.reference(X)` (when `acceptsUndefined` is set to false), both of them with a customized `onInvalidated` option.
 *
 * @param subType
 * @param options
 * @returns
 */


function safeReference(subType, options) {
  var refType = reference(subType, __assign(__assign({}, options), {
    onInvalidated: function (ev) {
      ev.removeRef();
    }
  }));

  if (options && options.acceptsUndefined === false) {
    return refType;
  } else {
    return maybe(refType);
  }
}

var BaseIdentifierType =
/** @class */
function (_super) {
  __extends(BaseIdentifierType, _super);

  function BaseIdentifierType(name, validType) {
    var _this = _super.call(this, name) || this;

    _this.validType = validType;
    _this.flags = TypeFlags.Identifier;
    return _this;
  }

  BaseIdentifierType.prototype.instantiate = function (parent, subpath, environment, initialValue) {
    if (!parent || !(parent.type instanceof ModelType)) throw fail$1("Identifier types can only be instantiated as direct child of a model type");
    return createScalarNode(this, parent, subpath, environment, initialValue);
  };

  BaseIdentifierType.prototype.reconcile = function (current, newValue, parent, subpath) {
    // we don't consider detaching here since identifier are scalar nodes, and scalar nodes cannot be detached
    if (current.storedValue !== newValue) throw fail$1("Tried to change identifier from '" + current.storedValue + "' to '" + newValue + "'. Changing identifiers is not allowed.");
    current.setParent(parent, subpath);
    return current;
  };

  BaseIdentifierType.prototype.isValidSnapshot = function (value, context) {
    if (typeof value !== this.validType) {
      return typeCheckFailure(context, value, "Value is not a valid " + this.describe() + ", expected a " + this.validType);
    }

    return typeCheckSuccess();
  };

  return BaseIdentifierType;
}(SimpleType);
/**
 * @internal
 * @hidden
 */


var IdentifierType =
/** @class */
function (_super) {
  __extends(IdentifierType, _super);

  function IdentifierType() {
    var _this = _super.call(this, "identifier", "string") || this;

    _this.flags = TypeFlags.Identifier;
    return _this;
  }

  IdentifierType.prototype.describe = function () {
    return "identifier";
  };

  return IdentifierType;
}(BaseIdentifierType);
/**
 * @internal
 * @hidden
 */


var IdentifierNumberType =
/** @class */
function (_super) {
  __extends(IdentifierNumberType, _super);

  function IdentifierNumberType() {
    return _super.call(this, "identifierNumber", "number") || this;
  }

  IdentifierNumberType.prototype.getSnapshot = function (node) {
    return node.storedValue;
  };

  IdentifierNumberType.prototype.describe = function () {
    return "identifierNumber";
  };

  return IdentifierNumberType;
}(BaseIdentifierType);
/**
 * `types.identifier` - Identifiers are used to make references, lifecycle events and reconciling works.
 * Inside a state tree, for each type can exist only one instance for each given identifier.
 * For example there couldn't be 2 instances of user with id 1. If you need more, consider using references.
 * Identifier can be used only as type property of a model.
 * This type accepts as parameter the value type of the identifier field that can be either string or number.
 *
 * Example:
 * ```ts
 *  const Todo = types.model("Todo", {
 *      id: types.identifier,
 *      title: types.string
 *  })
 * ```
 *
 * @returns
 */


var identifier = new IdentifierType();
/**
 * `types.identifierNumber` - Similar to `types.identifier`. This one will serialize from / to a number when applying snapshots
 *
 * Example:
 * ```ts
 *  const Todo = types.model("Todo", {
 *      id: types.identifierNumber,
 *      title: types.string
 *  })
 * ```
 *
 * @returns
 */

var identifierNumber = new IdentifierNumberType();
/**
 * Returns if a given value represents an identifier type.
 *
 * @param type
 * @returns
 */

function isIdentifierType(type) {
  return isType(type) && (type.flags & TypeFlags.Identifier) > 0;
}
/**
 * @internal
 * @hidden
 */


function normalizeIdentifier(id) {
  return "" + id;
}
/**
 * @internal
 * @hidden
 */


function isValidIdentifier(id) {
  return typeof id === "string" || typeof id === "number";
}
/**
 * @internal
 * @hidden
 */


function assertIsValidIdentifier(id, argNumber) {
  assertArg(id, isValidIdentifier, "string or number (identifier)", argNumber);
}
/**
 * `types.custom` - Creates a custom type. Custom types can be used for arbitrary immutable values, that have a serializable representation. For example, to create your own Date representation, Decimal type etc.
 *
 * The signature of the options is:
 * ```ts
 * export interface CustomTypeOptions<S, T> {
 *     // Friendly name
 *     name: string
 *     // given a serialized value, how to turn it into the target type
 *     fromSnapshot(snapshot: S): T
 *     // return the serialization of the current value
 *     toSnapshot(value: T): S
 *     // if true, this is a converted value, if false, it's a snapshot
 *     isTargetType(value: T | S): value is T
 *     // a non empty string is assumed to be a validation error
 *     getValidationMessage?(snapshot: S): string
 * }
 * ```
 *
 * Example:
 * ```ts
 * const DecimalPrimitive = types.custom<string, Decimal>({
 *     name: "Decimal",
 *     fromSnapshot(value: string) {
 *         return new Decimal(value)
 *     },
 *     toSnapshot(value: Decimal) {
 *         return value.toString()
 *     },
 *     isTargetType(value: string | Decimal): boolean {
 *         return value instanceof Decimal
 *     },
 *     getValidationMessage(value: string): string {
 *         if (/^-?\d+\.\d+$/.test(value)) return "" // OK
 *         return `'${value}' doesn't look like a valid decimal number`
 *     }
 * })
 *
 * const Wallet = types.model({
 *     balance: DecimalPrimitive
 * })
 * ```
 *
 * @param options
 * @returns
 */


function custom(options) {
  return new CustomType(options);
}
/**
 * @internal
 * @hidden
 */


var CustomType =
/** @class */
function (_super) {
  __extends(CustomType, _super);

  function CustomType(options) {
    var _this = _super.call(this, options.name) || this;

    _this.options = options;
    _this.flags = TypeFlags.Custom;
    return _this;
  }

  CustomType.prototype.describe = function () {
    return this.name;
  };

  CustomType.prototype.isValidSnapshot = function (value, context) {
    if (this.options.isTargetType(value)) return typeCheckSuccess();
    var typeError = this.options.getValidationMessage(value);

    if (typeError) {
      return typeCheckFailure(context, value, "Invalid value for type '" + this.name + "': " + typeError);
    }

    return typeCheckSuccess();
  };

  CustomType.prototype.getSnapshot = function (node) {
    return this.options.toSnapshot(node.storedValue);
  };

  CustomType.prototype.instantiate = function (parent, subpath, environment, initialValue) {
    var valueToStore = this.options.isTargetType(initialValue) ? initialValue : this.options.fromSnapshot(initialValue);
    return createScalarNode(this, parent, subpath, environment, valueToStore);
  };

  CustomType.prototype.reconcile = function (current, value, parent, subpath) {
    var isSnapshot = !this.options.isTargetType(value); // in theory customs use scalar nodes which cannot be detached, but still...

    if (!current.isDetaching) {
      var unchanged = current.type === this && (isSnapshot ? value === current.snapshot : value === current.storedValue);

      if (unchanged) {
        current.setParent(parent, subpath);
        return current;
      }
    }

    var valueToStore = isSnapshot ? this.options.fromSnapshot(value) : value;
    var newNode = this.instantiate(parent, subpath, undefined, valueToStore);
    current.die(); // noop if detaching

    return newNode;
  };

  return CustomType;
}(SimpleType); // we import the types to re-export them inside types.


var types = {
  enumeration: enumeration,
  model: model,
  compose: compose,
  custom: custom,
  reference: reference,
  safeReference: safeReference,
  union: union,
  optional: optional,
  literal: literal,
  maybe: maybe,
  maybeNull: maybeNull,
  refinement: refinement,
  string: string,
  boolean: boolean,
  number: number,
  integer: integer,
  Date: DatePrimitive,
  map: map,
  array: array,
  frozen: frozen,
  identifier: identifier,
  identifierNumber: identifierNumber,
  late: late,
  undefined: undefinedType,
  null: nullType,
  snapshotProcessor: snapshotProcessor
};
exports.types = types;
},{"mobx":"../../node_modules/@formular/core/node_modules/mobx/lib/mobx.module.js","process":"../../node_modules/process/browser.js"}],"../../node_modules/@formular/core/es/nodes/field.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createField = createField;
exports.Field = void 0;

var _mobxStateTree = require("mobx-state-tree");

var Field = _mobxStateTree.types.model('Field', {
  value: _mobxStateTree.types.maybe(_mobxStateTree.types.union(_mobxStateTree.types.string, _mobxStateTree.types.number, _mobxStateTree.types.boolean))
}).actions(function (self) {
  return {
    setValue: function setValue(val) {
      self.value = val === '' ? undefined : val;
    }
  };
}).actions(function (self) {
  return {
    patchValue: function patchValue(val) {
      self.setValue(val);
    }
  };
});

exports.Field = Field;

function createField(value) {
  return Field.create({
    value: value
  });
}
},{"mobx-state-tree":"../../node_modules/@formular/core/node_modules/mobx-state-tree/dist/mobx-state-tree.module.js"}],"../../node_modules/@formular/core/node_modules/@babel/runtime/helpers/defineProperty.js":[function(require,module,exports) {
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

module.exports = _defineProperty;
},{}],"../../node_modules/@formular/core/node_modules/@babel/runtime/helpers/arrayWithHoles.js":[function(require,module,exports) {
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

module.exports = _arrayWithHoles;
},{}],"../../node_modules/@formular/core/node_modules/@babel/runtime/helpers/iterableToArrayLimit.js":[function(require,module,exports) {
function _iterableToArrayLimit(arr, i) {
  if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
    return;
  }

  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

module.exports = _iterableToArrayLimit;
},{}],"../../node_modules/@formular/core/node_modules/@babel/runtime/helpers/nonIterableRest.js":[function(require,module,exports) {
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

module.exports = _nonIterableRest;
},{}],"../../node_modules/@formular/core/node_modules/@babel/runtime/helpers/slicedToArray.js":[function(require,module,exports) {
var arrayWithHoles = require("./arrayWithHoles");

var iterableToArrayLimit = require("./iterableToArrayLimit");

var nonIterableRest = require("./nonIterableRest");

function _slicedToArray(arr, i) {
  return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || nonIterableRest();
}

module.exports = _slicedToArray;
},{"./arrayWithHoles":"../../node_modules/@formular/core/node_modules/@babel/runtime/helpers/arrayWithHoles.js","./iterableToArrayLimit":"../../node_modules/@formular/core/node_modules/@babel/runtime/helpers/iterableToArrayLimit.js","./nonIterableRest":"../../node_modules/@formular/core/node_modules/@babel/runtime/helpers/nonIterableRest.js"}],"../../node_modules/@formular/core/node_modules/@babel/runtime/helpers/arrayWithoutHoles.js":[function(require,module,exports) {
function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  }
}

module.exports = _arrayWithoutHoles;
},{}],"../../node_modules/@formular/core/node_modules/@babel/runtime/helpers/iterableToArray.js":[function(require,module,exports) {
function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

module.exports = _iterableToArray;
},{}],"../../node_modules/@formular/core/node_modules/@babel/runtime/helpers/nonIterableSpread.js":[function(require,module,exports) {
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

module.exports = _nonIterableSpread;
},{}],"../../node_modules/@formular/core/node_modules/@babel/runtime/helpers/toConsumableArray.js":[function(require,module,exports) {
var arrayWithoutHoles = require("./arrayWithoutHoles");

var iterableToArray = require("./iterableToArray");

var nonIterableSpread = require("./nonIterableSpread");

function _toConsumableArray(arr) {
  return arrayWithoutHoles(arr) || iterableToArray(arr) || nonIterableSpread();
}

module.exports = _toConsumableArray;
},{"./arrayWithoutHoles":"../../node_modules/@formular/core/node_modules/@babel/runtime/helpers/arrayWithoutHoles.js","./iterableToArray":"../../node_modules/@formular/core/node_modules/@babel/runtime/helpers/iterableToArray.js","./nonIterableSpread":"../../node_modules/@formular/core/node_modules/@babel/runtime/helpers/nonIterableSpread.js"}],"../../node_modules/@formular/core/node_modules/@babel/runtime/helpers/typeof.js":[function(require,module,exports) {
function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    module.exports = _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    module.exports = _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

module.exports = _typeof;
},{}],"../../node_modules/@formular/core/es/nodes/helper/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dispatcher = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _field = require("../field");

var _group = require("../group");

var _array = require("../array");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var dispatcher = function dispatcher(snapshot) {
  if ((0, _typeof2.default)(snapshot.children) === 'object' && !Array.isArray(snapshot.children)) {
    return _group.FieldGroup;
  }

  if ((0, _typeof2.default)(snapshot.children) === 'object' && Array.isArray(snapshot.children)) {
    return _array.FieldArray;
  }

  return _field.Field;
};

exports.dispatcher = dispatcher;
},{"@babel/runtime/helpers/typeof":"../../node_modules/@formular/core/node_modules/@babel/runtime/helpers/typeof.js","../field":"../../node_modules/@formular/core/es/nodes/field.js","../group":"../../node_modules/@formular/core/es/nodes/group.js","../array":"../../node_modules/@formular/core/es/nodes/array.js"}],"../../node_modules/@formular/core/es/nodes/array.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createFieldArray = createFieldArray;
exports.FieldArray = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _mobxStateTree = require("mobx-state-tree");

var _group = require("./group");

var _field = require("./field");

var _helper = require("./helper");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var FieldArray = _mobxStateTree.types.model('FieldArray', {
  children: _mobxStateTree.types.array(_mobxStateTree.types.union({
    dispatcher: _helper.dispatcher
  }, _field.Field, _mobxStateTree.types.late(function () {
    return _group.FieldGroup;
  }), _mobxStateTree.types.late(function () {
    return FieldArray;
  })))
}).views(function (self) {
  return {
    get value() {
      return (0, _toConsumableArray2.default)(self.children.values()).map(function (_ref) {
        var value = _ref.value;
        return value;
      });
    }

  };
}).actions(function (self) {
  function _checkAllValuesPresent(val) {
    self.children.forEach(function (field, index) {
      if (val[index] === undefined) {
        throw new Error("Must supply a value for form field at index: ".concat(index, "."));
      }
    });
  }

  function _throwIfFieldMissing(index) {
    if (!self.children.length) {
      throw new Error('There are no form fields registered with this array yet.');
    }

    if (!self.children[index]) {
      throw new Error("Cannot find form field at index ".concat(index));
    }
  }

  return {
    setValue: function setValue(val) {
      _checkAllValuesPresent(val);

      val.forEach(function (newValue, index) {
        _throwIfFieldMissing(index);

        self.children[index].setValue(newValue);
      });
    },
    patchValue: function patchValue(val) {
      val.forEach(function (newValue, index) {
        if (self.children[index]) {
          self.children[index].patchValue(newValue);
        }
      });
    }
  };
});

exports.FieldArray = FieldArray;

function createFieldArray(value) {
  var children = [];
  value.forEach(function (target, index) {
    var type = (0, _helper.dispatcher)({
      children: target
    });

    if (type === _group.FieldGroup) {
      children[index] = (0, _group.createFieldGroup)(target);
    } else if (type === FieldArray) {
      children[index] = createFieldArray(target);
    } else {
      children[index] = (0, _field.createField)(target);
    }
  });
  return FieldArray.create({
    children: children
  });
}
},{"@babel/runtime/helpers/toConsumableArray":"../../node_modules/@formular/core/node_modules/@babel/runtime/helpers/toConsumableArray.js","mobx-state-tree":"../../node_modules/@formular/core/node_modules/mobx-state-tree/dist/mobx-state-tree.module.js","./group":"../../node_modules/@formular/core/es/nodes/group.js","./field":"../../node_modules/@formular/core/es/nodes/field.js","./helper":"../../node_modules/@formular/core/es/nodes/helper/index.js"}],"../../node_modules/@formular/core/es/nodes/group.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createFieldGroup = createFieldGroup;
exports.FieldGroup = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _mobxStateTree = require("mobx-state-tree");

var _field = require("./field");

var _array = require("./array");

var _helper = require("./helper");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var FieldGroup = _mobxStateTree.types.model('FieldGroup', {
  children: _mobxStateTree.types.map(_mobxStateTree.types.union({
    dispatcher: _helper.dispatcher
  }, _field.Field, _mobxStateTree.types.late(function () {
    return FieldGroup;
  }), _mobxStateTree.types.late(function () {
    return _array.FieldArray;
  })))
}).views(function (self) {
  return {
    get value() {
      var result = {};
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = self.children.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _step$value = (0, _slicedToArray2.default)(_step.value, 2),
              _key = _step$value[0],
              node = _step$value[1];

          Object.assign(result, (0, _defineProperty2.default)({}, _key, node.value));
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return result;
    }

  };
}).actions(function (self) {
  function _checkAllValuesPresent(val) {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = self.children.keys()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var name = _step2.value;

        if (val[name] === undefined) {
          throw new Error("Must supply a value for form field with name: '".concat(name, "'."));
        }
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  }

  function _throwIfFieldMissing(name) {
    if (!self.children.size) {
      throw new Error('There are no form fields registered with this group yet.');
    }

    if (!self.children.get(name)) {
      throw new Error("Cannot find form field with name: ".concat(name, "."));
    }
  }

  return {
    setValue: function setValue(val) {
      _checkAllValuesPresent(val);

      Object.keys(val).forEach(function (name) {
        _throwIfFieldMissing(name);

        self.children.get(name).setValue(val[name]);
      });
    },
    patchValue: function patchValue(val) {
      Object.keys(val).forEach(function (name) {
        if (self.children.get(name)) {
          self.children.get(name).patchValue(val[name]);
        }
      });
    },
    afterAttach: function afterAttach() {
      console.log(self, 'is attached');
    }
  };
});

exports.FieldGroup = FieldGroup;

function createFieldGroup(value) {
  var children = {};
  Object.keys(value).forEach(function (name) {
    var target = value[name];
    var type = (0, _helper.dispatcher)({
      children: target
    });

    if (type === FieldGroup) {
      Object.assign(children, (0, _defineProperty2.default)({}, name, createFieldGroup(target)));
    } else if (type === _array.FieldArray) {
      Object.assign(children, (0, _defineProperty2.default)({}, name, (0, _array.createFieldArray)(target)));
    } else {
      Object.assign(children, (0, _defineProperty2.default)({}, name, (0, _field.createField)(target)));
    }
  });
  return FieldGroup.create({
    children: children
  });
}
},{"@babel/runtime/helpers/defineProperty":"../../node_modules/@formular/core/node_modules/@babel/runtime/helpers/defineProperty.js","@babel/runtime/helpers/slicedToArray":"../../node_modules/@formular/core/node_modules/@babel/runtime/helpers/slicedToArray.js","mobx-state-tree":"../../node_modules/@formular/core/node_modules/mobx-state-tree/dist/mobx-state-tree.module.js","./field":"../../node_modules/@formular/core/es/nodes/field.js","./array":"../../node_modules/@formular/core/es/nodes/array.js","./helper":"../../node_modules/@formular/core/es/nodes/helper/index.js"}],"../../node_modules/@formular/core/node_modules/regenerator-runtime/runtime.js":[function(require,module,exports) {
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[toStringTagSymbol] = "Generator";

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  typeof module === "object" ? module.exports : {}
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}

},{}],"../../node_modules/@formular/core/node_modules/@babel/runtime/regenerator/index.js":[function(require,module,exports) {
module.exports = require("regenerator-runtime");

},{"regenerator-runtime":"../../node_modules/@formular/core/node_modules/regenerator-runtime/runtime.js"}],"../../node_modules/@formular/core/es/nodes/form.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createForm = createForm;
exports.Form = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _mobxStateTree = require("mobx-state-tree");

var _group = require("./group");

var _array = require("./array");

var _field = require("./field");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Form = _mobxStateTree.types.model('Form', {
  root: _group.FieldGroup,
  isSubmitting: _mobxStateTree.types.boolean
}).actions(function (self) {
  return {
    submit: (0, _mobxStateTree.flow)( /*#__PURE__*/_regenerator.default.mark(function submit() {
      return _regenerator.default.wrap(function submit$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              self.isSubmitting = true;
              _context.next = 3;
              return new Promise(function (r) {
                return setTimeout(r, 500);
              });

            case 3:
              self.isSubmitting = false;
              return _context.abrupt("return", self.root.value);

            case 5:
            case "end":
              return _context.stop();
          }
        }
      }, submit);
    })),
    reset: function reset() {
      (0, _mobxStateTree.walk)(self.root, function (node) {
        var type = (0, _mobxStateTree.getType)(node);

        if ([_field.Field, _group.FieldGroup, _array.FieldArray].some(function (fieldType) {
          return fieldType === type;
        })) {
          console.log('node with type', type);
          console.log('node =', node);
        }
      });
    }
  };
});

exports.Form = Form;

function createForm(_ref) {
  var _ref$initialValues = _ref.initialValues,
      initialValues = _ref$initialValues === void 0 ? {} : _ref$initialValues,
      _ref$values = _ref.values,
      values = _ref$values === void 0 ? {} : _ref$values;
  var root = (0, _group.createFieldGroup)(initialValues); // debug for walk

  !!root.value;
  root.patchValue(values);
  return Form.create({
    root: root,
    isSubmitting: false
  });
}
},{"@babel/runtime/regenerator":"../../node_modules/@formular/core/node_modules/@babel/runtime/regenerator/index.js","mobx-state-tree":"../../node_modules/@formular/core/node_modules/mobx-state-tree/dist/mobx-state-tree.module.js","./group":"../../node_modules/@formular/core/es/nodes/group.js","./array":"../../node_modules/@formular/core/es/nodes/array.js","./field":"../../node_modules/@formular/core/es/nodes/field.js"}],"../../node_modules/@formular/core/es/nodes/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Field", {
  enumerable: true,
  get: function () {
    return _field.Field;
  }
});
Object.defineProperty(exports, "FieldInstance", {
  enumerable: true,
  get: function () {
    return _field.FieldInstance;
  }
});
Object.defineProperty(exports, "createField", {
  enumerable: true,
  get: function () {
    return _field.createField;
  }
});
Object.defineProperty(exports, "FieldGroup", {
  enumerable: true,
  get: function () {
    return _group.FieldGroup;
  }
});
Object.defineProperty(exports, "FieldGroupInstance", {
  enumerable: true,
  get: function () {
    return _group.FieldGroupInstance;
  }
});
Object.defineProperty(exports, "createFieldGroup", {
  enumerable: true,
  get: function () {
    return _group.createFieldGroup;
  }
});
Object.defineProperty(exports, "FieldArray", {
  enumerable: true,
  get: function () {
    return _array.FieldArray;
  }
});
Object.defineProperty(exports, "FieldArrayInstance", {
  enumerable: true,
  get: function () {
    return _array.FieldArrayInstance;
  }
});
Object.defineProperty(exports, "createFieldArray", {
  enumerable: true,
  get: function () {
    return _array.createFieldArray;
  }
});
Object.defineProperty(exports, "Form", {
  enumerable: true,
  get: function () {
    return _form.Form;
  }
});
Object.defineProperty(exports, "FormInstance", {
  enumerable: true,
  get: function () {
    return _form.FormInstance;
  }
});
Object.defineProperty(exports, "createForm", {
  enumerable: true,
  get: function () {
    return _form.createForm;
  }
});

var _field = require("./field");

var _group = require("./group");

var _array = require("./array");

var _form = require("./form");
},{"./field":"../../node_modules/@formular/core/es/nodes/field.js","./group":"../../node_modules/@formular/core/es/nodes/group.js","./array":"../../node_modules/@formular/core/es/nodes/array.js","./form":"../../node_modules/@formular/core/es/nodes/form.js"}],"../../node_modules/@formular/core/es/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nodes = require("./nodes");

Object.keys(_nodes).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _nodes[key];
    }
  });
});
},{"./nodes":"../../node_modules/@formular/core/es/nodes/index.js"}],"index.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var core_1 = require("@formular/core");

window.base = core_1.createForm({
  initialValues: {
    foo: 'bar',
    bar: 123,
    baz: true,
    touming: undefined,
    foofoo: {
      username: 'baozi',
      age: 23
    },
    tag: ['happy', 'nice', 'quick'],
    firends: [{
      name: 'Heskey',
      age: 22
    }, {
      name: 'Barbara',
      age: 25
    }, {
      name: 'Fiona',
      age: 24
    }]
  }
});
},{"@formular/core":"../../node_modules/@formular/core/es/index.js"}],"../../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "49600" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.ts"], null)
//# sourceMappingURL=/basic.77de5100.js.map