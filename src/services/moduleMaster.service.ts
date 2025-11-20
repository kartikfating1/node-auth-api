import { DatabaseError } from "../ExceptionHandler/DatabaseValidationError";
import Modulemasters, {
  IModuleMaster,
} from "../models/modulemasters";
import customLogger from '../config/logger';
import { messageConstants } from "../constants/messageConstants";
const logger = customLogger();

export const moduleMasterService = {
  getModuleById: async (moduleId: string): Promise<IModuleMaster | null> => {
    try {
      return await Modulemasters.findOne({ moduleId: moduleId });
    } catch (error) {
      logger.error(messageConstants.module.GET_MODULE_ERR + error)
      throw new DatabaseError(error as string);
    }
  },

  getAllModules: async () => {
    try {
      return await Modulemasters.find();
    } catch (error) {
      logger.error(messageConstants.module.GET_ALL_MODULE_ERR + error)
      throw new DatabaseError(error as string);
    }
  },

  createModule: async (moduleData: IModuleMaster) => {
    try {
      return await Modulemasters.create(moduleData);
    } catch (error) {
      logger.error(messageConstants.module.CREATE_MODULE_ERR + error)
      throw new DatabaseError(error as string);
    }
  },
};
