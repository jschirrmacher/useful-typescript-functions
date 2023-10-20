import type NodeMailer from "nodemailer"

type Variables = Record<string, unknown>

export type MailTemplate = {
  subject: string
  html: string
}

export type SMTPConfiguration = {
  host: string
  port: number
  auth: {
    user: string
    pass: string
  }
}

export type MailerConfig = {
  emailFrom?: string
  baseUrl?: string
  port?: number
  smtp?: SMTPConfiguration
}

export type RenderFunction = (template: string, view: Record<string, string>) => string
type Logger = Pick<typeof console, "warn" | "info">
interface MailOptions {
  from: string
  to: string
  subject: string
  html: string
}
interface MailTransport {
  sendMail(options: MailOptions, callback: (err?: Error) => void): void
}

export function Mailer(
  nodeMailer: typeof NodeMailer,
  render: RenderFunction,
  logger: Logger = console,
  config: MailerConfig,
) {
  const { baseUrl, emailFrom } = {
    baseUrl: "http://localhost:" + (config?.port || 8080),
    emailFrom: "me@localhost",
    ...config,
  }
  const transporter: MailTransport | undefined =
    config?.smtp && nodeMailer.createTransport(config.smtp)

  return {
    async send(to: string, template: MailTemplate, variables: Variables) {
      const subject = render(template.subject, { baseUrl, ...variables })
      const logPrefix = `mailto(${to}), ${subject}:`
      const html = render(template.html, { baseUrl, ...variables })
      if (transporter) {
        const { err } = await new Promise<{ err?: Error | null }>(resolve =>
          transporter.sendMail({ from: emailFrom, to, subject, html }, err => resolve({ err })),
        )
        if (err) {
          logger.warn(`${logPrefix} ${err}`)
          throw new Error("sendMail failed")
        }
        logger.info(`${logPrefix} ok`)
      } else {
        logger.info(`${logPrefix} suppressed\n${html}`)
      }
    },
  }
}

export type Mailer = ReturnType<typeof Mailer>
