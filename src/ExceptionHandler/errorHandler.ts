import { StatusCodes } from "http-status-codes";
import { DatabaseError } from "sequelize";
import { DataValidationError } from "../ExceptionHandler/DatabaseValidationError";
import { InputValidationError } from "../helpers/roleInputValidator";
import { createResponse } from "../helpers/responses";

export class handleErrorResponse {
  static handle(error: any) {
    if (error instanceof DatabaseError) {
      return createResponse(StatusCodes.OK, error.message);
    } else if (error instanceof InputValidationError) {
      return createResponse(StatusCodes.OK, error.message);
    } else if (error instanceof DataValidationError) {
      return createResponse(StatusCodes.OK, error.message);
    } else {
      return createResponse(StatusCodes.OK, error.message);
    }
  }
}
