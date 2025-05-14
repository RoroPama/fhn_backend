import express from "express";
import { schemaValidate } from "../middlewares/validator.js";
import { dossier_enfantSchema } from "../framework-core/validators/enfant_dossier.schema.js";
import dossier_enfantController from "./../controllers/dossier_enfant.js";
const router = express.Router();

// Route pour créer un compte
router.post(
  "/",
  schemaValidate(dossier_enfantSchema),
  dossier_enfantController.soumissionDossierEnfant
);

export default router;
