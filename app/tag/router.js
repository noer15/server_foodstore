const express = require("express");
const router = express.Router();
const multer = require("multer");

const tagController = require("./controller");

router.get("/tags", tagController.getTag);
router.post("/tags", multer().none(), tagController.storeTag);
router.put("/tags/:id", multer().none(), tagController.updateTag);
router.delete("/tags/:id", tagController.deleteTag);

module.exports = router;
