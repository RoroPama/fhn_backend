require("dotenv").config();

exports.appConfig = {
  port: process.env.PORT,
  node_env: process.env.NODE_ENV,
};
