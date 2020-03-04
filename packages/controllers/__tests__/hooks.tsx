/* eslint-disable max-classes-per-file */
import React from 'react';
import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { createStore } from 'effector';
import { watcherEvent, propertyReducerEvent } from '../lib/events-creators';
import { useStoreAndEventsOf, useSliceOf, useListItemOf, useStoreOf } from '../lib/hooks';
import { ControllersContextProvider } from '../lib/context';
import { Controller } from '../lib/controller';

describe('Hooks tests', () => {
  it('gets store and events using hooks', () => {
    const watcherMockFn = jest.fn();

    const context = {
      TestController: {
        store: createStore({ testValue: 'testValue' }),
        events: {
          event: watcherEvent(watcherMockFn)
        }
      }
    };

    class TestController {
      static displayName = 'TestController';
    }

    function TestComponent() {
      const [store, events] = useStoreAndEventsOf(TestController, _ => _.store);
      return (
        <div>
          <button type="button" onClick={() => events.event()}>
            click me
          </button>
          {store.testValue}
        </div>
      );
    }

    const StatefulComponent = () => (
      <ControllersContextProvider value={context}>
        <TestComponent />
      </ControllersContextProvider>
    );

    let testValue;

    act(() => {
      const { queryByText } = render(<StatefulComponent />);
      queryByText('click me').click();
      testValue = queryByText('testValue');
    });

    expect(watcherMockFn).toHaveBeenCalled();
    expect(testValue).not.toBeNull();
  });

  it('Using slices prevents over-rendering and throws and error when a key not in store', () => {
    const rendersTwiceFn = jest.fn();
    const rendersOnceFn = jest.fn();
    const storePayload = { testValueA: 'testValueA', testValueB: 'testValueB' };

    interface TestData {
      testValueA: string;
      testValueB: string;
      testValueC: string;
    }

    class TestController extends Controller<TestData> {
      static displayName = 'TestController';

      fetchInitialData = () => ({} as any);

      bootstrap = () => {};
    }

    const testStore = createStore(storePayload);

    const testReducerEvent = propertyReducerEvent(testStore);

    const context = {
      TestController: {
        store: testStore,
        events: {
          event: testReducerEvent
        }
      }
    };

    function TestComponentA() {
      rendersOnceFn();
      const testValueA = useSliceOf(TestController, 'testValueA');
      return <div>{testValueA}</div>;
    }

    function TestComponentB() {
      rendersTwiceFn();
      const testValueB = useSliceOf(TestController, 'testValueB');
      return <div>{testValueB}</div>;
    }

    function TestComponentC() {
      const testValueC = useSliceOf(TestController, 'testValueC');
      return <div>{testValueC}</div>;
    }

    const StatefulComponent = () => (
      <ControllersContextProvider value={context}>
        <TestComponentA />
        <TestComponentB />
      </ControllersContextProvider>
    );

    let mutated;

    act(() => {
      const { queryByText } = render(<StatefulComponent />);
      testReducerEvent({ testValueB: 'mutated' });
      mutated = () => queryByText('mutated');
    });

    expect(rendersOnceFn).toHaveBeenCalledTimes(1);
    expect(rendersTwiceFn).toHaveBeenCalledTimes(2);
    expect(mutated()).not.toBeNull();
    expect(() => {
      const StatefulComponentB = () => (
        <ControllersContextProvider value={context}>
          <TestComponentC />
        </ControllersContextProvider>
      );

      render(<StatefulComponentB />);
    }).toThrowError(/not found in/);
  });

  it('Test useListItemOf hook both success and error flows', () => {
    const storePayload = [{ id: 1, name: 'Yung' }, { id: 2, name: 'Carl' }];

    type TestData = any[];

    class TestController extends Controller<TestData> {
      static displayName = 'TestController';

      fetchInitialData = () => ({} as any);

      bootstrap = () => {};
    }

    const testStore = createStore(storePayload);

    const context = {
      TestController: {
        store: testStore
      }
    };

    function TestComponentA() {
      const { name } = useListItemOf<{ id: string; name: string }>(TestController, 'id', 1);
      return <div>{name}</div>;
    }

    const StatefulComponent = () => (
      <ControllersContextProvider value={context}>
        <TestComponentA />
      </ControllersContextProvider>
    );

    let rendered;

    act(() => {
      const { queryByText } = render(<StatefulComponent />);
      rendered = () => queryByText('Yung');
    });

    expect(rendered()).not.toBeNull();
    expect(() => {
      function TestComponentB() {
        const { name } = useListItemOf<{ id: string; name: string }>(TestController, 'id', 1000);

        return <div>{name}</div>;
      }
      const StatefulComponentB = () => (
        <ControllersContextProvider value={context}>
          <TestComponentB />
        </ControllersContextProvider>
      );

      render(<StatefulComponentB />);
    }).toThrowError(/not found in/);
  });

  it('Test uninstantiated controller on useStateOf hook', () => {
    class TestController {}

    const context = {};

    function TestComponent() {
      const { name } = useStoreOf(TestController);

      return <div>{name}</div>;
    }

    const StatefulComponent = () => (
      <ControllersContextProvider value={context}>
        <TestComponent />
      </ControllersContextProvider>
    );

    expect(() => {
      act(() => {
        render(<StatefulComponent />);
      });
    }).toThrowError(/There's/);
  });
});
