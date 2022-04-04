const DeliveryAddress = require("./model");
const { policyFor } = require("../policy");
const { subject } = require("@casl/ability");

async function index(req, res, next) {
  let policy = policyFor(req.user);
  if (!policy.can("view", "DeliveryAddress")) {
    return res.json({
      error: 1,
      message: `You're not allowed to perform this action`,
    });
  }
  try {
    let { limit = 10, skip = 0 } = req.query;
    // (1) dapatkan jumlah data alamat pengiriman
    const count = await DeliveryAddress.find({
      user: req.user._id,
    }).countDocuments();
    // (2) dapatkan data alamat pengiriman
    const deliveryAddresses = await DeliveryAddress.find({ user: req.user._id })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort("-createdAt")
      .populate("user")
      .select("-__v");
    // (3) respon dengan data `deliveryAddresses`
    return res.json({
      data: deliveryAddresses,
      count,
    });
  } catch (error) {
    if (error && error.name == "ValidationError") {
      return res.json({
        error: 1,
        message: error.message,
        fields: error.errors,
      });
    }
    new Error(error);
  }
}
async function store(req, res, next) {
  try {
    let policy = policyFor(req.user);
    if (!policy.can("create", "DeliveryAddress")) {
      return res.json({
        error: 1,
        message: "You don't have permission to create delivery address",
      });
    }

    await DeliveryAddress.create(req.body)
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
  } catch (error) {
    new Error(error);
  }
}
async function update(req, res, next) {
  const policy = policyFor(req.user);
  if (!policy.can("update", "DeliveryAddress")) {
    return res.json({
      error: 1,
      message: "You don't have permission to update delivery address",
    });
  }
  try {
    let { id } = req.params;
    let { _id, ...payload } = req.body;

    let address = await DeliveryAddress.findOne({ _id: id });

    let subjectAddress = subject("DeliveryAddress", {
      ...address,
      user_id: address.user,
    });

    if (!policy.can("update", subjectAddress)) {
      return res.json({
        error: 1,
        message: `You're not allowed to modify this resource`,
      });
    }
    address = await DeliveryAddress.findOneAndUpdate({ _id: id }, payload, {
      new: true,
    });

    // (2) respon dengan data `address`
    return res.json(address);
  } catch (err) {
    if (err && err.name == "ValidationError") {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }

    next(err);
  }
}

async function destroy(req, res, next) {
  let policy = policyFor(req.user);
  try {
    let { id } = req.params;

    let address = await DeliveryAddress.findOne({ _id: id });

    let subjectAddress = subject({ ...address, user: address.user });

    if (!policy.can("delete", subjectAddress)) {
      return res.json({
        error: 1,
        message: `You're not allowed to delete this resource`,
      });
    }

    await DeliveryAddress.findOneAndDelete({ _id: id });

    return res.json(address);
  } catch (error) {
    if (error && error.name == "ValidationError") {
      return res.json({
        error: 1,
        message: error.message,
        fields: error.errors,
      });
    }
    next(error);
  }
}
module.exports = {
  index,
  store,
  update,
  destroy,
};
