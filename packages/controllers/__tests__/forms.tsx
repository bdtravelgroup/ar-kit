import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { watcherEvent } from '../lib/events-creators';
import { debounce, createFormHandler, Field, Fields, FormHandler } from '../lib/forms';
import { ControllersContextProvider } from '../lib/context';
import { useFormHandlerOf, useFormFieldOf } from '../lib/hooks';

describe('Form handler tests', () => {
  it('Checks debounce', async () => {
    const iterations = 1000;
    const fn = jest.fn();
    const asyncDebounced = debounce(async iteration => {
      fn();
      return iteration;
    }, 100);
    const syncDebounced = debounce(iteration => {
      fn();
      return iteration;
    }, 100);
    let asyncIteration;
    let syncIteration;
    // eslint-disable-next-line no-plusplus
    for (let i = 1; i <= iterations; i++) {
      // eslint-disable-next-line no-await-in-loop
      asyncIteration = asyncDebounced(i);
      syncIteration = syncDebounced(i);
    }

    await new Promise(r => setTimeout(() => r(), 200));

    const asyncResult = await asyncIteration;
    const syncResult = await syncIteration;

    expect(asyncResult).toBe(iterations);
    expect(syncResult).toBe(iterations);
    expect(fn).toHaveBeenCalledTimes(2);
  }, 120000);

  it('Creates form handler and tests happy path', async () => {
    const testValue = 'This is a test';
    const invalidValue = 'Some other text';
    const errorMessage = 'Value is not correct';
    const submitEventCallback = jest.fn();
    const submitEvent = watcherEvent(submitEventCallback);
    const validationInvokeFn = jest.fn();

    interface TestForm extends Fields {
      test: Field<string>;
      testNumber: Field<number>;
    }

    const formHandler = createFormHandler<TestForm>({
      fieldsDefinition: {
        test: { value: '' },
        testNumber: { value: 0 }
      },
      validators: {
        test: async (_handler, value) => {
          await validationInvokeFn();

          return value === testValue ? null : errorMessage;
        },
        testNumber: () => {
          return null;
        }
      },
      submitEvent
    });

    // repetition for testing debounce
    formHandler.set.test(testValue);
    formHandler.set.test(testValue);
    formHandler.set.test(testValue);
    formHandler.set.testNumber({ currentTarget: { type: 'number', value: '1' } });

    await new Promise(r => setTimeout(() => r(), 200));

    let testFieldState = formHandler.fields.getState().test;

    expect(validationInvokeFn).toHaveBeenCalledTimes(1);
    expect(formHandler.isValid.getState()).toBe(true);
    expect(testFieldState.value).toBe(testValue);
    expect(testFieldState.error).toBeNull();
    expect(formHandler.errors.getState().length).toBe(0);

    formHandler.submit();

    expect(submitEventCallback).toHaveBeenCalledWith({
      isValid: true,
      errors: [],
      test: { value: testValue, error: null },
      testNumber: {
        error: null,
        value: 1
      }
    });

    formHandler.set.test(invalidValue);

    await new Promise(r => setTimeout(() => r(), 200));

    testFieldState = formHandler.fields.getState().test;

    expect(formHandler.isValid.getState()).toBe(false);
    expect(testFieldState.value).toBe(invalidValue);
    expect(testFieldState.error).toBe(errorMessage);
    expect(formHandler.errors.getState().length).toBe(1);

    formHandler.submit();

    expect(submitEventCallback).toHaveBeenLastCalledWith({
      isValid: false,
      errors: [{ field: 'test', error: errorMessage }],
      test: { value: invalidValue, error: errorMessage },
      testNumber: {
        error: null,
        value: 1
      }
    });
  });

  it('Creates form field and uses form hook', async () => {
    const testValue = 'This is a test';
    const invalidValue = 'Some other text';
    const errorMessage = 'Value is not correct';
    const submitEventCallback = jest.fn();
    const submitEvent = watcherEvent(submitEventCallback);
    const unchangedCheckFn = jest.fn();
    const reRendersCheckFn = jest.fn();

    interface FormFields extends Fields {
      test: Field<string>;
      unchanged: Field<string>;
    }

    const formHandler = createFormHandler<FormFields>({
      fieldsDefinition: {
        test: { value: '' },
        unchanged: { value: '' }
      },
      validators: {
        test: (_handler, value) => {
          return value === testValue ? null : errorMessage;
        }
      },
      submitEvent
    });

    class TestController {
      static displayName = 'TestController';

      someUnconventionalFormProperty: FormHandler<FormFields> = null;
    }

    const FormField = useFormFieldOf<any, any, any>(
      TestController,
      'test',
      ({ field, set }) => <input type="text" data-testid="test-field-input" value={field.value} onChange={set} />,
      c => c.someUnconventionalFormProperty
    );

    const UnchangedFormField = useFormFieldOf<any, any, any>(
      TestController,
      'unchanged',
      ({ field, set }) => {
        unchangedCheckFn();
        return <input type="text" value={field.value} onChange={set} />;
      },
      c => c.someUnconventionalFormProperty
    );

    function TestComponent() {
      const [fields, valid, submitted, submit] = useFormHandlerOf<FormFields>(
        TestController,
        c => c.someUnconventionalFormProperty
      );
      reRendersCheckFn();
      return (
        <div>
          <FormField />
          <UnchangedFormField />
          <button type="button" data-testid="submit" onClick={() => submit()}>
            submit
          </button>
          <div data-testid="is-valid">{valid ? 'valid' : 'invalid'}</div>
          <div data-testid="test-field-value">{fields.test.value}</div>
          <div data-testid="submitted">{submitted ? 'yes' : 'no'}</div>
        </div>
      );
    }

    const context = {
      TestController: {
        someUnconventionalFormProperty: formHandler
      }
    };

    const StatefulComponent = () => (
      <ControllersContextProvider value={context}>
        <TestComponent />
      </ControllersContextProvider>
    );

    let testFieldInput;
    let formValidationStatus;
    let testFieldValue;
    let submitted;
    let submitButton;

    await act(async () => {
      const { queryByTestId } = render(<StatefulComponent />);
      testFieldInput = () => queryByTestId('test-field-input');
      formValidationStatus = () => queryByTestId('is-valid').textContent;
      testFieldValue = () => queryByTestId('test-field-value').textContent;
      submitted = () => queryByTestId('submitted').textContent;
      submitButton = () => queryByTestId('submit');
      fireEvent.change(testFieldInput(), { target: { value: testValue } });
      submitButton().click();
      await new Promise(r => setTimeout(() => r(), 200));
    });

    expect(formValidationStatus()).toBe('valid');
    expect(testFieldInput().value).toBe(testValue);
    expect(testFieldValue()).toBe(testValue);

    await act(async () => {
      formHandler.set.test(invalidValue);
      await new Promise(r => setTimeout(() => r(), 200));
      submitButton().click();
    });

    expect(formValidationStatus()).toBe('invalid');
    expect(testFieldInput().value).toBe(invalidValue);
    expect(testFieldValue()).toBe(invalidValue);
    expect(submitted()).toBe('yes');

    expect(reRendersCheckFn).toHaveBeenCalledTimes(6);
    expect(unchangedCheckFn).toHaveBeenCalledTimes(1);
  }, 120000);
});
