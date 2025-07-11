import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import express from "express";
import cookieParser from "cookie-parser";

const app = express();
import userRoute from "./src/routes/user.route.js";
import authRoute from "./src/routes/auth.route.js";
import dossier_enfantRoute from "./src/routes/dossier_enfant.route.js";
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());

app.use(
  cors({
    origin: ["http://localhost:5173", "https://fondationhn.netlify.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    credentials: true,
    maxAge: 86400,
  })
);

app.use(morgan("dev"));

app.use(cookieParser());

app.use("/auth", authRoute);
app.use("/users", userRoute);
app.use("/dossier_enfant", dossier_enfantRoute);
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

export default app;
