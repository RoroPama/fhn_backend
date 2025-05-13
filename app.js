const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());

app.use(cors());

app.use(morgan("dev"));

app.get("/", (req, res) => {
  console.log("Requête reçue sur la route principale");
  res.status(200).json({
    status: "success",
    message: "Le serveur fonctionne correctement",
  });
});

app.use((req, res) => {
  console.log(`Route non trouvéee: ${req.originalUrl}`);
  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} non trouvée`,
  });
});

module.exports = app;
