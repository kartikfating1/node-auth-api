import roles, { IRole } from "../models/roles";
import { DataValidationError } from "../ExceptionHandler/DatabaseValidationError";
import { messageConstants } from "../constants/messageConstants";
import UserDetails from "../models/UserDetails";

export const existingRole = async (roleData: IRole) => {
    const response = await roles.findOne({ $and: [{ companyId: roleData.companyId }, { name: roleData.name }] });
    if (response) {
        throw new DataValidationError(messageConstants.role.ROLE_EXIST);
    }
}

export const getRoleById = async (roleId: any) => {
    const response = await roles.findOne({ roleId: roleId });
    if (!response) {
        throw new DataValidationError(messageConstants.role.ROLE_NOT_FOUND);
    } else {
        return response;
    }
}
export const existingUser = async (roleId: any) => {
    const response = await UserDetails.findOne({ roleId: roleId });
    if (response) {
        throw new DataValidationError(messageConstants.userData.BEFORE_DELETE_ROLE);
    }
}

