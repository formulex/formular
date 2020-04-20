import {
  IReactionPublic,
  IAutorunOptions,
  autorun,
  IReactionOptions,
  reaction
} from 'mobx';
import { ResolverContextManager } from '..';

export interface DepsTracer<R, T = WatchEffectArgs> {
  (tools: T): R;
}

export interface WatchEffectArgs {
  trace: IReactionPublic['trace'];
}

export function watchEffect(
  effect: DepsTracer<any | Promise<any>>,
  opts?: IAutorunOptions
): void {
  if (ResolverContextManager.top) {
    ResolverContextManager.top.disposers.push(
      autorun((r) => effect({ trace: r.trace.bind(r) }), {
        ...opts,
        name: 'watchEffect' + (opts?.name ? ':' + opts?.name : '')
      })
    );
  } else {
    throw new Error('"watchEffect" should run with context');
  }
}

export function watch<R>(
  expression: DepsTracer<R>,
  effect: (arg: R) => void | Promise<void>,
  opts?: IReactionOptions
): void {
  if (ResolverContextManager.top) {
    ResolverContextManager.top.disposers.push(
      reaction(({ trace }) => expression({ trace }), effect, {
        ...opts,
        name: 'watch' + (opts?.name ? ':' + opts?.name : '')
      })
    );
  } else {
    throw new Error('"watch" should run with resolve context');
  }
}
