const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const app = express();
// setup Api

const productRouter = require("./app/products/router");
const categoryRouter = require("./app/categories/router");
const tagRouter = require("./app/tag/router");
const deliveryRouter = require("./app/delivery/router");
const provinceRouter = require("./app/wilayah/router");
const cartRoute = require("./app/cart/router");
const orderRoute = require("./app/order/router");
const invoiceRouter = require("./app/invoice/router");
// setup auth
const authRouter = require("./app/auth/router");
const { decodeToken } = require("./app/auth/middleware");

app.use(cors());
app.use(decodeToken());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// auth
app.use("/api/v1/auth", authRouter);

// province
app.use("/api/v1", provinceRouter);
app.use("/api/v1", deliveryRouter);
app.use("/api/v1", cartRoute);
app.use("/api/v1", orderRoute);
app.use("/api/v1", invoiceRouter);
// router api
app.use("/api/v1", productRouter);
app.use("/api/v1", categoryRouter);
app.use("/api/v1", tagRouter);

module.exports = app;
