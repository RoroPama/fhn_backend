import apiResponseCode from "../framework-core/http/api-response-code.js";
import httpStatus from "../framework-core/http/http-status.js";
import sendResponse from "../framework-core/http/response.js";
import authService from "../services/auth.service.js";

const createUserWithRole = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Créer l'utilisateur
    const user = await authService.createUser(name, email, password, role);

    return sendResponse(res, {
      message: "Compte créé avec succès",
      httpCode: httpStatus.CREATED,
      data: { userId: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.log("Erreur lors de la création du compte:", error);

    if (error.message === apiResponseCode.EMAIL_ALREADY_EXISTS) {
      return sendResponse(res, {
        message: "Cet email est déjà utilisé",
        httpCode: httpStatus.CONFLICT,
        errorCode: apiResponseCode.EMAIL_ALREADY_EXISTS,
      });
    }
  }
};

export default {
  createUserWithRole,
};
