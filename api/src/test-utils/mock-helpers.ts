// src/test-utils/mock-helpers.ts
// Minimal mock utilities to avoid external dependencies during unit testing.

export const createMockFn = () => {
  const fn: any = (...args: any[]) => {
    fn.mock.calls.push(args);
    return fn._impl(...args);
  };

  fn.mock = { calls: [] as any[][] };
  fn._impl = (..._args: any[]) => undefined;

  fn.mockResolvedValue = (value: any) => {
    fn._impl = () => Promise.resolve(value);
    return fn;
  };

  fn.mockRejectedValue = (error: any) => {
    fn._impl = () => Promise.reject(error);
    return fn;
  };

  fn.mockReturnValue = (value: any) => {
    fn._impl = () => value;
    return fn;
  };

  fn.mockImplementation = (impl: (...args: any[]) => any) => {
    fn._impl = impl;
    return fn;
  };

  return fn;
};

export const asMock = <T>(fn: T): any => fn as any;
