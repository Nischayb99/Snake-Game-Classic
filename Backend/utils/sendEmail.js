import nodemailer from "nodemailer";

const appName = process.env.APP_NAME || "Snake Game";

// Create transporter with better error handling
const createTransporter = () => {
  try {
    // Check if required environment variables exist
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email credentials missing. EMAIL_USER or EMAIL_PASS not set.');
      return null;
    }

    // Fixed: createTransport (not createTransporter)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Add additional options for better compatibility
      tls: {
        rejectUnauthorized: false
      }
    });

    return transporter;
  } catch (error) {
    console.error('Error creating email transporter:', error);
    return null;
  }
};

export const sendVerificationEmail = async (to, link) => {
  // Skip email sending in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log('🔗 [DEV] Verification Link:', link);
    console.log('📧 [DEV] Would send verification email to:', to);
    return Promise.resolve();
  }

  const transporter = createTransporter();

  if (!transporter) {
    console.log('📧 Email transporter not available - skipping verification email');
    return Promise.resolve(); // Don't fail the signup process
  }

  try {
    await transporter.sendMail({
      from: `${appName} <${process.env.EMAIL_USER}>`,
      to,
      subject: `Verify your email for ${appName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🐍 ${appName}</h1>
          </div>
          <div style="padding: 40px 30px; background: white;">
            <h2 style="color: #333; margin-top: 0;">Welcome to ${appName}!</h2>
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              Thank you for signing up! Please click the button below to verify your email address and activate your account.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${link}" 
                 style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                Verify Email Address
              </a>
            </div>
            <p style="color: #666; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${link}" style="color: #10b981; word-break: break-all;">${link}</a>
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              This verification link will expire in 24 hours. If you didn't create this account, please ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    console.log('✅ Verification email sent successfully to:', to);
  } catch (error) {
    console.error('❌ Error sending verification email:', error.message);
    // Don't throw error to prevent signup failure
  }
};

export const sendResetPasswordEmail = async (to, link) => {
  // Skip email sending in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log('🔗 [DEV] Reset Password Link:', link);
    console.log('📧 [DEV] Would send reset email to:', to);
    return Promise.resolve();
  }

  const transporter = createTransporter();

  if (!transporter) {
    console.log('📧 Email transporter not available - skipping reset email');
    return Promise.resolve(); // Don't fail in development
  }

  try {
    await transporter.sendMail({
      from: `${appName} <${process.env.EMAIL_USER}>`,
      to,
      subject: `Reset your ${appName} password`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5;">
          <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🐍 ${appName}</h1>
          </div>
          <div style="padding: 40px 30px; background: white;">
            <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              You requested to reset your password for your ${appName} account. Click the button below to create a new password.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${link}" 
                 style="background: #ef4444; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                Reset Password
              </a>
            </div>
            <p style="color: #666; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${link}" style="color: #ef4444; word-break: break-all;">${link}</a>
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              This reset link will expire in 1 hour. If you didn't request this password reset, please ignore this email and your password will remain unchanged.
            </p>
          </div>
        </div>
      `,
    });

    console.log('✅ Reset password email sent successfully to:', to);
  } catch (error) {
    console.error('❌ Error sending reset password email:', error.message);
    // Don't throw error in development
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
};