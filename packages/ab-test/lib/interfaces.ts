import { Event } from '@ar-kit/controllers';

export interface Experiment {
  variants: string[];
  weights: number[];
  activeVariant?: string;
}

export interface ExperimentEvents {
  emitWin: Event<void>;
  emitPlay: Event<string>;
}
