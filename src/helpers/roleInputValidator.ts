import Joi from "joi";

export class InputValidationError extends Error {
  constructor(message: string | undefined) {
    super(message);
    this.name = "InputValidationError";
  }
}

export class InputValidator {
  static validateSyncAdminUser(value: unknown) {
    const schema = Joi.object({
      companyId: Joi.string().required(),
      userId: Joi.string().required(),
      username: Joi.string().required(),
    });

    const { error } = schema.validate(value, { abortEarly: false });
    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(". ");
      throw new InputValidationError(`Input Validation Error: ${errorMessage}`);
    }
  }

  static validateSyncUser(value: unknown) {
    const schema = Joi.object({
      companyId: Joi.string().required(),
      userId: Joi.string().required(),
      username: Joi.string().required(),
      roleId: Joi.string().required(),
    });
    const { error } = schema.validate(value, { abortEarly: false });
    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(". ");
      throw new InputValidationError(`Input Validation Error: ${errorMessage}`);
    }
  }

  static validateCreateRole(value: unknown) {
    const schema = Joi.object({
      companyId: Joi.string().required(),
      name: Joi.string().required(),
      permissions: Joi.array()
        .min(1)
        .items(
          Joi.object({
            moduleId: Joi.string().required(),
            actions: Joi.object({
              create: Joi.boolean().required(),
              read: Joi.boolean().required(),
              update: Joi.boolean().required(),
              delete: Joi.boolean().required(),
            }).required(),
          })
        )
        .required(),
    });

    const { error } = schema.validate(value, { abortEarly: false });
    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(". ");
      throw new InputValidationError(`Input Validation Error: ${errorMessage}`);
    }
  }

  static validateCompanyIdQuery(value: unknown) {
    const schema = Joi.object({
      companyId: Joi.string().required(),
    });

    const { error } = schema.validate(value);
    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(". ");
      throw new InputValidationError(errorMessage);
    }
  }

  static validateRoleIdQuery(value: unknown) {
    const schema = Joi.object({
      roleId: Joi.string().required(),
    });

    const { error } = schema.validate(value);
    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(". ");
      throw new InputValidationError(errorMessage);
    }
  }

  static validateUpdateRoleQuery(value: unknown) {
    const schema = Joi.object({
      roleId: Joi.string().required(),
      name: Joi.string().required(),
      permissions: Joi.array()
        .items(
          Joi.object({
            moduleId: Joi.string().required(),
            actions: Joi.object({
              create: Joi.boolean().required(),
              read: Joi.boolean().required(),
              update: Joi.boolean().required(),
              delete: Joi.boolean().required(),
            }).required(),
          })
        )
        .required(),
    });

    const { error } = schema.validate(value);
    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(". ");
      throw new InputValidationError(errorMessage);
    }
  }

  static validatePermissions(value: unknown) {
    const schema = Joi.array().items(
      Joi.object({
        permissions: Joi.array()
          .min(1)
          .items(
            Joi.object({
              moduleId: Joi.string().required(),
              actions: Joi.object({
                create: Joi.boolean().required(),
                read: Joi.boolean().required(),
                update: Joi.boolean().required(),
                delete: Joi.boolean().required(),
              }).required(),
            })
          )
          .required(),
      })
    );

    const { error } = schema.validate(value, { abortEarly: false });
    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(". ");
      throw new InputValidationError(`Input Validation Error: ${errorMessage}`);
    }
  }
}
