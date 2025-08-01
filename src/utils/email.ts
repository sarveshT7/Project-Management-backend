import nodemailer from 'nodemailer';

interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

const createTransporter = () => {
    return nodemailer.createTransport(
        {
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || '587'),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        }
    )
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
    try {
        const transporter = createTransporter()
        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html
        };
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully to:', options.to);

    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
}

// Template functions
export const sendWelcomeEmail = async (to: string, firstName: string): Promise<void> => {
    const subject = 'Welcome to Project Management App!';
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Welcome ${firstName}!</h1>
      <p>Thank you for joining our Project Management platform.</p>
      <p>You can now:</p>
      <ul>
        <li>Create and manage projects</li>
        <li>Collaborate with team members</li>
        <li>Track task progress</li>
        <li>Generate analytics reports</li>
      </ul>
      <p>Get started by logging into your account!</p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        This email was sent from Project Management App
      </p>
    </div>
  `;

    await sendEmail({ to, subject, html });
};