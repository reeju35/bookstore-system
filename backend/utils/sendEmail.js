const nodemailer = require("nodemailer");

const sendEmail = async ({ email, subject, message }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const htmlTemplate = `
    <div style="font-family: Arial; padding:20px;">
      <h2 style="color:#2c3e50;">📚 Bookstore Order Confirmation</h2>
      <p>${message.replace(/\n/g, "<br/>")}</p>

      <hr/>

      <p style="color:gray;">
        Thank you for shopping with Bookstore.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `Bookstore <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html: htmlTemplate
  });
};

module.exports = sendEmail;
