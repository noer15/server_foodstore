const mongoose = require("mongoose");
const { mongoDB } = require("../app/config");

mongoose.connect(mongoDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
module.exports = db;
