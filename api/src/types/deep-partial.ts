// src\types\deep-partial.ts
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? T[P] extends (infer U)[]
      ? DeepPartial<U>[]
      : DeepPartial<T[P]>
    : T[P];
};
