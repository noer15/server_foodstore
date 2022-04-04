const express = require("express");
const router = express.Router();
const multer = require("multer");
const os = require("os");
// ambil controller
const productController = require("./controller");

router.get("/products", productController.getProducts);
router.post(
  "/product",
  multer({ dest: os.tmpdir() }).single("image"),
  productController.productStore
);
router.put(
  "/product/:id",
  multer({ dest: os.tmpdir() }).single("image"),
  productController.productUpdate
);
router.delete("/product/:id", productController.destroyProducts);

module.exports = router;
