import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { roleController } from "../../src/controller/role.controller";
import { roleService } from "../../src/services/role.service";
import { handleErrorResponse } from "../../src/ExceptionHandler/errorHandler"; // Adjust the import path if needed
import {
  DataValidationError,
  DatabaseError,
} from "../../src/ExceptionHandler/DatabaseValidationError";
import { getRoleById } from "../../src/services/common.service";

import { permissionService } from "../../src/services/permission.service";
import { moduleMasterService } from "../../src/services/moduleMaster.service";

import { createResponse } from "../../src/helpers/responses";
import { messageConstants } from "../../src/constants/messageConstants";
import { v4 as uuidv4 } from "uuid";

jest.mock("../../src/helpers/responses");
jest.mock("../../src/services/role.service");
jest.mock("../../src/ExceptionHandler/errorHandler");
jest.mock("../../src/services/common.service");
jest.mock("../../src/helpers/roleInputValidator");
jest.mock("../../src/services/permission.service");
jest.mock("../../src/services/moduleMaster.service");

describe("roleController › getRolesByCompanyId", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    req = {
      query: {},
    };
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({
      json: jsonMock,
    }));

    res = {
      status: statusMock,
      json: jsonMock,
    };

    jest.clearAllMocks();
  });

  it("should return roles for a valid companyId", async () => {
    const companyId = "mock-company-id";
    req.query = { companyId };

    const mockRoles = [
      { roleId: "1", name: "Role 1" },
      { roleId: "2", name: "Role 2" },
    ];

    (roleService.getRolesByCompanyId as jest.Mock).mockResolvedValue(mockRoles);

    const successResponse = {
      status: true,
      data: mockRoles,
    };
    (createResponse as jest.Mock).mockReturnValue(successResponse);

    await roleController.getRolesByCompanyId(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
    expect(jsonMock).toHaveBeenCalledWith(successResponse);

    expect(roleService.getRolesByCompanyId).toHaveBeenCalledWith(companyId);

    expect(createResponse).toHaveBeenCalledWith(mockRoles);
  });

  it("should handle errors during getRolesByCompanyId", async () => {
    const companyId = "mock-company-id";
    req.query = { companyId };

    const error = new Error("Database Error");
    (roleService.getRolesByCompanyId as jest.Mock).mockRejectedValue(error);

    const errorResponse = {
      status: false,
      message: "Internal Server Error",
    };
    (handleErrorResponse.handle as jest.Mock).mockReturnValue(errorResponse);

    await roleController.getRolesByCompanyId(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
    expect(handleErrorResponse.handle).toHaveBeenCalledWith(error);
    expect(jsonMock).toHaveBeenCalledWith(errorResponse);
  });
});

describe("roleController › deleteRole", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    req = {
      query: {},
    };
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({
      json: jsonMock,
    }));

    res = {
      status: statusMock,
      json: jsonMock,
    };

    jest.clearAllMocks();
  });

  it("should delete a role successfully", async () => {
    const roleId = "mock-role-id";
    req.query = { roleId };

    const deleteResponse = { acknowledged: true, deletedCount: 1 };
    const mockRole = { roleId: "mock-role-id", name: "Updated Role Name" };

    (roleService.deleteRole as jest.Mock).mockResolvedValue(deleteResponse);
    (getRoleById as jest.Mock).mockResolvedValue(mockRole);

    const successResponse = createResponse({
      message: "Role and its permissions deleted successfully",
    });
    (createResponse as jest.Mock).mockReturnValue(successResponse);

    await roleController.deleteRole(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
    expect(jsonMock).toHaveBeenCalledWith(successResponse);
    expect(roleService.deleteRole).toHaveBeenCalledWith(roleId);
    expect(getRoleById).toHaveBeenCalledWith(roleId);
    expect(createResponse).toHaveBeenCalledWith({
      message: "Role and its permissions deleted successfully",
    });
  });
  it("should handle errors during role deletion", async () => {
    const roleId = "mock-role-id";
    req.query = { roleId };

    const error = new DataValidationError("Failed to delete permissions");

    (roleService.deleteRole as jest.Mock).mockRejectedValue(error);

    const errorResponse = createResponse(
      StatusCodes.BAD_REQUEST,
      "Failed to delete permissions"
    );
    (handleErrorResponse.handle as jest.Mock).mockReturnValue(errorResponse);

    await roleController.deleteRole(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
    expect(handleErrorResponse.handle).toHaveBeenCalledWith(error);
    expect(jsonMock).toHaveBeenCalledWith(errorResponse);
  });
});

