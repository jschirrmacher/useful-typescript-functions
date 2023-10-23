# Mailer

Send html emails templated with variables.

Filling the template with variable values is done with a templating engine like Mustache, but you can use every engine you like, as long as it has a `render()` function getting the template and the variables and returns a string which is then to be used as the email content.

You also need to provide a mailing engine like [nodemailer](https://nodemailer.com/) to actually send the email.

## Usage

```ts
import { Mailer } from "useful-typescript-functions"
import Mustache from "mustache"
import nodeMailer from "nodemailer"

const config = {
  emailFrom: "me@localhost",
  baseUrl: "http://localhost",
  smtp: {
    host: "mailer.localhost",
    port: 587,
    auth: {
      user: "testuser",
      pass: "test-password",
    },
  },
}

const template = {
  subject: "email for {{ name }}!",
  html: "<h1>Hi {{ name }},</h1><p>This is my message for you</p><p>Regards, {{ senderName }}"
}

const mailer = Mailer(mailer, Mustache.render, console, config)
await mailer.send("recipient@some-server", template, { name: "Receiver", senderName: "Me" })
```
