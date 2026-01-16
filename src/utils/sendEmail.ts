import nodemailer from 'nodemailer';

export async function sendEmail(to: string, subject: string, text: string, html?: string) {
  // Support both SMTP and Gmail service
  const useSmtp = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
  const useGmail = process.env.EMAIL_USER && process.env.EMAIL_PASS;

  if (useSmtp) {
    // SMTP configuration
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html: html || text,
    });
  } else if (useGmail) {
    // Gmail service configuration
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      text,
      html: html || text,
    });
  } else {
    // Fallback: just log the message
    /* eslint-disable no-console */
    console.log(`Send email to ${to} — ${subject}\n\n${text}`);
    console.log('⚠️  No email service configured. Configure EMAIL_USER/EMAIL_PASS or SMTP_* in .env to send real emails.');
    /* eslint-enable no-console */
  }
}
