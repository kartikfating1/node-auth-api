import express from "express";
import { userSyncController } from "../controller/userSync.controller";

const getEnvironment = (): string => {
  switch (process.env.NODE_ENV) {
    case "staging":
      return "/qa";
    case "production":
      return "";
    case "dev":
    case "development":
      return "/dev";
    default:
      return "/dev";
  }
};

const authBasePath = `${getEnvironment()}/auth`;

export const userSyncRoutes = (app: express.Application) => {
  app.post(`${authBasePath}/syncUser`, userSyncController.UserDetailsSync);
  app.post(`${authBasePath}/syncAdminUser`, userSyncController.createAdminRole);
  app.get(`${authBasePath}/getUsers`, userSyncController.getUsers);
};
