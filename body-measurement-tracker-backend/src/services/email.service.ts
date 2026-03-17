import nodemailer from 'nodemailer'
import { logger } from '../utils/logger'
import { AppError } from '../utils/AppError'

interface EmailOptions {
  to: string
  subject: string
  text?: string
  html?: string
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const mailOptions = {
      from: `"Body Measurement Tracker" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    }

    const info = await transporter.sendMail(mailOptions)
    logger.info(`Email sent: ${info.messageId}`)
  } catch (error) {
    logger.error('Error sending email:', error)
    throw new AppError('Failed to send email', 500)
  }
}

export const sendWelcomeEmail = async (to: string, name: string): Promise<void> => {
  const html = `
    <h1>Welcome to Body Measurement Tracker!</h1>
    <p>Hi ${name},</p>
    <p>Thank you for joining Body Measurement Tracker. We're excited to help you track your fitness journey!</p>
    <p>Get started by:</p>
    <ul>
      <li>Adding your first measurement</li>
      <li>Setting your fitness goals</li>
      <li>Exploring the dashboard</li>
    </ul>
    <p>If you have any questions, feel free to contact our support team.</p>
    <p>Best regards,<br>The Body Measurement Tracker Team</p>
  `

  await sendEmail({
    to,
    subject: 'Welcome to Body Measurement Tracker!',
    html,
  })
}