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

  async sendOrderConfirmation(order) {
    try {
      if (!env.RESEND_API_KEY) {
        console.log(`[EmailService] Simulated Order Confirmation Email to ${order.customer.email}`);
        return;
      }
      // Placeholder for actual render
      await this.resend.emails.send({
        from: this.from,
        to: order.customer.email,
        subject: `Order Confirmation - ${order.orderNumber}`,
        html: `<p>Thank you for your order! Your order number is ${order.orderNumber}.</p>`,
      });
    } catch (error) {
      console.error('Error sending order confirmation email', error);
    }
  }

  async sendPaymentFailed(order) {
    try {
      if (!env.RESEND_API_KEY) {
        console.log(`[EmailService] Simulated Payment Failed Email to ${order.customer.email}`);
        return;
      }
      await this.resend.emails.send({
        from: this.from,
        to: order.customer.email,
        subject: `Payment Failed - ${order.orderNumber}`,
        html: `<p>Your payment for order ${order.orderNumber} failed. Please try again.</p>`,
      });
    } catch (error) {
      console.error('Error sending payment failed email', error);
    }
  }

  async sendOrderCancelled(order) {
    try {
      if (!env.RESEND_API_KEY) {
        console.log(`[EmailService] Simulated Order Cancelled Email to ${order.customer.email}`);
        return;
      }
      await this.resend.emails.send({
        from: this.from,
        to: order.customer.email,
        subject: `Order Cancelled - ${order.orderNumber}`,
        html: `<p>Your order ${order.orderNumber} has been cancelled.</p>`,
      });
    } catch (error) {
      console.error('Error sending order cancelled email', error);
    }
  }

  async sendRefundInitiated(order, refundRecord) {
    try {
      if (!env.RESEND_API_KEY) {
        console.log(`[EmailService] Simulated Refund Initiated Email to ${order.customer.email}`);
        return;
      }
      await this.resend.emails.send({
        from: this.from,
        to: order.customer.email,
        subject: `Refund Initiated - ${order.orderNumber}`,
        html: `<p>A refund of $${refundRecord.amount} has been initiated for your order ${order.orderNumber}.</p>`,
      });
    } catch (error) {
      console.error('Error sending refund initiated email', error);
    }
  }

  async sendRefundCompleted(order, refundRecord) {
    try {
      if (!env.RESEND_API_KEY) {
        console.log(`[EmailService] Simulated Refund Completed Email to ${order.customer.email}`);
        return;
      }
      await this.resend.emails.send({
        from: this.from,
        to: order.customer.email,
        subject: `Refund Processed - ${order.orderNumber}`,
        html: `<p>Your refund of $${refundRecord.amount} for order ${order.orderNumber} has been successfully processed.</p>`,
      });
    } catch (error) {
      console.error('Error sending refund completed email', error);
    }
  }

  async sendRefundFailed(order, refundRecord) {
    try {
      if (!env.RESEND_API_KEY) {
        console.log(`[EmailService] Simulated Refund Failed Email to ${order.customer.email}`);
        return;
      }
      await this.resend.emails.send({
        from: this.from,
        to: order.customer.email,
        subject: `Refund Failed - ${order.orderNumber}`,
        html: `<p>We encountered an issue processing your refund of $${refundRecord.amount} for order ${order.orderNumber}. We will investigate.</p>`,
      });
    } catch (error) {
      console.error('Error sending refund failed email', error);
    }
  }

  async sendOrderShipped(order) {
    try {
      if (!env.RESEND_API_KEY) {
        console.log(`[EmailService] Simulated Order Shipped Email to ${order.customer.email}`);
        return;
      }
      
      const trackingHtml = order.shippingInfo?.trackingUrl 
        ? `<p><a href="${order.shippingInfo.trackingUrl}">Track your shipment</a></p>`
        : '';
        
      const trackingText = order.shippingInfo?.trackingNumber 
        ? `<p>Carrier: ${order.shippingInfo.carrier || 'N/A'}<br>Tracking Number: ${order.shippingInfo.trackingNumber}</p>` 
        : '';

      await this.resend.emails.send({
        from: this.from,
        to: order.customer.email,
        subject: `Order Shipped - ${order.orderNumber}`,
        html: `
          <p>Your ElleStyle order has been shipped.</p>
          <p>Order: #${order.orderNumber}</p>
          ${trackingText}
          ${trackingHtml}
        `,
      });
    } catch (error) {
      console.error('Error sending order shipped email', error);
    }
  }

  async sendOrderDelivered(order) {
    try {
      if (!env.RESEND_API_KEY) {
        console.log(`[EmailService] Simulated Order Delivered Email to ${order.customer.email}`);
        return;
      }
      await this.resend.emails.send({
        from: this.from,
        to: order.customer.email,
        subject: `Order Delivered - ${order.orderNumber}`,
        html: `
          <p>Your ElleStyle order has been delivered.</p>
          <p>Order: #${order.orderNumber}</p>
          <p>Thank you for shopping with us!</p>
        `,
      });
    } catch (error) {
      console.error('Error sending order delivered email', error);
    }
  }
}

module.exports = new EmailService();
