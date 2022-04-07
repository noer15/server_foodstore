const mongoose = require("mongoose");
const { dbHost, dbName, dbPort, dbUser, dbPass } = require("../app/config");

// mongoose.connect(
//   `mongodb://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}?authSource=admin`,
//   {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   }
// );
mongoose.connect(
  `mongodb+srv://${dbUser}:${dbPass}@${dbHost}/${dbName}?authSource=admin&replicaSet=atlas-ap8r99-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const db = mongoose.connection;
module.exports = db;
