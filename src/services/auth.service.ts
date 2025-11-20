import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config/auth.config";
import Permissions, { IPermission } from "../models/permissions";
import Role from "../models/roles";
import { messageConstants } from "../constants/messageConstants";
import UserDetails, { IUserDetails } from "../models/UserDetails";
import { StatusCodes } from "http-status-codes";
import customLogger from "../config/logger";
const logger = customLogger();

interface DecodedToken {
  userId: string;
  roleId: string;
}

export const authService = {
  getToken: async (user: IUserDetails) => {
    const token = jwt.sign(
      { userId: user.userId, roleId: user.roleId },
      config.secret,
      {
        expiresIn: config.jwtExpiration,
      }
    );

    try {
      const permissions: IPermission[] = await Permissions.find({
        roleId: user.roleId,
      }).populate("ModuleMaster");

      const formattedPermissions = permissions
        .map((permission: IPermission | null) => {
          if (permission) {
            return {
              moduleId: permission.moduleId,
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
        .filter((permission: unknown) => permission !== null);

      const role: { name: string } | null = await Role.findOne({
        roleId: user.roleId,
      });

      if (!role) {
        throw new Error(messageConstants.authService.ROLE_FETCH_ERR);
      }
      const token = jwt.sign(
        {
          userId: user.userId,
          roleId: user.roleId,
          permissions: formattedPermissions,
        },
        config.secret,
        {
          expiresIn: config.jwtExpiration,
        }
      );
      return {
        id: user.userId,
        username: user.username,
        companyDetailId: user.companyDetailId,
        profilephoto: user.profilephoto || "",
        role: role.name,
        accessToken: token,
        permissions: formattedPermissions,
      };
    } catch (error) {
      logger.error(messageConstants.authService.TOKEN_ERR + error);
      throw error;
    }
  },

  login: async (username: string) => {
    const user = await UserDetails.findOne({ username: username });
    if (user) {
      const token = await authService.getToken(user);
      return token;
    } else {
      return new Error(messageConstants.authService.NO_USER);
    }
  },

  verifyTokenAndMatchIds: async (tokens: string) => {
    try {
      const decodedToken: JwtPayload = jwt.verify(
        tokens,
        config.secret
      ) as JwtPayload;

      const { userId, roleId } = decodedToken as DecodedToken;

      const user = await UserDetails.findOne({
        userId: userId,
        roleId: roleId,
      });
      if (!user) {
        throw new Error(messageConstants.authService.NO_USER);
      }

      return {
        status: StatusCodes.OK,
        message: messageConstants.authService.VALIDATED,
      };
    } catch (error) {
      logger.error(messageConstants.authService.VERIFY_ERR + error);
      return {
        status: StatusCodes.UNAUTHORIZED,
        message: messageConstants.Auth.UNAUTHORIZED,
      };
    }
  },
};
