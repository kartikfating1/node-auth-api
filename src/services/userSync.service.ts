import { v4 as uuidv4 } from "uuid";
import { roleService } from "../services/role.service";
import { permissionService } from "../services/permission.service";
import { moduleMasterService } from "../services/moduleMaster.service";
import UserDetails, { IUserDetails } from '../models/UserDetails';
import { IRole } from "../models/roles";
import { IPermission } from "../models/permissions";
import { messageConstants } from "../constants/messageConstants";
import customLogger from '../config/logger';
import { createErrorResponse, createSuccessResponse } from "../helpers/response";
import { appConstants } from "../constants/appConstants";
import { StatusCodes } from "http-status-codes";
import { DatabaseError } from "../ExceptionHandler/DatabaseValidationError";
const logger = customLogger();

export const userSyncService = {

  createAdminRole: async (companyId: string, userId: string, username: string) => {
    try {
      const existingUser = await UserDetails.findOne({ username: username });
      if (existingUser) {
        const errorResponse = createErrorResponse(StatusCodes.BAD_REQUEST, messageConstants.userData.USER_EXISTS)
        return errorResponse;
      }

      const roleItemsData = {
        roleId: uuidv4(),
        name: appConstants.userSync.ADMIN,
        companyId: companyId,
        updatedAt: new Date(),
      };
      const roleItems: IRole = roleItemsData as IRole;
      const createdRole = await roleService.createRole(roleItems);
  
      const modules = await moduleMasterService.getAllModules();
      for (const module of modules) {
        const permissionItemsData = {
          permissionId: uuidv4(),
          create: !(module.moduleId === messageConstants.module.THREE || module.moduleId === messageConstants.module.SIX),
          read: !(module.moduleId === messageConstants.module.THREE || module.moduleId === messageConstants.module.SIX),
          update: !(module.moduleId === messageConstants.module.THREE || module.moduleId === messageConstants.module.SIX),
          delete: !(module.moduleId === messageConstants.module.THREE || module.moduleId === messageConstants.module.SIX),
          roleId: createdRole.roleId,
          moduleId: module.moduleId,
          updatedAt: new Date(),
        };
        const permissionItems: IPermission = permissionItemsData as IPermission;
        await permissionService.createPermission(permissionItems);
      }
  
      const userData = {
        roleId: createdRole.roleId,
        username: username,
        companyId: companyId,
        userId: userId,
        updatedAt: new Date(),
      };
      const userD: IUserDetails = userData as unknown as IUserDetails;
      await UserDetails.create(userD);
      const successResponse = createSuccessResponse({message:messageConstants.userData.ADMIN_DATA});
      return successResponse;

    } catch (error) {
      logger.error(messageConstants.roleController.ROLE_CREATE_ERR + error);
      const errorResponse = createErrorResponse(StatusCodes.INTERNAL_SERVER_ERROR, messageConstants.userSync.USER_SYNC_ERR)
      return errorResponse;
    }
  },

  UserDetailsSync: async (userId: string, username: string, roleId: string, companyId: string) => {
    const existingUser = await UserDetails.findOne({ username: username });
    if (existingUser) {
      const errorResponse = createErrorResponse(StatusCodes.BAD_REQUEST, messageConstants.userData.USER_EXISTS)
      return errorResponse;
    }

    try {
      const userData = {
        roleId: roleId,
        username: username,
        companyId: companyId,
        userId: userId,
        updatedAt: new Date(),
      };
      const userID: IUserDetails = userData as unknown as IUserDetails;
      await UserDetails.create(userID);

      const successResponse = createSuccessResponse({message:messageConstants.userDetails.SYNC_SUCCESS});
      return successResponse;
    } catch (error) {
        logger.error(messageConstants.userSync.USER_SYNC_ERR + error);
        const errorResponse = createErrorResponse(StatusCodes.INTERNAL_SERVER_ERROR, messageConstants.userSync.USER_SYNC_ERR)
        return errorResponse;
    }
  },

  getUsers: async () => {
    try {
      return await UserDetails.find();
    } catch (error) {
      throw new DatabaseError(error as string);
    }
  },
}
