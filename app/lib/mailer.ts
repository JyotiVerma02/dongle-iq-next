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

function isPlaceholderSender(email: string) {
  const normalized = email.trim().toLowerCase();
  return [
    "no-reply@yourdomain.com",
    "no-reply@yourdomain",
    "support@dongleiq.com",
    "example@yourdomain.com",
    "support@yourdomain.com",
  ].includes(normalized);
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
  if (isPlaceholderSender(email)) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "SENDGRID_FROM_EMAIL must be set to a verified SendGrid sender identity. Replace the placeholder from address with a verified sender email in your environment.",
      );
    }

    // In development, allow placeholder addresses but log a clear warning so
    // developers don't hit hard 500s. Actual sends will be skipped by
    // `sendMail` when a placeholder from address is detected.
    // This keeps local development fast while encouraging proper production
    // configuration.
    // eslint-disable-next-line no-console
    console.warn(
      "Using placeholder SENDGRID_FROM_EMAIL in non-production. Email delivery will be skipped locally.",
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

    // If the from address is a known placeholder and we are not in
    // production, skip the SendGrid call and log the email instead of
    // throwing. This avoids 403 errors during local development while
    // still surfacing a console warning.
    if (isPlaceholderSender(from.email) && process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.log("[DEV EMAIL] Skipping SendGrid send because 'from' is a placeholder:", {
        from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html ? "(html content)" : undefined,
      });

      return {
        accepted: normalizeAddresses(options.to).map((entry) => entry.email),
        rejected: [],
      };
    }

    const replyTo = options.replyTo
      ? toEmailAddress(options.replyTo)
      : process.env.SENDGRID_REPLY_TO
      ? toEmailAddress(process.env.SENDGRID_REPLY_TO)
      : undefined;

    // eslint-disable-next-line no-console
    console.log("[SENDGRID] Sending email:", {
      from: from.email,
      to: normalizeAddresses(options.to).map((a) => a.email),
      subject: options.subject,
      replyTo: replyTo?.email || "not set",
    });

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
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
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      const hint = response.status === 403
        ? ` Ensure ${from.email} is a verified sender identity in SendGrid and matches the from address used by your application.`
        : "";

      // eslint-disable-next-line no-console
      console.error("[SENDGRID ERROR] Failed to send email:", {
        status: response.status,
        from: from.email,
        to: normalizeAddresses(options.to).map((a) => a.email),
        subject: options.subject,
        errorBody,
        hint,
      });

      throw new Error(
        `SendGrid request failed with status ${response.status}${errorBody ? `: ${errorBody}` : ""}${hint}`,
      );
    }

    // eslint-disable-next-line no-console
    console.log("[SENDGRID SUCCESS] Email sent successfully");

    return {
      accepted: normalizeAddresses(options.to).map((entry) => entry.email),
      rejected: [],
    };
  },
};

export type Transporter = typeof transporter;
export type MailerSendOptions = SendMailOptions;