describe("roleController › getRolePermissions", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    req = {
      query: {},
    };
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({
      json: jsonMock,
    }));

    res = {
      status: statusMock,
      json: jsonMock,
    };

    jest.clearAllMocks();
  });

  // it('should return role permissions successfully', async () => {
  //   try {
  //     const roleId = 'mock-role-id';
  //     req.query = { roleId };
  //     const mockRole = { roleId: 'mock-role-id', name: 'Updated Role Name' };

  //     (getRoleById as jest.Mock).mockResolvedValue(mockRole);

  //     const mockPermissions = [
  //       { moduleId: '1', moduleName: 'Module 1', actions: { create: true, read: true, update: true, delete: true }, create: true, read: true, update: true, delete: true },
  //       { moduleId: '2', moduleName: 'Module 2', actions: { create: true, read: false, update: true, delete: false }, create: true, read: false, update: true, delete: false },
  //     ];

  //     const mockModules = [
  //       { moduleId: '1', moduleName: 'Module 1', actions: { create: true, read: true, update: true, delete: true } },
  //       { moduleId: '2', moduleName: 'Module 2', actions: { create: true, read: false, update: true, delete: false } },
  //     ];

  //     (permissionService.getAllPermissions as jest.Mock).mockResolvedValue(mockPermissions);

  //     (moduleMasterService.getModuleById as jest.Mock).mockImplementation((moduleId: string) => {
  //       if (moduleId === mockPermissions[0].moduleId) {
  //         return Promise.resolve(mockModules[0]);
  //       } else if (moduleId === mockPermissions[1].moduleId) {
  //         return Promise.resolve(mockModules[1]);
  //       }
  //       return Promise.resolve(null);
  //     });

  //     await roleController.getRolePermissions(req as Request, res as Response);

  //     expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
  //     expect(jsonMock).toHaveBeenCalledWith({
  //       status: true,
  //       data: { permissions: mockPermissions },
  //     });
  //   } catch (error) {
  //     console.error('Error in test:', error);
  //     throw error;
  //   }
  // });

  it("should handle errors during getRolePermissions", async () => {
    const roleId = "mock-role-id";
    req.query = { roleId };

    const error = new Error("Database Error");

    // Mock the permissionService.getAllPermissions to reject with an error
    (permissionService.getAllPermissions as jest.Mock).mockRejectedValue(error);

    // Mock handleErrorResponse.handle to return a formatted error response
    (handleErrorResponse.handle as jest.Mock).mockReturnValue({
      status: false,
      data: {
        errorCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: error.message,
      },
    });

    await roleController.getRolePermissions(req as Request, res as Response);

    // Expect handleErrorResponse.handle to be called with the error
    expect(handleErrorResponse.handle).toHaveBeenCalledWith(error);

    // Expect the response to be an error response
    expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
    expect(jsonMock).toHaveBeenCalledWith({
      status: false,
      data: {
        errorCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Database Error",
      },
    });
  });

  // it('should return 400 if companyId is missing', async () => {
  //   try {
  //     (InputValidator.validateCompanyIdQuery as jest.Mock).mockRejectedValue("");
  //     await roleController.getRolesByCompanyId(req as Request, res as Response);

  //     expect(statusMock).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
  //     expect(jsonMock).toHaveBeenCalledWith({
  //       message: 'Company id is required',
  //     });
  //   } catch (error) {
  //     console.error('Error in test:', error);
  //     throw error;
  //   }
  // });
});

