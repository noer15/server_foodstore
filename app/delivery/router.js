const express = require("express");
const router = express.Router();
const multer = require("multer");
const os = require("os");

const deliveryAddressController = require("./controller");

router.get("/delivery-addresses", deliveryAddressController.index);
router.post(
  "/delivery-addresses",
  multer().none(),
  deliveryAddressController.store
);
router.put(
  "/delivery-addresses/:id",
  multer().none(),
  deliveryAddressController.update
);
router.delete("/delivery-addresses/:id", deliveryAddressController.destroy);

module.exports = router;
