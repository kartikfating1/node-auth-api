import { v4 as uuidv4 } from 'uuid';

interface RoleItemsData {
    roleId: string;
    name: string;
    companyId: string;
    updatedAt: Date;
}

export function buildRoleData(roleData: { name: string; companyId: string }): RoleItemsData {
    return {
        roleId: uuidv4(),
        name: roleData.name,
        companyId: roleData.companyId,
        updatedAt: new Date()
    };
}
