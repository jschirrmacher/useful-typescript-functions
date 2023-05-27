export * from "vitest";
declare module 'vitest' {
    interface Assertion<T> {
        toLogAsExpected(): T;
    }
    interface AsymmetricMatchersContaining {
        toLogAsExpected(): unknown;
    }
}
