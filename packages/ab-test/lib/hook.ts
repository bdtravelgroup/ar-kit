import { useState, useEffect } from 'react';
import { useStoreAndEventsOf } from '@ar-kit/controllers';
import { displayActiveVariant, calculateActiveVariant } from './utils';

export default (experimentState, userIdentifier) => {
  const [store, events] = useStoreAndEventsOf(experimentState);
  const [activeVariant, setActiveVariant] = useState(calculateActiveVariant(store, userIdentifier));

  useEffect(() => {
    events.emitPlay(activeVariant);
  }, [activeVariant]);

  return {
    activeVariant,
    setActiveVariant,
    emitWin: events.emitWin,
    displayActiveVariant: variants => displayActiveVariant(store, variants)
  };
};
