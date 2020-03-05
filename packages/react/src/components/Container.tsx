import React from 'react';

export interface ContainerProps {
  initialValues?: any;
}

export const Container: React.FC<ContainerProps> = ({ form, children }) => {
  return <formContext.Provider value={form}>{children}</formContext.Provider>;
};
