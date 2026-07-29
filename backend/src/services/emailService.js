const { Resend } = require('resend');
const { render } = require('@react-email/render');
const Welcome = require('../templates/emails/Welcome');
const VerifyEmail = require('../templates/emails/VerifyEmail');
const ResetPassword = require('../templates/emails/ResetPassword');
const React = require('react');
const env = require('../config/env');

class EmailService {
  constructor() {
    // If RESEND_API_KEY is not set, initialize with a dummy key or handle gracefully
    this.resend = new Resend(env.RESEND_API_KEY || 're_dummy_key');
    this.from = env.EMAIL_FROM || 'ElleStyle <support@ellestyle.in>';
  }

  async sendWelcomeEmail(to, name) {
    try {
      if (!env.RESEND_API_KEY) {
        console.log(`[EmailService] Simulated Welcome Email to ${to}`);
        return;
      }
      const html = await render(React.createElement(Welcome, { name }));
      await this.resend.emails.send({
        from: this.from,
        to,
        subject: 'Welcome to ElleStyle',
        html,
      });
    } catch (error) {
      console.error('Error sending welcome email', error);
    }
  }

  async sendVerificationEmail(to, name, token) {
    try {
      const verificationLink = `${env.APP_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
      if (!env.RESEND_API_KEY) {
        console.log(`[EmailService] Simulated Verification Email to ${to}. Link: ${verificationLink}`);
        return;
      }
      const html = await render(React.createElement(VerifyEmail, { name, verificationLink }));
      await this.resend.emails.send({
        from: this.from,
        to,
        subject: 'Verify Your Email - ElleStyle',
        html,
      });
    } catch (error) {
      console.error('Error sending verification email', error);
      throw new Error('Could not send email');
    }
  }

  async sendPasswordResetEmail(to, name, token) {
    try {
      const resetLink = `${env.APP_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
      if (!env.RESEND_API_KEY) {
        console.log(`[EmailService] Simulated Password Reset Email to ${to}. Link: ${resetLink}`);
        return;
      }
      const html = await render(React.createElement(ResetPassword, { name, resetLink }));
      await this.resend.emails.send({
        from: this.from,
        to,
        subject: 'Password Reset Request - ElleStyle',
        html,
      });
    } catch (error) {
      console.error('Error sending password reset email', error);
      throw new Error('Could not send email');
    }
  }
}

module.exports = new EmailService();
