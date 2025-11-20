interface RoutePermissions {
    [key: string]: { method: string; action: string; moduleId: string };
}
  
export const permissionsConfig: RoutePermissions = {
    "/createRole": { method: "POST", action: "create", moduleId: "1" },
    "/getRolePermissions": { method: "GET", action:"read", moduleId: "1"},
    "/updateRole/:roleId": { method: "PUT", action: "update", moduleId: "1" },
    "/deleteRole/:roleId": { method: "DELETE", action: "delete", moduleId: "1" },
};
  