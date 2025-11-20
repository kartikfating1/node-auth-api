import express from "express";
import { moduleMasterController } from "../controller/module.controller";
import authJwt from "../middleware/awthJwt";

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
export const moduleRoutes = (app: express.Application) => {
  app.use(express.json());

  /**
   * GET /getAllModules
   * @summary Get All Modules
   * @tags ModuleMaster
   * @security BearerAuth
   * @return {object} 200 - Success Response
   * @return {object} 500 - Internal Server Error
   * @return {object} 400 - Bad Request
   * @return {object} 401 - Unauthorized Request
   */
  app.get(
    `${authBasePath}/getAllModules`,
    [authJwt.verifyToken],
    moduleMasterController.getAllModules
  );
};
