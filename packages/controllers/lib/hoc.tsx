/* eslint-disable new-cap */
/* eslint-disable import/prefer-default-export */
import React, { Component } from 'react';
import { isServer, isClient } from '@ar-kit/runtime-env-checks';
import { staticContext, ControllersContextProvider } from './context';
import { ControllerClass } from './controller';

interface WithControllerProps {
  routerAction: boolean;
  initialController: any;
  appInitialController: any;
}

const getDisplayName = (controllerClass: ControllerClass) => {
  const { displayName } = controllerClass;

  if (!displayName) {
    throw new Error('"displayName" cannot be null!');
  }

  return displayName;
};

const getDisplayNameAndInstance = (controllerClass: ControllerClass) => {
  const displayName = getDisplayName(controllerClass);

  const controllerInstance = new controllerClass();

  return { displayName, controllerInstance };
};

export function withController(
  globalControllersClasses: ControllerClass[] = [],
  localControllersClasses: ControllerClass[] = []
): (Component: React.ComponentType<any>) => React.ComponentType<WithControllerProps> {
  return ControllerComponent => {
    let context: any = null;

    class WrapperComponent extends Component<WithControllerProps> {
      static displayName: string;

      static async getInitialProps(ctx) {
        const controllersMapper = controllerClass => {
          const { displayName, controllerInstance } = getDisplayNameAndInstance(controllerClass);
          return controllerInstance.fetchInitialData
            ? Promise.resolve(controllerInstance.fetchInitialData(ctx)).then(result => {
                const value = result;
                return { displayName, value };
              })
            : { displayName, value: {} };
        };

        const controllersInitialData = await Promise.all(
          globalControllersClasses.filter(x => !staticContext[getDisplayName(x)]).map(controllersMapper)
        );

        controllersInitialData.push(...(await Promise.all(localControllersClasses.map(controllersMapper))));

        const initialData = {};

        // eslint-disable-next-line no-restricted-syntax
        for (const controllerInitialData of controllersInitialData) {
          initialData[controllerInitialData.displayName] = controllerInitialData.value;
        }
        return initialData;
      }

      constructor(props: any) {
        super(props);

        context = isServer() ? {} : staticContext;

        const controllerGetter = (controllerClass: ControllerClass) => {
          const { displayName } = controllerClass;
          if (!displayName) {
            throw new Error('"displayName" cannot be null!');
          }
          if (!context[displayName]) {
            throw new Error(`There's no controller with name ${displayName} in context!`);
          }
          return context[displayName];
        };

        const bootstrappersMapper = controllerClass => {
          const { displayName, controllerInstance } = getDisplayNameAndInstance(controllerClass);
          controllerInstance.getController = controllerGetter;
          controllerInstance.bootstrap(props[displayName]);
          return { displayName, controllerInstance };
        };

        const bootstrappers = [];

        if (!props.routerAction) {
          bootstrappers.push(
            ...globalControllersClasses.filter(x => !context[getDisplayName(x)]).map(x => () => bootstrappersMapper(x))
          );
          bootstrappers.push(...localControllersClasses.map(x => () => bootstrappersMapper(x)));
        }

        // eslint-disable-next-line no-restricted-syntax
        for (const bootstrapper of bootstrappers) {
          const bootstrapped = bootstrapper();
          context[bootstrapped.displayName] = bootstrapped.controllerInstance;
        }
      }

      render() {
        return (
          <ControllersContextProvider value={context}>
            <ControllerComponent />
          </ControllersContextProvider>
        );
      }
    }

    const wrappedComponentName = ControllerComponent.displayName || ControllerComponent.name || 'Unknown';
    WrapperComponent.displayName = `ControllerComponent(${wrappedComponentName})`;

    return WrapperComponent;
  };
}
