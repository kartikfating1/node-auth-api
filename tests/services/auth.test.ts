import jwt from 'jsonwebtoken';
import { authService } from '../../src/services/auth.service';
import { messageConstants } from '../../src/constants/messageConstants';
import UserDetails, { IUserDetails } from '../../src/models/UserDetails';
import Permissions, { IPermission } from '../../src/models/permissions';
import Role from '../../src/models/roles';
import customLogger from '../../src/config/logger';
import { StatusCodes } from 'http-status-codes';

jest.mock('jsonwebtoken');
jest.mock('../../src/models/UserDetails');
jest.mock('../../src/models/permissions');
jest.mock('../../src/models/roles');
jest.mock('../../src/config/logger', () => {
  return jest.fn().mockReturnValue({
    info: jest.fn(),
    error: jest.fn(),
  });
});

const logger = customLogger();

describe('authService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getToken', () => {
    it('should return token and user details with permissions', async () => {
      const mockUser: IUserDetails = {
        userId: 'user1',
        roleId: 'role1',
        username: 'testuser',
        companyDetailId: 'company1',
        profilephoto: '',
      } as IUserDetails;

      const mockPermissions: IPermission[] = [{
        moduleId: 'module1',
        create: true,
        read: true,
        update: true,
        delete: true,
        roleId: 'role1'
      }] as IPermission[];

      const mockRole = { name: 'Admin' };

      (jwt.sign as jest.Mock).mockReturnValue('testToken');
      (Permissions.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockPermissions),
      });
      (Role.findOne as jest.Mock).mockResolvedValue(mockRole);

      const result = await authService.getToken(mockUser);

      expect(result).toEqual({
        id: mockUser.userId,
        username: mockUser.username,
        companyDetailId: mockUser.companyDetailId,
        profilephoto: '',
        role: mockRole.name,
        accessToken: 'testToken',
        permissions: [{
          moduleId: 'module1',
          actions: {
            create: true,
            read: true,
            update: true,
            delete: true,
          },
        }],
      });
    });

    it('should throw an error if role not found', async () => {
      const mockUser: IUserDetails = {
        userId: 'user1',
        roleId: 'role1',
        username: 'testuser',
        companyDetailId: 'company1',
        profilephoto: '',
      } as IUserDetails;

      (Permissions.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue([]),
      });
      (Role.findOne as jest.Mock).mockResolvedValue(null);

      await expect(authService.getToken(mockUser)).rejects.toThrow(messageConstants.authService.ROLE_FETCH_ERR);
    //   expect(logger.error).toHaveBeenCalledWith(messageConstants.authService.TOKEN_ERR + messageConstants.authService.ROLE_FETCH_ERR);
    });
  });

  describe('login', () => {
    // it('should return token on valid user', async () => {
    //   const mockUser: IUserDetails = {
    //     userId: 'user1',
    //     roleId: 'role1',
    //     username: 'testuser',
    //     companyDetailId: 'company1',
    //     profilephoto: '',
    //   } as IUserDetails;

    //   (UserDetails.findOne as jest.Mock).mockResolvedValue(mockUser);
    //   const getTokenSpy = jest.spyOn(authService, 'getToken').mockResolvedValue('testToken');

    //   const result = await authService.login('testuser');

    //   expect(getTokenSpy).toHaveBeenCalledWith(mockUser);
    //   expect(result).toBe('testToken');
    // });

    it('should return error if user not found', async () => {
      (UserDetails.findOne as jest.Mock).mockResolvedValue(null);

      const result = await authService.login('testuser');

      expect(result).toEqual(new Error(messageConstants.authService.NO_USER));
    });
  });

  describe('verifyTokenAndMatchIds', () => {
    it('should return validated status on valid token', async () => {
      const mockTokenPayload = { userId: 'user1', roleId: 'role1' };
      const mockUser: IUserDetails = {
        userId: 'user1',
        roleId: 'role1',
        username: 'testuser',
        companyDetailId: 'company1',
        profilephoto: '',
      } as IUserDetails;

      (jwt.verify as jest.Mock).mockReturnValue(mockTokenPayload);
      (UserDetails.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.verifyTokenAndMatchIds('testToken');

      expect(result).toEqual({ status: StatusCodes.OK, message: messageConstants.authService.VALIDATED });
    });

    it('should return unauthorized status on invalid token', async () => {
      const mockError = new Error('Invalid token');
      (jwt.verify as jest.Mock).mockImplementation(() => { throw mockError; });

      const result = await authService.verifyTokenAndMatchIds('invalidToken');

      expect(result).toEqual({ status: StatusCodes.UNAUTHORIZED, message: messageConstants.Auth.UNAUTHORIZED });
      expect(logger.error).toHaveBeenCalledWith(messageConstants.authService.VERIFY_ERR + mockError);
    });

    it('should return unauthorized status if user not found', async () => {
      const mockTokenPayload = { userId: 'user1', roleId: 'role1' };
      (jwt.verify as jest.Mock).mockReturnValue(mockTokenPayload);
      (UserDetails.findOne as jest.Mock).mockResolvedValue(null);

      const result = await authService.verifyTokenAndMatchIds('testToken');

      expect(result).toEqual({ status: StatusCodes.UNAUTHORIZED, message: messageConstants.Auth.UNAUTHORIZED });
      expect(logger.error).toHaveBeenCalledWith(messageConstants.authService.VERIFY_ERR + new Error(messageConstants.authService.NO_USER));
    });
  });
});
