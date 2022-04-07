const router = require("express").Router();
const multer = require("multer");

const OrderController = require("./controller");

router.get("/orders", OrderController.index);
router.post("/orders", multer().none(), OrderController.store);

module.exports = router;
