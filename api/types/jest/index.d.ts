declare namespace jest {
  type ResolvedValue<T> = T extends Promise<infer U> ? U : T;

  interface Mock<T = unknown, Y extends any[] = any> {
    (...args: Y): T;
    mockClear(): this;
    mockReset(): this;
    mockReturnValue(value: T): this;
    mockReturnValueOnce(value: T): this;
    mockImplementation(fn: (...args: Y) => T): this;
    mockImplementationOnce(fn: (...args: Y) => T): this;
    mockResolvedValue(value: ResolvedValue<T>): this;
    mockResolvedValueOnce(value: ResolvedValue<T>): this;
    mockRejectedValue(error: unknown): this;
    mockRejectedValueOnce(error: unknown): this;
  }
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
