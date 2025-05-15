import Joi from "joi";
import Constants from "../../shared/constants.js";

export const dossierStatusSchema = Joi.object({
  dossierId: Joi.string().uuid().required().messages({
    "string.empty": "L'ID du dossier est requis",
    "string.uuid": "L'ID du dossier doit être un UUID valide",
    "any.required": "L'ID du dossier est requis",
  }),
  newStatus: Joi.string()
    .valid(...Object.values(Constants.statut_dossier))
    .required()
    .messages({
      "string.empty": "Le statut est requis",
      "any.only":
        "Le statut doit être l'une des valeurs suivantes: Nouveau, En_cours, Incomplet, Accepte, Rejete, Cloture",
      "any.required": "Le statut est requis",
    }),
});

export const dossier_enfantSchema = Joi.object({
  // Informations de base de l'enfant
  nom: Joi.string().required().messages({
    "any.required": "Le nom est requis",
    "string.empty": "Le nom ne peut pas être vide",
  }),
  date_naissance: Joi.date().required().messages({
    "any.required": "La date de naissance est requise",
    "date.base": "La date de naissance doit être une date valide",
  }),
  sexe: Joi.string().valid("M", "F").required().messages({
    "any.only": 'Le sexe doit être "M" ou "F"',
    "any.required": "Le sexe est requis",
  }),
  commune: Joi.string().required(),
  diagnostic: Joi.string().required(),
  parentNom: Joi.string().required(),
  parentTelephone: Joi.string().required(),
  parentEmail: Joi.string().email().required(),
  date_creation: Joi.date().required(),
  activites_quotidiennes: Joi.string().allow("", null),
  ancien_etablissement: Joi.string().allow("", null),
  est_scolarise: Joi.boolean().required(),
  niveau_scolaire: Joi.string().allow("", null),

  // etablissementId doit être 1 ou 2
  etablissementId: Joi.number().valid(1, 2).required().messages({
    "any.only": "L'établissement doit être 1 ou 2",
    "any.required": "L'établissement est requis",
  }),

  // Parcours médical tarii
  suivi_orthophonique: Joi.boolean().when("etablissementId", {
    is: 1,
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  suivi_psychologique: Joi.boolean().when("etablissementId", {
    is: 1,
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  psychomotricien: Joi.boolean().when("etablissementId", {
    is: 1,
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  tradipracticien: Joi.boolean().when("etablissementId", {
    is: 1,
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),

  // Parcours médical wisi
  a_consulte_ophtalmo: Joi.boolean().when("etablissementId", {
    is: 2,
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  a_autre_suivi_medical: Joi.boolean().when("etablissementId", {
    is: 2,
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  details_suivi_medical: Joi.string().allow("", null).when("etablissementId", {
    is: 2,
    then: Joi.optional(),
    otherwise: Joi.forbidden(),
  }),
  a_perception_visuelle: Joi.boolean().when("etablissementId", {
    is: 2,
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  est_aveugle: Joi.boolean().when("etablissementId", {
    is: 2,
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),

  // Champs communs aux deux parcours
  attente: Joi.string().allow("", null),
  observation: Joi.string().allow("", null),

  // Informations sur les fichiers
  filesInfo: Joi.alternatives()
    .try(
      // Cas où c'est une chaîne JSON
      Joi.string().custom((value, helpers) => {
        try {
          const parsed = JSON.parse(value);
          if (!Array.isArray(parsed)) {
            return helpers.error("any.invalid");
          }
          return parsed;
        } catch {
          return helpers.error("any.invalid");
        }
      }),
      // Cas où c'est déjà un tableau
      Joi.array().items(
        Joi.object({
          natureId: Joi.string().required().messages({
            "any.required": "L'ID de la nature du fichier est requis",
          }),
        })
      )
    )
    .optional()
    .messages({
      "any.invalid":
        "filesInfo doit être un tableau valide d'objets avec natureId",
    }),
});

export const addObservationSchema = Joi.object({
  dossierId: Joi.string().uuid().required().messages({
    "string.empty": "L'identifiant du dossier est requis",
    "string.guid": "L'identifiant du dossier doit être un UUID valide",
    "any.required": "L'identifiant du dossier est requis",
  }),

  contenu: Joi.string().min(1).max(5000).trim().required().messages({
    "string.empty": "Le contenu de l'observation est requis",
    "string.min": "Le contenu de l'observation ne peut pas être vide",
    "string.max":
      "Le contenu de l'observation ne peut pas dépasser 5000 caractères",
    "any.required": "Le contenu de l'observation est requis",
  }),
}).required();
