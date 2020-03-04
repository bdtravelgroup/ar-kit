import { createStore } from 'effector';
import { Controller } from '../lib/controller';

describe('Test controllers abstract class', () => {
  it('Instance Controller class', () => {
    interface TestData {
      foo: string;
    }

    class TestController extends Controller<TestData> {
      fetchInitialData = () => {
        return {
          foo: 'bar'
        };
      };

      store: any;

      bootstrap(initialState) {
        this.store = createStore(initialState, { name: 'test' });
      }
    }

    const instance = new TestController();

    expect(instance.getController(TestController)).toBeNull();
  });
});
