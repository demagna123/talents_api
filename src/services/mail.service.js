const nodemailer = require("nodemailer");
require("dotenv").config();

let transporter;

function getTransporter() {
  if (!transporter) {
    const port = Number(process.env.MAIL_PORT);
    transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASSWORD },
    });
  }
  return transporter;
}

// Lance une erreur si l'envoi échoue : l'appelant décide quoi faire
async function sendMail({ to, subject, html }) {
  return getTransporter().sendMail({ from: process.env.MAIL_FROM, to, subject, html });
}

module.exports = { sendMail };