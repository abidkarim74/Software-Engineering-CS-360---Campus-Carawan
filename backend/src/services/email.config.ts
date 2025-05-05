import nodemailer from 'nodemailer';

const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
const port = Number(process.env.EMAIL_PORT) || 587;

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,      
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false 
  }
});

transporter.verify((err, success) => {
  if (err) console.error('✉️ Email transporter setup failed:', err);
  else console.log('✅ Email transporter ready');
});

export default transporter;