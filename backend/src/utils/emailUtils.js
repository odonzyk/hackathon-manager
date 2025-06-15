const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../logger');

const transporterOptions = {
  host: config.smtpHost,
  port: config.smtpPort,
  secure: config.smtpSecure,
  debug: true,
  tls: {
    rejectUnauthorized: config.smtpRejectUnauthorized
  }
};
// Auth nur hinzufügen, wenn smtpUser nicht leer ist
if (config.smtpUser) {
  transporterOptions.auth = {
    user: config.smtpUser,
    pass: config.smtpPassword
  };
}
const transporter = nodemailer.createTransport(transporterOptions);

/**
 * Sendet eine E-Mail.
 * @param {string} to - Empfängeradresse.
 * @param {string} subject - Betreff der E-Mail.
 * @param {string} text - Textinhalt der E-Mail.
 * @param {string} html - HTML-Inhalt der E-Mail.
 */
async function sendEmail(to, subject, text, html) {
  try {
    await transporter.sendMail({
      from: config.smtpFrom,
      to,
      subject,
      text,
      html
    });
    logger.debug(`emailUtils: E-Mail erfolgreich an ${to} gesendet.`);
  } catch (error) {
    logger.error(`emailUtils: Fehler beim Senden der E-Mail an ${to}:`, error);
  }
}

async function sendActivationEmail(newUser) {
  const activationLink = `${config.activationUrl}?email=${encodeURIComponent(newUser.email)}&ac=${newUser.activation_code}`;
  await sendEmail(
    newUser.email,
    'Hackathon Kontoaktivierung',
    `Hallo ${newUser.name},\n\nBitte aktiviere Dein Konto mit folgendem Link:\n${activationLink}`,
    `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #4CAF50;">Hallo ${newUser.name}, willkommen beim Hackathon Manager!</h2>
            <p>Vielen Dank, dass du dich registriert hast. Um dein Konto zu aktivieren, klicke bitte auf den folgenden Link:</p>
            <p style="text-align: center; margin: 20px 0;">
                <a href="${activationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">Konto aktivieren</a>
            </p>
            <p>Falls der Button nicht funktioniert, kannst du auch diesen Link verwenden:</p>
            <p style="word-wrap: break-word;">
                <a href="${activationLink}" style="color: #4CAF50;">${activationLink}</a>
            </p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="font-size: 12px; color: #777;">Wenn du diese E-Mail nicht angefordert hast, kannst du sie ignorieren.</p>
            <p style="font-size: 12px; color: #777;">Mit freundlichen Grüßen,<br>Das Hackathon Manager Team</p>
        </div>`
  );
}

async function sendServerRestartNotification(adminEmail) {
  const restartTime = new Date().toLocaleString(); // Aktuelle Zeit des Neustarts
  const serverInfo = `${config.hostUrl || 'Hackathon Server'}`;
  const websiteLink = config.hostPort ? `${config.hostUrl}:${config.hostPort}` : config.hostUrl;

  await sendEmail(
    adminEmail,
    'Server Neustart Benachrichtigung',
    `Hallo Admin,\n\nDer Server wurde erfolgreich neu gestartet.\n\nDetails:\nServer: ${serverInfo}\nZeitpunkt: ${restartTime}\n\nWeitere Informationen finden Sie auf unserer Webseite:\n${websiteLink}\n\nFalls Sie diese Benachrichtigung nicht erwartet haben, überprüfen Sie bitte die Serverlogs.`,
    `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #4CAF50;">Server Neustart Benachrichtigung</h2>
            <p>Hallo Admin,</p>
            <p>Der Server wurde erfolgreich neu gestartet.</p>
            <p><strong>Details:</strong></p>
            <ul>
                <li><strong>Server:</strong> ${serverInfo}</li>
                <li><strong>Zeitpunkt:</strong> ${restartTime}</li>
            </ul>
            <p>Hier gehts direkt zu Anwendung:</p>
            <p style="text-align: center; margin: 20px 0;">
                <a href="${websiteLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">Zur Webseite</a>
            </p>
            <p>Falls der Button nicht funktioniert, können Sie auch diesen Link verwenden:</p>
            <p style="word-wrap: break-word;">
                <a href="${websiteLink}" style="color: #4CAF50;">${websiteLink}</a>
            </p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="font-size: 12px; color: #777;">Falls Sie diese Benachrichtigung nicht erwartet haben, überprüfen Sie bitte die Serverlogs.</p>
            <p style="font-size: 12px; color: #777;">Mit freundlichen Grüßen,<br>Das Hackathon Manager Team</p>
        </div>`
  );
}

module.exports = { sendActivationEmail, sendServerRestartNotification };
