import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import ssl
from typing import List, Optional

class EmailService:
    def __init__(self):
        self.smtp_server = os.environ.get('MAIL_SERVER', 'sandbox.smtp.mailtrap.io')
        self.smtp_port = int(os.environ.get('MAIL_PORT', 2525))
        self.username = os.environ.get('MAIL_USERNAME')
        self.password = os.environ.get('MAIL_PASSWORD')
        self.from_email = os.environ.get('MAIL_FROM', 'noreply@careerpilot.com')
        self.from_name = os.environ.get('MAIL_FROM_NAME', 'CareerPilot')
        
    def send_email(self, 
                   to_email: str, 
                   subject: str, 
                   html_body: str, 
                   text_body: Optional[str] = None):
        """Send an email using Mailtrap SMTP."""
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = f"{self.from_name} <{self.from_email}>"
            message["To"] = to_email
            
            # Add text and HTML parts
            if text_body:
                text_part = MIMEText(text_body, "plain")
                message.attach(text_part)
                
            html_part = MIMEText(html_body, "html")
            message.attach(html_part)
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.username, self.password)
                server.sendmail(self.from_email, to_email, message.as_string())
                
            print(f"✅ Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to send email to {to_email}: {str(e)}")
            return False

# Initialize email service
email_service = EmailService()

