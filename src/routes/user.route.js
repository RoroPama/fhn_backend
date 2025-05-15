import express from "express";
import { schemaValidate } from "../middlewares/validator.js";
import userController from "../controllers/user.controller.js";
import { addUserSchema } from "../framework-core/validators/user.schema.js";
import { verifyToken } from "../middlewares/auth.js";
import { requireAdmin } from "../middlewares/user.js";

const router = express.Router();

// Route pour créer un compte
router.post(
  "/",
  schemaValidate(addUserSchema),
  verifyToken,
  requireAdmin,
  userController.createUserWithRole
);

router.get("/", verifyToken, requireAdmin, userController.getUsers);

export default router;
