const Order = require("./model");
const OrderItem = require("../order-item/model");
const CartItem = require("../cart/model");
const DeliveryAddress = require("../delivery/model");
const { policyFor } = require("../policy");
const { subject } = require("@casl/ability");

async function index(req, res, next) {
  let policy = policyFor(req.user);
  if (!policy.can("view", "Order")) {
    return res.status(403).json({
      message: "You are not authorized to access this resource",
    });
  }
  try {
    let { limit = 10, skip = 0 } = req.query;
    let count = await Order.find({ user: req.user._id }).countDocuments();
    let orders = await Order.find({ user: req.user._id })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate("order_items")
      .sort({ createdAt: -1 });
    return res.json({
      data: orders.map((order) => order.toJSON({ virtuals: true })),
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
    next(error);
  }
}
async function store(req, res, next) {
  let policy = policyFor(req.user);
  if (!policy.can("create", "Order")) {
    return res.json({
      error: 1,
      message: "You don't have permission to create order",
    });
  }
  try {
    // (1) dapatkan `delivery_fee` dan `delivery_address`
    let { delivery_fee, delivery_address } = req.body;
    let items = await CartItem.find({ user: req.user._id }).populate("product");

    // (2) cek apakah keranjang belanja kosong?
    if (!items.length) {
      return res.json({
        error: 1,
        message: "Can not create order because you have no items in cart",
      });
    }

    let address = await DeliveryAddress.findOne({ _id: delivery_address });
    // create order but don't save it yet.
    // using mongoose.Types.ObjectId() to generate id for saving ref
    let order = new Order({
      _id: new mongoose.Types.ObjectId(),
      status: "waiting_payment",
      delivery_fee,
      delivery_address: {
        provinsi: address.provinsi,
        kabupaten: address.kabupaten,
        kecamatan: address.kecamatan,
        kelurahan: address.kelurahan,
        detail: address.detail,
      },
      user: req.user._id,
    });

    // create order items too
    let orderItems = await OrderItem.insertMany(
      items.map((item) => ({
        ...item,
        name: item.product.name,
        qty: parseInt(item.qty),
        price: parseInt(item.product.price),
        order: order._id,
        product: item.product._id,
      }))
    );

    orderItems.forEach((item) => order.order_items.push(item));

    await order.save();

    // clear cart items
    await CartItem.deleteMany({ user: req.user._id });

    return res.json(order);
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
async function update(req, res, next) {}
async function destroy(req, res, next) {}

module.exports = {
  index,
  store,
  update,
  destroy,
};
