import dotenv from "dotenv";

dotenv.config();

const appConfig = {
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
  isTest: process.env.NODE_ENV === "test",
  port: process.env.PORT,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
    cookieExpiresIn:
      parseInt(process.env.JWT_COOKIE_EXPIRES_IN, 10) || 24 * 60 * 60 * 1000, // 1 jour en ms
  },
  node_env: process.env.NODE_ENV,
  // cookie: {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === "production",
  //   sameSite: "strict",
  // },
  bcrypt: {
    saltRounds: 12,
  },
};

export default appConfig;
