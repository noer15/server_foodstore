const userModel = require("../user/model");
const config = require("../../app/config");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { getToken } = require("../utils/get-token");

async function register(req, res, next) {
  await userModel
    .create(req.body)
    .then((result) => {
      return res.status(200).json(result);
    })
    .catch((err) => {
      if (err && err.name === "ValidationError") {
        return res.json({
          error: 1,
          message: err.message,
          fields: err.errors,
        });
      }
      next(err);
    });
}

async function localStrategy(email, password, done) {
  try {
    // (1) cari user ke MongoDB
    let user = await userModel
      .findOne({ email })
      .select("-__v -createdAt -updatedAt -cart_items -token");
    // (2) jika user tidak ditemukan, akhiri proses login
    if (!user) return done();
    // (3) sampai sini artinya user ditemukan, cek password sesuaiatau tidak
    if (bcrypt.compareSync(password, user.password)) {
      ({ password, ...userWithoutPassword } = user.toJSON());
      return done(null, userWithoutPassword);
    }
  } catch (error) {
    done(err, null); // <--- tangani error
  }
  done();
}

async function login(req, res, next) {
  passport.authenticate("local", async function (err, user) {
    if (err) return next(err);
    if (!user)
      return res.json({
        error: 1,
        message: "email or password incorrect",
      });
    // (1) buat JSON Web Token
    let signed = jwt.sign(user, config.secretKey); // <--- ganti secret key dengan keymu sendiri, bebas yang sulit ditebak
    await userModel.findOneAndUpdate(
      { _id: user._id },
      { $push: { token: signed } },
      { new: true }
    );
    return res.json({
      message: "logged in successfully",
      user: user,
      token: signed,
    });
  })(req, res, next);
}

async function profile(req, res, next) {
  if (!req.user) {
    return res.json({
      error: 1,
      message: `Your're not login or token expired`,
    });
  }
  return res.json(req.user);
}

async function logout(req, res, next) {
  let token = getToken(req);
  let user = await userModel.findOneAndUpdate(
    { token: { $in: [token] } },
    { $pull: { token } },
    { useFindAndModify: false }
  );

  if (!user || !token) {
    return res.json({
      error: 1,
      message: "User tidak ditemukan",
    });
  }

  // --- logout berhasil ---//

  return res.json({
    error: 0,
    message: "Logout berhasil",
  });
}

module.exports = { logout, profile, register, login, localStrategy };
