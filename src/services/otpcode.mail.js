const { sendMail } = require("./mail.service.js");
const constants = require("../data/constants.js");

async function otpCodeMail(to, code) {
  const html = `
    <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; color: #1f2933;">
      <h2 style="text-align: center; color: #078a3e;">SKULLVI · Talent Engine</h2>
      <p>Bonjour, voici votre code de connexion :</p>
      <div style="text-align: center; font-size: 44px; font-weight: bold; letter-spacing: 8px; margin: 24px 0;">
        ${code}
      </div>
      <p>Ce code est valable ${constants.OTP_CODE_EXPIRY_MINUTES} minutes. Saisissez-le dans l'application pour terminer votre connexion.</p>
      <p style="font-size: 13px; color: #667085;">
        Si vous n'êtes pas à l'origine de cette demande, ignorez ce message et changez votre mot de passe.
        Message automatique : merci de ne pas y répondre.
      </p>
    </div>`;

  await sendMail({ to, subject: "Votre code de connexion SKULLVI", html });
}

module.exports = otpCodeMail;