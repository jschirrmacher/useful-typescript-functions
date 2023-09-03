/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { Application, RequestHandler } from "express";
import { LogLevel } from "./Logger.js";
import { Server } from "http";
type Logger = Pick<typeof console, "debug" | "info" | "error">;
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
export declare function setupServer(options?: ServerConfiguration): Promise<ServerConfiguration>;
export declare function stopServer(config: ServerConfiguration): void;
export declare const middlewares: {
    staticFiles(distPath: string): import("express-serve-static-core").Router;
    requestLogger(logger: Pick<typeof console, "debug">, logLevel: LogLevel): import("express-serve-static-core").Router;
};
export {};
