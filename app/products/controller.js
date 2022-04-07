// import model
const productModel = require("./model");
const categoryModel = require("../categories/model");
const tagModel = require("../tag/model");
const fs = require("fs");
const path = require("path");
const config = require("../config");
// export helpers response res
const apiResponse = require("../../helpers");
const { policyFor } = require("../policy");

async function getProducts(req, res, next) {
  try {
    let { limit = 10, skip = 0, q = "", category = "", tags = [] } = req.query;
    let criteria = {};
    if (q.length) {
      criteria = {
        ...criteria,
        name: {
          $regex: `${q}`,
          $options: "i",
        },
      };
    }
    if (category.length) {
      category = await categoryModel.findOne({
        name: { $regex: `${category}` },
        options: "i",
      });
      if (category) {
        criteria = { ...criteria, category: category._id };
      }
    }
    if (tags.length) {
      tags = await tagModel.find({
        name: { $in: tags },
      });
      criteria = {
        ...criteria,
        tags: {
          $in: tags.map((item) => item._id),
        },
      };
    }
    const count = await productModel.countDocuments(criteria);
    const products = await productModel
      .find(criteria)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate("category")
      .populate("tags");
    return res.status(200).json({
      data: products,
      count,
    });
  } catch (error) {
    return apiResponse.ErrorResponse(res, error);
  }
}

async function productStore(req, res, next) {
  try {
    let payload = req.body;
    let policy = policyFor(req.user);
    if (!policy.can("create", "Product")) {
      return res.json({
        error: 1,
        message: "You don't have permission to create product",
      });
    }

    if (payload.category) {
      let category = await categoryModel.findOne({
        name: { $regex: payload.category, $options: "i" },
      });
      if (category) {
        payload = { ...payload, category: category._id };
      } else {
        delete payload.category;
      }
    }

    if (payload.tags && payload.tags.length) {
      let tags = await tagModel.find({
        name: { $in: payload.tags },
      });
      if (tags.length) {
        payload = { ...payload, tags: tags.map((item) => item._id) };
      }
    }
    if (req.file) {
      let tmp_path = req.file.path;
      let originalExt =
        req.file.originalname.split(".")[
          req.file.originalname.split(".").length - 1
        ];
      let filename = req.file.filename + "." + originalExt;
      let target_path = path.resolve(
        config.rootPath,
        `public/upload/${filename}`
      );

      const src = fs.createReadStream(tmp_path);
      const dest = fs.createWriteStream(target_path);
      src.pipe(dest);

      src.on("end", async () => {
        try {
          let product = await productModel.create({
            ...payload,
            image_url: filename,
          });
          return res.json(product);
        } catch (err) {
          // (1) jika error, hapus file yang sudah terupload pada direktori
          fs.unlinkSync(target_path);

          // (2) cek apakah error disebabkan validasi MongoDB
          if (err && err.name === "ValidationError") {
            return res.json({
              error: 1,
              message: err.message,
              fields: err.errors,
            });
          }

          next(err);
        }
      });

      src.on("error", async () => {
        next(err);
      });
    } else {
      let product = await productModel.create(payload);
      return res.status(200).json(product);
    }
  } catch (err) {
    if (err && err.name === "ValidationError") {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }
    next(err);
  }
}

async function productUpdate(req, res, next) {
  try {
    let payload = req.body;
    let policy = policyFor(req.user);
    if (!policy.can("update", "Product")) {
      return res.json({
        error: 1,
        message: "You don't have permission to update product",
      });
    }
    if (payload.category) {
      let category = await categoryModel.findOne({
        name: { $regex: payload.category, $options: "i" },
      });
      if (category) {
        payload = { ...payload, category: category._id };
      } else {
        delete payload.category;
      }
    }
    if (payload.tags && payload.tags.length) {
      let tags = await tagModel.find({
        name: { $in: payload.tags },
      });
      if (tags.length) {
        payload = { ...payload, tags: tags.map((item) => item._id) };
      }
    }
    if (req.file) {
      let tmp_path = req.file.path;
      let originalExt =
        req.file.originalname.split(".")[
          req.file.originalname.split(".").length - 1
        ];
      let filename = req.file.filename + "." + originalExt;
      let target_path = path.resolve(
        config.rootPath,
        `public/upload/${filename}`
      );

      const src = fs.createReadStream(tmp_path);
      const dest = fs.createWriteStream(target_path);
      src.pipe(dest);

      src.on("end", async () => {
        try {
          let product = await productModel.findOne({
            _id: req.params.id,
          });
          let currentImage = `${config.rootPath}/public/upload/${product.image_url}`;
          if (fs.existsSync(currentImage)) {
            fs.unlinkSync(currentImage);
          }
          product = await productModel.findOneAndUpdate(
            { _id: req.params.id },
            { ...payload, image_url: filename },
            { new: true, runValidators: true }
          );
          return res.json(product);
        } catch (err) {
          // (1) jika error, hapus file yang sudah terupload pada direktori
          fs.unlinkSync(target_path);

          // (2) cek apakah error disebabkan validasi MongoDB
          if (err && err.name === "ValidationError") {
            return res.json({
              error: 1,
              message: err.message,
              fields: err.errors,
            });
          }

          next(err);
        }
      });

      src.on("error", async () => {
        next(err);
      });
    } else {
      let product = await productModel.findOneAndUpdate(
        { _id: req.params.id },
        payload,
        { new: true, runValidators: true }
      );
      return res.status(200).json(product);
    }
  } catch (err) {
    if (err && err.name === "ValidationError") {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }
    next(err);
  }
}

async function destroyProducts(req, res, next) {
  try {
    let policy = policyFor(req.user);
    if (!policy.can("delete", "Product")) {
      return res.json({
        error: 1,
        message: "You don't have permission to delete product",
      });
    }
    let product = await productModel.findOneAndDelete({ _id: req.params.id });
    let currentImage = `${config.rootPath}/public/upload/${product.image_url}`;
    if (fs.existsSync(currentImage)) {
      fs.unlinkSync(currentImage);
    }
    return res.json(product);
  } catch (err) {}
}

module.exports = { productStore, productUpdate, getProducts, destroyProducts };
