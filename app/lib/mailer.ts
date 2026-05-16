type MailAddress = string | { email: string; name?: string };

type SendMailOptions = {
  from?: MailAddress;
  to: MailAddress | MailAddress[];
  subject: string;
  text?: string;
  html?: string;
  replyTo?: MailAddress;
};

function toEmailAddress(address: MailAddress) {
  if (typeof address === "string") {
    return { email: address };
  }

  return {
    email: address.email,
    ...(address.name ? { name: address.name } : {}),
  };
}

function normalizeAddresses(address: MailAddress | MailAddress[]) {
  return (Array.isArray(address) ? address : [address]).map(toEmailAddress);
}

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }

  return value;
}

function getDefaultFromAddress() {
  const email =
    process.env.SENDGRID_FROM_EMAIL ||
    process.env.EMAIL_FROM ||
    process.env.SUPPORT_EMAIL;

  if (!email) {
    throw new Error(
      "SENDGRID_FROM_EMAIL or EMAIL_FROM or SUPPORT_EMAIL must be configured",
    );
  }
  return {
    email,
    name: process.env.SENDGRID_FROM_NAME || process.env.EMAIL_FROM_NAME || "DongleIQ Support",
  };
}

export const transporter = {
  async sendMail(options: SendMailOptions) {
    const apiKey = getRequiredEnv("SENDGRID_API_KEY");
    const from = options.from
      ? toEmailAddress(options.from)
      : getDefaultFromAddress();

    const replyTo = options.replyTo
      ? toEmailAddress(options.replyTo)
      : process.env.SENDGRID_REPLY_TO
      ? toEmailAddress(process.env.SENDGRID_REPLY_TO)
      : undefined;

    let response: Response;

    try {
      response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          ...(replyTo ? { replyTo } : {}),
          personalizations: [
            {
              to: normalizeAddresses(options.to),
              subject: options.subject,
            },
          ],
          content: [
            ...(options.text
              ? [{ type: "text/plain", value: options.text }]
              : []),
            ...(options.html
              ? [{ type: "text/html", value: options.html }]
              : []),
          ],
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
    } catch (error) {
      throw new Error(
        `SendGrid connection timed out or failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      const hint = response.status === 403
        ? ` Ensure ${from.email} is a verified sender identity in SendGrid and matches the from address used by your application.`
        : "";

      throw new Error(
        `SendGrid request failed with status ${response.status}${errorBody ? `: ${errorBody}` : ""}${hint}`,
      );
    }

    return {
      accepted: normalizeAddresses(options.to).map((entry) => entry.email),
      rejected: [],
    };
  },
};

export type Transporter = typeof transporter;
export type MailerSendOptions = SendMailOptions;
