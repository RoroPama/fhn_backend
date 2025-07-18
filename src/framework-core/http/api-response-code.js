const apiResponseCode = {
  // Token
  MESSAGING_TOKEN_REQUIRED: "MESSAGING_TOKEN_REQUIRED",
  MESSAGING_TOKEN_UPDATED: "MESSAGING_TOKEN_UPDATED",
  // Data
  DATA_NOT_FOUND: "DATA_NOT_FOUND",
  NO_DATA_PROVIDED: "NO_DATA_PROVIDED",
  DATA_UPDATED: "DATA_UPDATED",
  INVALID_REQUEST_BODY: "INVALID_REQUEST_BODY",
  VALIDATION_FAILED: "VALIDATION_FAILED",
  MISSING_DATA: "MISSING_DATA",
  DATA_FETCH_SUCCESS: "DATA_FETCH_SUCCESS",
  DATA_FETCH_ERROR: "DATA_FETCH_ERROR",
  DATA_CREATED: "EVENT_CREATED",
  INVALID_ID: "INVALID_ID",
  INVALID_DATA: "INVALID_DATA",
  ERROR_CREATING_DATA: " ERROR_CREATING_DATA",
  // Email
  INVALID_EMAIL: "INVALID_EMAIL",
  EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
  CHECK_EMAIL_ERROR: "CHECK_EMAIL_ERROR",
  CREATE_USER_ERROR: "CREATE_USER_ERROR",
  EMAIL_ALREADY_EXISTS: "EMAIL_ALREADY_EXISTS",
  EMAIL_PASSWORD_INCORRECT: "EMAIL_PASSWORD_INCORRECT",
  // User
  USERNAME_INVALID: "USERNAME_INVALID",
  ERROR_UPDATE_USER: "ERROR_UPDATE_USER",
  USERNAME_ALREADY_USED: "USERNAME_ALREADY_USED",
  ERROR_GET_USER: "ERROR_GET_USER",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  // Token
  TOKEN_INVALID: "TOKEN_INVALID",
  TOKEN_NOT_PROVIDED: "TOKEN_NOT_PROVIDED",
  INVALID_JSON_FORMAT: "INVALID_JSON_FORMAT",

  // servor
  SERVER_ERROR: "SERVER_ERROR",

  // autres
  ACCESS_DENIDED: "ACCESS_DENIDED",
  ACTION_UNAUTHORIZED: "ACTION_UNAUTHORIZED",
  ROUTE_NOT_FOUND: "ROUTE_NOT_FOUND",
  SERVOR_ERROR: "SERVOR_ERROR",
};

export default apiResponseCode;
