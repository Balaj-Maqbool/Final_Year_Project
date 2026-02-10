const getPasswordResetTemplate = (resetUrl) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
            <div style="text-align: center; padding-bottom: 20px;">
                <h1 style="color: #333; font-size: 24px; margin-bottom: 10px;">Reset Your Password</h1>
                <p style="color: #666; font-size: 16px; line-height: 1.5;">You requested to reset your password. Click the button below to proceed.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">Reset Password</a>
            </div>

            <div style="text-align: center; border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 20px;">
                <p style="color: #999; font-size: 12px; margin-bottom: 5px;">If you didn't request this, you can safely ignore this email.</p>
                <p style="color: #999; font-size: 12px;">This link will expire in 10 minutes.</p>
            </div>
        </div>
    `;
};

const getWelcomeEmailTemplate = ({ name, role }) => {
    const isClient = role === "Client";

    const features = isClient
        ? `
        <li style="margin-bottom: 15px; padding-left: 25px; position: relative;">
            <span style="position: absolute; left: 0; color: #4F46E5;">✓</span>
            <strong style="color: #333;">Post Projects:</strong> Easily publish your requirements and reach thousands of experts.
        </li>
        <li style="margin-bottom: 15px; padding-left: 25px; position: relative;">
            <span style="position: absolute; left: 0; color: #4F46E5;">✓</span>
            <strong style="color: #333;">Hire Talent:</strong> Review proposals, check portfolios, and hire the best match.
        </li>
        <li style="margin-bottom: 15px; padding-left: 25px; position: relative;">
            <span style="position: absolute; left: 0; color: #4F46E5;">✓</span>
            <strong style="color: #333;">Secure Payments:</strong> Your money is held safely until you're satisfied with the work.
        </li>`
        : `
        <li style="margin-bottom: 15px; padding-left: 25px; position: relative;">
            <span style="position: absolute; left: 0; color: #4F46E5;">✓</span>
            <strong style="color: #333;">Find Work:</strong> Browse thousands of active jobs that match your skills.
        </li>
        <li style="margin-bottom: 15px; padding-left: 25px; position: relative;">
            <span style="position: absolute; left: 0; color: #4F46E5;">✓</span>
            <strong style="color: #333;">Submit Proposals:</strong> Stand out with great pitches and win contracts.
        </li>
        <li style="margin-bottom: 15px; padding-left: 25px; position: relative;">
            <span style="position: absolute; left: 0; color: #4F46E5;">✓</span>
            <strong style="color: #333;">Get Paid:</strong> Receive payments securely and build your reputation.
        </li>`;

    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
            <!-- Header -->
            <div style="background-color: #4F46E5; padding: 30px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Welcome to Freelance Market! 🚀</h1>
                <p style="color: #e0e7ff; margin-top: 10px; font-size: 16px;">The Premier Marketplace for Pakistani Talent</p>
            </div>

            <!-- Body -->
            <div style="padding: 40px 30px;">
                <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                    Hi <strong>${name}</strong>,
                </p>
                <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                    We are thrilled to have you join our growing community as a <strong>${role}</strong>! You have just taken the first step towards success.
                </p>

                <!-- Features Grid -->
                <div style="background-color: #f8fafc; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
                    <h3 style="color: #333; margin-top: 0; border-bottom: 2px solid #4F46E5; display: inline-block; padding-bottom: 5px;">
                        ${isClient ? "How to Hire:" : "How to Earn:"}
                    </h3>
                    
                    <ul style="list-style-type: none; padding: 0; margin-top: 20px;">
                        ${features}
                        <li style="margin-bottom: 0; padding-left: 25px; position: relative;">
                            <span style="position: absolute; left: 0; color: #4F46E5;">✓</span>
                            <strong style="color: #333;">Secure Chat:</strong> Communicate safely with built-in messaging.
                        </li>
                    </ul>
                </div>

                <div style="text-align: center; margin-top: 40px;">
                    <a href="${process.env.FRONTEND_URL || "#"}${process.env.FRONTEND_DASHBOARD_PATH || "/dashboard"}" style="background-color: #4F46E5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; transition: background-color 0.3s;">
                        ${isClient ? "Post a Job Now" : "Find Jobs Now"}
                    </a>
                </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
                <p style="color: #888; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Freelance Market Pakistan. All rights reserved.</p>
                <p style="color: #888; font-size: 12px; margin-top: 5px;">Happy Freelancing!</p>
            </div>
        </div>
    `;
};

export { getPasswordResetTemplate, getWelcomeEmailTemplate };
