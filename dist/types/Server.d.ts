/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { Server } from "http";
import { Application, NextFunction, Request, Response, Router } from "express";
import { LogLevel } from "./Logger.js";
type Logger = Pick<typeof console, "debug" | "info" | "error">;
export declare const restMethod: readonly ["get", "post", "put", "patch", "delete"];
type RequestHandler = (req: Request, res: Response, next: NextFunction) => unknown;
export interface ServerConfiguration {
    app?: Application;
    server?: Server;
    port?: number;
    logger?: Logger;
    middlewares?: RequestHandler[];
    readableResponses?: boolean;
}
export declare class RestError extends Error {
    status: number;
    constructor(status: number, message: string);
}
export declare function setupServer(options?: ServerConfiguration): Promise<Required<ServerConfiguration>>;
export declare function stopServer(config: ServerConfiguration): void;
export declare const middlewares: {
    staticFiles(distPath: string): import("express-serve-static-core").Router;
    requestLogger(logger: Pick<typeof console, "debug">, logLevel: LogLevel): import("express-serve-static-core").Router;
};
export declare function routerBuilder(basePath?: string): {
    build: () => Router;
} & {
    get: (path: string, handler: RequestHandler) => {
        build: () => Router;
    } & any;
    post: (path: string, handler: RequestHandler) => {
        build: () => Router;
    } & any;
    put: (path: string, handler: RequestHandler) => {
        build: () => Router;
    } & any;
    patch: (path: string, handler: RequestHandler) => {
        build: () => Router;
    } & any;
    delete: (path: string, handler: RequestHandler) => {
        build: () => Router;
    } & any;
};
export {};
