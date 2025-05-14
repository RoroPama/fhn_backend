import authService from "../services/auth.service.js";
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Vérifier que les champs requis sont présents
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email et mot de passe requis",
      });
    }

    // Créer l'utilisateur
    const user = await authService.createUser(name, email, password);

    // Générer le token JWT
    // const token = authService.generateToken(user.id, user.email);

    // Définir le cookie
    // res.cookie("authToken", token, authService.getCookieOptions());

    // Répondre avec les informations de l'utilisateur (sans le mot de passe)
    return res.status(201).json({
      success: true,
      message: "Compte créé avec succès",
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la création du compte:", error);

    // Gérer les erreurs spécifiques
    if (error.message === "Cet email est déjà utilisé") {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message.includes("Format d'email invalide") ||
      error.message.includes("mot de passe")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // Erreur générale
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la création du compte",
    });
  }
};

export default {
  register,
};
