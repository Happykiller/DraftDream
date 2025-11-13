// src/test-utils/mock-helpers.ts
// Minimal mock utilities to avoid external dependencies during unit testing.

type MockImplementation<TArgs extends unknown[], TResult> = (...args: TArgs) => TResult;

export type MockFn<TArgs extends unknown[] = unknown[], TResult = unknown> = ((
  ...args: TArgs
) => TResult) & {
  mock: { calls: TArgs[] };
  mockImplementation(impl: MockImplementation<TArgs, TResult>): MockFn<TArgs, TResult>;
  mockReturnValue(value: TResult): MockFn<TArgs, TResult>;
  mockResolvedValue(value: Awaited<TResult>): MockFn<TArgs, TResult>;
  mockRejectedValue(error: Error): MockFn<TArgs, TResult>;
};

export const createMockFn = <TArgs extends unknown[] = unknown[], TResult = unknown>(
  initialImpl?: MockImplementation<TArgs, TResult>,
): MockFn<TArgs, TResult> => {
  const mockState = { calls: [] as TArgs[] };
  let implementation: MockImplementation<TArgs, TResult> =
    initialImpl ?? ((() => undefined) as MockImplementation<TArgs, TResult>);

  const fn = ((...args: TArgs): TResult => {
    mockState.calls.push(args);
    return implementation(...args);
  }) as MockFn<TArgs, TResult>;

  fn.mock = mockState;
  fn.mockImplementation = (impl: MockImplementation<TArgs, TResult>) => {
    implementation = impl;
    return fn;
  };
  fn.mockReturnValue = (value: TResult) => {
    implementation = () => value;
    return fn;
  };
  fn.mockResolvedValue = (value: Awaited<TResult>) => {
    implementation = (() => Promise.resolve(value)) as MockImplementation<TArgs, TResult>;
    return fn;
  };
  fn.mockRejectedValue = (error: Error) => {
    implementation = (() => Promise.reject(error)) as MockImplementation<TArgs, TResult>;
    return fn;
  };

  return fn;
};

export const asMock = <T extends (...args: any[]) => any>(
  fn: T,
): MockFn<Parameters<T>, ReturnType<T>> => fn as unknown as MockFn<Parameters<T>, ReturnType<T>>;
