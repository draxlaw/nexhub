import nodemailer, { Transporter } from 'nodemailer';

// Support both Gmail service and generic SMTP
const useSmtp = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
const emailService = process.env.EMAIL_SERVICE || 'Gmail';
const emailUser = process.env.EMAIL_USER || '';
const emailPass = process.env.EMAIL_PASS || '';
const emailFrom = process.env.EMAIL_FROM || emailUser;

let transporter: Transporter | null = null;

export function getEmailTransporter(): Transporter {
  if (transporter) {
    return transporter;
  }

  if (useSmtp) {
    // Use SMTP configuration
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('SMTP_HOST, SMTP_USER, and SMTP_PASS environment variables are required');
    }

    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Use Gmail service
    if (!emailUser || !emailPass) {
      throw new Error('EMAIL_USER and EMAIL_PASS environment variables are required for Gmail service');
    }

    transporter = nodemailer.createTransport({
      service: emailService,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  }

  return transporter;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  const transporter = getEmailTransporter();

  const mailOptions = {
    from: process.env.SMTP_FROM || emailFrom,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text || '',
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export async function verifyConnection(): Promise<void> {
  try {
    const transporter = getEmailTransporter();
    await transporter.verify();
    console.log('Email transporter is ready to send emails');
  } catch (error) {
    console.error('Email transporter verification failed:', error);
    throw error;
  }
}
