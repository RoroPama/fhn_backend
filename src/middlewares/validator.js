import apiResponseCode from "../framework-core/http/api-response-code.js";
import httpStatus from "../framework-core/http/http-status.js";
import sendResponse from "../framework-core/http/response.js";
import Joi from "joi";
export const schemaValidate = (schema) => async (req, res, next) => {
  try {
    const validatedData = await schema.validateAsync(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    // Remplacer le body par les données validées
    req.body = validatedData;
    next();
  } catch (error) {
    if (error.isJoi) {
      return sendResponse(res, {
        message: error.details.map((err) => err.message).join(" | "),
        httpCode: httpStatus.BAD_REQUEST,
        errorCode: apiResponseCode.VALIDATION_FAILED,
      });
    }

    // En cas d'erreur non liée à la validation
    return sendResponse(res, {
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      errorCode: apiResponseCode.SERVER_ERROR,
      message: "Une erreur est survenue lors de la validation",
    });
  }
};
