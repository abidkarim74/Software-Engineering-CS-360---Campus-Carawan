import transporter from './email.config.js';
import { VerificationEmailTemplate } from './emailTemplate.js';

export async function sendVerificationEmail(to: string, code: string): Promise<boolean> {
  try {
    const info = await transporter.sendMail({
      from: `"CampusCaravan" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Your CampusCaravan Verification Code',
      html: VerificationEmailTemplate(code),
    });
    console.log('✉️ Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
}