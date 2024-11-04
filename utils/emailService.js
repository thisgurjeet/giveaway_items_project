const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER, // my email address
        pass: process.env.EMAIL_PASS  // my email password 
    },
    tls: {
        rejectUnauthorized: false // Allow self-signed certificates
    }
    
});

// Function to send an email
const sendEmail = async (to, subject, text, html) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER, // Sender address
            to,                           // List of receivers (can be a string or array)
            subject,                      // Subject line
            text,                         // Plain text body
            html                          // HTML body (optional)
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent: ${info.response}`);
    } catch (error) {
        console.error(`Error sending email: ${error}`);
    }
};

module.exports = sendEmail;
