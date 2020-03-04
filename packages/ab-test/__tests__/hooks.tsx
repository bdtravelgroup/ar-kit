import React from 'react';
import { render, fireEvent, act, waitForElement } from '@testing-library/react';
import { createStore, watcherEvent, reducerEvent, withController, Controller } from '@ar-kit/controllers';
import { useExperiment, Experiment, ExperimentEvents } from '../index';

describe('Hook tests', () => {
  const emitWinSpy = jest.fn();
  const emitPlaySpy = jest.fn();

  class ABTestController extends Controller<Experiment> {
    static displayName = 'ABTest';

    fetchInitialData = async () => {
      return { variants: ['A', 'B'], weights: [10, 90] };
    };

    store: any;

    events: any;

    bootstrap = initialState => {
      const emitPlayAction = (store, activeVariant) => {
        emitPlaySpy();

        return {
          ...store,
          activeVariant
        };
      };

      this.store = createStore(initialState);
      this.events = {
        emitWin: watcherEvent(emitWinSpy),
        emitPlay: reducerEvent(emitPlayAction, this.store)
      };
    };
  }

  const DumbComponent = (userIdentifier = null) => () => {
    const { displayActiveVariant, emitWin } = useExperiment(ABTestController, userIdentifier);
    const variant = displayActiveVariant({
      A: <div>Section A</div>,
      B: <div>Section B</div>
    });

    return (
      <div>
        {variant}
        <button type="button" onClick={emitWin}>
          CTA
        </button>
      </div>
    );
  };

  it('Display active variant and trigger emit win action', async () => {
    let testValue;
    const StatefulComponent = withController([ABTestController])(DumbComponent());
    const props = await (StatefulComponent as any).getInitialProps();

    await act(async () => {
      const { queryByText } = render(<StatefulComponent {...props} />);

      testValue = await waitForElement(() => queryByText(/Section/i));
      fireEvent.click(queryByText('CTA'));
    });

    expect(emitPlaySpy).toBeCalled();
    expect(testValue).not.toBeNull();
    expect(emitWinSpy).toBeCalled();
  });

  it('Apply user identifier', async () => {
    const StatefulComponentWithUSer = withController([ABTestController])(DumbComponent('user1'));
    const props = await (StatefulComponentWithUSer as any).getInitialProps();

    act(() => {
      render(<StatefulComponentWithUSer {...props} />);
    });
  });
});
