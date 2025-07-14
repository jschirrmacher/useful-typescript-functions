import type NodeMailer from "nodemailer"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Logger } from "."
import { MailerConfig, Mailer, RenderFunction } from "./Mailer.js"

const john = "john@skynet.com"
const template = { subject: "Mail to {{name}}", html: "Dear {{name}}" }
const variables = { name: "John" }
const logger = Logger()

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
}

function setup(sendResult: "none" | "ok" | "error" = "ok", config: MailerConfig = testConfig) {
  const sendMailErr = sendResult === "ok" ? null : "sendMail failed"
  if (sendResult !== "none") {
    logger.expect({
      level: sendResult === "error" ? "warn" : "info",
      message: `mailto(john@skynet.com), Mail to John: ${sendMailErr || "ok"}`,
    })
  }
  const sendMail = vi
    .fn()
    .mockImplementation((data: object, callback: (err: unknown, info: string) => void) => {
      callback(sendMailErr ? { message: sendMailErr } : null, sendResult)
    })

  const createTransport = vi.fn().mockReturnValue({ sendMail })
  const mailer = { createTransport } as unknown as typeof NodeMailer
  const render: RenderFunction = (template, vars) =>
    template.replace(/\{\{(\w+)}}/gs, (t, k: string) => vars[k])
  const { send } = Mailer(mailer, render, logger, config)

  return { sendMail, send, createTransport }
}

describe("Mailer", () => {
  beforeEach(() => {
    logger.runInTest(expect)
  })

  afterEach(() => {
    expect(logger).toLogAsExpected()
  })

  it("should send to the recipient", async () => {
    const { sendMail, send } = setup()
    await send(john, template, variables)
    expect(sendMail).toBeCalledWith(expect.objectContaining({ to: john }), expect.anything())
  })

  it("should replace variables in the template's subject", async () => {
    const { sendMail, send } = setup()
    await send(john, template, variables)
    expect(sendMail).toBeCalledWith(
      expect.objectContaining({ subject: "Mail to John" }),
      expect.anything(),
    )
  })

  it("should replace variables in the template text", async () => {
    const { sendMail, send } = setup()
    await send(john, template, variables)
    expect(sendMail).toBeCalledWith(
      expect.objectContaining({ html: "Dear John" }),
      expect.anything(),
    )
  })

  it("should use the configuration from the config", () => {
    const { createTransport } = setup("none")
    expect(createTransport).toBeCalledWith({
      auth: {
        user: "testuser",
        pass: "test-password",
      },
      host: "mailer.localhost",
      port: 587,
    })
  })

  it("should log errors", async () => {
    const { send } = setup("error")
    await expect(send(john, template, variables)).rejects.toEqual(new Error("sendMail failed"))
  })

  it("should suppress email sending if smtp config is missing", async () => {
    logger.expect({
      level: "info",
      message: "mailto(john@skynet.com), Mail to John: suppressed\nDear John",
    })
    const { send, sendMail } = setup("none", {})
    await send(john, template, variables)
    expect(sendMail).not.toBeCalled()
  })
})
