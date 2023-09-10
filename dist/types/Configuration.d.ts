/// <reference types="node" />
type FileSystem = {
    existsSync: (fileName: string) => boolean;
    readFileSync: (fileName: string) => Buffer;
};
export declare function Configuration(configFile?: string, { existsSync, readFileSync }?: FileSystem): {
    backendConfiguration: any;
    frontendConfiguration: any;
};
export {};
