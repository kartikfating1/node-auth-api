import UserDetails, { IUserDetails } from "../../src/models/UserDetails";
import { userSyncService } from "../../src/services/userSync.service";
import { roleService } from "../../src/services/role.service";
import { permissionService } from "../../src/services/permission.service";
import { moduleMasterService } from "../../src/services/moduleMaster.service";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../../src/helpers/response";
import { StatusCodes } from "http-status-codes";
import { messageConstants } from "../../src/constants/messageConstants";
import { v4 as uuidv4 } from "uuid";
import { DatabaseError } from "../../src/ExceptionHandler/DatabaseValidationError";

jest.mock("../../src/config/logger", () => {
  return jest.fn().mockReturnValue({
    info: jest.fn(),
    error: jest.fn(),
  });
});
jest.mock("../../src/models/UserDetails");
jest.mock("../../src/services/role.service");
jest.mock("../../src/services/permission.service");
jest.mock("../../src/services/moduleMaster.service");
jest.mock("../../src/constants/messageConstants");
jest.mock("../../src/config/logger", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    info: jest.fn(),
    error: jest.fn(),
  })),
}));

jest.mock("uuid", () => ({
  v4: jest.fn(),
}));

describe("userSyncService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createAdminRole", () => {
    it("should create an admin role successfully", async () => {
      const companyId = "company-id";
      const userId = "user-id";
      const username = "Testuser";
      const mockRoleId = "mock-role-id";
      const mockModules = [
        { moduleId: "module-1" },
        { moduleId: "module-2" },
        { moduleId: messageConstants.module.THREE },
        { moduleId: messageConstants.module.SIX },
      ];
      (uuidv4 as jest.Mock).mockReturnValue(mockRoleId)(
        // for roleId
        UserDetails.findOne as jest.Mock
      );
      (roleService.createRole as jest.Mock).mockResolvedValue({
        roleId: mockRoleId,
      });
      (moduleMasterService.getAllModules as jest.Mock).mockResolvedValue(
        mockModules
      );
      (permissionService.createPermission as jest.Mock).mockResolvedValue(null);
      (UserDetails.create as jest.Mock).mockResolvedValue(null);
      const response = await userSyncService.createAdminRole(
        companyId,
        userId,
        username
      );

      expect(UserDetails.findOne).toHaveBeenCalledWith({ username });
      expect(roleService.createRole).toHaveBeenCalledWith(
        expect.objectContaining({
          roleId: mockRoleId,
          name: "Admin",
          companyId,
        })
      );
      expect(moduleMasterService.getAllModules).toHaveBeenCalled();
      expect(permissionService.createPermission).toHaveBeenCalledTimes(4);
      expect(UserDetails.create).toHaveBeenCalledWith(
        expect.objectContaining({
          roleId: mockRoleId,
          username,
          companyId,
          userId,
        })
      );
      expect(response).toEqual(
        createSuccessResponse({
          message: "Admin User Data synced successfully",
        })
      );
    });

    it("should return error response if user already exists", async () => {
      const companyId = "company1";
      const userId = "user1";
      const username = "existingUser";

      (UserDetails.findOne as jest.Mock).mockResolvedValue({ username });
      const result = await userSyncService.createAdminRole(
        companyId,
        userId,
        username
      );
      expect(UserDetails.findOne).toHaveBeenCalledWith({ username });
      expect(result).toEqual(
        createErrorResponse(StatusCodes.BAD_REQUEST, "User Data Already Exists")
      );
    });

    it("should create admin role and permissions successfully", async () => {
      const companyId = "company1";
      const userId = "user1";
      const username = "newUser";

      (UserDetails.findOne as jest.Mock).mockResolvedValueOnce(null);

      const expectedSuccessResponse = {
        status: true,
        data: { message: "Admin User Data synced successfully" },
      };
      const result = await userSyncService.createAdminRole(
        companyId,
        userId,
        username
      );
      UserDetails.findOne as jest.Mock;
      roleService.createRole as jest.Mock;
      (UserDetails.create as jest.Mock).mockResolvedValue(null);
      (permissionService.createPermission as jest.Mock).mockResolvedValue(null);
      (moduleMasterService.getAllModules as jest.Mock).mockResolvedValue([]);
      expect(UserDetails.findOne).toHaveBeenCalledWith({ username });
      expect(roleService.createRole).toHaveBeenCalledWith(
        expect.objectContaining({ companyId })
      );
      expect(moduleMasterService.getAllModules).toHaveBeenCalled();
      expect(result).toEqual(expectedSuccessResponse);
    });
  });

  describe("UserDetailsSync", () => {
    const userId = "12345";
    const username = "testuser";
    const roleId = "admin";
    const companyId = "Test Company";
    it("should return error response if user already exists", async () => {
      //Failed to mock logger.error(messageConstants.userSync.USER_SYNC_ERR + error);
      const userId = "user1";
      const username = "existingUser";

      // Mock UserDetails.findOne to resolve with existing user
      (UserDetails.findOne as jest.Mock).mockResolvedValueOnce({ username });

      const result = await userSyncService.UserDetailsSync(
        userId,
        username,
        "roleId1",
        "company1"
      );

      expect(UserDetails.findOne).toHaveBeenCalledWith({ username });
      expect(result).toEqual(
        createErrorResponse(StatusCodes.BAD_REQUEST, "User Data Already Exists")
      );
    });

    it("should create user details successfully", async () => {
      const userId = "user1";
      const username = "newUser";

      (UserDetails.findOne as jest.Mock).mockResolvedValueOnce(null);
      const expectedSuccessResponse = {
        status: true,
        data: { message: "User Details Synced Successfully" },
      };
      const result = await userSyncService.UserDetailsSync(
        userId,
        username,
        "roleId1",
        "company1"
      );
      expect(UserDetails.findOne).toHaveBeenCalledWith({ username });
      expect(UserDetails.create).toHaveBeenCalledWith(
        expect.objectContaining({
          roleId: "roleId1",
          username,
          companyId: "company1",
          userId,
        })
      );
      expect(result).toEqual(expectedSuccessResponse);
    });

    it("should handle errors gracefully", async () => {
      const userId = "user1";
      const username = "TestUser";
      (UserDetails.findOne as jest.Mock).mockResolvedValue({ username });
      const expectedErrorResponse = {
        status: false,
        errorCode: StatusCodes.BAD_REQUEST,
        message: "User Data Already Exists",
      };
      (UserDetails.create as jest.Mock).mockRejectedValue(
        expectedErrorResponse
      );
      const result = await userSyncService.UserDetailsSync(
        userId,
        username,
        "roleId1",
        "company1"
      );
      expect(UserDetails.findOne).toHaveBeenCalledWith({ username });
      expect(result).toEqual(
        createErrorResponse(
          expectedErrorResponse.errorCode,
          expectedErrorResponse.message
        )
      );
    });

    it("should handle error in the catch block and return an error response", async () => {
      const errorMessage = "Database failure";
      const mockError = new Error(errorMessage);

      UserDetails.findOne = jest.fn().mockResolvedValue(null);
      UserDetails.create = jest.fn().mockRejectedValue(mockError);

      const result = await userSyncService.UserDetailsSync(
        userId,
        username,
        roleId,
        companyId
      );

      expect(UserDetails.findOne).toHaveBeenCalledWith({ username });
      expect(UserDetails.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(
        createErrorResponse(
          StatusCodes.INTERNAL_SERVER_ERROR,
          messageConstants.userSync.USER_SYNC_ERR
        )
      );
    });

    describe("getUsers", () => {
      it("should retrieve all users successfully", async () => {
        const mockUsers: IUserDetails[] = [
          {
            userId: "1",
            username: "user1",
            roleId: "role1",
            companyId: "company1",
            updatedAt: new Date(),
          } as IUserDetails,
          {
            userId: "2",
            username: "user2",
            roleId: "role2",
            companyId: "company2",
            updatedAt: new Date(),
          } as IUserDetails,
        ];

        (UserDetails.find as jest.Mock).mockResolvedValue(mockUsers);

        const result = await userSyncService.getUsers();

        expect(UserDetails.find).toHaveBeenCalledTimes(1);
        expect(result).toEqual(mockUsers);
      });

      it("should throw a DatabaseError on database failure", async () => {
        const errorMessage = "Database failure";
        const mockError = new Error(errorMessage);

        (UserDetails.find as jest.Mock).mockRejectedValue(mockError);

        await expect(userSyncService.getUsers()).rejects.toThrow(DatabaseError);
      });
    });
  });
});
