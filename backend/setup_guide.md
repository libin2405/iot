# SMS Alert Setup Guide for IoTFireGuard

This guide will help you set up real-time SMS alerts for fire detection using Twilio.

## Prerequisites

1. **Twilio Account**: Sign up at [https://www.twilio.com](https://www.twilio.com)
2. **Phone Number**: Purchase a Twilio phone number for sending SMS
3. **Emergency Contacts**: Phone numbers to receive fire alerts

## Step-by-Step Setup

### 1. Create Twilio Account

1. Go to [https://www.twilio.com](https://www.twilio.com)
2. Sign up for a free account
3. Verify your email and phone number
4. You'll get $15 in free credits for testing

### 2. Get Twilio Credentials

1. Go to your [Twilio Console](https://console.twilio.com/)
2. Find your **Account SID** and **Auth Token** on the dashboard
3. Copy these values - you'll need them for configuration

### 3. Purchase a Phone Number

1. In Twilio Console, go to **Phone Numbers** > **Manage** > **Buy a number**
2. Choose a number from your country
3. Make sure it has **SMS** capability
4. Purchase the number (costs ~$1/month)

### 4. Configure Environment Variables

1. In the `backend` folder, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file with your details:
   ```env
   # Twilio Configuration
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+1234567890

   # Emergency Contacts (comma-separated)
   EMERGENCY_CONTACTS=+1234567890,+0987654321,+1122334455

   # Alert Settings
   SMS_COOLDOWN_MINUTES=5
   FIRE_CONFIDENCE_THRESHOLD=70
   ```

### 5. Install Dependencies

```bash
cd backend
pip install twilio python-dotenv
```

### 6. Test the Setup

1. Start the backend server:
   ```bash
   python app.py
   ```

2. Start the frontend:
   ```bash
   npm run dev
   ```

3. Go to the "Live Detection" tab
4. Click "Connect to Server"
5. Scroll down to "SMS Alert System"
6. Click "Send Test SMS" to verify everything works

## Configuration Options

### Environment Variables

- **TWILIO_ACCOUNT_SID**: Your Twilio Account SID
- **TWILIO_AUTH_TOKEN**: Your Twilio Auth Token  
- **TWILIO_PHONE_NUMBER**: Your Twilio phone number (with country code)
- **EMERGENCY_CONTACTS**: Comma-separated list of phone numbers to alert
- **SMS_COOLDOWN_MINUTES**: Minutes between alerts (prevents spam)
- **FIRE_CONFIDENCE_THRESHOLD**: Minimum confidence % to trigger SMS alert

### Phone Number Format

Always use international format with country code:
- ✅ Correct: `+1234567890` (US number)
- ✅ Correct: `+447123456789` (UK number)
- ❌ Wrong: `234-567-8900`
- ❌ Wrong: `07123456789`

## How SMS Alerts Work

1. **Fire Detection**: AI model detects fire with ≥70% confidence
2. **Cooldown Check**: Ensures 5+ minutes since last alert
3. **SMS Sent**: Alert sent to all emergency contacts
4. **Logging**: All SMS attempts are logged for debugging

## Sample Alert Message

```
🚨 FIRE ALERT - IoTFireGuard 🚨

CRITICAL: Fire detected with 85.3% confidence
Location: Camera Station 1
Time: 2024-01-15 14:30:25
Alert #1

Immediate action required!
Check the monitoring system for details.

This is an automated alert from IoTFireGuard.
```

## Costs

- **Twilio Phone Number**: ~$1/month
- **SMS Messages**: ~$0.0075 per SMS in US (varies by country)
- **Example**: 100 fire alerts/month = ~$1.75 total

## Troubleshooting

### Common Issues

1. **"SMS service not enabled"**
   - Check your `.env` file exists and has correct Twilio credentials
   - Verify Account SID and Auth Token are correct

2. **"Failed to send SMS"**
   - Verify phone numbers are in international format (+1234567890)
   - Check Twilio account has sufficient balance
   - Ensure Twilio phone number has SMS capability

3. **"Invalid phone number"**
   - Use international format with country code
   - Remove spaces, dashes, or parentheses
   - Verify the number is a valid mobile number

### Testing Tips

1. **Start Small**: Test with one phone number first
2. **Check Logs**: Look at backend console for error messages
3. **Verify Balance**: Check Twilio console for account balance
4. **Test Numbers**: Use Twilio's verified numbers for testing

### Debug Mode

Add this to your `.env` for more detailed logging:
```env
DEBUG=True
LOG_LEVEL=DEBUG
```

## Security Notes

- **Never commit `.env` file** to version control
- **Rotate credentials** regularly
- **Use environment variables** in production
- **Monitor usage** to prevent unexpected charges

## Production Deployment

For production use:
1. Use environment variables instead of `.env` file
2. Set up monitoring for SMS delivery failures
3. Implement rate limiting to prevent abuse
4. Consider using Twilio's webhook for delivery status
5. Set up alerts for high SMS usage

## Support

- **Twilio Documentation**: [https://www.twilio.com/docs](https://www.twilio.com/docs)
- **Twilio Support**: Available through console
- **Phone Number Issues**: Check Twilio's phone number lookup tool