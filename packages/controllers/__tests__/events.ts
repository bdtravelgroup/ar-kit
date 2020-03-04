import { createStore } from 'effector';
import {
  propertyReducerEvent,
  reducerEvent,
  watcherEvent,
  arrayItemReducerEvent,
  arrayIndexReducerEvent
} from '../lib/events-creators';

describe('events creators tests', () => {
  it('creates a reducer event', () => {
    const store = createStore({ value: 1 });
    const event = reducerEvent(({ value }) => ({ value: value + 1 }), store);
    const fn = jest.fn();
    event.watch(fn);
    event({});
    expect(store.getState().value).toBe(2);
    expect(fn).toBeCalledTimes(1);
  });

  it('creates a property reducer event', () => {
    const store = createStore({ value: 1, anotherValue: 2 });
    const event = propertyReducerEvent(store);
    const fn = jest.fn();
    event.watch(fn);
    event({ value: 2 });
    expect(store.getState().value).toBe(2);
    expect(fn).toBeCalledTimes(1);
  });

  it('creates an array item reducer event', () => {
    const store = createStore([{ value: 1 }]);
    const event = arrayItemReducerEvent(store);
    const fn = jest.fn();
    event.watch(fn);
    event({ search: { value: 1 }, value: { value: 2 } });
    expect(store.getState()[0].value).toBe(2);
    expect(fn).toBeCalledTimes(1);
  });

  it('creates an array item reducer event and removes item', () => {
    const store = createStore([{ value: 1 }]);
    const event = arrayItemReducerEvent(store);
    const fn = jest.fn();
    event.watch(fn);
    event({ search: { value: 1 }, remove: true });
    expect(store.getState().length).toBe(0);
    expect(fn).toBeCalledTimes(1);
  });

  it('creates an array index reducer event', () => {
    const store = createStore([{ value: 1 }, { value: 2 }]);
    const event = arrayIndexReducerEvent(store);
    const fn = jest.fn();
    event.watch(fn);
    event({ index: [0, 1], value: { value: 10 } });
    expect(store.getState()[0].value).toBe(10);
    expect(store.getState()[1].value).toBe(10);
    expect(fn).toBeCalledTimes(1);
  });

  it('creates an array index reducer event and removes at index', () => {
    const store = createStore([{ value: 1 }, { value: 2 }]);
    const event = arrayIndexReducerEvent(store);
    const fn = jest.fn();
    event.watch(fn);
    event({ index: [0, 1], remove: true });
    expect(store.getState().length).toBe(0);
    expect(fn).toBeCalledTimes(1);
  });

  it('creates an array index reducer event and adds at index', () => {
    const store = createStore([{ value: 1 }, { value: 2 }]);
    const event = arrayIndexReducerEvent(store);
    const fn = jest.fn();
    event.watch(fn);
    event({ index: [0], value: { value: 0 }, add: true });
    expect(store.getState()[0].value).toBe(0);
    expect(fn).toBeCalledTimes(1);
  });

  it('creates a watcher event', () => {
    const fn = jest.fn();
    const event = watcherEvent(fn);
    event({ value: 'a' });
    expect(fn).toBeCalledWith({ value: 'a' });
  });
});
