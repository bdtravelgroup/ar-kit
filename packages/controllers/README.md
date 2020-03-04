# @ar-kit/controllers



## Hoc example

```typescript
import { createStore, watcherEvent, withController, Controller } from '@ar-kit/controllers';


class ExampleController extends Controller<ExampleData> {
  initialize = async () => {
    return { foo: 'bar' };
  };

  bootstrap = initialState => {
    const exampleEvent = (store, payload) => {
	  const anotherPayload = this.getController(AnotherController);

      return {
        ...store,
        ...payload,
        ...anotherPayload
      };
    };

    this.store = createStore(initialState);
    this.events = {
      exampleEvent: watcherEvent(exampleEvent),
    };
  };
}

export default withController([ExampleController])(DumbComponent);
```



### Hooks

```jsx
import { useStoreAndEventsOf, useStoreOf, useEventsOf } = '@ar-kit/controllers';

function DumbComponent() {
  const [store, events] = useStoreAndEventsOf(ExampleController);
  // Or
  const store = useStoreOf(ExampleController);
  const events = useEventsOf(ExampleController);
    
  return <>
    <div>{store.foo}</div>
  	<button type="button" onClick={events.exampleEvent} />
  </>;
} 
```

