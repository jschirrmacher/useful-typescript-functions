export type LogLevel = "debug" | "info" | "warn" | "error";
type LogEntry = {
    level?: LogLevel;
    message?: string | RegExp;
    [key: string]: unknown;
};
type EntryStore = {
    expected: LogEntry[];
    unexpected: LogEntry[];
};
interface ExtendableExpect {
    extend(params: object): void;
}
export declare function Logger(): {
    entries: EntryStore;
    debug: (data: string | object) => void;
    info: (data: string | object) => void;
    warn: (data: string | object) => void;
    error: (data: string | object) => void;
    setGlobal(data: object): void;
    runInTest(expect: ExtendableExpect): void;
    expect(info: LogEntry): void;
};
export {};
