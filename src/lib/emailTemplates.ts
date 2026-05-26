function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type EmailShellOptions = {
  eyebrow: string;
  title: string;
  intro: string;
  body: string;
  footer?: string;
};

function buildEmailShell(options: EmailShellOptions) {
  const supportEmail = process.env.SUPPORT_EMAIL || "support@dongleiq.com";
  const supportPhone = process.env.CONTACT_PHONE || "";

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${escapeHtml(options.title)}</title>
      </head>
      <body style="margin:0;padding:24px;background:#eef7f4;font-family:Inter,Arial,sans-serif;color:#102132;">
        <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid rgba(16,48,69,0.08);border-radius:24px;overflow:hidden;box-shadow:0 24px 60px -40px rgba(15,118,110,0.35);">
          <div style="padding:28px 32px;background:linear-gradient(135deg,#0f766e,#10b981,#14b8a6);color:#ffffff;">
            <div style="font-size:11px;font-weight:800;letter-spacing:0.22em;text-transform:uppercase;opacity:0.8;">
              ${escapeHtml(options.eyebrow)}
            </div>
            <h1 style="margin:12px 0 0;font-size:28px;line-height:1.1;font-weight:900;">
              ${escapeHtml(options.title)}
            </h1>
            <p style="margin:12px 0 0;font-size:14px;line-height:1.7;opacity:0.92;">
              ${escapeHtml(options.intro)}
            </p>
          </div>
          <div style="padding:32px;">
            ${options.body}
            <div style="margin-top:32px;padding-top:20px;border-top:1px solid rgba(16,48,69,0.08);font-size:12px;line-height:1.7;color:#5f7384;">
              ${options.footer || `Need help? Reach us at ${escapeHtml(supportEmail)}${supportPhone ? ` or ${escapeHtml(supportPhone)}` : ""}.`}
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

function buildOtpBody(otp: string, label: string) {
  return `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#284455;">
      ${escapeHtml(label)}
    </p>
    <div style="display:inline-block;padding:16px 22px;border-radius:18px;background:#f3fbf9;border:1px solid rgba(16,185,129,0.18);font-size:34px;font-weight:900;letter-spacing:0.18em;color:#0f766e;">
      ${escapeHtml(otp)}
    </div>
    <p style="margin:16px 0 0;font-size:13px;line-height:1.7;color:#5f7384;">
      This OTP expires in 10 minutes.
    </p>
  `;
}

export function createUserOtpEmail(params: { otp: string; name?: string }) {
  const intro = params.name
    ? `Hi ${params.name}, use the verification code below to complete your DongleIQ registration.`
    : "Use the verification code below to complete your DongleIQ registration.";

  return {
    subject: "Verify your DongleIQ email",
    text: `Your verification OTP is ${params.otp}. It expires in 10 minutes.`,
    html: buildEmailShell({
      eyebrow: "User verification",
      title: "Verify your email",
      intro,
      body: buildOtpBody(params.otp, "Enter this one-time password on the verification screen to activate your account."),
    }),
  };
}

export function createAdminOtpEmail(params: { otp: string; name?: string }) {
  const intro = params.name
    ? `Hi ${params.name}, confirm your email to activate DongleIQ admin access.`
    : "Confirm your email to activate DongleIQ admin access.";

  return {
    subject: "Verify your DongleIQ admin email",
    text: `Your admin verification OTP is ${params.otp}. It expires in 10 minutes.`,
    html: buildEmailShell({
      eyebrow: "Admin verification",
      title: "Activate admin access",
      intro,
      body: buildOtpBody(params.otp, "Use this OTP to finish your admin verification securely."),
    }),
  };
}

export function createResendOtpEmail(params: { otp: string; accountType: "user" | "admin" }) {
  return {
    subject: "Your new DongleIQ OTP",
    text: `Your new OTP is ${params.otp}. It expires in 10 minutes.`,
    html: buildEmailShell({
      eyebrow: `${params.accountType} otp`,
      title: "Here is your new verification code",
      intro: "We received a request to resend your OTP.",
      body: buildOtpBody(params.otp, "Use this fresh code to continue your verification flow."),
    }),
  };
}

export function createPasswordResetEmail(params: { resetLink: string }) {
  return {
    subject: "Reset your DongleIQ password",
    text: `Reset your password using this secure link: ${params.resetLink}. This link expires in 1 hour.`,
    html: buildEmailShell({
      eyebrow: "Password reset",
      title: "Reset your password",
      intro: "We received a request to reset your DongleIQ password.",
      body: `
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#284455;">
          Use the secure link below to set a new password.
        </p>
        <a
          href="${escapeHtml(params.resetLink)}"
          style="display:inline-block;padding:14px 22px;border-radius:16px;background:linear-gradient(135deg,#0f766e,#10b981);color:#ffffff;text-decoration:none;font-weight:800;letter-spacing:0.02em;"
        >
          Reset Password
        </a>
        <p style="margin:16px 0 0;font-size:13px;line-height:1.7;color:#5f7384;">
          This link expires in 1 hour. If you did not request this, you can ignore this email.
        </p>
      `,
    }),
  };
}

function buildSummaryCard(rows: Array<{ label: string; value: string }>) {
  return `
    <div style="margin:24px 0;padding:22px;border-radius:20px;background:#f3fbf9;border:1px solid rgba(15,118,110,0.18);">
      ${rows
        .map(
          (row) => `
            <p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#284455;">
              <strong style="color:#102132;">${escapeHtml(row.label)}:</strong> ${escapeHtml(row.value)}
            </p>
          `,
        )
        .join("")}
    </div>
  `;
}

export function createPaymentSuccessEmail(params: {
  name?: string;
  amount: string;
  invoiceUrl?: string;
  invoiceNumber?: string;
  paymentDate?: string;
  dscId?: string;
  referenceNumber?: string;
}) {
  const invoiceLink = params.invoiceUrl
    ? `<a href="${escapeHtml(params.invoiceUrl)}" style="display:inline-block;padding:14px 22px;border-radius:16px;background:linear-gradient(135deg,#0f766e,#10b981);color:#ffffff;text-decoration:none;font-weight:800;letter-spacing:0.02em;">View invoice</a>`
    : "";

  return {
    subject: `DongleIQ payment received — ${escapeHtml(params.amount)}`,
    text: `We have received your payment of ${params.amount}. ${params.invoiceNumber ? `Invoice ${params.invoiceNumber} is available.` : ""}`,
    html: buildEmailShell({
      eyebrow: "Payment received",
      title: "Your payment is confirmed",
      intro: params.name
        ? `Hi ${params.name}, your DSC payment has been received successfully.`
        : "Your DSC payment has been received successfully.",
      body: `
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#284455;">
          Thank you for choosing DongleIQ. We have confirmed your payment and are processing your digital signature certificate request.
        </p>
        ${buildSummaryCard([
          { label: "Amount paid", value: params.amount },
          { label: "Invoice number", value: params.invoiceNumber || "Pending" },
          { label: "Reference", value: params.referenceNumber || "N/A" },
          { label: "DSC ID", value: params.dscId || "N/A" },
          { label: "Paid on", value: params.paymentDate || "Now" },
        ])}
        ${invoiceLink}
        <p style="margin:16px 0 0;font-size:13px;line-height:1.7;color:#5f7384;">
          We'll notify you as soon as your DSC certificate is ready. If you have questions, reply to this email or contact support.
        </p>
      `,
    }),
  };
}

export function createInvoiceEmail(params: {
  name?: string;
  invoiceUrl: string;
  invoiceNumber: string;
  amount: string;
  invoiceDate: string;
  dueDate?: string;
  status?: string;
}) {
  return {
    subject: `DongleIQ invoice ready — ${escapeHtml(params.invoiceNumber)}`,
    text: `Your DongleIQ invoice ${params.invoiceNumber} is ready for ${params.amount}. Download it here: ${params.invoiceUrl}`,
    html: buildEmailShell({
      eyebrow: "Invoice issued",
      title: "Your invoice is ready",
      intro: params.name
        ? `Hi ${params.name}, your invoice is now available for download.`
        : "Your invoice is now available for download.",
      body: `
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#284455;">
          You can download the invoice for your recent DongleIQ payment using the link below.
        </p>
        ${buildSummaryCard([
          { label: "Invoice number", value: params.invoiceNumber },
          { label: "Amount", value: params.amount },
          { label: "Invoice date", value: params.invoiceDate },
          { label: "Status", value: params.status || "Paid" },
          { label: "Due date", value: params.dueDate || "Immediately" },
        ])}
        <a
          href="${escapeHtml(params.invoiceUrl)}"
          style="display:inline-block;padding:14px 22px;border-radius:16px;background:linear-gradient(135deg,#0f766e,#10b981);color:#ffffff;text-decoration:none;font-weight:800;letter-spacing:0.02em;"
        >
          Download invoice
        </a>
        <p style="margin:16px 0 0;font-size:13px;line-height:1.7;color:#5f7384;">
          If you need the invoice sent to your accounts department or have questions, feel free to reach out.
        </p>
      `,
    }),
  };
}

export function createAdminInviteEmail(params: {
  inviteLink: string;
  invitingAdminName: string;
}) {
  return {
    subject: "Admin invitation - DongleIQ",
    text: `${params.invitingAdminName} invited you to join DongleIQ as an admin. Accept here: ${params.inviteLink}`,
    html: buildEmailShell({
      eyebrow: "Admin invite",
      title: "You are invited to the admin panel",
      intro: `${params.invitingAdminName} has invited you to join DongleIQ as an administrator.`,
      body: `
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#284455;">
          Accept the invitation below to create your admin account.
        </p>
        <a
          href="${escapeHtml(params.inviteLink)}"
          style="display:inline-block;padding:14px 22px;border-radius:16px;background:linear-gradient(135deg,#0f766e,#10b981);color:#ffffff;text-decoration:none;font-weight:800;letter-spacing:0.02em;"
        >
          Accept Invitation
        </a>
        <p style="margin:16px 0 0;font-size:13px;line-height:1.7;color:#5f7384;">
          This invitation expires in 7 days. If you were not expecting it, you can safely ignore this message.
        </p>
      `,
    }),
  };
}

export function createAdminWelcomeEmail(params: { name: string; dashboardUrl: string }) {
  return {
    subject: "Welcome to the DongleIQ admin panel",
    text: `Welcome ${params.name}. Your admin account is ready. Open the dashboard here: ${params.dashboardUrl}`,
    html: buildEmailShell({
      eyebrow: "Admin welcome",
      title: `Welcome, ${escapeHtml(params.name)}`,
      intro: "Your admin account has been created successfully.",
      body: `
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#284455;">
          You can now sign in and manage approvals, payments, and operations from the DongleIQ admin workspace.
        </p>
        <a
          href="${escapeHtml(params.dashboardUrl)}"
          style="display:inline-block;padding:14px 22px;border-radius:16px;background:linear-gradient(135deg,#0f766e,#10b981);color:#ffffff;text-decoration:none;font-weight:800;letter-spacing:0.02em;"
        >
          Open Admin Dashboard
        </a>
        <p style="margin:16px 0 0;font-size:13px;line-height:1.7;color:#5f7384;">
          Keep your credentials secure and never share your password with anyone.
        </p>
      `,
    }),
  };
}
