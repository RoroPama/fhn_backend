import express from "express";
import authController from "../controllers/auth.controller.js";
import { schemaValidate } from "../middlewares/validator.js";
import { registerSchema } from "../framework-core/validators/auth.schema.js";

const router = express.Router();

// Route pour créer un compte
router.post(
  "/register",
  schemaValidate(registerSchema),
  authController.register
);

export default router;
