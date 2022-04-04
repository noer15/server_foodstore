const tagModel = require("./model");
const { policyFor } = require("../policy");

async function getTag(req, res, next) {
  await tagModel
    .find()
    .then((result) => {
      return res.status(200).json({
        message: "data berhasil diambil",
        data: result,
      });
    })
    .catch((e) => next(e));
}

async function updateTag(req, res, next) {
  const policy = policyFor(req.user);
  if (!policy.can("update", "Tag")) {
    return res.json({
      error: 1,
      message: "You don't have permission to update tag",
    });
  }
  await tagModel
    .updateOne(
      {
        _id: req.params.id,
      },
      {
        $set: req.body,
      }
    )
    .then((result) => {
      return res.status(200).json(result);
    })
    .catch((e) => next(e));
}

async function storeTag(req, res, next) {
  const policy = policyFor(req.user);
  if (!policy.can("create", "Tag")) {
    return res.json({
      error: 1,
      message: "You don't have permission to create tag",
    });
  }
  await tagModel
    .create(req.body)
    .then((result) => {
      return res.status(200).json(result);
    })
    .catch((e) => next(e));
}

async function deleteTag(req, res, next) {
  const policy = policyFor(req.user);
  if (!policy.can("delete", "Tag")) {
    return res.json({
      error: 1,
      message: "You don't have permission to delete tag",
    });
  }

  await tagModel
    .deleteOne({
      _id: req.params.id,
    })
    .then((result) => {
      return res.json({
        message: "data berhasil dihapus",
        data: result,
      });
    })
    .catch((e) => {
      next(e);
    });
}

module.exports = { storeTag, getTag, updateTag, deleteTag };
