/* eslint-disable max-classes-per-file */
import React, { useEffect } from 'react';
import { render, act, fireEvent } from '@testing-library/react';
import { Event, createStore } from 'effector';
import { withController } from '../lib/hoc';
import { watcherEvent } from '../lib/events-creators';
import { useStoreOf, useEventsOf } from '../lib/hooks';
import { Controller } from '../lib/controller';

interface TestData {
  testValue: string;
}

interface TestEvents {
  testEvent: Event<void>;
  testEventError?: Event<void>;
}

class TestErrorController {
  static displayName = 'TestController';
}

describe('HOC tests', () => {
  it('binds controller correctly to react component', async () => {
    class FullTestController extends Controller<TestData> {
      static displayName = 'FullTestController';

      fetchInitialData = () => {
        return { testValue: 'testValue' };
      };

      store: any;

      events: any;

      bootstrap(initialState: TestData) {
        this.store = createStore(initialState);
        this.events = {
          testEvent: watcherEvent(() => {
            expect(this.getController<FullTestController>(FullTestController).store.getState()).toMatchObject({
              testValue: 'testValue'
            });
          }),
          testEventError: watcherEvent(() => {
            expect(() => {
              this.getController(TestErrorController);
            }).toThrowError(/There's no controller/);
          })
        };
      }
    }

    function TestComponent() {
      const store = useStoreOf<TestData>(FullTestController, _ => _.store);
      const { testEvent, testEventError } = useEventsOf<TestEvents>(FullTestController);

      useEffect(() => {
        testEvent();
      });

      return (
        <>
          <div>{store.testValue}</div>
          <button data-testid="btn" type="button" onClick={() => testEventError()}>
            Trigger error
          </button>
        </>
      );
    }

    const StatefulComponent = withController([FullTestController])(TestComponent);

    const props = await (StatefulComponent as any).getInitialProps({});

    let testValue;

    act(() => {
      const { queryByTestId, queryByText } = render(<StatefulComponent {...props} />);
      testValue = queryByText('testValue');
      fireEvent.click(queryByTestId('btn'));
    });

    expect(testValue).not.toBeNull();
  }, 120000);

  it('can apply a controller partially', async () => {
    const partialTestControllerevent = jest.fn();

    class PartialTestController extends Controller<TestData> {
      static displayName = 'PartialTestController';

      events: any;

      bootstrap(initialState: TestData) {
        this.events = {
          testEvent: watcherEvent(partialTestControllerevent)
        };
      }
    }

    function TestComponent() {
      const { testEvent } = useEventsOf<TestEvents>(PartialTestController);

      useEffect(() => {
        testEvent();
      });

      return (
        <>
          <div>something</div>
        </>
      );
    }

    TestComponent.displayName = 'PartialTestController';

    const StatefulComponent = withController([PartialTestController])(TestComponent);

    const props = await (StatefulComponent as any).getInitialProps({});

    act(() => {
      render(<StatefulComponent {...props} />);
    });

    expect(partialTestControllerevent).toHaveBeenCalled();
  }, 120000);
});
