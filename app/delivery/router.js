const express = require("express");
const router = express.Router();
const multer = require("multer");
const os = require("os");

const deliveryAddressController = require("./controller");

router.get("/delivery-address", deliveryAddressController.index);
router.post(
  "/delivery-address",
  multer().none(),
  deliveryAddressController.store
);
router.put(
  "/delivery-address/:id",
  multer().none(),
  deliveryAddressController.update
);
router.delete("/delivery-address/:id", deliveryAddressController.destroy);

module.exports = router;
