const nodemailer = require('nodemailer');

class EmailService {
  private transporter: any;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendPasswordResetEmail(to: string, resetToken: string, userName: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: {
        name: 'Gamified Productivity App',
        address: process.env.EMAIL_USER
      },
      to: to,
      subject: '🔐 Reset Your Password - Gamified Productivity App',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8fafc;
            }
            .container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 16px;
              padding: 40px;
              text-align: center;
              color: white;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 48px;
              margin-bottom: 20px;
            }
            .title {
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .subtitle {
              font-size: 16px;
              opacity: 0.9;
              margin-bottom: 30px;
            }
            .content {
              background: white;
              border-radius: 12px;
              padding: 30px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              text-align: left;
            }
            .greeting {
              font-size: 18px;
              font-weight: 600;
              color: #2d3748;
              margin-bottom: 20px;
            }
            .message {
              color: #4a5568;
              margin-bottom: 30px;
              line-height: 1.7;
            }
            .reset-button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              padding: 16px 32px;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              margin: 20px 0;
              transition: transform 0.2s;
            }
            .reset-button:hover {
              transform: translateY(-2px);
            }
            .security-note {
              background: #f7fafc;
              border-left: 4px solid #4299e1;
              padding: 16px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .security-title {
              font-weight: 600;
              color: #2b6cb0;
              margin-bottom: 8px;
            }
            .security-text {
              color: #4a5568;
              font-size: 14px;
            }
            .footer {
              text-align: center;
              color: #718096;
              font-size: 14px;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
            }
            .expiry-warning {
              color: #e53e3e;
              font-weight: 600;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🎮</div>
            <div class="title">Password Reset Request</div>
            <div class="subtitle">Level up your security with a new password</div>
          </div>
          
          <div class="content">
            <div class="greeting">Hi ${userName}! 👋</div>
            
            <div class="message">
              We received a request to reset your password for your Gamified Productivity App account. 
              Don't worry, it happens to the best of us! Click the button below to create a new password 
              and get back to crushing your goals.
            </div>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="reset-button">
                🔐 Reset My Password
              </a>
            </div>
            
            <div class="security-note">
              <div class="security-title">🛡️ Security Information</div>
              <div class="security-text">
                This reset link will expire in <span class="expiry-warning">15 minutes</span> for your security. 
                If you didn't request this password reset, you can safely ignore this email.
              </div>
            </div>
            
            <div class="message">
              If the button doesn't work, you can copy and paste this link into your browser:
              <br><br>
              <code style="background: #f1f5f9; padding: 8px; border-radius: 4px; word-break: break-all;">
                ${resetUrl}
              </code>
            </div>
          </div>
          
          <div class="footer">
            <p>
              🚀 Keep leveling up with Gamified Productivity App<br>
              This email was sent because you requested a password reset. If you didn't make this request, 
              please contact our support team.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Hi ${userName}!
        
        We received a request to reset your password for your Gamified Productivity App account.
        
        Click the link below to reset your password:
        ${resetUrl}
        
        This link will expire in 15 minutes for security reasons.
        
        If you didn't request this password reset, you can safely ignore this email.
        
        Best regards,
        The Gamified Productivity App Team
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to ${to}`);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  async sendPasswordResetConfirmation(to: string, userName: string): Promise<void> {
    const mailOptions = {
      from: {
        name: 'Gamified Productivity App',
        address: process.env.EMAIL_USER
      },
      to: to,
      subject: '✅ Password Successfully Reset - Gamified Productivity App',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Successful</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8fafc;
            }
            .container {
              background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
              border-radius: 16px;
              padding: 40px;
              text-align: center;
              color: white;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 48px;
              margin-bottom: 20px;
            }
            .title {
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .subtitle {
              font-size: 16px;
              opacity: 0.9;
            }
            .content {
              background: white;
              border-radius: 12px;
              padding: 30px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .message {
              color: #4a5568;
              margin-bottom: 20px;
              line-height: 1.7;
            }
            .success-icon {
              font-size: 64px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🎮</div>
            <div class="title">Password Reset Successful!</div>
            <div class="subtitle">Your account is secure and ready to go</div>
          </div>
          
          <div class="content">
            <div style="text-align: center;">
              <div class="success-icon">✅</div>
            </div>
            
            <div class="message">
              Hi ${userName}!
              <br><br>
              Great news! Your password has been successfully reset. You can now log in to your 
              Gamified Productivity App account with your new password and continue your productivity journey.
              <br><br>
              If you didn't make this change, please contact our support team immediately.
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Hi ${userName}!
        
        Your password has been successfully reset for your Gamified Productivity App account.
        
        You can now log in with your new password.
        
        If you didn't make this change, please contact our support team immediately.
        
        Best regards,
        The Gamified Productivity App Team
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Password reset confirmation email sent to ${to}`);
    } catch (error) {
      console.error('Error sending password reset confirmation email:', error);
      throw new Error('Failed to send password reset confirmation email');
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('Email service is ready to send emails');
      return true;
    } catch (error) {
      console.error('Email service verification failed:', error);
      return false;
    }
  }
}

export default new EmailService();
