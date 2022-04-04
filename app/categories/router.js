const express = require("express");
const router = express.Router();
const multer = require("multer");
// ambil controller
const categoryController = require("./controller");

router.get("/categories", categoryController.getCategory);
router.post("/categories", multer().none(), categoryController.storeCategory);
router.put(
  "/categories/:id",
  multer().none(),
  categoryController.updateCategory
);
router.delete(
  "/categories/:id",
  multer().none(),
  categoryController.deleteCategory
);

module.exports = router;
