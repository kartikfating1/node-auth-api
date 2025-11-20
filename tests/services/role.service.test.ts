import customLogger from "../../src/config/logger";
import { roleService } from "../../src/services/role.service";
import {
  DatabaseError,
  DataValidationError,
} from "../../src/ExceptionHandler/DatabaseValidationError";
import RoleModel, { IRole } from "../../src/models/roles";
import { messageConstants } from "../../src/constants/messageConstants";
import { permissionService } from "../../src/services/permission.service";
import roles from "../../src/models/roles";

jest.mock("../../src/models/roles");
jest.mock("../../src/services/permission.service");
jest.mock("../../src/config/logger", () => {
  return jest.fn().mockReturnValue({
    info: jest.fn(),
    error: jest.fn(),
  });
});

const logger = customLogger();

describe("Role Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createRole", () => {
    const mockRoleData: IRole = {
      roleId: "12345",
      name: "Admin",
      companyId: "Test Company",
    } as IRole;

    it("should create a new role successfully", async () => {
      RoleModel.create = jest.fn().mockResolvedValue(mockRoleData);

      const result = await roleService.createRole(mockRoleData);

      expect(RoleModel.create).toHaveBeenCalledTimes(1);
      expect(result.name).toEqual(mockRoleData.name);
    });

    it("should throw a DatabaseError on database failure for createRole", async () => {
      const errorMessage = "Database failure";

      RoleModel.create = jest.fn().mockRejectedValue(errorMessage);

      await expect(roleService.createRole(mockRoleData)).rejects.toThrow(
        DatabaseError
      );
      expect(logger.error).toHaveBeenCalledWith(
        messageConstants.roleService.CREATE_ROLE_ERR + errorMessage
      );
    });
  });

  describe("deleteRole", () => {
    const mockRoleId = "12345";

    it("should throw a DataValidationError when failing to delete permissions for deleteRole", async () => {
      const mockRoleId = "mockRoleId";
      const mockPermissions = [{ permissionId: "1" }, { permissionId: "2" }];
      (permissionService.getAllPermissions as jest.Mock).mockResolvedValue(
        mockPermissions
      );
      (permissionService.deletePermission as jest.Mock).mockResolvedValue({
        acknowledged: false,
        deletedCount: 0,
      });

      try {
        await roleService.deleteRole(mockRoleId);
        fail("deleteRole should throw an error");
      } catch (error: any) {
        expect(error.message).toBe(
          DataValidationError.name +
            ": " +
            messageConstants.role.FAILED_TO_DELETE_MODULE_PERMISSIONS
        );
      }
    });

    it("should throw a DatabaseError when failing to delete the role", async () => {
      const mockRoleId = "mockRoleId";
      const mockPermissions = [{ permissionId: "1" }, { permissionId: "2" }];

      permissionService.getAllPermissions = jest
        .fn()
        .mockResolvedValue(mockPermissions);

      permissionService.deletePermission = jest
        .fn()
        .mockResolvedValue({ acknowledged: true, deletedCount: 2 });

      roles.deleteOne = jest
        .fn()
        .mockResolvedValue({ acknowledged: false, deletedCount: 0 });

      try {
        await roleService.deleteRole(mockRoleId);
        fail("deleteRole should throw an error");
      } catch (error: any) {
        expect(error).toBeInstanceOf(DatabaseError);
      }
    });

    it("should delete the role and permissions successfully", async () => {
      const mockRoleId = "mockRoleId";
      const mockPermissions = [{ permissionId: "1" }, { permissionId: "2" }];

      permissionService.getAllPermissions = jest
        .fn()
        .mockResolvedValue(mockPermissions);

      permissionService.deletePermission = jest
        .fn()
        .mockResolvedValue({ acknowledged: true, deletedCount: 2 });

      roles.deleteOne = jest
        .fn()
        .mockResolvedValue({ acknowledged: true, deletedCount: 1 });

      const result = await roleService.deleteRole(mockRoleId);
      expect(result.acknowledged).toBeTruthy();
      expect(result.deletedCount).toBe(1);
    });

    it("should throw a DatabaseError on database failure for deleteRole", async () => {
      const errorMessage = "Database failure";
      permissionService.getAllPermissions = jest
        .fn()
        .mockRejectedValue(errorMessage);
      await expect(roleService.deleteRole(mockRoleId)).rejects.toThrow(
        DatabaseError
      );
      expect(logger.error).toHaveBeenCalledWith(
        messageConstants.roleService.DELETE_ROLE_ERR + errorMessage
      );
    });
  });

  describe("updateRole", () => {
    const mockRole: IRole = {
      roleId: "12345",
      name: "Updated Role Name",
    } as IRole;

    it("should update a role successfully", async () => {
      const updateResponse = {
        nModified: 1,
      };

      RoleModel.updateOne = jest.fn().mockResolvedValue(updateResponse);

      const result = await roleService.updateRole(mockRole, mockRole.roleId);

      expect(RoleModel.updateOne).toHaveBeenCalledWith(
        { roleId: mockRole.roleId },
        { $set: { name: mockRole.name } }
      );
      expect(result).toEqual(updateResponse);
    });

    it("should throw a DatabaseError on database failure for updateRole", async () => {
      const errorMessage = "Database failure";
      const error = new DatabaseError(errorMessage);
      (RoleModel.updateOne as jest.Mock).mockRejectedValue(error);

      const mockRole = { name: "Admin", roleId: "1" } as IRole;

      await expect(
        roleService.updateRole(mockRole, mockRole.roleId)
      ).rejects.toThrow(Error);
    });
  });

  describe("getRolesByCompanyId", () => {
    const mockCompanyId = "companyId123";

    it("should return roles successfully", async () => {
      const mockRoles = [
        { roleId: "1", name: "Admin", companyId: mockCompanyId },
        { roleId: "2", name: "User", companyId: mockCompanyId },
      ];

      roles.find = jest.fn().mockResolvedValue(mockRoles);

      const result = await roleService.getRolesByCompanyId(mockCompanyId);

      expect(roles.find).toHaveBeenCalledWith({ companyId: mockCompanyId });
      expect(result).toEqual(mockRoles);
    });

    it("should throw a DatabaseError on database failure for getRolesByCompanyId", async () => {
      const errorMessage = "Database failure";
      const error = new Error(errorMessage);

      roles.find = jest.fn().mockRejectedValue(error);

      await expect(
        roleService.getRolesByCompanyId(mockCompanyId)
      ).rejects.toThrow(DatabaseError);
    });
  });

  describe("getRoleByName", () => {
    const mockRoleName = "Admin";
  
    it("should return a role successfully when found by name", async () => {
      const mockRole = { roleId: "12345", name: mockRoleName, companyId: "Test Company" };
  
      roles.findOne = jest.fn().mockResolvedValue(mockRole);
  
      const result = await roleService.getRoleByName(mockRoleName);
  
      expect(roles.findOne).toHaveBeenCalledWith({ name: mockRoleName });
      expect(result).toEqual(mockRole);
    });
  
    it("should return null when no role is found with the given name", async () => {
      roles.findOne = jest.fn().mockResolvedValue(null);
  
      const result = await roleService.getRoleByName(mockRoleName);
  
      expect(roles.findOne).toHaveBeenCalledWith({ name: mockRoleName });
      expect(result).toBeNull();
    });
  
    it("should throw a DatabaseError on database failure", async () => {
      const errorMessage = "Database failure";
      roles.findOne = jest.fn().mockRejectedValue(errorMessage);
  
      await expect(roleService.getRoleByName(mockRoleName)).rejects.toThrow(DatabaseError);
      expect(logger.error).toHaveBeenCalledWith(
        messageConstants.roleService.GET_ROLE_ERR + errorMessage
      );
    });
  });
  
});
