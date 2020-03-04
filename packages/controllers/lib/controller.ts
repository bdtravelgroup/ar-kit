/* eslint-disable @typescript-eslint/ban-ts-ignore */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Store } from 'effector';
import { FormHandler, Fields } from './forms';

export interface ControllerClass {
  new (): any;
  displayName?: string;
}

export abstract class Controller<InitialStateType> {
  abstract bootstrap(initialState: InitialStateType);

  fetchInitialData?: (ctx: {
    err: any;
    req: any;
    res: any;
    pathname: string;
    query: string;
    asPath: string;
  }) => Promise<InitialStateType> | InitialStateType;

  // @ts-ignore
  getController<T>(controllerClass: ControllerClass): T {
    return null;
  }
}
