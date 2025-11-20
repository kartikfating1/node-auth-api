import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { moduleMasterService } from "../../src/services/moduleMaster.service";
import { handleErrorResponse } from "../../src/ExceptionHandler/errorHandler"; // Adjust the import path if needed

import { moduleMasterController } from "../../src/controller/module.controller";
import { createResponse } from "../../src/helpers/responses";
import { messageConstants } from "../../src/constants/messageConstants";

jest.mock("../../src/services/moduleMaster.service");
jest.mock("../../src/ExceptionHandler/errorHandler");
jest.mock("../../src/helpers/responses");

describe("moduleMasterController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    req = { query: {} };
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock }));
    res = { status: statusMock, json: jsonMock };
    jest.clearAllMocks();
  });

  it("should return 404 if moduleId is not provided in getModuleById", async () => {
    req.query = {};

    const errorResponse = createResponse(
      StatusCodes.NOT_FOUND,
      messageConstants.inputValidation.MODULEID_REQUIRED
    );
    (createResponse as jest.Mock).mockReturnValue(errorResponse);

    await moduleMasterController.getModuleById(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(jsonMock).toHaveBeenCalledWith(errorResponse);
  });

  it("should return module data if moduleId is provided in getModuleById", async () => {
    const moduleId = "1";
    req.query = { moduleId };
    const moduleData = { moduleId, name: "Test Module" };

    (moduleMasterService.getModuleById as jest.Mock).mockResolvedValue(
      moduleData
    );

    const successResponse = createResponse(moduleData);
    (createResponse as jest.Mock).mockReturnValue(successResponse);

    await moduleMasterController.getModuleById(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
    expect(jsonMock).toHaveBeenCalledWith(successResponse);
  });

  it("should handle errors correctly in getModuleById", async () => {
    const moduleId = "validModuleId";
    req.query = { moduleId };
    const error = new Error("Database Error");

    (moduleMasterService.getModuleById as jest.Mock).mockRejectedValue(error);

    const errorResponse = createResponse(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Internal Server Error"
    );
    (handleErrorResponse.handle as jest.Mock).mockReturnValue(errorResponse);

    await moduleMasterController.getModuleById(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
    expect(handleErrorResponse.handle).toHaveBeenCalledWith(error);
    expect(jsonMock).toHaveBeenCalledWith(errorResponse);
  });

  it("should return all modules with 200 status code in getAllModules", async () => {
    const mockModules = [
      { id: "1", name: "Module 1" },
      { id: "2", name: "Module 2" },
    ];

    (moduleMasterService.getAllModules as jest.Mock).mockResolvedValue(
      mockModules
    );

    const successResponse = createResponse({
      Modules: mockModules,
    });
    (createResponse as jest.Mock).mockReturnValue(successResponse);

    await moduleMasterController.getAllModules(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
    expect(jsonMock).toHaveBeenCalledWith(successResponse);
  });

  it("should handle errors correctly in getAllModules", async () => {
    const error = new Error("Database Error");

    (moduleMasterService.getAllModules as jest.Mock).mockRejectedValue(error);

    const errorResponse = createResponse(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Internal Server Error"
    );
    (handleErrorResponse.handle as jest.Mock).mockReturnValue(errorResponse);

    await moduleMasterController.getAllModules(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
    expect(handleErrorResponse.handle).toHaveBeenCalledWith(error);
    expect(jsonMock).toHaveBeenCalledWith(errorResponse);
  });
});
