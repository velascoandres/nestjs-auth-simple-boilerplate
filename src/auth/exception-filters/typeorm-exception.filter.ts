import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Response } from 'express';
import { PostgreErrorCodesEnum } from '../../constants/postgres-error.codes';
@Catch(QueryFailedError)
export class TypeORMQueryExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.driverError.code) {
      case PostgreErrorCodesEnum.DUPLICATE_CONSTRAINT:
        return response.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          message: 'Duplicate value',
        });
      case PostgreErrorCodesEnum.NOT_NULL:
      case PostgreErrorCodesEnum.CHECK_VIOLATION:
        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
        });
      default:
        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Server error',
        });
    }
  }
}
