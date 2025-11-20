import { Request, Response } from "express";
import { messageConstants } from "../constants/messageConstants";
import { moduleMasterService } from "../services/moduleMaster.service";
import { StatusCodes } from "http-status-codes";
import { handleErrorResponse } from "../ExceptionHandler/errorHandler";
import { createResponse } from "../helpers/responses";

export const moduleMasterController = {
  getModuleById: async (request: Request, response: Response) => {
    try {
      const moduleId: string = request.query.moduleId as string;
      if (!moduleId) {
        const errorResponse = createResponse(
          StatusCodes.NOT_FOUND,
          messageConstants.inputValidation.MODULEID_REQUIRED
        );
        return response.status(StatusCodes.NOT_FOUND).json(errorResponse);
      }

      const moduleData = await moduleMasterService.getModuleById(moduleId);
      const successResponse = createResponse(moduleData);
      response.status(StatusCodes.OK).json(successResponse);
    } catch (error: any) {
      const errorResponse = handleErrorResponse.handle(error);
      response.status(StatusCodes.OK).json(errorResponse);
    }
  },

  getAllModules: async (_request: Request, response: Response) => {
    try {
      const moduleData = await moduleMasterService.getAllModules();
      const successResponse = createResponse({
        Modules: moduleData,
      });
      response.status(StatusCodes.OK).json(successResponse);
    } catch (error: any) {
      const errorResponse = handleErrorResponse.handle(error);
      response.status(StatusCodes.OK).json(errorResponse);
    }
  },
};
