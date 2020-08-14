import React from 'react';
import type { Source } from '../components/asAtomField';

export interface PlainConfig {
  emptyContent?: string | (<P>(source: Source, ownProps: P) => string);
}

export const PlainConfigContext = React.createContext<PlainConfig | null>(null);
