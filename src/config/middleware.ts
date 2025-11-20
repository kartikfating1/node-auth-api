import { NextFunction, Request, Response } from "express";
import { appConstants } from "../constants/appConstants";

export const middleware = (req: Request, res: Response, next: NextFunction) => {
  res.header(appConstants.ACCESS_CONTROL, appConstants.TOKEN_CONTENT_TYPE);
  next();
};