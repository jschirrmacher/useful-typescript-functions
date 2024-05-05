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
export interface LogStruct {
    level: LogLevel;
    message: string;
    [key: string]: unknown;
}
export type Transport = (data: LogStruct) => void;
export declare function createCSVTransport(path: string): (data: LogStruct) => void;
export declare function createJSONLTransport(path: string): (data: LogStruct) => void;
interface ExtendableExpect {
    extend(params: object): void;
}
export declare function Logger(): {
    entries: EntryStore;
    debug: (data: string | object) => void;
    info: (data: string | object) => void;
    warn: (data: string | object) => void;
    error: (data: string | object) => void;
    setLogLevel(level: LogLevel): void;
    setSilent(silent: boolean): void;
    setTransport(transport: Transport): any;
    setGlobal(data: object): any;
    runInTest(expect: ExtendableExpect): any;
    expect(info: LogEntry): any;
};
export {};
