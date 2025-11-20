import express, { Request, Response, NextFunction } from "express";
import {
  login,
  verifyTokenController,
  azureLogin,
  azureRedirect,
} from "../controller/auth.controller";

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

export default function (app: express.Application) {
  app.use(function (req: Request, res: Response, next: NextFunction) {
    res.setHeader(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(`${authBasePath}/azureLogin`, azureLogin);

  app.post(`${authBasePath}/callback`, azureRedirect);

  app.post(`${authBasePath}/login`, login);

  app.post(`${authBasePath}/protect`, verifyTokenController);
}
