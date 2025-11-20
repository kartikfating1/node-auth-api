import { Request, Response } from "express";
import { userSyncService } from "../services/userSync.service";
import { StatusCodes } from "http-status-codes";
import { InputValidator } from "../helpers/roleInputValidator";
import { handleErrorResponse } from "../ExceptionHandler/errorHandler";

export const userSyncController = {
  createAdminRole: async (request: Request, response: Response) => {
    try {
      InputValidator.validateSyncAdminUser(request.body);
      const { companyId, userId, username } = request.body;
      const result = await userSyncService.createAdminRole(
        companyId,
        userId,
        username
      );
      response.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      const errorResponse = handleErrorResponse.handle(error);
      response.status(StatusCodes.OK).json(errorResponse);
    }
  },

  UserDetailsSync: async (request: Request, response: Response) => {
    try {
      InputValidator.validateSyncUser(request.body);
      const { userId, username, roleId, companyId } = request.body;
      const result = await userSyncService.UserDetailsSync(
        userId,
        username,
        roleId,
        companyId
      );
      response.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      const errorResponse = handleErrorResponse.handle(error);
      response.status(StatusCodes.OK).json(errorResponse);
    }
  },

  getUsers: async (_request: Request, response: Response) => {
    try {
      const data = await userSyncService.getUsers();
      response.status(StatusCodes.OK).send({ data });
    } catch (error: any) {
      const errorResponse = handleErrorResponse.handle(error);
      response.status(StatusCodes.OK).json(errorResponse);
    }
  },
};
