import os
import smtplib
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

class EmailAlertService:
    def __init__(self):
        self.email_sender = os.getenv('EMAIL_SENDER')
        self.email_password = os.getenv('EMAIL_PASSWORD')
        self.smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', 587))
        self.emergency_contacts = os.getenv('EMERGENCY_CONTACTS', '').split(',')
        self.email_cooldown_minutes = int(os.getenv('EMAIL_COOLDOWN_MINUTES', 5))
        self.fire_confidence_threshold = int(os.getenv('FIRE_CONFIDENCE_THRESHOLD', 70))
        self.subject_prefix = os.getenv('EMAIL_SUBJECT_PREFIX', '[FIRE ALERT]')
        self.organization_name = os.getenv('ORGANIZATION_NAME', 'IoTFireGuard System')
        
        # Check if email service is properly configured
        if self.email_sender and self.email_password:
            self.enabled = True
            print("Email Alert Service initialized successfully")
        else:
            self.enabled = False
            print("Email Alert Service disabled - missing email credentials")
        
        # Track last alert times to prevent spam
        self.last_alert_time = None
        self.alert_count = 0
        
        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
    
    def should_send_alert(self, prediction, confidence):
        """Check if an email alert should be sent based on conditions"""
        if not self.enabled:
            return False
        
        # Check if prediction is fire with sufficient confidence
        if prediction != 'Fire' or confidence < self.fire_confidence_threshold:
            return False
        
        # Check cooldown period
        if self.last_alert_time:
            time_since_last = datetime.now() - self.last_alert_time
            if time_since_last < timedelta(minutes=self.email_cooldown_minutes):
                return False
        
        return True
    
    def create_fire_alert_email(self, prediction, confidence, location="Camera Station 1"):
        """Create HTML email content for fire alert"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
                .container {{ max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
                .header {{ background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 20px; text-align: center; }}
                .header h1 {{ margin: 0; font-size: 24px; }}
                .alert-icon {{ font-size: 48px; margin-bottom: 10px; }}
                .content {{ padding: 30px; }}
                .alert-details {{ background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }}
                .detail-row {{ display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }}
                .detail-label {{ font-weight: bold; color: #374151; }}
                .detail-value {{ color: #dc2626; font-weight: bold; }}
                .confidence-bar {{ background-color: #e5e7eb; height: 20px; border-radius: 10px; overflow: hidden; margin: 10px 0; }}
                .confidence-fill {{ background: linear-gradient(90deg, #dc2626, #ef4444); height: 100%; transition: width 0.3s ease; }}
                .footer {{ background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }}
                .urgent {{ color: #dc2626; font-weight: bold; font-size: 18px; text-align: center; margin: 20px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="alert-icon">🚨</div>
                    <h1>CRITICAL FIRE ALERT</h1>
                    <p>{self.organization_name}</p>
                </div>
                
                <div class="content">
                    <div class="urgent">⚠️ IMMEDIATE ACTION REQUIRED ⚠️</div>
                    
                    <div class="alert-details">
                        <h3 style="margin-top: 0; color: #dc2626;">🔥 Fire Detected with High Confidence</h3>
                        
                        <div class="detail-row">
                            <span class="detail-label">Detection Type:</span>
                            <span class="detail-value">{prediction}</span>
                        </div>
                        
                        <div class="detail-row">
                            <span class="detail-label">Confidence Level:</span>
                            <span class="detail-value">{confidence:.1f}%</span>
                        </div>
                        
                        <div class="confidence-bar">
                            <div class="confidence-fill" style="width: {confidence}%;"></div>
                        </div>
                        
                        <div class="detail-row">
                            <span class="detail-label">Location:</span>
                            <span class="detail-value">{location}</span>
                        </div>
                        
                        <div class="detail-row">
                            <span class="detail-label">Detection Time:</span>
                            <span class="detail-value">{timestamp}</span>
                        </div>
                        
                        <div class="detail-row">
                            <span class="detail-label">Alert Number:</span>
                            <span class="detail-value">#{self.alert_count + 1}</span>
                        </div>
                    </div>
                    
                    <h3>📋 Recommended Actions:</h3>
                    <ul style="color: #374151; line-height: 1.6;">
                        <li><strong>Verify the alert</strong> by checking the live monitoring system</li>
                        <li><strong>Contact emergency services</strong> if fire is confirmed</li>
                        <li><strong>Evacuate the area</strong> if necessary</li>
                        <li><strong>Check nearby sensors</strong> for additional confirmation</li>
                        <li><strong>Monitor wind conditions</strong> and fire spread potential</li>
                    </ul>
                    
                    <div style="background-color: #eff6ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 15px; margin: 20px 0;">
                        <h4 style="margin-top: 0; color: #1d4ed8;">📱 System Information</h4>
                        <p style="margin: 5px 0; color: #374151;"><strong>Monitoring System:</strong> IoTFireGuard AI Detection</p>
                        <p style="margin: 5px 0; color: #374151;"><strong>Detection Method:</strong> Real-time Computer Vision Analysis</p>
                        <p style="margin: 5px 0; color: #374151;"><strong>Alert Threshold:</strong> {self.fire_confidence_threshold}% confidence</p>
                    </div>
                </div>
                
                <div class="footer">
                    <p><strong>This is an automated alert from {self.organization_name}</strong></p>
                    <p>Alert generated at {timestamp} | System Status: Operational</p>
                    <p>For technical support or to modify alert settings, contact your system administrator.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text version for email clients that don't support HTML
        text_content = f"""
🚨 CRITICAL FIRE ALERT - {self.organization_name} 🚨

FIRE DETECTED WITH HIGH CONFIDENCE!

