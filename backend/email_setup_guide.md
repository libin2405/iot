# Email Alert Setup Guide for IoTFireGuard

This guide will help you set up real-time email alerts for fire detection using SMTP email services.

## Prerequisites

1. **Email Account**: Gmail, Outlook, or any SMTP-compatible email service
2. **App Password**: For Gmail/Outlook (not your regular password)
3. **Emergency Contacts**: Email addresses to receive fire alerts

## Step-by-Step Setup

### 1. Gmail Setup (Recommended)

#### Enable 2-Factor Authentication
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click "Security" → "2-Step Verification"
3. Follow the setup process

#### Generate App Password
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click "Security" → "App passwords"
3. Select "Mail" and "Other (custom name)"
4. Enter "IoTFireGuard" as the name
5. Copy the 16-character app password (e.g., `abcd efgh ijkl mnop`)

### 2. Outlook/Hotmail Setup

#### Enable App Passwords
1. Go to [Microsoft Account Security](https://account.microsoft.com/security)
2. Click "Advanced security options"
3. Under "App passwords", click "Create a new app password"
4. Enter "IoTFireGuard" as the name
5. Copy the generated password

### 3. Configure Environment Variables

1. In the `backend` folder, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file with your details:

   **For Gmail:**
   ```env
   EMAIL_SENDER=your_email@gmail.com
   EMAIL_PASSWORD=abcd efgh ijkl mnop
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   EMERGENCY_CONTACTS=alert1@example.com,alert2@example.com,alert3@example.com
   EMAIL_COOLDOWN_MINUTES=5
   FIRE_CONFIDENCE_THRESHOLD=70
   EMAIL_SUBJECT_PREFIX=[FIRE ALERT]
   ORGANIZATION_NAME=IoTFireGuard System
   ```

   **For Outlook/Hotmail:**
   ```env
   EMAIL_SENDER=your_email@outlook.com
   EMAIL_PASSWORD=your_app_password_here
   SMTP_SERVER=smtp-mail.outlook.com
   SMTP_PORT=587
   EMERGENCY_CONTACTS=alert1@example.com,alert2@example.com
   EMAIL_COOLDOWN_MINUTES=5
   FIRE_CONFIDENCE_THRESHOLD=70
   EMAIL_SUBJECT_PREFIX=[FIRE ALERT]
   ORGANIZATION_NAME=IoTFireGuard System
   ```

### 4. Install Dependencies

```bash
cd backend
pip install python-dotenv
```

### 5. Test the Setup

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
5. Scroll down to "Email Alert System"
6. Click "Send Test Email" to verify everything works

## Configuration Options

### Environment Variables

- **EMAIL_SENDER**: Your email address (sender)
- **EMAIL_PASSWORD**: App password (NOT your regular password)
- **SMTP_SERVER**: SMTP server address
- **SMTP_PORT**: SMTP port (usually 587 for TLS)
- **EMERGENCY_CONTACTS**: Comma-separated list of email addresses
- **EMAIL_COOLDOWN_MINUTES**: Minutes between alerts (prevents spam)
- **FIRE_CONFIDENCE_THRESHOLD**: Minimum confidence % to trigger email alert
- **EMAIL_SUBJECT_PREFIX**: Prefix for alert email subjects
- **ORGANIZATION_NAME**: Your organization name for emails

### Common SMTP Settings

| Provider | SMTP Server | Port | Security |
|----------|-------------|------|----------|
| Gmail | smtp.gmail.com | 587 | TLS |
| Outlook/Hotmail | smtp-mail.outlook.com | 587 | TLS |
| Yahoo | smtp.mail.yahoo.com | 587 | TLS |
| Custom | your.smtp.server | 587/465 | TLS/SSL |

## How Email Alerts Work

1. **Fire Detection**: AI model detects fire with ≥70% confidence
2. **Cooldown Check**: Ensures 5+ minutes since last alert
3. **Email Sent**: HTML-formatted alert sent to all emergency contacts
4. **Logging**: All email attempts are logged for debugging

## Sample Alert Email

The system sends professional HTML emails with:

- 🚨 **Critical Fire Alert Header**
- 📊 **Detection Details** (confidence, location, time)
- 📋 **Recommended Actions** checklist
- 📱 **System Information**
- 🎨 **Professional HTML formatting**

## Costs

- **Email Service**: Free with Gmail/Outlook
- **No per-message costs**: Unlike SMS, emails are free
- **Unlimited Recipients**: Add as many emergency contacts as needed

## Troubleshooting

### Common Issues

1. **"Email service not enabled"**
   - Check your `.env` file exists and has correct email credentials
   - Verify EMAIL_SENDER and EMAIL_PASSWORD are set

2. **"Authentication failed"**
   - Use app password, NOT your regular email password
   - Ensure 2-factor authentication is enabled
   - Check if "Less secure app access" is disabled (use app passwords instead)

3. **"Connection refused"**
   - Verify SMTP server and port settings
   - Check firewall/antivirus blocking SMTP connections
   - Try port 465 (SSL) instead of 587 (TLS)

4. **"Invalid email address"**
   - Verify email addresses are properly formatted
   - Remove spaces and special characters
   - Use comma separation for multiple contacts

### Testing Tips

1. **Start Small**: Test with one email address first
2. **Check Spam**: Alert emails might go to spam folder initially
3. **Verify Credentials**: Use app passwords, not regular passwords
4. **Check Logs**: Look at backend console for error messages

### Debug Mode

Add this to your `.env` for more detailed logging:
```env
DEBUG=True
LOG_LEVEL=DEBUG
```

## Security Notes

- **Never commit `.env` file** to version control
- **Use app passwords** instead of regular passwords
- **Enable 2-factor authentication** on email accounts
- **Monitor email usage** for suspicious activity
- **Use environment variables** in production

## Production Deployment

For production use:
1. Use environment variables instead of `.env` file
2. Set up email delivery monitoring
3. Implement rate limiting to prevent abuse
4. Consider using dedicated email services (SendGrid, Mailgun)
5. Set up email bounce/failure handling

## Advanced Configuration

### Custom SMTP Server
```env
EMAIL_SENDER=alerts@yourcompany.com
EMAIL_PASSWORD=your_smtp_password
SMTP_SERVER=mail.yourcompany.com
SMTP_PORT=587
```

### Multiple Alert Types
You can customize alert subjects and content by modifying the `email_service.py` file.

## Support

- **Gmail Help**: [https://support.google.com/mail](https://support.google.com/mail)
- **Outlook Help**: [https://support.microsoft.com/outlook](https://support.microsoft.com/outlook)
- **SMTP Troubleshooting**: Check your email provider's SMTP documentation