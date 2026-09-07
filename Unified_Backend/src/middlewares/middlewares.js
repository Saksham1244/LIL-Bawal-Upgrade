function standardResponse(response, data, status = 200, message = "Success") {
  return response.status(status).json({
    success: status >= 200 && status < 300,
    data: data,
    status: status,
    message: message,
  });
}

module.exports = { standardResponse };
