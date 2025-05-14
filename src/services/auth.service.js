import appConfig from "../config/app.config.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../db/prisma.js";
class AuthService {
  constructor() {
    this.saltRounds = appConfig.bcrypt.saltRounds;
    this.jwtSecret = appConfig.jwt.secret;
    this.jwtExpiresIn = "24h";
    this.cookieMaxAge = appConfig.jwt.cookieMaxAge;
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
  async createUser(name, email, password) {
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

    const user = await prisma.user.create({
      data: {
        nom: name,
        email,
        mot_de_passe_hash: hashedPassword,
        role: "parent",
      },
    });

    return user;
  }

  async login(email, password) {
    // Valider les données
    if (!this.validateEmail(email)) {
      throw new Error("Format d'email invalide");
    }

    if (!this.validatePassword(password)) {
      throw new Error("Le mot de passe doit contenir au moins 8 caractères");
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("Email ou mot de passe incorrect");
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(
      password,
      user.mot_de_passe_hash
    );

    if (!isPasswordValid) {
      throw new Error("Email ou mot de passe incorrect");
    }

    const { mot_de_passe_hash, ...userWithoutPassword } = user;

    return userWithoutPassword;
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
