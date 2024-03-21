"use strict";

const config = require("../config");
const mongoose = require("mongoose");
// mongoose.Promise = require('bluebird')

mongoose.connection.once("connected", () => {
  console.log("MongoDB is connected");
});

mongoose.connection.on("error", (err) => {
  console.log(`Could not connect to MongoDB because of ${err}`);
  process.exit(-1);
});

// if (config.env === 'dev') {
//   mongoose.set('debug', true)
// }
// mongoose.set('useNewUrlParser', true);
// mongoose.set('useFindAndModify', false);
// mongoose.set('useCreateIndex', true);
exports.connect = () => {
  var mongoURI = config.mongo.uri;

  mongoose.connect(
    mongoURI,
    { dbName: "proconsultant", useCreateIndex: true, useFindAndModify: false },
    {
      keepAlive: 1,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );

  return mongoose.connection;
};
