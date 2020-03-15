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
  autoRuns?: AutorunEffect | AutorunEffect[];
  reactions?:
    | [ReactionTrace, ReactionEffect]
    | [ReactionTrace, ReactionEffect][];
}

export const Scope: React.FC<ScopeProps> = ({
  name,
  autoRuns,
  reactions,
  children
}) => {
  const scope = useScope({ name });
  useAutoruns(autoRuns, { scope });
  useReactions(reactions, { scope, fireImmediately: false });
  return <ScopeConext.Provider value={scope}>{children}</ScopeConext.Provider>;
};
