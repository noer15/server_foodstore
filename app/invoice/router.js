const router = require("express").Router();
const multer = require("multer");
const invoiceController = require("./controller");

router.get("/invoices/:order_id", invoiceController.show);
router.get(
  "/invoices/:order_id/initiate-payment",
  invoiceController.initiatePayment
);
router.post(
  "/invoices/handle-midtrans",
  invoiceController.handleMidtransNotification
);

module.exports = router;
