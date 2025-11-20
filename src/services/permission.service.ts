
import { DatabaseError } from "../ExceptionHandler/DatabaseValidationError";
import  { IPermission } from "../models/permissions";
import permissions from "../models/permissions";
import customLogger from '../config/logger';
import { messageConstants } from "../constants/messageConstants";
const logger = customLogger();

export const permissionService = {
  createPermission: async (responseData: IPermission) => {
    try {
      return  await permissions.create(responseData);
    } catch (error) {
      logger.error( messageConstants.permission.CREATE_PERM_ERR + error)
      throw new DatabaseError(error as string);
    }
  },
  deletePermission: async (permissionIds: string[]) => {
    try {
      const result = await permissions.deleteMany({ permissionId: { $in: permissionIds } });
    return result;
    } catch (error) {
      logger.error( messageConstants.permission.DELETE_PERM_ERR + error)
      throw new DatabaseError(error as string);
    }
  },
  getAllPermissions: async (roleId: string): Promise<IPermission[]> => {
    try {
      return await permissions.find({ roleId: roleId });
    } catch (error) {
      logger.error( messageConstants.permission.GET_PERM_ERR + error)
      throw new DatabaseError(error as string);
    }
  },
  findPermission: async (roleId: string, moduleId: string) => {
    try {
      return await permissions.findOne({ roleId: roleId, moduleId: moduleId });
    } catch (error) {
      logger.error( messageConstants.permission.FIND_PERM_ERR + error)
      throw new DatabaseError(error as string);
    }
  },
  updateExistingPermission: async (actions: any, existingPermission: any) => {
   try {
     const filter = { permissionId: existingPermission.permissionId};
     const updateDocument = {
       $set: {
         create: actions.create,
         read: actions.read,
         update: actions.update,
         delete: actions.delete,
       },
     };
     return await permissions.updateOne(filter, updateDocument);
   }catch (error) {
     logger.error( messageConstants.permission.UPDATE_PERM_ERR + error)
     throw new DatabaseError(error as string);
   }
   }
};
