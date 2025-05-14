function sendResponse(
  res,
  { message, httpCode, errorCode = null, data = null }
) {
  const response = {
    success: httpCode >= 200 && httpCode < 300,
    message,
  };

  if (errorCode) {
    response.errorCode = errorCode;
  }

  if (data !== null) {
    response.data = data;
  }

  res.status(httpCode).json(response);
}

export default sendResponse;
