import { existingRole, existingUser, getRoleById } from '../../src/services/common.service';
import roles, { IRole } from '../../src/models/roles';
import { DataValidationError } from '../../src/ExceptionHandler/DatabaseValidationError';
import UserDetails from '../../src/models/UserDetails';
import { messageConstants } from '../../src/constants/messageConstants';

jest.mock('../../src/models/roles');
jest.mock('../../src/models/UserDetails');
jest.mock('../../src/ExceptionHandler/DatabaseValidationError');

describe('Role Service', () => {
  describe('existingRole', () => {
    it('should call DataValidationError if the role exists', async () => {
      const roleData: IRole = {
        roleId: 'role1',
        name: 'Admin',
        companyId: 'company1',
        updatedAt: new Date(),
      } as IRole;
  
      (roles.findOne as jest.Mock).mockResolvedValueOnce(roleData);
  
      try {
        await existingRole(roleData);
        fail('Expected existingRole to throw DataValidationError');
      } catch (error:any) {
        expect(error).toBeInstanceOf(DataValidationError);
        expect(DataValidationError).toHaveBeenCalled();
      }
    });

    it('should not throw an error if the role does not exist', async () => {
      const roleData: IRole = {
        roleId: 'role1',
        name: 'Admin',
        companyId: 'company1',
        updatedAt: new Date(),
      }as IRole;
      (roles.findOne as jest.Mock).mockResolvedValueOnce(null);

      await expect(existingRole(roleData)).resolves.not.toThrow();
    });
  });

  describe('getRoleById', () => {
    it('should return the role if found', async () => {
      const roleId = 'role1';
      const roleResponse = { roleId: 'role1', name: 'Admin', companyId: 'company1' };
      (roles.findOne as jest.Mock).mockResolvedValueOnce(roleResponse);

      const result = await getRoleById(roleId);
      expect(result).toEqual(roleResponse);
    });
    
    it('should call DataValidationError if the role is not found', async () => {
      const roleId = 'role1';
      (roles.findOne as jest.Mock).mockResolvedValueOnce(null);

      try {
        await getRoleById(roleId);
      } catch (error: any) {
        expect(error).toBeInstanceOf(DataValidationError);
        expect(DataValidationError).toHaveBeenCalled();
      }
    });
  });

  describe('existingUser', () => {
    it('should call DataValidationError if the user with the given roleId exists', async () => {
      const roleId = 'role1';
      const userData = { roleId: 'role1', name: 'John Doe' };
  
      (UserDetails.findOne as jest.Mock).mockResolvedValueOnce(userData);
  
      try {
        await existingUser(roleId);
        fail('Expected existingUser to throw DataValidationError');
      } catch (error: any) {
        expect(error).toBeInstanceOf(DataValidationError);
        expect(DataValidationError).toHaveBeenCalledWith(messageConstants.userData.BEFORE_DELETE_ROLE);
      }
    });

    it('should not throw an error if the user with the given roleId does not exist', async () => {
      const roleId = 'role1';
      (UserDetails.findOne as jest.Mock).mockResolvedValueOnce(null);

      await expect(existingUser(roleId)).resolves.not.toThrow();
    });
  });
});
