const categoryModel = require("./model");
const { policyFor } = require("../policy");

async function getCategory(req, res) {
  try {
    await categoryModel
      .find()
      .then((data) => {
        return res.status(200).json({
          message: "data berhasil",
          data: data,
        });
      })
      .catch((e) => console.log(e));
  } catch (error) {
    new Error(error);
  }
}

async function storeCategory(req, res) {
  let policy = policyFor(req.user);
  if (!policy.can("create", "Category")) {
    return res.json({
      error: 1,
      message: "You don't have permission to create category",
    });
  }
  await categoryModel
    .create(req.body)
    .then((item) => {
      return res.json(item);
    })
    .catch((err) => {
      if (err && err.name === "ValidationError") {
        return res.json({
          error: 1,
          message: err.message,
          fields: err.errors,
        });
      }
    });
}

async function updateCategory(req, res) {
  let policy = policyFor(req.user);
  if (!policy.can("update", "Category")) {
    return res.json({
      error: 1,
      message: "You don't have permission to update category",
    });
  }
  let payload = req.body;
  await categoryModel
    .findOneAndUpdate(
      {
        _id: req.params.id,
      },
      payload
    )
    .then((item) => {
      return res.status(200).json(item);
    })
    .catch((e) => console.log(e));
}

async function deleteCategory(req, res) {
  let policy = policyFor(req.user);
  if (!policy.can("delete", "Category")) {
    return res.json({
      error: 1,
      message: "You don't have permission to delete category",
    });
  }

  await categoryModel
    .findOneAndDelete({
      _id: req.params.id,
    })
    .then((item) => {
      return res.json(item);
    })
    .catch((e) => console.log(e));
}

module.exports = {
  getCategory,
  storeCategory,
  updateCategory,
  deleteCategory,
};
