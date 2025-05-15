import express from "express";
import { schemaValidate } from "../middlewares/validator.js";
import {
  addObservationSchema,
  dossier_enfantSchema,
  dossierStatusSchema,
} from "../framework-core/validators/enfant_dossier.schema.js";
import dossier_enfantController from "./../controllers/dossier_enfant.js";
import upload_files from "../middlewares/upload_files.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

router.get(
  "/getDossierEnfantOfparent/:parentId",
  verifyToken,
  dossier_enfantController.getDossierEnfantOfparent
);

router.post(
  "/addObservation",
  verifyToken,
  schemaValidate(addObservationSchema),
  dossier_enfantController.addObservation
);
// Route pour créer un dossier enfant avec upload de fichiers
router.post(
  "/",
  verifyToken,
  upload_files.uploadFiles, // Middleware multer pour gérer les fichiers
  schemaValidate(dossier_enfantSchema), // Validation des données

  dossier_enfantController.soumissionDossierEnfant
);

router.patch(
  "/changeDossierState",
  schemaValidate(dossierStatusSchema),
  verifyToken,
  dossier_enfantController.changeDossierState
);

export default router;

router.get("/", verifyToken, dossier_enfantController.getAllDossiersEnfants);
