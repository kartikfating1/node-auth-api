import { permissionService } from '../../src/services/permission.service'
import { DatabaseError } from '../../src/ExceptionHandler/DatabaseValidationError'
import { IPermission } from '../../src/models/permissions'
import permissions from '../../src/models/permissions'
import customLogger from '../../src/config/logger'
import { messageConstants } from '../../src/constants/messageConstants'

jest.mock('../../src/models/permissions')
jest.mock('../../src/config/logger', () => {
    return jest.fn().mockReturnValue({
        error: jest.fn(),
    })
})
const logger = customLogger()

describe('permissionService', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('createPermission', () => {
        it('should create a permission successfully', async () => {
            const permissionData: IPermission = {
                roleId: 'role1',
                moduleId: 'module1',
                create: true,
                read: true,
                update: true,
                delete: true,
            } as IPermission;
            permissions.create = jest.fn().mockResolvedValue(permissionData)

            const result = await permissionService.createPermission(permissionData)

            expect(result).toEqual(permissionData)
            expect(permissions.create).toHaveBeenCalledWith(permissionData)
        })

        it('should throw a DatabaseError when creation fails', async () => {
            const error = new Error('Creation failed')
            permissions.create = jest.fn().mockRejectedValue(error)

            await expect(permissionService.createPermission({} as IPermission)).rejects.toThrow(DatabaseError)
            expect(logger.error).toHaveBeenCalledWith(messageConstants.permission.CREATE_PERM_ERR + error)
        })
    })

    describe('deletePermission', () => {
        it('should delete permissions successfully', async () => {
            const permissionIds = ['perm1', 'perm2']
            const deleteResult = { deletedCount: 2 }
            permissions.deleteMany = jest.fn().mockResolvedValue(deleteResult)

            const result = await permissionService.deletePermission(permissionIds)

            expect(result).toEqual(deleteResult)
            expect(permissions.deleteMany).toHaveBeenCalledWith({ permissionId: { $in: permissionIds } })
        })

        it('should throw a DatabaseError when deletion fails', async () => {
            const error = new Error('Deletion failed')
            permissions.deleteMany = jest.fn().mockRejectedValue(error)

            await expect(permissionService.deletePermission(['perm1'])).rejects.toThrow(DatabaseError)
            expect(logger.error).toHaveBeenCalledWith(messageConstants.permission.DELETE_PERM_ERR + error)
        })
    })

    describe('getAllPermissions', () => {
        it('should return all permissions for a role', async () => {
            const roleId = 'role1'
            const permissionData: IPermission[] = [
                { roleId: 'role1', moduleId: 'module1', create: true, read: true, update: true, delete: true },
            ] as IPermission[]
            permissions.find = jest.fn().mockResolvedValue(permissionData)

            const result = await permissionService.getAllPermissions(roleId)

            expect(result).toEqual(permissionData)
            expect(permissions.find).toHaveBeenCalledWith({ roleId })
        })

        it('should throw a DatabaseError when retrieval fails', async () => {
            const error = new Error('Retrieval failed')
            permissions.find = jest.fn().mockRejectedValue(error)

            await expect(permissionService.getAllPermissions('role1')).rejects.toThrow(DatabaseError)
            expect(logger.error).toHaveBeenCalledWith(messageConstants.permission.GET_PERM_ERR + error)
        })
    })

    describe('findPermission', () => {
        it('should find a permission by roleId and moduleId', async () => {
            const roleId = 'role1'
            const moduleId = 'module1'
            const permissionData = { roleId, moduleId, create: true, read: true, update: true, delete: true } as IPermission;
            permissions.findOne = jest.fn().mockResolvedValue(permissionData)

            const result = await permissionService.findPermission(roleId, moduleId)

            expect(result).toEqual(permissionData)
            expect(permissions.findOne).toHaveBeenCalledWith({ roleId, moduleId })
        })

        it('should throw a DatabaseError when retrieval fails', async () => {
            const error = new Error('Retrieval failed')
            permissions.findOne = jest.fn().mockRejectedValue(error)

            await expect(permissionService.findPermission('role1', 'module1')).rejects.toThrow(DatabaseError)
            expect(logger.error).toHaveBeenCalledWith(messageConstants.permission.FIND_PERM_ERR + error)
        })
    })

    describe('updateExistingPermission', () => {
        it('should update an existing permission successfully', async () => {
            const actions = { create: false, read: false, update: false, delete: false }
            const existingPermission = { permissionId: 'perm1', roleId: 'role1', moduleId: 'module1' }
            const updateResult = { modifiedCount: 1 }
            permissions.updateOne = jest.fn().mockResolvedValue(updateResult)

            const result = await permissionService.updateExistingPermission(actions, existingPermission)

            expect(result).toEqual(updateResult)
            expect(permissions.updateOne).toHaveBeenCalledWith(
                { permissionId: existingPermission.permissionId },
                { $set: actions }
            )
        })

        it('should throw a DatabaseError when update fails', async () => {
            const actions = { create: false, read: false, update: false, delete: false }
            const existingPermission = { permissionId: 'perm1', roleId: 'role1', moduleId: 'module1' }
            const error = new Error('Update failed')
            permissions.updateOne = jest.fn().mockRejectedValue(error)

            await expect(permissionService.updateExistingPermission(actions, existingPermission)).rejects.toThrow(DatabaseError)
            expect(logger.error).toHaveBeenCalledWith(messageConstants.permission.UPDATE_PERM_ERR + error)
        })
    })
})
