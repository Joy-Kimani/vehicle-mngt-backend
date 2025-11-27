import nodemailer from "nodemailer";


export const sendNotificationEmail = async (
  email: string,
  full_name: string,
  subject: string,
  message: string,
): Promise<string> => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: 'smtp.gmail.com',
      secure: true,
      auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_SENDER,
      to: email,
      subject: subject,
      text: `Hello ${full_name},\n\n${message}\n\nIf you didn't request this, please ignore this email.`,
      html: `
        <html>
          <head>
            <style>
              .email-container {
                font-family: Arial, sans-serif;
                background-color: #f9f9f9;
                padding: 20px;
                border-radius: 8px;
                color: #333;
              }
              h2 {
                color: #007bff;
              }
              p {
                font-size: 16px;
                line-height: 1.6;
              }
              .footer {
                margin-top: 20px;
                font-size: 14px;
                color: #4b4848ff;
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <h2>${subject}</h2>
              <p>Hello <strong>${full_name}</strong>,</p>
              <p>${message}</p>
              <p class="footer">If you didn’t request this, please ignore this email.</p>
            </div>
          </body>
        </html>
      `,
    };

    const mailRes = await transporter.sendMail(mailOptions);
   

    if (mailRes.accepted.length > 0) {
      return "Notification email sent successfully";
    } else if (mailRes.rejected.length > 0) {
      return "Notification email not sent, please try again";
    } else {
      return "Email server error";
    }
  } catch (error) {
    console.error(error);
    return "Email server error";
  }
};