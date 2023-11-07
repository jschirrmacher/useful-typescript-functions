/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import type { Application, NextFunction, Request, Response } from "express";
import { Server } from "http";
type Logger = Pick<typeof console, "debug" | "info" | "error">;
export declare const restMethod: readonly ["get", "post", "put", "patch", "delete"];
export type RestMethod = (typeof restMethod)[number];
export type RequestHandler = (req: Request, res: Response, next: NextFunction) => unknown;
export type RouterDefinition = {
    [m in RestMethod]: (path: string, ...handlers: RequestHandler[]) => RouterDefinition;
} & {
    build: () => Promise<RequestHandler>;
};
export interface ServerConfiguration {
    app: Application;
    server: Server;
    port: number;
    logger: Logger;
    routers: (RouterDefinition | RequestHandler)[];
    readableResponses?: boolean;
    logRequests?: boolean;
    fileUpload?: {
        maxSize: number;
    };
    staticFiles?: string;
}
export declare class RestError extends Error {
    status: number;
    constructor(status: number, message: string);
}
export declare class Redirection extends Error {
    location: string;
    status: number;
    constructor(location: string, temporary?: boolean);
}
export declare function setupServer(options?: Partial<ServerConfiguration>): Promise<Required<ServerConfiguration>>;
export declare function stopServer(config: ServerConfiguration): void;
export declare function defineRouter(basePath?: string, name?: string): RouterDefinition;
export {};
