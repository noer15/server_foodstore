const { getToken } = require("../utils/get-token");
const jwt = require("jsonwebtoken");
const config = require("../config");
const userModel = require("../user/model");

function decodeToken() {
  return async function (req, res, next) {
    try {
      let token = getToken(req);
      if (!token) return next(); // <--- jika tidak ada token maka next
      req.user = jwt.verify(token, config.secretKey);
      let user = userModel.findOne({
        token: {
          $in: [token],
        },
      });
      //-- token expired jika User tidak ditemukan --//
      if (!user) {
        return res.json({
          error: 1,
          message: `Token expired`,
        });
      }
    } catch (err) {
      if (err && err.name === "JsonWebTokenError") {
        return res.json({
          error: 1,
          message: err.message,
        });
      }
      // (2) tangani error lainnya
      next(err);
    }
    return next();
  };
}

module.exports = { decodeToken };