def get_verification_email_html(user_name: str, verification_link: str) -> str:
    """Generate HTML for email verification."""
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your CareerPilot Account</title>
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
                color: white;
                padding: 30px;
                border-radius: 12px 12px 0 0;
                text-align: center;
            }}
            .logo {{
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
            }}
            .tagline {{
                opacity: 0.9;
                font-size: 14px;
            }}
            .content {{
                background: white;
                padding: 40px 30px;
                border: 1px solid #e5e7eb;
                border-top: none;
            }}
            .verify-btn {{
                display: inline-block;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                text-decoration: none;
                padding: 16px 32px;
                border-radius: 8px;
                font-weight: bold;
                margin: 20px 0;
                text-align: center;
            }}
            .verify-btn:hover {{
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
            }}
            .footer {{
                background: #f9fafb;
                padding: 20px 30px;
                border: 1px solid #e5e7eb;
                border-top: none;
                border-radius: 0 0 12px 12px;
                text-align: center;
                color: #6b7280;
                font-size: 14px;
            }}
            .link-fallback {{
                word-break: break-all;
                color: #10b981;
                margin-top: 20px;
                padding: 15px;
                background: #f0fdf4;
                border-radius: 8px;
                font-size: 14px;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo">🚀 CareerPilot</div>
            <div class="tagline">powered by Athena AI</div>
        </div>
        
        <div class="content">
            <h2 style="color: #1e40af; margin-bottom: 20px;">Welcome to CareerPilot, {user_name}! 👋</h2>
            
            <p>You're just one step away from starting your AI-powered career journey with Athena. Please verify your email address to activate your account and unlock all features:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{verification_link}" class="verify-btn">✅ Verify My Email</a>
            </div>
            
            <p><strong>What you'll get access to:</strong></p>
            <ul style="margin: 20px 0;">
                <li>🎯 Personalized career assessments</li>
                <li>🤖 AI-powered guidance from Athena</li>
                <li>📈 Custom roadmaps and progress tracking</li>
                <li>💬 24/7 chat support with Athena</li>
                <li>🎓 Skills development recommendations</li>
            </ul>
            
            <p>This verification link will expire in 24 hours for your security.</p>
            
            <div class="link-fallback">
                <strong>Button not working?</strong><br>
                Copy and paste this link into your browser:<br>
                {verification_link}
            </div>
        </div>
        
        <div class="footer">
            <p>This email was sent by CareerPilot. If you didn't create an account, you can safely ignore this email.</p>
            <p style="margin-top: 10px;">
                <strong>CareerPilot</strong> - Your AI-Powered Career Advisor<br>
                Empowering professionals to make smarter career decisions
            </p>
        </div>
    </body>
    </html>
    """

def get_welcome_email_html(user_name: str) -> str:
    """Generate HTML for welcome email after verification."""
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to CareerPilot!</title>
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                padding: 30px;
                border-radius: 12px 12px 0 0;
                text-align: center;
            }}
            .content {{
                background: white;
                padding: 40px 30px;
                border: 1px solid #e5e7eb;
                border-top: none;
            }}
            .cta-btn {{
                display: inline-block;
                background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
                color: white;
                text-decoration: none;
                padding: 16px 32px;
                border-radius: 8px;
                font-weight: bold;
                margin: 20px 0;
            }}
            .footer {{
                background: #f9fafb;
                padding: 20px 30px;
                border: 1px solid #e5e7eb;
                border-top: none;
                border-radius: 0 0 12px 12px;
                text-align: center;
                color: #6b7280;
                font-size: 14px;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <div style="font-size: 28px; font-weight: bold; margin-bottom: 10px;">🎉 Welcome to CareerPilot!</div>
            <div style="opacity: 0.9;">Your account is now verified and ready to go!</div>
        </div>
        
        <div class="content">
            <h2 style="color: #059669; margin-bottom: 20px;">Hello {user_name}! 👋</h2>
            
            <p>Congratulations! Your email has been verified and your CareerPilot account is now fully activated. You're ready to start your AI-powered career journey with Athena.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="#" class="cta-btn">🚀 Start Career Assessment</a>
            </div>
            
            <h3 style="color: #1e40af;">What's Next?</h3>
            <ol style="margin: 20px 0;">
                <li><strong>Complete your profile</strong> - Help Athena understand your background</li>
                <li><strong>Take the career assessment</strong> - Get personalized recommendations</li>
                <li><strong>Explore your roadmap</strong> - See your path to career success</li>
                <li><strong>Chat with Athena</strong> - Get AI-powered career guidance anytime</li>
            </ol>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #1e40af; margin-bottom: 10px;">💡 Pro Tip from Athena:</h4>
                <p style="margin: 0; font-style: italic;">"The best time to start planning your career is now. Take the assessment when you have 10 minutes to focus - your future self will thank you!"</p>
            </div>
        </div>
        
        <div class="footer">
            <p>Welcome aboard! We're excited to be part of your career journey.</p>
            <p style="margin-top: 10px;">
                <strong>The CareerPilot Team</strong><br>
                🤖 Powered by Athena AI
            </p>
        </div>
    </body>
    </html>
    """

async def send_verification_email(email: str, verification_token: str):
    """Send verification email to user."""
    try:
        # For now, using a placeholder verification link
        # In production, this should be your actual domain
        verification_link = f"https://athena-advisor.preview.emergentagent.com/verify-email?token={verification_token}"
        
        # Extract name from email (simple approach)
        user_name = email.split('@')[0].replace('.', ' ').replace('_', ' ').title()
        
        html_body = get_verification_email_html(user_name, verification_link)
        
        text_body = f"""
        Welcome to CareerPilot, {user_name}!
        
        Please verify your email address to activate your account.
        
        Click or copy this link to verify: {verification_link}
        
        This link will expire in 24 hours.
        
        If you didn't create an account, you can ignore this email.
        
        Best regards,
        The CareerPilot Team
        """
        
        success = email_service.send_email(
            to_email=email,
            subject="🚀 Verify Your CareerPilot Account - Start Your AI Career Journey!",
            html_body=html_body,
            text_body=text_body
        )
        
        return success
        
    except Exception as e:
        print(f"Error sending verification email: {str(e)}")
        return False

async def send_welcome_email(email: str, user_name: str):
    """Send welcome email after verification."""
    try:
        html_body = get_welcome_email_html(user_name)
        
        text_body = f"""
        Welcome to CareerPilot, {user_name}!
        
        Your account is now verified and ready to go!
        
        What's Next:
        1. Complete your profile
        2. Take the career assessment  
        3. Explore your roadmap
        4. Chat with Athena
        
        We're excited to be part of your career journey!
        
        Best regards,
        The CareerPilot Team
        """
        
        success = email_service.send_email(
            to_email=email,
            subject="🎉 Welcome to CareerPilot! Your Account is Ready",
            html_body=html_body,
            text_body=text_body
        )
        
        return success
        
    except Exception as e:
        print(f"Error sending welcome email: {str(e)}")
        return False