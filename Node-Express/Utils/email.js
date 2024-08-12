const nodemailer = require("nodemailer");

const sendEmail = async (option) => {
  //CREATE A TRANSPORTER(Transporter is a service responsible for sending email i.e gmail, but we are not using gmail, we used mailtrap)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_POST,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //DEFINE EMAIL OPTIONS
  const emailOptions = {
    from: "CinMovie support<support@cinmovie.com>",
    to: option.email,
    subject: option.subject,
    text: option.message,
  };

  await transporter.sendMail(emailOptions);
};

module.exports = sendEmail;
