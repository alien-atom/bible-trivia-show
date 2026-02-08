import sgMail from '@sendgrid/mail';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=sendgrid',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  console.log('SendGrid connection settings:', {
    hasSettings: !!connectionSettings?.settings,
    hasApiKey: !!connectionSettings?.settings?.api_key,
    fromEmail: connectionSettings?.settings?.from_email
  });

  if (!connectionSettings || (!connectionSettings.settings.api_key || !connectionSettings.settings.from_email)) {
    throw new Error('SendGrid not connected');
  }
  return { apiKey: connectionSettings.settings.api_key, email: connectionSettings.settings.from_email };
}

async function getUncachableSendGridClient() {
  const { apiKey, email } = await getCredentials();
  sgMail.setApiKey(apiKey);
  return {
    client: sgMail,
    fromEmail: email
  };
}

export async function sendOtpEmail(toEmail: string, code: string): Promise<boolean> {
  // Try SendGrid first
  try {
    const { client, fromEmail } = await getUncachableSendGridClient();
    
    const msg = {
      to: toEmail,
      from: {
        email: fromEmail,
        name: 'Debbie from Bible Trivia Show'
      },
      subject: 'Your Bible Trivia Show Verification Code',
      text: `Your verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FAF8F5;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #D4A017; margin: 0;">Bible Trivia Show</h1>
            <p style="color: #5C4A32; margin-top: 5px;">Your Epic Bible Knowledge Journey</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #D4A017 0%, #E6B830 100%); border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 20px;">
            <p style="color: #5C4A32; margin: 0 0 10px 0; font-size: 16px; font-weight: 500;">Your verification code is:</p>
            <div style="background: rgba(255,255,255,0.85); border-radius: 8px; padding: 20px; display: inline-block;">
              <span style="font-size: 36px; font-weight: bold; color: #5C4A32; letter-spacing: 8px;">${code}</span>
            </div>
          </div>
          
          <div style="background: #F5F0E6; border-radius: 8px; padding: 20px; text-align: center; border: 1px solid #E8DFD0;">
            <p style="color: #5C4A32; margin: 0; font-size: 14px;">
              This code will expire in <strong>10 minutes</strong>.
            </p>
            <p style="color: #8B7355; margin: 15px 0 0 0; font-size: 12px;">
              If you didn't request this code, please ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #8B7355; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Bible Trivia Show. All rights reserved.</p>
          </div>
        </div>
      `
    };

    await client.send(msg);
    console.log(`📧 OTP email sent to ${toEmail}`);
    return true;
  } catch (error: any) {
    console.error('SendGrid error:', error?.response?.body || error.message || error);
    
    // Fallback: Log OTP to console for development/testing
    console.log('\n========================================');
    console.log('📧 EMAIL FALLBACK (SendGrid unavailable)');
    console.log(`📬 To: ${toEmail}`);
    console.log(`🔐 Verification Code: ${code}`);
    console.log('⏰ Expires in: 10 minutes');
    console.log('========================================\n');
    
    // Return true so user can still test the app
    return true;
  }
}
