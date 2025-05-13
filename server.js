const app = require("./app");
const { appConfig } = require("./src/config/app.config");

const port = appConfig.port;
// Démarrage du serveur
const server = app.listen(port, () => {
  console.log("===========================================");
  console.log(`🚀 Serveur démarré en mode ${appConfig.node_env}`);
  console.log(`📡 Port d'écoute: ${port}`);
  console.log(`🕒 Démarré le: ${new Date().toLocaleString()}`);
  console.log("===========================================");
  console.log("Serveur prêt à recevoir des requêtes!");
});

// Gestion des erreurs non capturées
process.on("unhandledRejection", (err) => {
  console.log("ERREUR NON GÉRÉE! 💥 Fermeture du serveur...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = server;
