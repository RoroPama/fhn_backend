import nodemailer from "nodemailer";
import appConfig from "../config/app.config.js";

// Configuration du transporteur SMTP avec les variables de configuration
const transporter = nodemailer.createTransport({
  host: appConfig.smtp_host,
  port: parseInt(appConfig.smtp_port),
  secure: false, // Utiliser TLS
  auth: {
    user: appConfig.smtp_user,
    pass: appConfig.smtp_pass,
  },
  tls: {
    rejectUnauthorized: false, // Accepter les certificats auto-signés
    ciphers: "SSLv3",
  },
  debug: true, // Activer le debug pour voir les détails
});

// Vérifier la connexion SMTP au démarrage
transporter.verify(function (error, success) {
  if (error) {
    console.error("Erreur de configuration SMTP:", error);
  } else {
    console.log("Serveur SMTP prêt à envoyer des emails");
  }
});

// Fonction pour envoyer un email avec template HTML
async function sendEmail({ to, subject, text, html }) {
  try {
    // Configuration du message
    const mailOptions = {
      from: "FHN" || `"${appConfig.app_name}" <${appConfig.smtp_user}>`,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject: subject,
      onject: "FHN",
      text: text,
      html: html || text, // Si pas de HTML, utiliser le texte
    };

    // Envoi de l'email
    const info = await transporter.sendMail(mailOptions);

    console.log("Email envoyé avec succès:", {
      messageId: info.messageId,
      destinataire: to,
      sujet: subject,
    });

    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
    };
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Template d'email réutilisable
function createEmailTemplate(title, content, ctaText, ctaLink) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .cta-button { 
          display: inline-block; 
          padding: 10px 20px; 
          background-color: #4CAF50; 
          color: white; 
          text-decoration: none; 
          border-radius: 5px; 
          margin: 20px 0;
        }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${title}</h1>
        </div>
        <div class="content">
          ${content}
          ${
            ctaLink
              ? `<a href="${ctaLink}" class="cta-button">${
                  ctaText || "Cliquer ici"
                }</a>`
              : ""
          }
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${
    appConfig.app_name || "FHN"
  }. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Exemples de fonctions utilitaires
const emailService = {
  // Envoyer un email de bienvenue
  async sendWelcomeEmail(userEmail, userName) {
    const html = createEmailTemplate(
      "Bienvenue !",
      `<p>Bonjour ${userName},</p>
       <p>Nous sommes ravis de vous accueillir sur ${appConfig.app_name}.</p>
       <p>Votre compte a été créé avec succès.</p>`,
      "Accéder à mon compte",
      `${appConfig.app_url}/login`
    );

    return await sendEmail({
      to: userEmail,
      subject: `Bienvenue sur ${appConfig.app_name}`,
      text: `Bonjour ${userName}, bienvenue sur ${appConfig.app_name}!`,
      html: html,
    });
  },

  // Envoyer un email de réinitialisation de mot de passe
  async sendPasswordResetEmail(userEmail, resetToken) {
    const resetLink = `${appConfig.app_url}/reset-password?token=${resetToken}`;
    const html = createEmailTemplate(
      "Réinitialisation de votre mot de passe",
      `<p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
       <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe:</p>`,
      "Réinitialiser mon mot de passe",
      resetLink
    );

    return await sendEmail({
      to: userEmail,
      subject: "Réinitialisation de votre mot de passe",
      text: `Pour réinitialiser votre mot de passe, visitez: ${resetLink}`,
      html: html,
    });
  },

  // Envoyer un email de notification avec support pour les sauts de ligne
  async sendNotificationEmail(userEmail, title, message, isred = true) {
    // Convertir les \n en <br> pour le HTML et créer des paragraphes
    const htmlMessage = message
      .split("\n\n")
      .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
      .join("");

    const html = createEmailTemplate(title, htmlMessage, null, null);

    return await sendEmail({
      to: userEmail,

      subject: title,
      text: message,
      html: html,
    });
  },

  // Envoyer un email avec pièce jointe
  async sendEmailWithAttachment(to, subject, content, filePath) {
    return await sendEmail({
      to: to,
      subject: subject,
      text: content,
      html: `<p>${content}</p>`,
      attachments: [
        {
          filename: filePath.split("/").pop(),
          path: filePath,
        },
      ],
    });
  },
};

export default {
  sendEmail,
  emailService,
  createEmailTemplate,
};
