import jwt from "jsonwebtoken";
import appConfig from "../config/app.config.js";
import sendResponse from "../framework-core/http/response.js";
import httpStatus from "../framework-core/http/http-status.js";
import apiResponseCode from "../framework-core/http/api-response-code.js";

export const verifyToken = async (req, res, next) => {
  try {
    // Récupérer le token depuis le cookie ou l'en-tête Authorization
    let token = req.cookies?.authToken;

    // Si pas de token dans les cookies, vérifier l'en-tête Authorization
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    // Si aucun token n'est fourni
    if (!token) {
      return sendResponse(res, {
        message: "Token d'authentification manquant",
        httpCode: httpStatus.UNAUTHORIZED,
        errorCode: apiResponseCode.UNAUTHORIZED,
      });
    }

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, appConfig.jwt.secret);

    // Ajouter les informations de l'utilisateur à la requête
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    // Passer au middleware suivant
    next();
  } catch (error) {
    // Gérer les différents types d'erreurs JWT
    if (error.name === "TokenExpiredError") {
      return sendResponse(res, {
        message: "Token expiré",
        httpCode: httpStatus.UNAUTHORIZED,
        errorCode: apiResponseCode.TOKEN_EXPIRED,
      });
    }

    if (error.name === "JsonWebTokenError") {
      return sendResponse(res, {
        message: "Token invalide",
        httpCode: httpStatus.UNAUTHORIZED,
        errorCode: apiResponseCode.INVALID_TOKEN,
      });
    }

    // Erreur générale
    console.error("Erreur dans authMiddleware:", error);
    return sendResponse(res, {
      message: "Erreur d'authentification",
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      errorCode: apiResponseCode.SERVER_ERROR,
    });
  }
};
