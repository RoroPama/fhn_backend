import Joi from "joi";
import Constants from "../../shared/constants.js";

export const addUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    "string.base": "Le nom doit être une chaîne de caractères",
    "string.empty": "Le nom est requis",
    "string.min": "Le nom doit contenir au moins {#limit} caractères",
    "string.max": "Le nom ne peut pas dépasser {#limit} caractères",
    "any.required": "Le nom est requis",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Format d'email invalide",
    "string.empty": "L'email est requis",
    "any.required": "L'email est requis",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Le mot de passe doit contenir au moins {#limit} caractères",
    "string.empty": "Le mot de passe est requis",
    "any.required": "Le mot de passe est requis",
  }),
  role: Joi.string()
    .valid(Constants.userRoles["secretaire"], Constants.userRoles["analyste"])
    .required()
    .messages({
      "any.only": "Le rôle doit être 'analyste' ou 'secretaire'",
      "string.empty": "Le rôle est requis",
      "any.required": "Le rôle est requis",
    }),
});
