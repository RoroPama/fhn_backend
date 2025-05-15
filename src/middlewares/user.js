import prisma from "../db/prisma.js";
import apiResponseCode from "../framework-core/http/api-response-code.js";
import httpStatus from "../framework-core/http/http-status.js";
import sendResponse from "../framework-core/http/response.js";
import Constants from "../shared/constants.js";

export const requireAdmin = async (req, res, next) => {
  try {
    // Récupérer l'utilisateur depuis la base de données
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.userId,
      },
      select: {
        role: true,
      },
    });

    if (!user || user.role !== Constants.userRoles.admin) {
      return sendResponse(res, {
        message: "Accès refusé. Privilèges administrateur requis",
        httpCode: httpStatus.FORBIDDEN,
        errorCode: apiResponseCode.INSUFFICIENT_PERMISSIONS,
      });
    }

    req.user.role = user.role;
    console.log("99");

    next();
  } catch (error) {
    return sendResponse(res, {
      message: "Erreur lors de l'auth",
      httpCode: httpStatus.UNAUTHORIZED,
      errorCode: apiResponseCode.ACTION_UNAUTHORIZED,
    });
  }
};
