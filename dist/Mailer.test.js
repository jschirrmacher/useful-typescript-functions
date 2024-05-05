"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const _1 = require(".");
const Mailer_js_1 = require("./Mailer.js");
const john = "john@skynet.com";
const template = { subject: "Mail to {{name}}", html: "Dear {{name}}" };
const variables = { name: "John" };
const logger = (0, _1.Logger)();
const testConfig = {
    emailFrom: "me@localhost",
    baseUrl: "http://localhost",
    port: 80,
    smtp: {
        host: "mailer.localhost",
        port: 587,
        auth: {
            user: "testuser",
            pass: "test-password",
        },
    },
};
function setup(sendResult = "ok", config = testConfig) {
    const sendMailErr = sendResult === "ok" ? null : "sendMail failed";
    if (sendResult !== "none") {
        logger.expect({
            level: sendResult === "error" ? "warn" : "info",
            message: `mailto(john@skynet.com), Mail to John: ${sendMailErr || "ok"}`,
        });
    }
    const sendMail = vitest_1.vi
        .fn()
        .mockImplementation((data, callback) => {
        callback(sendMailErr ? { message: sendMailErr } : null, sendResult);
    });
    const createTransport = vitest_1.vi.fn().mockReturnValue({ sendMail });
    const mailer = { createTransport };
    const render = (template, vars) => template.replace(/\{\{(\w+)}}/gs, (t, k) => vars[k]);
    const { send } = (0, Mailer_js_1.Mailer)(mailer, render, logger, config);
    return { sendMail, send, createTransport };
}
(0, vitest_1.describe)("Mailer", () => {
    (0, vitest_1.beforeEach)(() => {
        logger.runInTest(vitest_1.expect);
    });
    (0, vitest_1.afterEach)(() => {
        (0, vitest_1.expect)(logger).toLogAsExpected();
    });
    (0, vitest_1.it)("should send to the recipient", async () => {
        const { sendMail, send } = setup();
        await send(john, template, variables);
        (0, vitest_1.expect)(sendMail).toBeCalledWith(vitest_1.expect.objectContaining({ to: john }), vitest_1.expect.anything());
    });
    (0, vitest_1.it)("should replace variables in the template's subject", async () => {
        const { sendMail, send } = setup();
        await send(john, template, variables);
        (0, vitest_1.expect)(sendMail).toBeCalledWith(vitest_1.expect.objectContaining({ subject: "Mail to John" }), vitest_1.expect.anything());
    });
    (0, vitest_1.it)("should replace variables in the template text", async () => {
        const { sendMail, send } = setup();
        await send(john, template, variables);
        (0, vitest_1.expect)(sendMail).toBeCalledWith(vitest_1.expect.objectContaining({ html: "Dear John" }), vitest_1.expect.anything());
    });
    (0, vitest_1.it)("should use the configuration from the config", () => {
        const { createTransport } = setup("none");
        (0, vitest_1.expect)(createTransport).toBeCalledWith({
            auth: {
                user: "testuser",
                pass: "test-password",
            },
            host: "mailer.localhost",
            port: 587,
        });
    });
    (0, vitest_1.it)("should log errors", () => {
        const { send } = setup("error");
        void (0, vitest_1.expect)(send(john, template, variables)).rejects.toEqual(new Error("sendMail failed"));
    });
    (0, vitest_1.it)("should suppress email sending if smtp config is missing", async () => {
        logger.expect({
            level: "info",
            message: "mailto(john@skynet.com), Mail to John: suppressed\nDear John",
        });
        const { send, sendMail } = setup("none", {});
        await send(john, template, variables);
        (0, vitest_1.expect)(sendMail).not.toBeCalled();
    });
});
//# sourceMappingURL=Mailer.test.js.map