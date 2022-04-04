const router = require("express").Router();
const multer = require("multer");
const invoiceController = require("./controller");

router.get("/invoices/:order_id", invoiceController.show);

module.exports = router;
