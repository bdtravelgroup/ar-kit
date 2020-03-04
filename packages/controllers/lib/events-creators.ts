/* eslint-disable import/prefer-default-export */
import { createEvent, Store } from 'effector';

export function reducerEvent<State, Payload>(reducer: (state: State, payload: Payload) => State, store: Store<State>) {
  const event = createEvent<Payload>();
  store.on(event, reducer);
  return event;
}

function isObject(obj) {
  const type = typeof obj;
  return type === 'function' || (type === 'object' && !!obj);
}

export function propertyReducerEvent<State>(store: Store<State>) {
  const event = createEvent<Partial<State>>();
  store.on(event, (state: State, payload: Partial<State>) => {
    if (!isObject(state)) {
      throw new Error('state must be an object');
    }
    if (!isObject(payload)) {
      throw new Error('payload must be an object');
    }
    const nextState = { ...state };
    Object.keys(payload).forEach(x => {
      nextState[x] = payload[x];
    });
    return nextState;
  });
  return event;
}

type ArrayItemReducerPayload<Payload> = { search: Partial<Payload>; value?: Partial<Payload>; remove?: boolean };

export function arrayItemReducerEvent<State>(store: Store<State[]>) {
  const event = createEvent<ArrayItemReducerPayload<State>>();
  store.on(event, (state: State[], payload: ArrayItemReducerPayload<State>) => {
    if (!Array.isArray(state)) {
      throw new Error('state must be an array');
    }
    if (!isObject(payload)) {
      throw new Error('payload must be an object');
    }

    function evalSearch(item: State) {
      let truthy = true;
      Object.keys(payload.search).forEach(key => {
        truthy = item[key] === payload.search[key];
      });
      return truthy;
    }

    if (payload.remove) {
      return state.filter(item => {
        const truthy = evalSearch(item);
        return !truthy;
      });
    }

    return state.map(item => {
      const truthy = evalSearch(item);

      if (truthy) {
        return {
          ...item,
          ...payload.value
        };
      }
      return item;
    });
  });
  return event;
}

type ArrayIndexReducerPayload<Payload> = {
  index?: number[];
  value?: Partial<Payload>;
  add?: boolean;
  remove?: boolean;
};

export function arrayIndexReducerEvent<State>(store: Store<State[]>) {
  const event = createEvent<ArrayIndexReducerPayload<Partial<State>>>();
  store.on(event, (state: State[], payload: ArrayIndexReducerPayload<Partial<State>>) => {
    if (payload.add) {
      const val =
        payload.index[0] === -1
          ? [...state, payload.value as State]
          : state.splice(payload.index[0], 0, payload.value as State) && [...state];
      return val;
    }
    if (!payload.index) {
      throw new Error('Must specify index for modifying or removing items');
    }
    if (payload.remove) {
      return state.filter((_, index) => {
        return !(typeof payload.index.find(x => x === index) !== 'undefined');
      });
    }
    return state.map((item, index) => {
      if (typeof payload.index.find(x => x === index) !== 'undefined') {
        return {
          ...item,
          ...payload.value
        };
      }
      return item;
    });
  });
  return event;
}

export function watcherEvent<Payload>(watcher: (payload: Payload) => any) {
  const event = createEvent<Payload>();
  event.watch(watcher);
  return event;
}
