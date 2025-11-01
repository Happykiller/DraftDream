declare namespace jest {
  type Mock<T = unknown, Y extends any[] = any> = (...args: Y) => T;
}

declare module 'jest' {
  export interface Config {
    preset?: string;
    testEnvironment?: string;
    roots?: string[];
    moduleFileExtensions?: string[];
    clearMocks?: boolean;
    moduleNameMapper?: Record<string, string>;
    globals?: Record<string, unknown>;
  }
}
