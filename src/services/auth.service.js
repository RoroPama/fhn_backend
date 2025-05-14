import appConfig from "../config/app.config.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

class AuthService {
  constructor() {
    this.saltRounds = appConfig.bcrypt.saltRounds;
    this.jwtSecret = appConfig.jwt.secret;
    this.jwtExpiresIn = "24h";
    this.cookieMaxAge = appConfig.jwt.cookieMaxAge; // 24 heures
  }

  // Hacher le mot de passe
  async hashPassword(password) {
    return await bcrypt.hash(password, this.saltRounds);
  }

  // Vérifier si un email existe déjà
  async isEmailTaken(email) {
    // TODO: Implémenter la vérification dans la base de données
    // Exemple: const user = await User.findOne({ email });
    // return !!user;
    return false; // Placeholder
  }

  // Valider le format de l'email
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Valider la force du mot de passe
  validatePassword(password) {
    // Au moins 8 caractères
    return password.length >= 8;
  }

  // Créer un utilisateur
  async createUser(email, password) {
    // Valider les données
    if (!this.validateEmail(email)) {
      throw new Error("Format d'email invalide");
    }

    if (!this.validatePassword(password)) {
      throw new Error("Le mot de passe doit contenir au moins 8 caractères");
    }

    // Vérifier si l'email existe déjà
    if (await this.isEmailTaken(email)) {
      throw new Error("Cet email est déjà utilisé");
    }

    // Hacher le mot de passe
    const hashedPassword = await this.hashPassword(password);

    // TODO: Sauvegarder l'utilisateur dans la base de données
    // Exemple:
    // const user = await User.create({
    //   email,
    //   password: hashedPassword,
    //   createdAt: new Date()
    // });

    // Simuler un utilisateur créé
    const user = {
      id: Date.now(), // ID temporaire
      email,
      createdAt: new Date(),
    };

    return user;
  }

  // Générer un JWT
  generateToken(userId, email) {
    const payload = {
      userId,
      email,
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    });
  }

  // Configurer le cookie JWT
  getCookieOptions() {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: this.cookieMaxAge,
    };
  }
}
const authService = new AuthService();

export default authService;
