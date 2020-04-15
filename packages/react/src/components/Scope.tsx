import React from 'react';
import { ScopeConext } from '../contexts';
import { useScope } from '../hooks/useScope';
import {
  AutorunEffect,
  useAutoruns,
  ReactionTrace,
  ReactionEffect,
  useReactions
} from '../hooks';

export interface ScopeProps {
  name?: string;
  auto?: AutorunEffect | AutorunEffect[];
  watch?: [ReactionTrace, ReactionEffect] | [ReactionTrace, ReactionEffect][];
}

export const Scope: React.FC<ScopeProps> = ({
  name,
  auto,
  watch,
  children
}) => {
  const scope = useScope({ name });
  useAutoruns(auto, { scope });
  useReactions(watch, { scope, fireImmediately: false });
  return <ScopeConext.Provider value={scope}>{children}</ScopeConext.Provider>;
};
Scope.displayName = 'Scope';
