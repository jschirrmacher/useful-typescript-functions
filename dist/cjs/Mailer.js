"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailerFactory = void 0;
function MailerFactory(nodeMailer, render, logger = console, config) {
    const { baseUrl, emailFrom } = {
        baseUrl: "http://localhost:" + (config?.port || 8080),
        emailFrom: "me@localhost",
        ...config,
    };
    const transporter = config?.smtp && nodeMailer.createTransport(config.smtp);
    return {
        async send(to, template, variables) {
            const subject = render(template.subject, { baseUrl, ...variables });
            const logPrefix = `mailto(${to}), ${subject}:`;
            const html = render(template.html, { baseUrl, ...variables });
            if (transporter) {
                const { err } = await new Promise(resolve => transporter.sendMail({ from: emailFrom, to, subject, html }, err => resolve({ err })));
                if (err) {
                    logger.warn(`${logPrefix} ${err}`);
                    throw new Error("sendMail failed");
                }
                logger.info(`${logPrefix} ok`);
            }
            else {
                logger.info(`${logPrefix} suppressed\n${html}`);
            }
        },
    };
}
exports.MailerFactory = MailerFactory;
//# sourceMappingURL=Mailer.js.map