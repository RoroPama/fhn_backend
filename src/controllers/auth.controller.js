import apiResponseCode from "../framework-core/http/api-response-code.js";
import httpStatus from "../framework-core/http/http-status.js";
import sendResponse from "../framework-core/http/response.js";
import authService from "../services/auth.service.js";
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Créer l'utilisateur
    const user = await authService.createUser(name, email, password);

    // Générer le token JWT
    const token = authService.generateToken(user.id, user.email);

    // Définir le cookie
    res.cookie("authToken", token, authService.getCookieOptions());

    // Répondre avec les informations de l'utilisateur (sans le mot de passe)

    return sendResponse(res, {
      message: "Compte créé avec succès",
      httpCode: httpStatus.CREATED,
      data: { name: user.nom, email: user.email, role: user.role, token },
    });
  } catch (error) {
    console.error("Erreur lors de la création du compte:", error);

    if (error.message === apiResponseCode.EMAIL_ALREADY_EXISTS) {
      return sendResponse(res, {
        message: "Cet email est déjà utilisé",
        httpCode: httpStatus.CONFLICT,
        errorCode: apiResponseCode.EMAIL_ALREADY_EXISTS,
      });
    }

    return sendResponse(res, {
      message: "Erreur lors de la création du compte",
      httpCode: 500,
      errorCode: apiResponseCode.SERVER_ERROR,
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await authService.login(email, password);

    // Générer le token JWT
    const token = authService.generateToken(user.id, user.email);

    // Définir le cookie
    res.cookie("authToken", token, authService.getCookieOptions());

    return sendResponse(res, {
      message: "Connexion réussie",
      httpCode: httpStatus.OK,
      data: { nom: user.nom, email: user.email, role: user.role, token },
    });
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);

    // Gérer les erreurs spécifiques
    if (error.message === apiResponseCode.EMAIL_PASSWORD_INCORRECT) {
      return sendResponse(res, {
        message: "Email ou mot de passe incorrect",
        httpCode: httpStatus.UNAUTHORIZED,
        errorCode: apiResponseCode.EMAIL_PASSWORD_INCORRECT,
      });
    }

    return sendResponse(res, {
      message: "Erreur lors de la connexion",
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      errorCode: apiResponseCode.SERVER_ERROR,
    });
  }
};

const checkAuth = async (req, res) => {
  return sendResponse(res, {
    message: "Utilisateur authentifié",
    httpCode: httpStatus.OK,
    data: { userId: req.user.userId, email: req.user.email },
  });
};

export default {
  register,
  login,
  checkAuth,
};
