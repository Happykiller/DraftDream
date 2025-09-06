// src\common\applyInstanceMixins.ts
//
// Utility function used to copy both instance properties and prototype
// members from a list of classes to a target instance. It instantiates each
// provided class with the given arguments and merges its properties into the
// target. This allows composition without using classical inheritance.
export function applyInstanceMixins<T>(
  target: T,
  classes: (new (...args: any[]) => any)[],
  args: any[]
): void {
  for (const Ctor of classes) {
    const instance = new Ctor(...args);
    const proto = Object.getPrototypeOf(instance);

    for (const key of Object.getOwnPropertyNames(proto)) {
      if (key !== 'constructor') {
        Object.defineProperty(
          target,
          key,
          Object.getOwnPropertyDescriptor(proto, key)!
        );
      }
    }

    for (const key of Object.keys(instance)) {
      (target as any)[key] = instance[key];
    }
  }
}