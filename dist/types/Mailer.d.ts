/// <reference types="node" />
/// <reference types="node" />
import type NodeMailer from "nodemailer";
type Variables = Record<string, unknown>;
export type MailTemplate = {
    subject: string;
    html: string;
};
export type SMTPConfiguration = {
    host: string;
    port: number;
    auth: {
        user: string;
        pass: string;
    };
};
export type MailerConfig = {
    emailFrom?: string;
    baseUrl?: string;
    port?: number;
    smtp?: SMTPConfiguration;
};
export type RenderFunction = (template: string, view: Record<string, string>) => string;
type Logger = Pick<typeof console, "warn" | "info">;
export declare function Mailer(nodeMailer: typeof NodeMailer, render: RenderFunction, logger: Logger | undefined, config: MailerConfig): {
    send(to: string, template: MailTemplate, variables: Variables): Promise<void>;
};
export type Mailer = ReturnType<typeof Mailer>;
export {};
