import prisma from "../db/prisma.js";
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
    console.log("error");

    console.log("Erreur lors de la création du compte:", error);
    console.error("Erreur lors de la création du compte:", error);

    if (error.message === apiResponseCode.EMAIL_ALREADY_EXISTS) {
      return sendResponse(res, {
        message: "Cet email est déjà utilisé",
        httpCode: httpStatus.CONFLICT,
        errorCode: apiResponseCode.EMAIL_ALREADY_EXISTS,
      });
    }
  }
};

const getUsers = async (req, res) => {
  try {
    // Récupérer directement les utilisateurs avec Prisma
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ["analyste", "secretaire"],
        },
      },
      select: {
        id: true,
        nom: true,
        email: true,
        role: true,
      },
    });

    return sendResponse(res, {
      message: "Utilisateurs récupérés avec succès",
      httpCode: httpStatus.OK,
      data: users,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return sendResponse(res, {
      message:
        "Une erreur est survenue lors de la récupération des utilisateurs",
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
    });
  }
};

export default {
  createUserWithRole,
  getUsers,
};
