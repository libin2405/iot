
import os
import smtplib
import ssl
from datetime import datetime, timedelta
from dotenv import load_dotenv
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# --- Load Environment Variables ---
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=dotenv_path)
# --- End of .env loading ---

# Debug print to check if .env was loaded
print(f"DEBUG (email_service): SENDER_EMAIL from .env is: {os.environ.get('SENDER_EMAIL')}")

class EmailAlertService:
    def __init__(self):
        self.sender_email = os.getenv('SENDER_EMAIL')
        self.sender_password = os.getenv('SENDER_PASSWORD')
        self.recipient_emails = os.getenv('RECIPIENT_EMAILS', '').split(',')
        
        self.email_cooldown_minutes = int(os.getenv('EMAIL_COOLDOWN_MINUTES', 5))
        self.fire_confidence_threshold = int(os.getenv('FIRE_CONFIDENCE_THRESHOLD', 55))
        
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587 # For STARTTLS
        
        # Initialize service
        if self.sender_email and self.sender_password:
            self.enabled = True
            print("Email Alert Service initialized successfully")
        else:
            self.enabled = False
            print("Email Alert Service disabled - missing email credentials")
        
        # Track last alert times
        self.last_alert_time = None
        self.alert_count = 0
        
        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)

    def _send_email(self, subject, body, recipients):
        """Helper function to send an email."""
        if not self.enabled:
            return False, "Email service is not enabled."
        
        context = ssl.create_default_context()
        try:
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls(context=context) # Secure the connection
                server.login(self.sender_email, self.sender_password)
                
                for recipient in recipients:
                    recipient = recipient.strip()
                    if not recipient:
                        continue
                        
                    message = MIMEMultipart()
                    message["From"] = self.sender_email
                    message["To"] = recipient
                    message["Subject"] = subject
                    message.attach(MIMEText(body, "plain"))
                    
                    server.sendmail(self.sender_email, recipient, message.as_string())
                    self.logger.info(f"Email sent successfully to {recipient}")
            return True, "Email sent successfully."
        except Exception as e:
            self.logger.error(f"Failed to send email: {e}")
            return False, str(e)
            
    def should_send_alert(self, prediction, confidence):
        """Check if an email alert should be sent based on conditions"""
        if not self.enabled:
            return False
        
        if prediction != 'Fire' or confidence < self.fire_confidence_threshold:
            return False
        
        if self.last_alert_time:
            time_since_last = datetime.now() - self.last_alert_time
            if time_since_last < timedelta(minutes=self.email_cooldown_minutes):
                return False # Cooldown active
        
        return True
    
    def send_fire_alert(self, prediction, confidence, location="Camera Station 1"):
        """Send fire alert email to all emergency contacts"""
        if not self.should_send_alert(prediction, confidence):
            return False
        
        self.last_alert_time = datetime.now()
        self.alert_count += 1
        
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        subject = f"🚨 FIRE ALERT - IoTFireGuard (Alert #{self.alert_count})"
        body = f"""
        CRITICAL: Fire detected with {confidence:.1f}% confidence
        
        Location: {location}
        Time: {timestamp}

        Immediate action required!
        Check the monitoring system for details.

        This is an automated alert from IoTFireGuard.
        """.strip()
        
        success, _ = self._send_email(subject, body, self.recipient_emails)
        return success

    def send_test_message(self, test_email=None):
        """Send a test email to verify functionality"""
        if not self.enabled:
            return False, "Email service not enabled - check email credentials"
        
        recipients = [test_email] if test_email else self.recipient_emails
        
        subject = "📱 IoTFireGuard Test Message"
        body = f"""
        This is a test of the email alert system.
        Time: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

        If you receive this message, email alerts are working correctly.

        System Status: ✅ Operational
        """.strip()
        
        success, error_msg = self._send_email(subject, body, recipients)
        
        if success:
            return True, f"Test email sent successfully to {', '.join(recipients)}"
        else:
            return False, f"Failed to send test email. Error: {error_msg}"
    
    def get_status(self):
        """Get current status of email service"""
        return {
            'enabled': self.enabled,
            'email_configured': bool(self.sender_email and self.sender_password),
            'emergency_contacts': len([e for e in self.recipient_emails if e.strip()]),
            'last_alert_time': self.last_alert_time.isoformat() if self.last_alert_time else None,
            'alert_count': self.alert_count,
            'cooldown_minutes': self.email_cooldown_minutes,
            'confidence_threshold': self.fire_confidence_threshold
        }
