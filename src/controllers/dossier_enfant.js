import prisma from "../db/prisma.js";
import apiResponseCode from "../framework-core/http/api-response-code.js";
import httpStatus from "../framework-core/http/http-status.js";
import sendResponse from "../framework-core/http/response.js";
import Constants from "../shared/constants.js";
import fs from "fs";

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

      // Informations sur les fichiers
      filesInfo, // Array d'objets contenant { natureId } pour chaque fichier
    } = req.body;

    // Parse filesInfo si c'est une chaîne JSON
    const filesInfoArray =
      typeof filesInfo === "string" ? JSON.parse(filesInfo) : filesInfo;

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

      // 4. Gérer les fichiers uploadés
      const documents = [];
      if (req.files && req.files.length > 0) {
        // Vérifier que nous avons les informations pour chaque fichier
        if (!filesInfoArray || filesInfoArray.length !== req.files.length) {
          throw new Error(
            "Les informations des fichiers ne correspondent pas aux fichiers uploadés"
          );
        }

        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          const fileInfo = filesInfoArray[i];

          // Construire l'URL relative du fichier
          const date = new Date();
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const relativeUrl = `/uploads/${year}/${month}/${file.filename}`;

          // Créer l'entrée Document dans la base de données
          const document = await prisma.document.create({
            data: {
              dossierId: dossier.id,
              natureId: fileInfo.natureId,
              nomFichier: file.originalname,
              url: relativeUrl,
            },
          });

          documents.push(document);
        }
      }

      return { enfant, dossier, documents };
    });

    return sendResponse(res, {
      httpCode: httpStatus.CREATED,
      message: "Dossier créé avec succès",
      data: result,
    });
  } catch (error) {
    console.error("Erreur lors de la création du dossier:", error);

    // En cas d'erreur, supprimer les fichiers uploadés
    if (req.files) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    return sendResponse(res, {
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      message:
        error.message ||
        "Une erreur est survenue lors de la création du dossier",
      errorCode: apiResponseCode.SERVER_ERROR,
    });
  }
};

const getAllDossiersEnfants = async (req, res) => {
  try {
    // Récupérer tous les dossiers avec leurs relations
    const dossiers = await prisma.dossier.findMany({
      include: {
        enfant: true,
        utilisateur: true,
        documents: {
          include: {
            nature: true, // Si vous avez une relation avec nature
          },
        },
        // Inclure les deux types de parcours médicaux pour récupérer les observations
        parcoursMedicalTARII: true,
        parcoursMedicalWiSi: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // Formater les données selon le format souhaité
    const dossiersFormattees = dossiers.map((dossier) => {
      // Déterminer les observations selon le type de parcours médical
      const observations = [];

      if (dossier.parcoursMedicalTARII?.[0]) {
        const parcours = dossier.parcoursMedicalTARII[0];
        if (parcours.observation) {
          observations.push(parcours.observation);
        }
      } else if (dossier.parcoursMedicalWiSi?.[0]) {
        const parcours = dossier.parcoursMedicalWiSi[0];
        if (parcours.observation) {
          observations.push(parcours.observation);
        }
      }

      // Formater les documents
      const documents = dossier.documents.map((doc) => ({
        id: doc.id,
        nomFichier: doc.nomFichier,
        url: doc.url,
        nature: doc.nature?.nom || "Non spécifié",
        dateUpload: doc.created_at,
      }));

      return {
        id: dossier.id,
        nom: dossier.enfant.nom,
        dateNaissance: dossier.enfant.date_naissance
          .toISOString()
          .split("T")[0],
        sexe: dossier.enfant.sexe,
        commune: dossier.enfant.commune,
        parent: {
          nom: dossier.enfant.parentNom,
          telephone: dossier.enfant.parentTelephone,
          email: dossier.enfant.parentEmail,
        },
        statutDossier: dossier.statut_dossier,
        dateCreation: dossier.created_at.toISOString(),
        utilisateurCreateur: dossier.utilisateur?.nom || "Inconnu",
        observations,
        documents,
      };
    });

    return sendResponse(res, {
      httpCode: httpStatus.OK,
      message: "Dossiers récupérés avec succès",
      data: dossiersFormattees,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des dossiers:", error);

    return sendResponse(res, {
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: "Une erreur est survenue lors de la récupération des dossiers",
      errorCode: apiResponseCode.SERVER_ERROR,
    });
  }
};
export default { soumissionDossierEnfant, getAllDossiersEnfants };
