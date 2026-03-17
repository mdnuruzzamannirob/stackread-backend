const nodemailer = require('nodemailer')
const env = require('../config/env')

let transporter = null

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.EMAIL_HOST,
      port: env.EMAIL_PORT,
      secure: env.EMAIL_PORT === 465,
      auth: { user: env.EMAIL_USER, pass: env.EMAIL_PASS },
    })
  }
  return transporter
}

const send = async ({ to, subject, html, text }) => {
  const transport = getTransporter()
  await transport.sendMail({
    from: `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM_ADDRESS}>`,
    to,
    subject,
    html,
    text,
  })
}

// ─── Email Templates ──────────────────────────────────────────────────────────

const sendVerificationEmail = async ({ to, name, token }) => {
  const link = `${env.CLIENT_URL}/verify-email?token=${token}`
  await send({
    to,
    subject: 'Verify your email — Digital Library',
    text: `Hi ${name},\n\nPlease verify your email:\n${link}\n\nThis link expires in 24 hours.`,
    html: `
      <p>Hi <strong>${name}</strong>,</p>
      <p>Please verify your email address by clicking the button below:</p>
      <p><a href="${link}" style="background:#6366f1;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Verify Email</a></p>
      <p>Or copy this link: <a href="${link}">${link}</a></p>
      <p>This link expires in <strong>24 hours</strong>.</p>
      <p>If you did not create an account, please ignore this email.</p>
    `,
  })
}

const sendPasswordResetEmail = async ({ to, name, token }) => {
  const link = `${env.CLIENT_URL}/reset-password?token=${token}`
  await send({
    to,
    subject: 'Reset your password — Digital Library',
    text: `Hi ${name},\n\nReset your password:\n${link}\n\nThis link expires in 1 hour. If you did not request this, ignore this email.`,
    html: `
      <p>Hi <strong>${name}</strong>,</p>
      <p>Click the button below to reset your password:</p>
      <p><a href="${link}" style="background:#6366f1;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Reset Password</a></p>
      <p>Or copy this link: <a href="${link}">${link}</a></p>
      <p>This link expires in <strong>1 hour</strong>.</p>
      <p>If you did not request a password reset, please ignore this email.</p>
    `,
  })
}

const sendWelcomeEmail = async ({ to, name }) => {
  await send({
    to,
    subject: 'Welcome to Digital Library!',
    text: `Hi ${name},\n\nWelcome to Digital Library! Your account is ready. Head to your dashboard to start reading.\n\n${env.CLIENT_URL}/dashboard`,
    html: `
      <p>Hi <strong>${name}</strong>,</p>
      <p>Welcome to <strong>Digital Library</strong>! 🎉</p>
      <p>Your account is ready. Head to your dashboard to start reading.</p>
      <p><a href="${env.CLIENT_URL}/dashboard" style="background:#6366f1;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Go to Dashboard</a></p>
    `,
  })
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
}
