const { ErrorCodes } = require("../../services/errors/enums.js");

module.exports = (error, req, res, next) => {
  console.error(error.stack); 

  switch (error.code) {
    case ErrorCodes.ROUTING_ERROR:
      res.status(404).send({ status: "error", error: "Routing error" });
      break;
    case ErrorCodes.INVALID_TYPES_ERROR:
      res.status(400).send({ status: "error", error: error.message });
      break;
    case ErrorCodes.DATABASE_ERROR:
      res.status(500).send({ status: "error", error: "Database error" });
      break;
    case ErrorCodes.PRODUCT_NOT_FOUND:
      res.status(404).send({ status: "error", error: "Product not found" });
      break;
    case ErrorCodes.CART_OPERATION_ERROR:
      res.status(400).send({ status: "error", error: "Cart operation error" });
      break;
    default:
      res.status(500).send({ status: "error", error: "Unhandled error" });
  }
};