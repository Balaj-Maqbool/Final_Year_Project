import { SMTP_EMAIL, SMTP_FROM_NAME } from "../constants.js";
import transporter from "../config/nodemailer.config.js";

const sendEmail = async (options) => {
    const message = {
        from: `${SMTP_FROM_NAME} <${SMTP_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };

    await transporter.sendMail(message);
};

export default sendEmail;
