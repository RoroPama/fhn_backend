import express from "express";
import { schemaValidate } from "../middlewares/validator.js";
import { dossier_enfantSchema } from "../framework-core/validators/enfant_dossier.schema.js";
import dossier_enfantController from "./../controllers/dossier_enfant.js";
import upload_files from "../middlewares/upload_files.js";

const router = express.Router();

// Route pour créer un dossier enfant avec upload de fichiers
router.post(
  "/",
  upload_files.uploadFiles, // Middleware multer pour gérer les fichiers
  schemaValidate(dossier_enfantSchema), // Validation des données
  dossier_enfantController.soumissionDossierEnfant
);

export default router;
