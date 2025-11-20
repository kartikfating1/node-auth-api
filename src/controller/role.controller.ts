import { Request, Response } from "express";
import { messageConstants } from "../constants/messageConstants";
import { roleService } from "../services/role.service";
import { moduleMasterService } from "../services/moduleMaster.service";
import { permissionService } from "../services/permission.service";
import { IPermission } from "../models/permissions";
import { v4 as uuidv4 } from "uuid";
import { StatusCodes } from "http-status-codes";
import { InputValidator } from "../helpers/roleInputValidator";
import {
  existingRole,
  existingUser,
  getRoleById,
} from "../services/common.service";
import { DataValidationError } from "../ExceptionHandler/DatabaseValidationError";
import { handleErrorResponse } from "../ExceptionHandler/errorHandler";
import { createResponse } from "../helpers/responses";

export const roleController = {
  createRole: async (request: Request, response: Response) => {
    try {
      InputValidator.validateCreateRole(request.body);
      const { permissions } = request.body;
      await existingRole(request.body);
      const createdRole = await roleService.createRole(request.body);

      if (permissions && permissions.length > 0) {
        const permissionCreationPromises = permissions.map(
          async (permission: any) => {
            const { moduleId, actions } = permission;
            const module = await moduleMasterService.getModuleById(moduleId);

            if (!module) {
              throw new DataValidationError(
                `Module with ID ${moduleId} not found`
              );
            }

            const permissionItemsData = {
              permissionId: uuidv4(),
              create: actions.create,
              read: actions.read,
              update: actions.update,
              delete: actions.delete,
              roleId: createdRole.roleId,
              moduleId: module.moduleId,
              updatedAt: new Date(),
            };

            const permissionItems: IPermission =
              permissionItemsData as IPermission;
            return await permissionService.createPermission(permissionItems);
          }
        );

        await Promise.all(permissionCreationPromises);
      }
      const successResponse = createResponse(
        messageConstants.role.ROLE_CREATED
      );
      response.status(StatusCodes.OK).json(successResponse);
    } catch (error: any) {
      const errorResponse = handleErrorResponse.handle(error);
      response.status(StatusCodes.OK).json(errorResponse);
    }
  },

  getRolesByCompanyId: async (request: Request, response: Response) => {
    try {
      InputValidator.validateCompanyIdQuery(request.query);
      const companyId = request.query.companyId as string;
      const roles = await roleService.getRolesByCompanyId(companyId);
      const successResponse = createResponse(roles);
      response.status(StatusCodes.OK).json(successResponse);
    } catch (error: any) {
      const errorResponse = handleErrorResponse.handle(error);
      response.status(StatusCodes.OK).json(errorResponse);
    }
  },

  deleteRole: async (request: Request, response: Response) => {
    try {
      InputValidator.validateRoleIdQuery(request.query);
      const roleId = request.query.roleId as string;

      await getRoleById(roleId);

      await existingUser(roleId);

      await roleService.deleteRole(roleId);
      const successResponse = createResponse(
        StatusCodes.OK,
        messageConstants.role.ROLE_PERMISSIONS_DELETED
      );
      return response.status(StatusCodes.OK).json(successResponse);
    } catch (error: any) {
      const errorResponse = handleErrorResponse.handle(error);
      response.status(StatusCodes.OK).json(errorResponse);
    }
  },

  getRolePermissions: async (request: Request, response: Response) => {
    try {
      InputValidator.validateRoleIdQuery(request.query);
      const roleId = request.query.roleId as string;

      await getRoleById(roleId);
      const permissions = await permissionService.getAllPermissions(roleId);
      const rolePermissions = await Promise.all(
        permissions.map(async (permission) => {
          const modulemaster = await moduleMasterService.getModuleById(
            permission.moduleId
          );
          if (modulemaster) {
            return {
              moduleId: modulemaster.moduleId,
              moduleName: modulemaster.moduleName,
              actions: {
                create: permission.create,
                read: permission.read,
                update: permission.update,
                delete: permission.delete,
              },
            };
          } else {
            return null;
          }
        })
      );
      const successResponse = createResponse({
        permissions: rolePermissions,
      });
      response.status(StatusCodes.OK).json(successResponse);
    } catch (error: any) {
      const errorResponse = handleErrorResponse.handle(error);
      response.status(StatusCodes.OK).json(errorResponse);
    }
  },

  updateRole: async (request: Request, response: Response) => {
    try {
      InputValidator.validateUpdateRoleQuery(request.body);

      const { roleId, name: roleName, permissions } = request.body;

      const role = await getRoleById(roleId);
      role.name = roleName;
      await roleService.updateRole(role, roleId);
      if (permissions && permissions.length > 0) {
        for (const permission of permissions) {
          const { moduleId, actions } = permission;
          const module = await moduleMasterService.getModuleById(moduleId);
          if (!module) {
            throw new DataValidationError(
              `Module with ID ${moduleId} not found`
            );
          }
          const existingPermission = await permissionService.findPermission(
            roleId,
            moduleId
          );
          if (existingPermission) {
            const existingPermissionUpdate = {
              create: existingPermission.create,
              read: existingPermission.read,
              update: existingPermission.update,
              deletePermission: existingPermission.delete,
              permissionId: existingPermission.permissionId,
              updatedAt: new Date(),
            };
            await permissionService.updateExistingPermission(
              actions,
              existingPermissionUpdate
            );
          } else {
            const permissionItemsData = {
              create: actions.create,
              read: actions.read,
              update: actions.update,
              delete: actions.delete,
              roleId: role.roleId,
              moduleId: module.moduleId,
              updatedAt: new Date(),
              permissionId: uuidv4(),
            };
            const permissionItems: IPermission =
              permissionItemsData as IPermission;
            await permissionService.createPermission(permissionItems);
          }
        }
      }
      const successResponse = createResponse(messageConstants.role.ROLE_UPDATE);
      response.status(StatusCodes.OK).json(successResponse);
    } catch (error: any) {
      const errorResponse = handleErrorResponse.handle(error);
      response.status(StatusCodes.OK).json(errorResponse);
    }
  },
};
