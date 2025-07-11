import appConfig from "../config/app.config.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../db/prisma.js";
import apiResponseCode from "../framework-core/http/api-response-code.js";

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
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });
      return !!user; // Retourne true si l'user existe, false sinon
    } catch (error) {
      console.error("Erreur lors de la vérification de l'email:", error);
      throw new Error("Erreur lors de la vérification de l'email");
    }
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
  async createUser(name, email, password, role = null) {
    // Vérifier si l'email existe déjà
    if (await this.isEmailTaken(email)) {
      throw new Error(apiResponseCode.EMAIL_ALREADY_EXISTS);
    }

    // Hacher le mot de passe
    const hashedPassword = await this.hashPassword(password);

    const user = await prisma.user.create({
      data: {
        nom: name,
        email,
        mot_de_passe_hash: hashedPassword,
        role: role ?? "parent",
      },
    });

    return user;
  }

  async login(email, password) {
    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error(apiResponseCode.EMAIL_PASSWORD_INCORRECT);
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(
      password,
      user.mot_de_passe_hash
    );

    if (!isPasswordValid) {
      throw new Error(apiResponseCode.EMAIL_PASSWORD_INCORRECT);
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
      maxAge: this.cookieMaxAge,
    };
  }
}

const authService = new AuthService();

export default authService;
