import prisma from "../db/prisma.js";
import apiResponseCode from "../framework-core/http/api-response-code.js";
import httpStatus from "../framework-core/http/http-status.js";
import sendResponse from "../framework-core/http/response.js";
import Constants from "../shared/constants.js";

const soumissionDossierEnfant = async (req, res) => {
  try {
    const utilisateurId = "0ece4a19-8a18-49ab-82ca-d47b0563222d";
    const {
      // Informations de base de l'enfant
      nom,
      date_naissance,
      sexe,
      commune,
      diagnostic,
      parentNom,
      parentTelephone,
      parentEmail,
      date_creation,

      est_scolarise,
      niveau_scolaire,
      ancien_etablissement,
      activites_quotidiennes,
      etablissementId,

      // Champs communs aux deux formulaires
      attente,
      observation,

      // Champs spécifiques au formulaire TARII (établissement 1)
      suivi_orthophonique,
      suivi_psychologique,
      psychomotricien,
      tradipracticien,

      // Champs spécifiques au formulaire WISI (établissement 2)
      a_consulte_ophtalmo,
      a_autre_suivi_medical,
      details_suivi_medical,
      a_perception_visuelle,
      est_aveugle,
    } = req.body;

    // Utiliser une transaction pour garantir l'intégrité des données
    const result = await prisma.$transaction(async (prisma) => {
      // 1. Créer ou récupérer l'enfant
      let enfant = await prisma.enfant.findFirst({
        where: {
          nom,
          date_naissance: new Date(date_naissance),
          parentEmail,
        },
      });

      if (!enfant) {
        enfant = await prisma.enfant.create({
          data: {
            nom,
            date_naissance: new Date(date_naissance),
            sexe,
            commune,
            diagnostic,
            parentNom,
            parentTelephone,
            parentEmail,
            est_scolarise,
            niveau_scolaire,
            ancien_etablissement,
            activites_quotidiennes,
            date_creation: new Date(date_creation),
            utilisateurId,
          },
        });
      }

      // 2. Créer le dossier
      const dossier = await prisma.dossier.create({
        data: {
          enfantId: enfant.id,
          statut_dossier: Constants.statut_dossier.nouveau,
          etablissementId: etablissementId.toString(),
        },
      });

      // 3. Ajouter le parcours médical selon l'établissement
      if (etablissementId === 1) {
        // Parcours TARII
        await prisma.parcoursMedicalTARII.create({
          data: {
            suivi_orthophonique,
            suivi_psychologique,
            psychomotricien,
            tradipracticien,
            attente: attente || "",
            observation: observation || "",
            dossierId: dossier.id,
          },
        });
      } else if (etablissementId === 2) {
        // Parcours WISI
        await prisma.parcoursMedicalWiSi.create({
          data: {
            a_consulte_ophtalmo,
            a_autre_suivi_medical,
            details_suivi_medical: details_suivi_medical || "",
            a_perception_visuelle,
            est_aveugle,
            attente: attente || "",
            observation: observation || "",
            dossierId: dossier.id,
          },
        });
      }

      return { enfant, dossier };
    });

    return sendResponse(res, {
      httpCode: httpStatus.CREATED,
      message: "Dossier créé avec succès",
      data: result,
    });
  } catch (error) {
    return sendResponse(res, {
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: "Une erreur est survenue lors de la création du dossier",
      errorCode: apiResponseCode.SERVER_ERROR,
      data: result,
    });
  }
};

export default {
  soumissionDossierEnfant,
};
