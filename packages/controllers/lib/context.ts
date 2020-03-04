import React from 'react';

const ControllersContext = React.createContext({} as any);

export const ControllersContextProvider = ControllersContext.Provider;
export const ControllersContextConsumer = ControllersContext.Consumer;
export const staticContext: any = {};

export default ControllersContext;
