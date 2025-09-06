// src\common\applyMixins.ts
//
// Classic mixin helper that copies prototypes from the provided constructors
// to the derived constructor. Useful when multiple inheritance patterns are
// required in TypeScript.
export function applyMixins(derivedCtor: any, constructors: any[]) {
  constructors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      Object.defineProperty(
        derivedCtor.prototype,
        name,
        Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ||
          Object.create(null),
      );
    });
  });
}