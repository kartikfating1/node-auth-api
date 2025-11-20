import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { authService } from "../../src/services/auth.service";
import customLogger from "../../src/config/logger";
import { messageConstants } from "../../src/constants/messageConstants";
import {
  login,
  verifyTokenController,
  azureFailure,
} from "../../src/controller/auth.controller";

jest.mock("passport");
jest.mock("../../src/services/auth.service");
jest.mock("../../src/config/logger");
jest.mock("../../src/helpers/redirectURLSelector", () => ({
  envConfig: jest.fn(() => "https://example.com/callback"), // Mocked URL
  URLSelect: jest.fn(() => "https://example.com/selected-url"), // Mocked URLSelect function
}));

const mockLogger = {
  error: jest.fn(),
};
(customLogger as jest.Mock).mockReturnValue(mockLogger);

describe("auth Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let sendMock: jest.Mock;
  let jsonMock: jest.Mock;
  let redirectMock: jest.Mock;

  beforeEach(() => {
    req = {
      body: {},
      headers: {},
    };
    sendMock = jest.fn();
    jsonMock = jest.fn();
    redirectMock = jest.fn();
    statusMock = jest.fn(() => ({
      send: sendMock,
      json: jsonMock,
    }));

    res = {
      status: statusMock,
      redirect: redirectMock,
    } as Partial<Response> as Response;
    jest.clearAllMocks();
  });

  describe("login", () => {
    it("should return user details on successful login", async () => {
      const username = "testuser";
      const userDetails = { id: 1, name: "Test User" };

      req.body = { username };
      (authService.login as jest.Mock).mockResolvedValue(userDetails);

      await login(req as Request, res as Response);

      expect(authService.login).toHaveBeenCalledWith(username);
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
      expect(sendMock).toHaveBeenCalledWith(userDetails);
    });
  });

  describe("verifyTokenController", () => {
    it("should return 400 if token is missing", async () => {
      req.headers = {};

      await verifyTokenController(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(jsonMock).toHaveBeenCalledWith({
        message: messageConstants.Auth.TOKEN_REQ,
      });
    });

    it("should return the result if token is valid", async () => {
      const token = "valid-token";
      const result = { status: StatusCodes.OK, message: "Token is valid" };

      req.headers = { authorization: `Bearer ${token}` };
      (authService.verifyTokenAndMatchIds as jest.Mock).mockResolvedValue(
        result
      );

      await verifyTokenController(req as Request, res as Response);

      expect(authService.verifyTokenAndMatchIds).toHaveBeenCalledWith(token);
      expect(statusMock).toHaveBeenCalledWith(result.status);
      expect(jsonMock).toHaveBeenCalledWith({ message: result.message });
    });
  });

  describe("azureFailure", () => {
    it("should redirect to URLSelect", () => {
      azureFailure(req as Request, res as Response);

      expect(redirectMock).toHaveBeenCalledWith(
        "https://example.com/selected-url"
      ); // Check redirect URL
    });
  });
});
