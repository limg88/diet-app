import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const responseBody = isHttpException ? exception.getResponse() : null;

    const message =
      typeof responseBody === 'string'
        ? responseBody
        : (responseBody as { message?: unknown })?.message ?? 'Internal server error';

    response.status(status).json({
      statusCode: status,
      message,
      error: isHttpException ? (responseBody as { error?: string })?.error : 'Error',
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
