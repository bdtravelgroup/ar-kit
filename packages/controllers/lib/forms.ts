/* eslint-disable guard-for-in */
import { createApi, createEvent, createStore, Event, Store, combine } from 'effector';

interface PreventableEvent {
  preventDefault(): void;
}

export type Fields = {
  [key: string]: Field<any>;
};

export type Field<T> = {
  value: T;
  validationPending?: boolean;
  error?: string;
};

type Unpacked<T> = T extends Field<infer U> ? U : any;

type Rest = {
  [key: string]: any;
};

type ChangeEvent = {
  currentTarget: {
    type: string;
    value: string;
  };
} & Partial<Rest>;

export type FormHandler<F extends Fields> = {
  fields: Store<F>;
  validators: { [key: string]: (fields: Fields, field: string, value: any) => boolean };
  isValid: Store<boolean>;
  submitted: Store<boolean>;
  submit: Event<void | { preventDefault(): void }>;
  reset: Event<void>;
  set: { [K in keyof F]: Event<Unpacked<F[K]> | ChangeEvent> };
  errors?: Store<string[]>;
};

export function debounce(func, wait) {
  let timerId;

  return function debouncedFunction(...args) {
    return new Promise(resolve => {
      if (timerId) {
        clearTimeout(timerId);
      }
      timerId = setTimeout(
        () => (func.then ? func.apply(this, args).then(resolve) : resolve(func.apply(this, args))),
        wait
      );
    });
  };
}

export function createFieldHandler<
  E extends React.ChangeEvent<HTMLInputElement> | string,
  F extends { [key: string]: Field<any> }
>(
  setFieldEvent: Event<string>,
  form: FormHandler<F>,
  validator: (form: FormHandler<F>, payload: string) => Promise<string> | string,
  setErrorEvent: Event<string>
): (value: E) => void {
  // eslint-disable-next-line no-shadow
  const debouncedValidator = debounce(async (form: FormHandler<F> | string, value) => {
    const errorMessage = await validator(form as FormHandler<F>, value);
    setErrorEvent(errorMessage);
  }, 100);

  return (e: E) => {
    let fieldValue;
    if (!(e as React.ChangeEvent<HTMLInputElement>).currentTarget) {
      fieldValue = e;
    } else {
      const { type, value, checked } = (e as React.ChangeEvent<HTMLInputElement>).currentTarget;
      if (type === 'number' || type === 'range') {
        const parsed = parseFloat(value);
        // eslint-disable-next-line no-restricted-globals
        fieldValue = isNaN(parsed) ? '' : parsed;
      } else if (type === 'checkbox') {
        fieldValue = checked;
      } else {
        fieldValue = value;
      }
    }
    setFieldEvent(fieldValue);
    // eslint-disable-next-line prettier/prettier
    debouncedValidator(form, fieldValue);
  };
}

export function createFormHandler<F extends Fields>(config: {
  fieldsDefinition: F;
  validators: Partial<{ [K in keyof F]: (handler: FormHandler<F>, value: any) => Promise<string> | string }>;
  submitEvent?: Event<F>;
  resetOnSubmit?: boolean;
}): FormHandler<F> {
  const { fieldsDefinition, submitEvent, resetOnSubmit, validators } = config;

  // eslint-disable-next-line no-restricted-syntax
  for (const field in fieldsDefinition) {
    if (fieldsDefinition[field].value === '') fieldsDefinition[field].validationPending = true;
  }

  const form: any = {};
  const submitHandler = createEvent<PreventableEvent>();
  const reset = createEvent();
  const fields = createStore(fieldsDefinition);
  const errors = fields.map(e =>
    Object.keys(e)
      .filter(k => !!e[k].error || !!e[k].validationPending)
      .map(k => ({ field: k, error: e[k].error, validationPending: !!e[k].validationPending }))
  );
  const isValid = errors.map(x => x.length === 0);
  const submitted = createStore(false);

  form.fields = fields;
  form.submitted = submitted;
  form.set = {};

  fields.reset(reset);

  const fieldsValuesReducers = createApi(
    fields,
    Object.keys(fieldsDefinition).reduce(
      (reducers: any, key: string) => ({
        ...reducers,
        [key]: (state, value) => ({ ...state, [key]: { ...state[key], value, validationPending: !!validators[key] } })
      }),
      {}
    )
  );

  const fieldsErrorsReducers = createApi(
    fields,
    Object.keys(fieldsDefinition).reduce(
      (reducers: any, key: string) => ({
        ...reducers,
        [key]: (state, error) => ({ ...state, [key]: { ...state[key], error, validationPending: false } })
      }),
      {}
    )
  );

  if (submitEvent) {
    // eslint-disable-next-line no-shadow
    combine(fields, isValid, errors, (fields, isValid, errors) => ({ ...fields, isValid, errors })).watch(
      submitHandler,
      (state: any, e?: PreventableEvent) => {
        if (e) e.preventDefault();
        Object.keys(state).forEach((x: any) => delete state[x].validationPending);
        state.errors.forEach(x => delete x.validationPending);
        submitEvent(state);
      }
    );
  }

  submitted.on(submitHandler, () => true);

  submitted.on(reset, () => false);

  errors.reset(reset);

  submitted.watch(bool => {
    if (bool && resetOnSubmit) reset();
  });

  form.isValid = isValid;
  form.errors = errors;
  form.submit = submitHandler;
  form.reset = reset;

  form.set = Object.keys(fieldsDefinition).reduce(
    (reducers: any, key: string) => ({
      ...reducers,
      [key]: createFieldHandler(fieldsValuesReducers[key], form, validators[key], fieldsErrorsReducers[key])
    }),
    {}
  );

  return form;
}
