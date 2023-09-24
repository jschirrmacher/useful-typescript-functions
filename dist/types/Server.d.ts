/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="qs" />
import express, { Application, NextFunction, Request, Response } from "express";
import { Server } from "http";
import { LogLevel } from "./Logger.js";
type Logger = Pick<typeof console, "debug" | "info" | "error">;
export declare const restMethod: readonly ["get", "post", "put", "patch", "delete"];
type RestMethod = (typeof restMethod)[number];
type RequestHandler = (req: Request, res: Response, next: NextFunction) => unknown;
type RouterBuilder = {
    build: () => RequestHandler;
} & {
    [m in RestMethod]: (path: string, ...handlers: RequestHandler[]) => RouterBuilder;
};
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
    staticFiles(distPath: string): RequestHandler;
    requestLogger(logger: Pick<typeof console, "debug">, logLevel: LogLevel): RequestHandler;
    fileUpload(maxUploadSize: number): express.RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
};
export declare function routerBuilder(basePath?: string): RouterBuilder;
export {};
