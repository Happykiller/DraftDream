declare module 'crypto' {
    export function randomBytes(size: number): { toString: (encoding: string) => string };
}

declare const Buffer: {
    from: (value: string) => { toString: (encoding: string) => string };
};

declare const jest: any;
declare function afterEach(action: () => void): void;