describe("roleController › getRolesByCompanyId", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    req = {
      query: {},
    };
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({
      json: jsonMock,
    }));

    res = {
      status: statusMock,
      json: jsonMock,
    };

    jest.clearAllMocks();
  });

  describe("getRolesByCompanyId", () => {
    it("should return roles for a valid companyId", async () => {
      req.query = { companyId: "mock-company-id" };

      const mockRoles = [{ roleId: "1", name: "Role 1" }];
      (roleService.getRolesByCompanyId as jest.Mock).mockResolvedValue(
        mockRoles
      );

      await roleController.getRolesByCompanyId(req as Request, res as Response);

      expect(roleService.getRolesByCompanyId).toHaveBeenCalledWith(
        "mock-company-id"
      );
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
      expect(jsonMock).toHaveBeenCalledWith(createResponse(mockRoles));
    });

    it("should handle errors during getRolesByCompanyId", async () => {
      req.query = { companyId: "mock-company-id" };

      const error = new DatabaseError("Database Error");
      (roleService.getRolesByCompanyId as jest.Mock).mockRejectedValue(error);
      (handleErrorResponse.handle as jest.Mock).mockReturnValue({
        status: false,
        data: { errorCode: StatusCodes.OK, message: "Database Error" },
      });

      await roleController.getRolesByCompanyId(req as Request, res as Response);

      expect(handleErrorResponse.handle).toHaveBeenCalledWith(error);
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
      expect(jsonMock).toHaveBeenCalledWith({
        status: false,
        data: { errorCode: StatusCodes.OK, message: "Database Error" },
      });
    });
  });

  describe("deleteRole", () => {
    it("should delete a role and return success response", async () => {
      req.query = { roleId: "mock-role-id" };

      (roleService.deleteRole as jest.Mock).mockResolvedValue(null);

      await roleController.deleteRole(req as Request, res as Response);

      expect(roleService.deleteRole).toHaveBeenCalledWith("mock-role-id");
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
      expect(jsonMock).toHaveBeenCalledWith(
        createResponse(
          StatusCodes.OK,
          messageConstants.role.ROLE_PERMISSIONS_DELETED
        )
      );
    });

    it("should handle errors during role deletion", async () => {
      req.query = { roleId: "mock-role-id" };

      const error = new DatabaseError("Database Error");
      (roleService.deleteRole as jest.Mock).mockRejectedValue(error);
      (handleErrorResponse.handle as jest.Mock).mockReturnValue({
        status: false,
        data: { errorCode: StatusCodes.OK, message: "Database Error" },
      });

      await roleController.deleteRole(req as Request, res as Response);

      expect(handleErrorResponse.handle).toHaveBeenCalledWith(error);
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
      expect(jsonMock).toHaveBeenCalledWith({
        status: false,
        data: { errorCode: StatusCodes.OK, message: "Database Error" },
      });
    });
  });

  describe("getRolePermissions", () => {
    it("should return role permissions for a valid roleId", async () => {
      req.query = { roleId: "mock-role-id" };

      const mockPermissions = [
        {
          moduleId: "mock-module-id",
          moduleName: "Mock Module",
          actions: { create: true },
        },
      ];
      (permissionService.getAllPermissions as jest.Mock).mockResolvedValue(
        mockPermissions
      );
      (moduleMasterService.getModuleById as jest.Mock).mockResolvedValue({
        moduleId: "mock-module-id",
        moduleName: "Mock Module",
      });

      await roleController.getRolePermissions(req as Request, res as Response);

      expect(permissionService.getAllPermissions).toHaveBeenCalledWith(
        "mock-role-id"
      );
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
      expect(jsonMock).toHaveBeenCalledWith(
        createResponse({ permissions: mockPermissions })
      );
    });

    it("should handle errors during getRolePermissions", async () => {
      req.query = { roleId: "mock-role-id" };

      const error = new DataValidationError("Data Validation Error");
      (permissionService.getAllPermissions as jest.Mock).mockRejectedValue(
        error
      );
      (handleErrorResponse.handle as jest.Mock).mockReturnValue({
        status: false,
        data: { errorCode: StatusCodes.OK, message: "Data Validation Error" },
      });

      await roleController.getRolePermissions(req as Request, res as Response);

      expect(handleErrorResponse.handle).toHaveBeenCalledWith(error);
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
      expect(jsonMock).toHaveBeenCalledWith({
        status: false,
        data: { errorCode: StatusCodes.OK, message: "Data Validation Error" },
      });
    });
  });

  describe("updateRole", () => {
    it("should update a role and return success response", async () => {
      req.body = {
        roleId: "mock-role-id",
        name: "Updated Role",
        permissions: [
          { moduleId: "mock-module-id", actions: { create: true } },
        ],
      };

      (roleService.updateRole as jest.Mock).mockResolvedValue(null);
      (moduleMasterService.getModuleById as jest.Mock).mockResolvedValue({
        moduleId: "mock-module-id",
      });
      (permissionService.findPermission as jest.Mock).mockResolvedValue(null);

      await roleController.updateRole(req as Request, res as Response);

      expect(roleService.updateRole).toHaveBeenCalledWith(
        expect.anything(),
        "mock-role-id"
      );
      expect(permissionService.createPermission).toHaveBeenCalledTimes(1);
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
      expect(jsonMock).toHaveBeenCalledWith(
        createResponse(messageConstants.role.ROLE_UPDATE)
      );
    });

    it("should handle errors during role update", async () => {
      req.body = {
        roleId: "mock-role-id",
        name: "Updated Role",
      };

      const error = new DatabaseError("Database Error");
      (roleService.updateRole as jest.Mock).mockRejectedValue(error);
      (handleErrorResponse.handle as jest.Mock).mockReturnValue({
        status: false,
        data: { errorCode: StatusCodes.OK, message: "Database Error" },
      });

      await roleController.updateRole(req as Request, res as Response);

      expect(handleErrorResponse.handle).toHaveBeenCalledWith(error);
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
      expect(jsonMock).toHaveBeenCalledWith({
        status: false,
        data: { errorCode: StatusCodes.OK, message: "Database Error" },
      });
    });
  });
  describe("roleController.createRole", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;

    beforeEach(() => {
      req = {
        body: {
          roleId: "mock-role-id",
          name: "mock-role-name",
          permissions: [
            {
              moduleId: "mock-module-id",
              actions: { create: true, read: true, update: true, delete: true },
            },
          ],
        },
      };
      statusMock = jest.fn().mockReturnThis();
      jsonMock = jest.fn();
      res = {
        status: statusMock,
        json: jsonMock,
      };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should create a role without permissions", async () => {
      req.body.permissions = [];

      const mockCreatedRole = {
        roleId: "mock-role-id",
        name: "mock-role-name",
      };
      (roleService.createRole as jest.Mock).mockResolvedValue(mockCreatedRole);

      await roleController.createRole(req as Request, res as Response);

      expect(roleService.createRole).toHaveBeenCalledWith(req.body);
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
      expect(jsonMock).toHaveBeenCalledWith(
        createResponse(messageConstants.role.ROLE_CREATED)
      );
    });

    it("should create a role with permissions", async () => {
      const mockCreatedRole = {
        roleId: "mock-role-id",
        name: "mock-role-name",
      };
      const mockModule = {
        moduleId: "mock-module-id",
        moduleName: "mock-module-name",
      };

      (roleService.createRole as jest.Mock).mockResolvedValue(mockCreatedRole);
      (moduleMasterService.getModuleById as jest.Mock).mockResolvedValue(
        mockModule
      );
      (permissionService.createPermission as jest.Mock).mockResolvedValue({});

      await roleController.createRole(req as Request, res as Response);

      expect(roleService.createRole).toHaveBeenCalledWith(req.body);
      expect(moduleMasterService.getModuleById).toHaveBeenCalledWith(
        "mock-module-id"
      );
      expect(permissionService.createPermission).toHaveBeenCalledWith(
        expect.objectContaining({
          permissionId: expect.any(String),
          create: true,
          read: true,
          update: true,
          delete: true,
          roleId: "mock-role-id",
          moduleId: "mock-module-id",
          updatedAt: expect.any(Date),
        })
      );
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
      expect(jsonMock).toHaveBeenCalledWith(
        createResponse(messageConstants.role.ROLE_CREATED)
      );
    });

    it("should handle error if module is not found", async () => {
      (roleService.createRole as jest.Mock).mockResolvedValue({
        roleId: "mock-role-id",
      });
      (moduleMasterService.getModuleById as jest.Mock).mockResolvedValue(null);

      const errorResponse = createResponse(
        StatusCodes.OK,
        "Module with ID mock-module-id not found"
      );
      (handleErrorResponse.handle as jest.Mock).mockReturnValue(errorResponse);

      await roleController.createRole(req as Request, res as Response);

      expect(moduleMasterService.getModuleById).toHaveBeenCalledWith(
        "mock-module-id"
      );
      expect(handleErrorResponse.handle).toHaveBeenCalledWith(
        new DataValidationError("Module with ID mock-module-id not found")
      );
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
      expect(jsonMock).toHaveBeenCalledWith(errorResponse);
    });

    it("should handle error during permission creation", async () => {
      const mockCreatedRole = {
        roleId: "mock-role-id",
        name: "mock-role-name",
      };
      const mockModule = {
        moduleId: "mock-module-id",
        moduleName: "mock-module-name",
      };

      (roleService.createRole as jest.Mock).mockResolvedValue(mockCreatedRole);
      (moduleMasterService.getModuleById as jest.Mock).mockResolvedValue(
        mockModule
      );
      (permissionService.createPermission as jest.Mock).mockRejectedValue(
        new Error("Permission creation error")
      );

      const errorResponse = createResponse(
        StatusCodes.OK,
        "Permission creation error"
      );
      (handleErrorResponse.handle as jest.Mock).mockReturnValue(errorResponse);

      await roleController.createRole(req as Request, res as Response);

      expect(moduleMasterService.getModuleById).toHaveBeenCalledWith(
        "mock-module-id"
      );
      expect(permissionService.createPermission).toHaveBeenCalled();
      expect(handleErrorResponse.handle).toHaveBeenCalledWith(
        new Error("Permission creation error")
      );
      expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
      expect(jsonMock).toHaveBeenCalledWith(errorResponse);
    });
  });
});
describe("roleController.updateRole", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    req = {
      body: {
        roleId: "mock-role-id",
        name: "Updated Role Name",
        permissions: [
          {
            moduleId: "mock-module-id",
            actions: {
              create: true,
              read: true,
              update: true,
              delete: false,
            },
          },
        ],
      },
    };
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    res = {
      status: statusMock,
      json: jsonMock,
    };
  });

  it("should update a role without permissions", async () => {
    req.body.permissions = [];

    const mockRole = { roleId: "mock-role-id", name: "Updated Role Name" };
    (roleService.updateRole as jest.Mock).mockResolvedValue(mockRole);
    (createResponse as jest.Mock).mockReturnValue({
      status: true,
      data: messageConstants.role.ROLE_UPDATE,
    });

    await roleController.updateRole(req as Request, res as Response);

    expect(roleService.updateRole).toHaveBeenCalledWith(
      mockRole,
      req.body.roleId
    );
    expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
    expect(jsonMock).toHaveBeenCalledWith({
      status: true,
      data: messageConstants.role.ROLE_UPDATE,
    });
  });

  it("should update a role with existing permissions", async () => {
    const mockRole = { roleId: "mock-role-id", name: "Updated Role Name" };
    const mockModule = { moduleId: "mock-module-id", moduleName: "Module 1" };
    const mockExistingPermission = {
      permissionId: uuidv4(),
      create: false,
      read: false,
      update: false,
      delete: false,
    };

    (roleService.updateRole as jest.Mock).mockResolvedValue(mockRole);
    (moduleMasterService.getModuleById as jest.Mock).mockResolvedValue(
      mockModule
    );
    (permissionService.findPermission as jest.Mock).mockResolvedValue(
      mockExistingPermission
    );
    (permissionService.updateExistingPermission as jest.Mock).mockResolvedValue(
      undefined
    );
    (createResponse as jest.Mock).mockReturnValue({
      status: true,
      data: messageConstants.role.ROLE_UPDATE,
    });

    await roleController.updateRole(req as Request, res as Response);

    expect(permissionService.updateExistingPermission).toHaveBeenCalledWith(
      req.body.permissions[0].actions,
      expect.objectContaining({
        permissionId: mockExistingPermission.permissionId,
      })
    );
    expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
    expect(jsonMock).toHaveBeenCalledWith({
      status: true,
      data: messageConstants.role.ROLE_UPDATE,
    });
  });

  it("should update a role with new permissions", async () => {
    const mockRole = { roleId: "mock-role-id", name: "Updated Role Name" };
    const mockModule = { moduleId: "mock-module-id", moduleName: "Module 1" };

    (roleService.updateRole as jest.Mock).mockResolvedValue(mockRole);
    (moduleMasterService.getModuleById as jest.Mock).mockResolvedValue(
      mockModule
    );
    (permissionService.findPermission as jest.Mock).mockResolvedValue(null);
    (permissionService.createPermission as jest.Mock).mockResolvedValue(
      undefined
    );
    (createResponse as jest.Mock).mockReturnValue({
      status: true,
      data: messageConstants.role.ROLE_UPDATE,
    });

    await roleController.updateRole(req as Request, res as Response);

    expect(permissionService.createPermission).toHaveBeenCalledWith(
      expect.objectContaining({
        roleId: req.body.roleId,
        moduleId: req.body.permissions[0].moduleId,
      })
    );
    expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
    expect(jsonMock).toHaveBeenCalledWith({
      status: true,
      data: messageConstants.role.ROLE_UPDATE,
    });
  });

  it("should handle module not found error", async () => {
    (moduleMasterService.getModuleById as jest.Mock).mockResolvedValue(null);
    const mockError = new DataValidationError(
      "Module with ID mock-module-id not found"
    );

    (handleErrorResponse.handle as jest.Mock).mockReturnValue({
      status: false,
      data: {
        errorCode: StatusCodes.OK,
        message: mockError.message,
      },
    });

    await roleController.updateRole(req as Request, res as Response);

    expect(handleErrorResponse.handle).toHaveBeenCalledWith(
      expect.any(DataValidationError)
    );
    expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
    expect(jsonMock).toHaveBeenCalledWith({
      status: false,
      data: {
        errorCode: StatusCodes.OK,
        message: "Module with ID mock-module-id not found",
      },
    });
  });
  it("should handle error during role update", async () => {
    const mockError = new Error("Role update failed");
    (roleService.updateRole as jest.Mock).mockRejectedValue(mockError);

    (handleErrorResponse.handle as jest.Mock).mockReturnValue({
      status: false,
      data: {
        errorCode: StatusCodes.OK,
        message: mockError.message,
      },
    });

    await roleController.updateRole(req as Request, res as Response);

    expect(handleErrorResponse.handle).toHaveBeenCalledWith(mockError);
    expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
    expect(jsonMock).toHaveBeenCalledWith({
      status: false,
      data: {
        errorCode: StatusCodes.OK,
        message: "Role update failed",
      },
    });
  });
});
