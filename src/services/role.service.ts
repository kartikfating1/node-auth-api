import RoleModel, { IRole } from "../models/roles";
import { DatabaseError } from "../ExceptionHandler/DatabaseValidationError";
import roles from "../models/roles";
import customLogger from '../config/logger';
import { messageConstants } from "../constants/messageConstants";
import { buildRoleData } from "../helpers/roleDataBuilder";
import { permissionService } from "./permission.service";
import { DataValidationError } from "../ExceptionHandler/DatabaseValidationError";
const logger = customLogger();

export const roleService = {
  createRole: async (roleData: IRole) => {
    try {
      return await RoleModel.create(buildRoleData(roleData));
    } catch (error) {
      logger.error(messageConstants.roleService.CREATE_ROLE_ERR + error)
      throw new DatabaseError(error as string);
    }
  },
  getRolesByCompanyId: async (companyId: string) => {
    try {
      return await roles.find({ companyId: companyId });
    } catch (error) {
      logger.error(messageConstants.roleService.GET_ROLE_ERR + error)
      throw new DatabaseError(error as string);
    }
  },
  getRoleByName: async (roleName: string) => {
    try {
      return await roles.findOne({ name: roleName });
    } catch (error) {
      logger.error(messageConstants.roleService.GET_ROLE_ERR + error);
      throw new DatabaseError(error as string);
    }
  },  
  deleteRole: async (roleId: string) => {
    try {
      const existingPermissions = await permissionService.getAllPermissions(roleId)
      const permissionIds = existingPermissions.map(permission => permission.permissionId);
      const permissionResponse = await permissionService.deletePermission(permissionIds);

      if (!permissionResponse.acknowledged || permissionResponse.deletedCount !== permissionIds.length) {
        throw new DataValidationError(messageConstants.role.FAILED_TO_DELETE_MODULE_PERMISSIONS);
      }
      const roleDeleteResponse = await roles.deleteOne({ roleId: roleId });

      if (!roleDeleteResponse.acknowledged || roleDeleteResponse.deletedCount !== 1) {
        throw new DataValidationError(messageConstants.role.FAILED_TO_DELETE_ROLE);
      }

      return roleDeleteResponse;
    } catch (error) {
      logger.error(messageConstants.roleService.DELETE_ROLE_ERR + error)
      throw new DatabaseError(error as string);
    }
  },
  updateRole: async (role: IRole, roleId: string) => {
    try {
      const filter = { roleId: roleId };
      const updateDocument = {
        $set: {
          name: role.name,
        },
      };
      return roles.updateOne(filter, updateDocument);
    } catch (error) {
      logger.error(messageConstants.roleService.UPDATE_ROLE_ERR + error)
      throw new DatabaseError(error as string);
    }
  }
};
