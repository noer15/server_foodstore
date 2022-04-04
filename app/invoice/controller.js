const { subject } = require("@casl/ability");

const Invoice = require("./model");
const { policyFor } = require("../policy");

async function show(req, res, next) {
  try {
    let { order_id } = req.params;
    let invoice = await Invoice.findOne({ order: order_id })
      .populate("order")
      .populate("user");

    let policy = policyFor(req.user);
    let subjectInvoice = subject("Invoice", {
      ...invoice,
      user_id: invoice.user._id,
    });
    if (!policy.can("read", subjectInvoice)) {
      return res.status(403).json({
        message: "You are not authorized to access this resource",
      });
    }
    return res.json(invoice);
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
  show,
};
