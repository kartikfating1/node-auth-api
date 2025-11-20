import express from "express";
import { roleController } from "../controller/role.controller";
import authJwt from "../middleware/awthJwt";

const getEnvironment = (): string => {
  switch (process.env.NODE_ENV) {
    case "staging":
      return "/qa";
    case "production":
      return "";
    case "dev":
    case "development":
      return "/dev";
    default:
      return "/dev";
  }
};

const authBasePath = `${getEnvironment()}/auth`;
export const roleRoutes = (app: express.Application) => {
  app.use(express.json());

  /**
   * @typedef {object} RoleAction
   * @property {boolean} create - The create permission
   * @property {boolean} read - The read permission
   * @property {boolean} update - The update permission
   * @property {boolean} delete - The delete permission
   */

  /**
   * @typedef {object} RolePermission
   * @property {string} moduleId - The module ID
   * @property {RoleAction} actions - The actions
   */

  /**
   * @typedef {object} RoleInput
   * @property {string} companyId - The company ID
   * @property {string} name - The role name
   * @property {RolePermission[]} permissions - The permissions array
   */

  /**
   * @typedef {object} UpdateRoleInput
   * @property {RolePermission[]} permissions - The permissions array
   */

  /**
   * POST /createRole
   * @summary Create user role
   * @param {RoleInput} request.body.required - Role input data
   * @tags Role
   * @example request - Create Role example
   * {
   *   "companyId": "123",
   *   "name": "Manager",
   *   "permissions": [
   *     {
   *       "moduleId": "1",
   *       "actions": {
   *         "create": true,
   *         "read": true,
   *         "update": true,
   *         "delete": true
   *       }
   *     },
   *     {
   *       "moduleId": "2",
   *       "actions": {
   *         "create": true,
   *         "read": true,
   *         "update": false,
   *         "delete": false
   *       }
   *     }
   *   ]
   * }
   * @security BearerAuth
   * @return {object} 200 - Success Response
   * @return {object} 400 - Bad Request
   * @return {object} 401 - Unauthorized Request
   * @return {object} 500 - Internal Server Error
   */
  app.post(
    `${authBasePath}/createRole`,
    [authJwt.verifyToken],
    roleController.createRole
  );

  /**
   * GET /getRolesByCompanyId
   * @summary Get user role by company id.
   * @tags Role
   * @security BearerAuth
   * @param {string} companyId.query.required - Company ID
   * @return {object} 200 - Success Response
   * @return {object} 500 - Internal Server Error
   * @return {object} 400 - Bad Request
   * @return {object} 401 - Unauthorised Request
   */
  app.get(
    `${authBasePath}/getRolesByCompanyId`,
    [authJwt.verifyToken],
    roleController.getRolesByCompanyId
  );

  /**
   * DELETE /deleteRole
   * @summary Delete user role
   * @tags Role
   * @security BearerAuth
   * @param {string} roleId.query.required - Role ID
   * @return {object} 200 - Success Response
   * @return {object} 500 - Internal Server Error
   * @return {object} 400 - Bad Request
   * @return {object} 401 - Unauthorised Request
   */
  app.delete(
    `${authBasePath}/deleteRole`,
    [authJwt.verifyToken],
    roleController.deleteRole
  );

  /**
   * PUT /updateRole
   * @summary Update user role
   * @param {string} roleId.query.required - Role ID
   * @param {string} name.query.required - Role name
   * @param {UpdateRoleInput} request.body.required - Role update data
   * @example request - Update Role Example
   * {
   *   "permissions": [
   *     {
   *       "moduleId": "1",
   *       "actions": {
   *         "create": true,
   *         "read": true,
   *         "update": true,
   *         "delete": false
   *       }
   *     },
   *     {
   *       "moduleId": "3",
   *       "actions": {
   *         "create": true,
   *         "read": true,
   *         "update": true,
   *         "delete": true
   *       }
   *     },
   *     {
   *       "moduleId": "4",
   *       "actions": {
   *         "create": true,
   *         "read": true,
   *         "update": true,
   *         "delete": true
   *       }
   *     },
   *     {
   *       "moduleId": "5",
   *       "actions": {
   *         "create": true,
   *         "read": true,
   *         "update": true,
   *         "delete": false
   *       }
   *     },
   *     {
   *       "moduleId": "6",
   *       "actions": {
   *         "create": true,
   *         "read": true,
   *         "update": true,
   *         "delete": true
   *       }
   *     },
   *     {
   *       "moduleId": "7",
   *       "actions": {
   *         "create": true,
   *         "read": true,
   *         "update": true,
   *         "delete": false
   *       }
   *     }
   *   ]
   * }
   * @tags Role
   * @security BearerAuth
   * @return {object} 200 - Success Response
   * @return {object} 400 - Bad Request
   * @return {object} 401 - Unauthorized Request
   * @return {object} 500 - Internal Server Error
   */
  app.put(
    `${authBasePath}/updateRole`,
    [authJwt.verifyToken],
    roleController.updateRole
  );

  /**
   * GET /getRolePermissions
   * @summary Get role permissions
   * @tags Role
   * @security BearerAuth
   * @param {string} roleId.query.required - Role ID
   * @return {object} 200 - Success Response
   * @return {object} 500 - Internal Server Error
   * @return {object} 400 - Bad Request
   * @return {object} 401 - Unauthorised Request
   */
  app.get(
    `${authBasePath}/getRolePermissions`,
    [authJwt.verifyToken],
    roleController.getRolePermissions
  );
};
