import React, { useContext } from 'react';

export interface RenderConfig {
  emptyContent?: string;
}

export const RenderConfigContext = React.createContext<RenderConfig>({});

export const useRenderConfig = () => useContext(RenderConfigContext);

export const RenderConfigProvider = RenderConfigContext.Provider;
