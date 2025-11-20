import { Request, Response, NextFunction } from "express";
import axios from "axios";
import { StatusCodes } from "http-status-codes";
import jwt, { JwtPayload } from "jsonwebtoken";
import { messageConstants } from "../constants/messageConstants";
import dotenv from "dotenv";
import config from "../config/auth.config";
import { permissionsConfig } from "../config/permission.config";

dotenv.config();

const getBaseURL = () => {
  let baseUrl = "";
  switch (process.env.NODE_ENV) {
    case "staging":
      baseUrl = process.env.STAG_AUTH_URL ?? "";
      break;
    case "production":
      baseUrl = process.env.PROD_AUTH_URL ?? "";
      break;
    case "dev":
      baseUrl = process.env.DEV_AUTH_URL ?? "";
      break;
  }
  return baseUrl;
};
const BASE_URL = getBaseURL();

interface DecodedToken {
  userId: string;
  roleId: string;
  permissions: {
    moduleId: string;
    actions: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
    };
  }[];
}

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["authorization"];

  if (!token) {
    // Skip token validation and allow request to continue
    return next();
  }

  try {
    const tokenParts = token.split(" ");
    if (tokenParts.length !== 2) {
      throw new Error("Invalid token format");
    }
    const actualToken = tokenParts[1];

    const decodedToken: JwtPayload = jwt.verify(actualToken, config.secret) as JwtPayload;
    const { permissions } = decodedToken as DecodedToken;

    const routeConfig = permissionsConfig[req.route.path as keyof typeof permissionsConfig];

    if (routeConfig && routeConfig.method === req.method) {
      const { action, moduleId } = routeConfig;

      const modulePermissions = permissions.find(
        (perm) => perm.moduleId === moduleId
      );
      if (
        !modulePermissions ||
        !modulePermissions.actions[action as keyof typeof modulePermissions.actions]
      ) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ status: "False", message: "Unauthorized" });
      }
    }

    next();
  } catch (error) {
    // If token is invalid, still skip or optionally block
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ status: "False", message: "Invalid Token" });
  }
};

// const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
//   const token = req.headers["authorization"];

//   if (!token) {
//     return res
//       .status(StatusCodes.FORBIDDEN)
//       .send({ message: messageConstants.MiddleWare.SIGN_IN });
//   }

//   try {
//     await axios
//       .post(
//         `${BASE_URL}/protect`,
//         { authHeader: token },
//         { headers: { authorization: token } }
//       )
//       .then(function (response) {
//         if (response.data.message == "Token Verified And IDs Matched") {
//           const routeConfig =
//             permissionsConfig[req.route.path as keyof typeof permissionsConfig];

//           if (routeConfig && routeConfig.method === req.method) {
//             const { action, moduleId } = routeConfig;

//             try {
//               const tokenParts = token.split(" ");
//               if (tokenParts.length !== 2) {
//                 throw new Error("Invalid token format");
//               }
//               const actualToken = tokenParts[1];
//               const decodedToken: JwtPayload = jwt.verify(
//                 actualToken,
//                 config.secret
//               ) as JwtPayload;

//               const { permissions } = decodedToken as DecodedToken;

//               const modulePermissions = permissions.find(
//                 (perm) => perm.moduleId === moduleId
//               );
//               if (
//                 !modulePermissions ||
//                 !modulePermissions.actions[
//                   action as keyof typeof modulePermissions.actions
//                 ]
//               ) {
//                 return res
//                   .status(StatusCodes.UNAUTHORIZED)
//                   .json({ status: "False", message: "Unauthorized" });
//               }
//             } catch (jwtError) {
//               return res
//                 .status(StatusCodes.UNAUTHORIZED)
//                 .json({ status: "False", message: "Invalid Token" });
//             }
//           }
//           next();
//         } else {
//           res
//             .status(StatusCodes.UNAUTHORIZED)
//             .json({ status: "False", message: "Unauthorized" });
//         }
//       })
//       .catch(function (error) {
//         res
//           .status(StatusCodes.FORBIDDEN)
//           .json({ status: "False", message: "Authentication Failed" });
//       });
//   } catch (error) {
//     res
//       .status(StatusCodes.INTERNAL_SERVER_ERROR)
//       .json({ message: "Error in token validation: " + error });
//   }
// };

const authJwt = {
  verifyToken: verifyToken,
};
export default authJwt;