Detection Details:
- Type: {prediction}
- Confidence: {confidence:.1f}%
- Location: {location}
- Time: {timestamp}
- Alert #: {self.alert_count + 1}

⚠️ IMMEDIATE ACTION REQUIRED ⚠️

Recommended Actions:
1. Verify the alert by checking the live monitoring system
2. Contact emergency services if fire is confirmed
3. Evacuate the area if necessary
4. Check nearby sensors for additional confirmation
5. Monitor wind conditions and fire spread potential

System Information:
- Monitoring System: IoTFireGuard AI Detection
- Detection Method: Real-time Computer Vision Analysis
- Alert Threshold: {self.fire_confidence_threshold}% confidence

This is an automated alert from {self.organization_name}.
Alert generated at {timestamp} | System Status: Operational
        """
        
        return html_content, text_content
    
    def send_fire_alert(self, prediction, confidence, location="Camera Station 1"):
        """Send fire alert email to all emergency contacts"""
        if not self.should_send_alert(prediction, confidence):
            return False
        
        # Update alert tracking
        self.last_alert_time = datetime.now()
        self.alert_count += 1
        
        # Create email content
        html_content, text_content = self.create_fire_alert_email(prediction, confidence, location)
        
        # Email subject
        subject = f"{self.subject_prefix} Fire Detected - {confidence:.1f}% Confidence - Alert #{self.alert_count}"
        
        success_count = 0
        failed_contacts = []
        
        # Send email to all emergency contacts
        for contact in self.emergency_contacts:
            contact = contact.strip()
            if not contact:
                continue
                
            try:
                # Create message
                msg = MIMEMultipart('alternative')
                msg['From'] = self.email_sender
                msg['To'] = contact
                msg['Subject'] = subject
                
                # Add both plain text and HTML versions
                text_part = MIMEText(text_content, 'plain')
                html_part = MIMEText(html_content, 'html')
                
                msg.attach(text_part)
                msg.attach(html_part)
                
                # Send email
                with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                    server.starttls()
                    server.login(self.email_sender, self.email_password)
                    server.send_message(msg)
                
                self.logger.info(f"Fire alert email sent successfully to {contact}")
                success_count += 1
                
            except Exception as e:
                self.logger.error(f"Failed to send email to {contact}: {str(e)}")
                failed_contacts.append(contact)
        
        # Log results
        if success_count > 0:
            self.logger.info(f"Fire alert sent to {success_count} contacts")
        
        if failed_contacts:
            self.logger.warning(f"Failed to send alerts to: {', '.join(failed_contacts)}")
        
        return success_count > 0
    
    def send_test_email(self, test_email=None):
        """Send a test email to verify email functionality"""
        if not self.enabled:
            return False, "Email service not enabled - check email credentials"
        
        test_contacts = [test_email] if test_email else self.emergency_contacts
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Create test email content
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f0f9ff; }}
                .container {{ max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
                .header {{ background: linear-gradient(135deg, #0ea5e9, #3b82f6); color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 30px; }}
                .status-good {{ color: #059669; font-weight: bold; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📧 Email Test - {self.organization_name}</h1>
                </div>
                <div class="content">
                    <h2>✅ Email System Test Successful!</h2>
                    <p>This is a test email from your IoTFireGuard monitoring system.</p>
                    <p><strong>Test Time:</strong> {timestamp}</p>
                    <p><strong>System Status:</strong> <span class="status-good">Operational</span></p>
                    <p>If you receive this email, your fire alert system is configured correctly and ready to send emergency notifications.</p>
                    <hr>
                    <p><em>This is an automated test from {self.organization_name}</em></p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
📧 Email Test - {self.organization_name}

✅ Email System Test Successful!

This is a test email from your IoTFireGuard monitoring system.

Test Time: {timestamp}
System Status: Operational

If you receive this email, your fire alert system is configured correctly 
and ready to send emergency notifications.

This is an automated test from {self.organization_name}
        """
        
        subject = f"[TEST] {self.organization_name} - Email Alert System Test"
        
        success_count = 0
        errors = []
        
        for contact in test_contacts:
            contact = contact.strip()
            if not contact:
                continue
                
            try:
                # Create message
                msg = MIMEMultipart('alternative')
                msg['From'] = self.email_sender
                msg['To'] = contact
                msg['Subject'] = subject
                
                # Add both plain text and HTML versions
                text_part = MIMEText(text_content, 'plain')
                html_part = MIMEText(html_content, 'html')
                
                msg.attach(text_part)
                msg.attach(html_part)
                
                # Send email
                with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                    server.starttls()
                    server.login(self.email_sender, self.email_password)
                    server.send_message(msg)
                
                self.logger.info(f"Test email sent to {contact}")
                success_count += 1
                
            except Exception as e:
                error_msg = f"Failed to send test email to {contact}: {str(e)}"
                self.logger.error(error_msg)
                errors.append(error_msg)
        
        if success_count > 0:
            return True, f"Test email sent successfully to {success_count} contacts"
        else:
            return False, f"Failed to send test emails. Errors: {'; '.join(errors)}"
    
    def get_status(self):
        """Get current status of email service"""
        return {
            'enabled': self.enabled,
            'email_configured': bool(self.email_sender and self.email_password),
            'emergency_contacts': len([c for c in self.emergency_contacts if c.strip()]),
            'last_alert_time': self.last_alert_time.isoformat() if self.last_alert_time else None,
            'alert_count': self.alert_count,
            'cooldown_minutes': self.email_cooldown_minutes,
            'confidence_threshold': self.fire_confidence_threshold,
            'smtp_server': self.smtp_server,
            'smtp_port': self.smtp_port
        }