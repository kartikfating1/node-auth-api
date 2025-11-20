import { Request, Response } from "express";
import { userSyncController } from "../../src/controller/userSync.controller";
import { userSyncService } from "../../src/services/userSync.service";
import { StatusCodes } from "http-status-codes";
import { InputValidator } from "../../src/helpers/roleInputValidator";
import { handleErrorResponse } from "../../src/ExceptionHandler/errorHandler"; // Adjust the import path if needed

jest.mock("../../src/services/userSync.service");
jest.mock("../../src/helpers/roleInputValidator");
jest.mock("../../src/ExceptionHandler/errorHandler");
jest.mock("../../src/helpers/roleInputValidator");

describe("userSyncController Tests", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    req = {
      body: {
        companyId: "mockCompanyId",
        userId: "mockUserId",
        username: "mockUsername",
        roleId: "mockRoleId",
      },
    };
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({
      json: jsonMock,
    }));

    res = {
      status: statusMock,
    } as Partial<Response>;

    jest.clearAllMocks();
  });

  describe("createAdminRole", () => {
    it("should create admin role and return success response", async () => {
      (userSyncService.createAdminRole as jest.Mock).mockResolvedValue({
        message: "Admin role created successfully",
      });

      await userSyncController.createAdminRole(req as Request, res as Response);

      expect(InputValidator.validateSyncAdminUser).toHaveBeenCalledWith(
        req.body
      );
      expect(userSyncService.createAdminRole).toHaveBeenCalledWith(
        "mockCompanyId",
        "mockUserId",
        "mockUsername"
      );
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Admin role created successfully",
      });
    });

    it("should handle validation errors and return error response", async () => {
      const mockError = new Error("Validation Error");
      (InputValidator.validateSyncAdminUser as jest.Mock).mockImplementation(
        () => {
          throw mockError;
        }
      );
      (handleErrorResponse.handle as jest.Mock).mockReturnValue({
        error: "Validation Error",
      });

      await userSyncController.createAdminRole(req as Request, res as Response);

      expect(InputValidator.validateSyncAdminUser).toHaveBeenCalledWith(
        req.body
      );
      expect(handleErrorResponse.handle).toHaveBeenCalledWith(mockError);
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Validation Error",
      });
    });
  });

  describe("UserDetailsSync", () => {
    it("should sync user details and return success response", async () => {
      (userSyncService.UserDetailsSync as jest.Mock).mockResolvedValue({
        message: "User details synced successfully",
      });

      await userSyncController.UserDetailsSync(req as Request, res as Response);

      expect(InputValidator.validateSyncUser).toHaveBeenCalledWith(req.body);
      expect(userSyncService.UserDetailsSync).toHaveBeenCalledWith(
        "mockUserId",
        "mockUsername",
        "mockRoleId",
        "mockCompanyId"
      );
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "User details synced successfully",
      });
    });

    it("should handle validation errors and return error response", async () => {
      const mockError = new Error("Validation Error");
      (InputValidator.validateSyncUser as jest.Mock).mockImplementation(() => {
        throw mockError;
      });
      (handleErrorResponse.handle as jest.Mock).mockReturnValue({
        error: "Validation Error",
      });

      await userSyncController.UserDetailsSync(req as Request, res as Response);

      expect(InputValidator.validateSyncUser).toHaveBeenCalledWith(req.body);
      expect(handleErrorResponse.handle).toHaveBeenCalledWith(mockError);
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Validation Error",
      });
    });
  });

  describe("getUsers", () => {
    it("should handle internal server error and return error response", async () => {
      const mockError = new Error("Internal Server Error");
      (userSyncService.getUsers as jest.Mock).mockRejectedValue(mockError);
      (handleErrorResponse.handle as jest.Mock).mockReturnValue({
        error: "Internal Server Error",
      });

      await userSyncController.getUsers(req as Request, res as Response);

      expect(userSyncService.getUsers).toHaveBeenCalledTimes(1);
      expect(handleErrorResponse.handle).toHaveBeenCalledWith(mockError);
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Internal Server Error",
      });
    });
  });
});
