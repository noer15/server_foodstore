const cartModel = require("./model");
const ProductModel = require("../products/model");
const { policyFor } = require("../policy");

async function index(req, res, next) {
  let policy = policyFor(req.user);
  if (!policy.can("read", "Cart")) {
    return res.json({
      error: 1,
      message: "You don't have permission to read cart",
    });
  }

  try {
    let items = await cartModel.find({ user: req.user._id });
    return res.json(items);
  } catch (error) {
    if (error && error.name === "ValidationError") {
      return res.json({
        error: 1,
        message: error.message,
        fields: error.errors,
      });
    }
    next(error);
  }
}
async function update(req, res, next) {
  let policy = policyFor(req.user);
  if (!policy.can("update", "Cart")) {
    return res.json({
      error: 1,
      message: "You don't have permission to update cart",
    });
  }
  try {
    const { items } = req.body;

    const productIds = items.map((itm) => itm.product._id);

    // (1) cari data produk di MongoDB simpan sbg `products`
    const products = await ProductModel.find({ _id: { $in: productIds } });

    let cartItems = items.map((item) => {
      let relatedProduct = products.find(
        (product) => product._id.toString() === item.product._id
      );

      return {
        product: relatedProduct._id,
        price: relatedProduct.price,
        image_url: relatedProduct.image_url,
        name: relatedProduct.name,
        user: req.user._id,
        qty: item.qty,
      };
    });

    await cartModel.deleteMany({ user: req.user._id });
    await cartModel.bulkWrite(
      cartItems.map((item) => {
        return {
          updateOne: {
            filter: { user: req.user._id, product: item.product },
            update: item,
            upsert: true,
          },
        };
      })
    );

    return res.json(cartItems);
  } catch (error) {
    if (error && error.name === "ValidationError") {
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
  update,
};
