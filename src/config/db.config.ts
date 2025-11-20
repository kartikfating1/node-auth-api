import mongoose from "mongoose";
import MongoStore from "connect-mongo";
import { appConstants } from "../constants/appConstants";
import customLogger from "../config/logger";
import { messageConstants } from "../constants/messageConstants";

const logger = customLogger();
let dbConnection: mongoose.Connection;

type ConnectCallback = (error: Error | null) => void;

export const db = {
  connectToDb: (cb: ConnectCallback) => {
    mongoose
      .connect(appConstants.MONGO_DB, {
        user: process.env.DB_USER_DEV,
        pass: process.env.DB_PASSWORD_DEV,
      })
      .then(() => {
        dbConnection = mongoose.connection;
        return cb(null);
      })
      .catch((err) => {
        return cb(err);
      });
  },

  getDB: () => dbConnection,

  getMongoSessionStore: () => {
    return MongoStore.create({
      mongoUrl: appConstants.MONGO_DB,
      collectionName: "sessions",
      ttl: 14 * 24 * 60 * 60, // 14 days
    });
  },
};

mongoose.connection.on("connected", () => {
  logger.info(messageConstants.DB.CONNECT);
});

mongoose.connection.on("error", (err) => {
  logger.error(messageConstants.DB.CONNECT_ERR + err);
});

mongoose.connection.on("disconnected", () => {
  logger.info(messageConstants.DB.DISCONNECT);
});
