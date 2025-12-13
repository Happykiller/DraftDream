/// <reference types="node" />

import { Buffer } from 'buffer';

declare module 'crypto' {
    export function randomBytes(size: number): Buffer;
}

declare const Buffer: typeof import('buffer').Buffer;

declare const jest: any;
declare function afterEach(action: () => void): void;
