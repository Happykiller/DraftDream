declare module 'jest-mock-extended' {
  export type MockProxy<T> = T & {
    [K in keyof T]: T[K] extends (...args: infer A) => infer R
      ? jest.Mock<R, A>
      : T[K];
  };

  export function mock<T>(): MockProxy<T>;
}
