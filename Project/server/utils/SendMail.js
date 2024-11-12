import "dotenv/config";
import { createTransport } from "nodemailer";

export async function SendMail(email, emailSubject, emailBody) {
    const transport = createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // Use SSL
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
        debug: true, // Enable debug output
        logger: true, // Log connection info
    });

    const mailOption = {
        from: process.env.SMTP_EMAIL,
        to: email,
        subject: emailSubject,
        html: emailBody,
    };

    try {
        const result = await transport.sendMail(mailOption);
        console.log("Email sent successfully!", result);
        return result;
    } catch (err) {
        console.error("Error sending email:", err.message);
        throw err; // Rethrow the error if needed for further handling
    }
}
