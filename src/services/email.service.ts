import { sendEmail, EmailOptions } from '../config/email';

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verificationUrl = `${frontendUrl}/verify-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;

  const emailOptions: EmailOptions = {
    to: email,
    subject: 'Verify your email address',
    html: `
      <h2>Email Verification</h2>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
        Verify Email
      </a>
      <p>Or copy and paste this link in your browser:</p>
      <p>${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
    `,
    text: `Verify your email: ${verificationUrl}`,
  };

  await sendEmail(emailOptions);
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${frontendUrl}/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;

  const emailOptions: EmailOptions = {
    to: email,
    subject: 'Reset your password',
    html: `
      <h2>Password Reset</h2>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
        Reset Password
      </a>
      <p>Or copy and paste this link in your browser:</p>
      <p>${resetUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
    text: `Reset your password: ${resetUrl}`,
  };

  await sendEmail(emailOptions);
}

export async function sendOrderConfirmationEmail(email: string, orderId: string, orderTotal: number): Promise<void> {
  const emailOptions: EmailOptions = {
    to: email,
    subject: `Order Confirmation - Order #${orderId}`,
    html: `
      <h2>Order Confirmation</h2>
      <p>Thank you for your order!</p>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Total Amount:</strong> $${orderTotal.toFixed(2)}</p>
      <p>You will receive a shipping confirmation soon.</p>
      <p>If you have any questions, please contact our support team.</p>
    `,
    text: `Order Confirmation - Order #${orderId}`,
  };

  await sendEmail(emailOptions);
}

export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  const emailOptions: EmailOptions = {
    to: email,
    subject: 'Welcome to our store!',
    html: `
      <h2>Welcome, ${name}!</h2>
      <p>Thank you for joining us. We're excited to have you!</p>
      <p>Start browsing our products and enjoy exclusive deals.</p>
      <p>If you have any questions, feel free to contact us.</p>
    `,
    text: `Welcome to our store, ${name}!`,
  };

  await sendEmail(emailOptions);
}
