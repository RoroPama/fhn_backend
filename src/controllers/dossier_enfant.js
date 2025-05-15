import prisma from "../db/prisma.js";
import apiResponseCode from "../framework-core/http/api-response-code.js";
import httpStatus from "../framework-core/http/http-status.js";
import sendResponse from "../framework-core/http/response.js";
import dossierEnfantService from "../services/dossier_enfant.service.js";
import userService from "../services/user.service.js";
import Constants from "../shared/constants.js";
import fs from "fs";
import email from "../shared/email.js"; // Assurez-vous d'importer la fonction d'envoi d'email
const soumissionDossierEnfant = async (req, res) => {
  try {
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

    // Récupérer l'utilisateur ID depuis la requête (probablement depuis le middleware d'auth)
    const utilisateurId = req.user?.userId || req.body.utilisateurId;

    if (!utilisateurId) {
      return sendResponse(res, {
        httpCode: httpStatus.BAD_REQUEST,
        message: "L'identifiant de l'utilisateur est requis",
        errorCode: apiResponseCode.VALIDATION_ERROR,
      });
    }

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
          statut_dossier: "Nouveau", // Utiliser l'enum Statut
          etablissementId: etablissementId.toString(),
        },
      });

      // 3. Ajouter le parcours médical selon l'établissement
      if (etablissementId === 1 || etablissementId === "1") {
        // Parcours TARII
        await prisma.parcoursMedicalTARII.create({
          data: {
            suivi_orthophonique: Boolean(suivi_orthophonique),
            suivi_psychologique: Boolean(suivi_psychologique),
            psychomotricien: Boolean(psychomotricien),
            tradipracticien: Boolean(tradipracticien),
            attente: attente || "",
            observation: observation || "",
            dossierId: dossier.id,
          },
        });
      } else if (etablissementId === 2 || etablissementId === "2") {
        // Parcours WISI
        await prisma.parcoursMedicalWiSi.create({
          data: {
            a_consulte_ophtalmo: Boolean(a_consulte_ophtalmo),
            a_autre_suivi_medical: Boolean(a_autre_suivi_medical),
            details_suivi_medical: details_suivi_medical || "",
            a_perception_visuelle: Boolean(a_perception_visuelle),
            est_aveugle: Boolean(est_aveugle),
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
        documents: true,
        ParcoursMedicalTARII: true,
        ParcoursMedicalWiSi: true,
        etablissement: true,
        observations: true,
      },
      orderBy: {
        id: "desc", // Trier par ID décroissant
      },
    });

    // Formater les données selon le format souhaité
    const dossiersFormattees = dossiers.map((dossier) => {
      // Déterminer les observations selon le type de parcours médical
      const observations = [];
      let parcoursMedical = null;

      if (dossier.ParcoursMedicalTARII?.length > 0) {
        const parcours = dossier.ParcoursMedicalTARII[0];
        if (parcours.observation) {
          observations.push(parcours.observation);
        }
        parcoursMedical = {
          type: "TARII",
          data: parcours,
        };
      } else if (dossier.ParcoursMedicalWiSi?.length > 0) {
        const parcours = dossier.ParcoursMedicalWiSi[0];
        if (parcours.observation) {
          observations.push(parcours.observation);
        }
        parcoursMedical = {
          type: "WiSi",
          data: parcours,
        };
      }

      // Formater les documents
      const documents = dossier.documents.map((doc) => ({
        id: doc.id,
        nomFichier: doc.nomFichier,
        url: doc.url,
        nature: doc.natureId,
        dateUpload: doc.uploadDate || new Date().toISOString(),
      }));

      const dossierFormate = {
        id: dossier.id,
        nom: dossier.enfant.nom,
        dateNaissance: dossier.enfant.date_naissance
          .toISOString()
          .split("T")[0],
        sexe: dossier.enfant.sexe,
        commune: dossier.enfant.commune,
        // Nouvelles données pour le calcul du score
        est_scolarise: dossier.enfant.est_scolarise,
        niveau_scolaire: dossier.enfant.niveau_scolaire,
        ancien_etablissement: dossier.enfant.ancien_etablissement,
        activites_quotidiennes: dossier.enfant.activites_quotidiennes,
        parcoursMedical: parcoursMedical,
        etablissement: {
          id: dossier.etablissement.id,
          libelle: dossier.etablissement.libelle,
        },
        // Fin des nouvelles données
        parent: {
          nom: dossier.enfant.parentNom,
          telephone: dossier.enfant.parentTelephone,
          email: dossier.enfant.parentEmail,
        },
        statutDossier: dossier.statut_dossier,
        dateCreation: dossier.enfant.date_creation.toISOString(),
        utilisateurCreateur: dossier.enfant.utilisateurId || "Inconnu",
        observations,
        documents,
      };

      // Calculer la note pour ce dossier
      const note = dossierEnfantService.calculNote(dossierFormate);

      // Ajouter la note au dossier formaté
      return {
        ...dossierFormate,
        note,
      };
    });

    // Trier les dossiers par note décroissante (les plus désavantagés en premier)
    dossiersFormattees.sort((a, b) => b.note - a.note);

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

const changeDossierState = async (req, res) => {
  try {
    const { dossierId, newStatus } = req.body;

    // Récupérer l'ID de l'utilisateur depuis le middleware d'authentification
    const userId = req.user.userId;

    // Vérifier le rôle de l'utilisateur
    const userRole = await userService.getUserRole(userId);

    // Vérifier si l'utilisateur a le rôle requis (analyste ou admin)
    if (userRole !== Constants.userRoles["analyste"]) {
      return sendResponse(res, {
        message:
          "Permission refusée. Seuls les analystes et administrateurs peuvent changer l'état d'un dossier",
        httpCode: httpStatus.FORBIDDEN,
        errorCode: apiResponseCode.ACCESS_DENIDED,
      });
    }

    // Vérifier que le dossier existe avec les informations du parent
    const dossierExists = await prisma.dossier.findUnique({
      where: { id: dossierId },
      include: {
        enfant: {
          select: {
            nom: true,
            parentNom: true,
            parentEmail: true,
          },
        },
      },
    });

    if (!dossierExists) {
      return sendResponse(res, {
        message: "Dossier non trouvé",
        httpCode: httpStatus.NOT_FOUND,
        errorCode: apiResponseCode.NOT_FOUND,
      });
    }

    // Mettre à jour le statut du dossier
    const updatedDossier = await prisma.dossier.update({
      where: { id: dossierId },
      data: { statut_dossier: newStatus },
      include: {
        enfant: {
          select: {
            nom: true,
            parentNom: true,
            parentEmail: true,
          },
        },
      },
    });

    // Envoyer un email au parent si le dossier est accepté et que l'email existe
    if (
      newStatus === Constants.statut_dossier.Accepte &&
      updatedDossier.enfant.parentEmail
    ) {
      try {
        email.emailService.sendNotificationEmail(
          updatedDossier.enfant.parentEmail,
          "Le Dossier soumis à la FHN a été accepté",
          `Bonjour ${updatedDossier.enfant.parentNom},\n\nNous avons le plaisir de vous informer que le dossier de ${updatedDossier.enfant.nom} a été accepté.\n\nCordialement,\nL'équipe FHN`
        );
      } catch (emailError) {
        console.error("Erreur lors de l'envoi de l'email:", emailError);
        // On ne bloque pas la mise à jour du dossier si l'email échoue
      }
    }

    // Répondre avec le dossier mis à jour
    return sendResponse(res, {
      message: "Statut du dossier mis à jour avec succès",
      httpCode: httpStatus.OK,
      data: {
        id: updatedDossier.id,
        enfantNom: updatedDossier.enfant.nom,
        parentNom: updatedDossier.enfant.parentNom,
        statut: updatedDossier.statut_dossier,
        etablissement: updatedDossier.etablissementId,
      },
    });
  } catch (error) {
    console.error("Erreur lors du changement de statut du dossier:", error);
    return sendResponse(res, {
      message: "Erreur lors du changement de statut du dossier",
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      errorCode: apiResponseCode.SERVER_ERROR,
    });
  }
};

const getDossierEnfantOfparent = async (req, res) => {
  try {
    // Using a fixed parentId for testing
    const { parentId } = req.params;

    // Vérifier que l'ID du parent existe
    if (!parentId) {
      return sendResponse(res, {
        httpCode: httpStatus.BAD_REQUEST,
        message: "L'identifiant du parent est requis",
        errorCode: apiResponseCode.VALIDATION_ERROR,
      });
    }

    // Récupérer les enfants et leurs dossiers associés pour ce parent
    const enfants = await prisma.enfant.findMany({
      where: {
        utilisateurId: parentId,
      },
      select: {
        id: true,
        nom: true,
        sexe: true,
        dossier: {
          select: {
            id: true,
            statut_dossier: true,
            etablissementId: true,
            etablissement: {
              select: {
                libelle: true,
              },
            },
          },
        },
      },
    });

    // Formater les données pour le retour
    const enfantsFormates = enfants.map((enfant) => {
      // Pour chaque enfant, récupérer les informations de son/ses dossier(s)
      const dossiers = enfant.dossier.map((dossier) => ({
        dossier_id: dossier.id,
        etablissement_id: dossier.etablissementId,
        etablissement_libelle: dossier.etablissement.libelle,
        statut_dossier: dossier.statut_dossier,
      }));

      return {
        enfant_id: enfant.id,
        nom: enfant.nom,
        sexe: enfant.sexe,
        dossiers: dossiers,
      };
    });

    return sendResponse(res, {
      httpCode: httpStatus.OK,
      message: "Données des enfants récupérées avec succès",
      data: enfantsFormates,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des dossiers enfants:",
      error
    );
    return sendResponse(res, {
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: "Une erreur est survenue lors de la récupération des dossiers",
      errorCode: apiResponseCode.SERVER_ERROR,
    });
  }
};

const addObservation = async (req, res) => {
  try {
    const { dossierId, contenu } = req.body;

    // Récupérer l'ID de l'utilisateur depuis le middleware d'authentification
    const auteurId = req.user?.userId;

    // Validation des données
    if (!dossierId) {
      return sendResponse(res, {
        httpCode: httpStatus.BAD_REQUEST,
        message: "L'identifiant du dossier est requis",
        errorCode: apiResponseCode.VALIDATION_ERROR,
      });
    }

    if (!contenu || contenu.trim() === "") {
      return sendResponse(res, {
        httpCode: httpStatus.BAD_REQUEST,
        message: "Le contenu de l'observation est requis",
        errorCode: apiResponseCode.VALIDATION_ERROR,
      });
    }

    if (!auteurId) {
      return sendResponse(res, {
        httpCode: httpStatus.UNAUTHORIZED,
        message: "L'authentification est requise pour ajouter une observation",
        errorCode: apiResponseCode.UNAUTHORIZED,
      });
    }

    // Vérifier que le dossier existe
    const dossierExists = await prisma.dossier.findUnique({
      where: { id: dossierId },
      include: {
        enfant: {
          select: {
            nom: true,
          },
        },
        etablissement: {
          select: {
            libelle: true,
          },
        },
      },
    });

    if (!dossierExists) {
      return sendResponse(res, {
        httpCode: httpStatus.NOT_FOUND,
        message: "Dossier non trouvé",
        errorCode: apiResponseCode.NOT_FOUND,
      });
    }

    // Vérifier le rôle de l'utilisateur
    const userRole = await userService.getUserRole(auteurId);

    // Vérifier si l'utilisateur a le rôle requis (analyste ou admin)
    if (userRole !== Constants.userRoles["analyste"]) {
      return sendResponse(res, {
        httpCode: httpStatus.FORBIDDEN,
        message:
          "Permission refusée. Seuls les analystes et administrateurs peuvent ajouter des observations",
        errorCode: apiResponseCode.ACCESS_DENIDED,
      });
    }

    // Créer l'observation
    const observation = await prisma.observation.create({
      data: {
        dossierId,
        contenu: contenu.trim(),
        auteurId,
      },
      include: {
        auteur: {
          select: {
            id: true,
            nom: true,
            role: true,
          },
        },
        dossier: {
          select: {
            id: true,
            statut_dossier: true,
            enfant: {
              select: {
                nom: true,
              },
            },
          },
        },
      },
    });

    return sendResponse(res, {
      httpCode: httpStatus.CREATED,
      message: "Observation ajoutée avec succès",
      data: {
        id: observation.id,
        contenu: observation.contenu,
        date: observation.date,
        auteur: {
          id: observation.auteur.id,
          nom: observation.auteur.nom,
          role: observation.auteur.role,
        },
        dossier: {
          id: observation.dossier.id,
          statut: observation.dossier.statut_dossier,
          enfantNom: observation.dossier.enfant.nom,
        },
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'observation:", error);

    return sendResponse(res, {
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      message:
        error.message ||
        "Une erreur est survenue lors de l'ajout de l'observation",
      errorCode: apiResponseCode.SERVER_ERROR,
    });
  }
};
export default {
  soumissionDossierEnfant,
  getAllDossiersEnfants,
  changeDossierState,
  getDossierEnfantOfparent,
  addObservation,
};
