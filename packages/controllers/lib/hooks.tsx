/* eslint-disable import/prefer-default-export */
import { Store, Event, is } from 'effector';
import { useStore, useStoreMap, useList } from 'effector-react';
import React, { useMemo, useContext } from 'react';
import { Field, Fields } from './forms';
import ControllersContext from './context';
import { ControllerClass } from './controller';

export function useController(controllerClassOrName: ControllerClass): any {
  const controllerName = controllerClassOrName.displayName;
  const context = useContext(ControllersContext);
  if (!context[controllerName]) {
    throw new Error(`There's no state with name ${controllerName} in context!`);
  }
  return context[controllerName];
}

function getStore(controllerInstance: any, storeExtractor?: (controllerInstance: any) => any) {
  const store = storeExtractor ? storeExtractor(controllerInstance) : controllerInstance.store;
  if (!store || !is.store(store)) {
    throw new Error('Specified store is invalid');
  }
  return store;
}

export function useStoreOf<StoreDataType>(
  controllerClass: ControllerClass,
  storeExtractor?: (controllerInstance: any) => any
): StoreDataType {
  const controller = useController(controllerClass);
  const store = getStore(controller, storeExtractor);
  return useStore(store) as StoreDataType;
}

export function useEventsOf<EventsType>(controllerClass: ControllerClass): EventsType {
  const state = useController(controllerClass);
  return state.events as EventsType;
}

export function useStoreAndEventsOf<StoreDataType, EventsType>(
  controllerClass: ControllerClass,
  storeExtractor?: (controllerInstance: any) => any
): [StoreDataType, EventsType] {
  const controller = useController(controllerClass);
  const store = getStore(controller, storeExtractor);
  return [useStore(store) as StoreDataType, controller.events as EventsType];
}

export function useSliceOfStore<Slice>(store: Store<any>, key: Extract<keyof Slice, string>): Slice {
  return useStoreMap<Store<any>, Slice, string[]>({
    store,
    keys: [key],
    fn: (state, [k]: [string]) => {
      const keyExists = k in state;
      const slice = state[k];

      if (!keyExists) {
        throw new Error(`key ${key} not found in ${store.shortName}`);
      }

      return slice;
    }
  });
}

export function useSliceOf<Slice>(
  controllerClass: ControllerClass,
  key: Extract<keyof Slice, string>,
  storeExtractor?: (controllerInstance: any) => any
): Slice {
  const controller = useController(controllerClass);
  const store = getStore(controller, storeExtractor);
  return useSliceOfStore(store, key);
}

export function useListOf<StoreDataType>(
  controllerClass: ControllerClass,
  fn: (item: Store<StoreDataType>, index: number) => React.ReactNode,
  storeExtractor?: (controllerInstance: any) => any
): React.ReactNode {
  const controller = useController(controllerClass);
  const store = getStore(controller, storeExtractor);
  return useList<Store<StoreDataType>>(store, fn);
}

export function useListItemOf<Slice>(
  controllerClass: ControllerClass,
  key: Extract<keyof Slice, string>,
  id: any,
  storeExtractor?: (controllerInstance: any) => any
): Slice {
  const controller = useController(controllerClass);
  const store = getStore(controller, storeExtractor);
  return useStoreMap<any, Slice, string[]>({
    store,
    keys: [key],
    fn: (state, [k]: [string]) => {
      const slice = state.find(x => x[k] === id);
      if (!slice) {
        throw new Error(`key ${key} not found in ${store.shortName}`);
      }
      return slice;
    }
  });
}

function getFormHandler(controllerClass: ControllerClass, formExtractor: (controllerInstance: any) => any) {
  const controller = useController(controllerClass);
  const form = formExtractor ? formExtractor(controller) : controller.form;
  if (!form || !form.fields || !form.isValid || !form.submitted) {
    throw new Error('Specified form is invalid');
  }
  return form;
}

export function useFormHandlerOf<FieldsType extends Fields>(
  controllerClass: ControllerClass,
  formExtractor?: (controllerInstance: any) => any
): [FieldsType, boolean, boolean, Event<void>] {
  const form = getFormHandler(controllerClass, formExtractor);
  return [
    useStore(form.fields) as FieldsType,
    useStore(form.isValid) as boolean,
    useStore(form.submitted) as boolean,
    form.submit as Event<void>
  ];
}

export function useFormOf<FieldsType extends Fields>(
  controllerClass: ControllerClass,
  formExtractor?: (controllerInstance: any) => any
): { form: FieldsType; isValid: boolean; submitted: boolean; submit: Event<void> } {
  const [form, isValid, submitted, submit] = useFormHandlerOf(controllerClass, formExtractor);
  return {
    form,
    isValid,
    submitted,
    submit
  };
}

export function useFormFieldOf<EventPayloadType, PropsType>(
  controllerClass: ControllerClass,
  fieldName: string,
  Child: React.ComponentType<{ field: Field<any>; set: Event<EventPayloadType> }>,
  formExtractor?: (controllerInstance: any) => any
): React.ComponentType<PropsType> {
  const FormField = () => {
    const form = getFormHandler(controllerClass, formExtractor);
    const field = useSliceOfStore<any>(form.fields, fieldName);
    return useMemo(() => <Child field={field} set={form.set[fieldName]} />, [field]);
  };
  FormField.displayName = `FormField(${fieldName})`;
  return FormField;
}
