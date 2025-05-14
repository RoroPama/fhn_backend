import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Obtenir le répertoire courant (__dirname équivalent en ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration de multer pour le stockage des fichiers
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    // Créer le dossier uploads s'il n'existe pas
    const uploadDir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Créer un sous-dossier par année/mois pour mieux organiser
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const subDir = path.join(uploadDir);

    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir, { recursive: true });
    }

    cb(null, subDir);
  },
  filename: (req, file, cb) => {
    // Format: YYYYMMDD-HHMMSS-ms
    const now = new Date();
    const timestamp = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
      "-",
      String(now.getHours()).padStart(2, "0"),
      String(now.getMinutes()).padStart(2, "0"),
      String(now.getSeconds()).padStart(2, "0"),
      "-",
      String(now.getMilliseconds()).padStart(3, "0"),
    ].join("");

    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}${ext}`);
  },
});

// Configuration de multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limite de 10MB par fichier
  },
  fileFilter: (req, file, cb) => {
    // Types de fichiers acceptés
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Type de fichier non supporté"), false);
    }
  },
});

// Middleware pour gérer les fichiers multiples
const uploadFiles = upload.array("fichiers", 10); // Maximum 10 fichiers

export default {
  uploadFiles,
};
