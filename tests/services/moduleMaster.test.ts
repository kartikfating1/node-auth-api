import customLogger from '../../src/config/logger';
import { moduleMasterService } from '../../src/services/moduleMaster.service';
import { DatabaseError } from '../../src/ExceptionHandler/DatabaseValidationError';
import Modulemasters, { IModuleMaster } from '../../src/models/modulemasters';
import { messageConstants } from '../../src/constants/messageConstants';

jest.mock('../../src/models/modulemasters');
jest.mock('../../src/config/logger', () => {
  return jest.fn().mockReturnValue({
    info: jest.fn(),
    error: jest.fn(),
  })
})
const logger = customLogger();
describe('Module Master Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getModuleById', () => {
    it('should return module data when found', async () => {
      const mockModuleId = '12345';
      const mockModuleData: IModuleMaster = {
        moduleId: mockModuleId,
      } as IModuleMaster;

      Modulemasters.findOne = jest.fn().mockResolvedValue(mockModuleData);

      const result = await moduleMasterService.getModuleById(mockModuleId);

      expect(Modulemasters.findOne).toHaveBeenCalledWith({ moduleId: mockModuleId });
      expect(result).toEqual(mockModuleData);
    });

    it('should throw a DatabaseError when module is not found', async () => {
      const mockModuleId = '12345';
      const errorMessage = 'Module not found';
    
      Modulemasters.findOne = jest.fn().mockRejectedValue(errorMessage);
    
      await expect(moduleMasterService.getModuleById(mockModuleId)).rejects.toThrow(DatabaseError);
      expect(logger.error).toHaveBeenCalledWith(messageConstants.module.GET_MODULE_ERR + errorMessage);
    });

    it('should throw a DatabaseError on database failure for getModuleById', async () => {
      const mockModuleId = '12345';
      const errorMessage = 'Database failure';
    
      Modulemasters.findOne = jest.fn().mockRejectedValue(errorMessage);
    
      await expect(moduleMasterService.getModuleById(mockModuleId)).rejects.toThrow(DatabaseError);
      expect(logger.error).toHaveBeenCalledWith(messageConstants.module.GET_MODULE_ERR + errorMessage);
    });
  });

  describe('getAllModules', () => {
    it('should throw a DatabaseError on database failure for getAllModules', async () => {
      const errorMessage = 'Database failure';

      Modulemasters.find = jest.fn().mockRejectedValue(errorMessage);

      await expect(moduleMasterService.getAllModules()).rejects.toThrow(DatabaseError);
      expect(logger.error).toHaveBeenCalledWith(messageConstants.module.GET_ALL_MODULE_ERR + errorMessage);
    });
  });

  describe('createModule', () => {
    const mockModuleData: IModuleMaster = {
      moduleId: '12345',
    } as IModuleMaster;

    it('should create a new module successfully', async () => {
      Modulemasters.create = jest.fn().mockResolvedValue(mockModuleData);

      const result = await moduleMasterService.createModule(mockModuleData);

      expect(Modulemasters.create).toHaveBeenCalledWith(mockModuleData);
      expect(result).toEqual(mockModuleData);
    });

    it('should throw a DatabaseError on database failure for createModule', async () => {
      const errorMessage = 'Database failure';
      Modulemasters.create = jest.fn().mockRejectedValue(errorMessage);

      await expect(moduleMasterService.createModule(mockModuleData)).rejects.toThrow(DatabaseError);
      expect(logger.error).toHaveBeenCalledWith(messageConstants.module.CREATE_MODULE_ERR + errorMessage);
    });
  });

  it('should throw a DatabaseError on database failure for getModuleById', async () => {
    const error = new Error('Database failure');
    (Modulemasters.findOne as jest.Mock).mockRejectedValue(error);

    await expect(moduleMasterService.getModuleById('module1')).rejects.toThrow(DatabaseError);
    expect(logger.error).toHaveBeenCalledWith(`${messageConstants.module.GET_MODULE_ERR}${error}`);
  });
  
  it('should throw a DatabaseError on database failure for getAllModules', async () => {
    const error = new Error('Database failure');
    (Modulemasters.find as jest.Mock).mockRejectedValue(error);

    await expect(moduleMasterService.getAllModules()).rejects.toThrow(DatabaseError);
    expect(logger.error).toHaveBeenCalledWith(`${messageConstants.module.GET_ALL_MODULE_ERR}${error}`);
  });

  it('should throw a DatabaseError on database failure for createModule', async () => {
    const error = new Error('Database failure');
    (Modulemasters.create as jest.Mock).mockRejectedValue(error);

    const moduleData: IModuleMaster = { moduleId: 'module1', moduleName: 'Module 1' } as IModuleMaster;
    await expect(moduleMasterService.createModule(moduleData)).rejects.toThrow(DatabaseError);
    expect(logger.error).toHaveBeenCalledWith(`${messageConstants.module.CREATE_MODULE_ERR}${error}`);
  });

  it('should create a module successfully', async () => {
    const moduleData: IModuleMaster = { moduleId: 'module1', moduleName: 'Module 1' } as IModuleMaster;

    (Modulemasters.create as jest.Mock).mockResolvedValue(moduleData);

    const result = await moduleMasterService.createModule(moduleData);

    expect(result).toEqual(moduleData);
  });

  it('should return module data successfully', async () => {
    const sampleModuleData: IModuleMaster = {
      moduleId: 'module1',
      moduleName: 'Module 1',
    } as IModuleMaster;

    (Modulemasters.findOne as jest.Mock).mockResolvedValue(sampleModuleData);

    const result = await moduleMasterService.getModuleById('module1');

    expect(result).toEqual(sampleModuleData);
  });
});
