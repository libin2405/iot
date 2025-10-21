import os
from datetime import datetime, timedelta
from twilio.rest import Client
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

class SMSAlertService:
    def __init__(self):
        self.account_sid = os.getenv('TWILIO_ACCOUNT_SID')
        self.auth_token = os.getenv('TWILIO_AUTH_TOKEN')
        self.twilio_number = os.getenv('TWILIO_PHONE_NUMBER')
        self.emergency_contacts = os.getenv('EMERGENCY_CONTACTS', '').split(',')
        self.sms_cooldown_minutes = int(os.getenv('SMS_COOLDOWN_MINUTES', 5))
        self.fire_confidence_threshold = int(os.getenv('FIRE_CONFIDENCE_THRESHOLD', 70))
        
        # Initialize Twilio client
        if self.account_sid and self.auth_token:
            self.client = Client(self.account_sid, self.auth_token)
            self.enabled = True
            print("SMS Alert Service initialized successfully")
        else:
            self.client = None
            self.enabled = False
            print("SMS Alert Service disabled - missing Twilio credentials")
        
        # Track last alert times to prevent spam
        self.last_alert_time = None
        self.alert_count = 0
        
        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
    
    def should_send_alert(self, prediction, confidence):
        """Check if an SMS alert should be sent based on conditions"""
        if not self.enabled:
            return False
        
        # Check if prediction is fire with sufficient confidence
        if prediction != 'Fire' or confidence < self.fire_confidence_threshold:
            return False
        
        # Check cooldown period
        if self.last_alert_time:
            time_since_last = datetime.now() - self.last_alert_time
            if time_since_last < timedelta(minutes=self.sms_cooldown_minutes):
                return False
        
        return True
    
    def send_fire_alert(self, prediction, confidence, location="Camera Station 1"):
        """Send fire alert SMS to all emergency contacts"""
        if not self.should_send_alert(prediction, confidence):
            return False
        
        # Update alert tracking
        self.last_alert_time = datetime.now()
        self.alert_count += 1
        
        # Create alert message
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        message = f"""
🚨 FIRE ALERT - IoTFireGuard 🚨

CRITICAL: Fire detected with {confidence:.1f}% confidence
Location: {location}
Time: {timestamp}
Alert #{self.alert_count}

Immediate action required!
Check the monitoring system for details.

This is an automated alert from IoTFireGuard.
        """.strip()
        
        success_count = 0
        failed_contacts = []
        
        # Send SMS to all emergency contacts
        for contact in self.emergency_contacts:
            contact = contact.strip()
            if not contact:
                continue
                
            try:
                message_instance = self.client.messages.create(
                    body=message,
                    from_=self.twilio_number,
                    to=contact
                )
                
                self.logger.info(f"SMS sent successfully to {contact}. SID: {message_instance.sid}")
                success_count += 1
                
            except Exception as e:
                self.logger.error(f"Failed to send SMS to {contact}: {str(e)}")
                failed_contacts.append(contact)
        
        # Log results
        if success_count > 0:
            self.logger.info(f"Fire alert sent to {success_count} contacts")
        
        if failed_contacts:
            self.logger.warning(f"Failed to send alerts to: {', '.join(failed_contacts)}")
        
        return success_count > 0
    
    def send_test_message(self, test_number=None):
        """Send a test message to verify SMS functionality"""
        if not self.enabled:
            return False, "SMS service not enabled - check Twilio credentials"
        
        test_contacts = [test_number] if test_number else self.emergency_contacts
        
        message = f"""
📱 IoTFireGuard Test Message

This is a test of the SMS alert system.
Time: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

If you receive this message, SMS alerts are working correctly.

System Status: ✅ Operational
        """.strip()
        
        success_count = 0
        errors = []
        
        for contact in test_contacts:
            contact = contact.strip()
            if not contact:
                continue
                
            try:
                message_instance = self.client.messages.create(
                    body=message,
                    from_=self.twilio_number,
                    to=contact
                )
                
                self.logger.info(f"Test SMS sent to {contact}. SID: {message_instance.sid}")
                success_count += 1
                
            except Exception as e:
                error_msg = f"Failed to send test SMS to {contact}: {str(e)}"
                self.logger.error(error_msg)
                errors.append(error_msg)
        
        if success_count > 0:
            return True, f"Test message sent successfully to {success_count} contacts"
        else:
            return False, f"Failed to send test messages. Errors: {'; '.join(errors)}"
    
    def get_status(self):
        """Get current status of SMS service"""
        return {
            'enabled': self.enabled,
            'twilio_configured': bool(self.account_sid and self.auth_token),
            'emergency_contacts': len([c for c in self.emergency_contacts if c.strip()]),
            'last_alert_time': self.last_alert_time.isoformat() if self.last_alert_time else None,
            'alert_count': self.alert_count,
            'cooldown_minutes': self.sms_cooldown_minutes,
            'confidence_threshold': self.fire_confidence_threshold
        }