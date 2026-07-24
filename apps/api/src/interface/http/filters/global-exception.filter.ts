import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  type ExceptionFilter,
} from '@nestjs/common';

interface RequestLogger {
  error(payload: object, message: string): void;
  warn(payload: object, message: string): void;
}

interface HttpRequest {
  readonly method: string;
  readonly url: string;
  readonly log: RequestLogger;
}

interface HttpReply {
  status(statusCode: number): HttpReply;
  send(body: unknown): unknown;
}

interface ErrorResponseBody {
  readonly statusCode: number;
  readonly error: string;
  readonly message: string | readonly string[];
  readonly path: string;
  readonly timestamp: string;
}

function getHttpExceptionMessage(exception: HttpException): string | readonly string[] {
  const response = exception.getResponse();

  if (typeof response === 'string') {
    return response;
  }

  if (typeof response === 'object' && response !== null && 'message' in response) {
    const message = response.message;

    if (typeof message === 'string') {
      return message;
    }

    if (
      Array.isArray(message) &&
      message.every((item): item is string => typeof item === 'string')
    ) {
      return message;
    }
  }

  return exception.message;
}

function getHttpExceptionError(exception: HttpException): string {
  const response = exception.getResponse();

  if (
    typeof response === 'object' &&
    response !== null &&
    'error' in response &&
    typeof response.error === 'string'
  ) {
    return response.error;
  }

  return HttpStatus[exception.getStatus()] ?? 'Error';
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<HttpRequest>();
    const reply = http.getResponse<HttpReply>();
    const isHttpException = exception instanceof HttpException;
    const statusCode = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const body: ErrorResponseBody = {
      statusCode,
      error: isHttpException ? getHttpExceptionError(exception) : 'Internal Server Error',
      message: isHttpException ? getHttpExceptionMessage(exception) : 'Internal server error',
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    const logPayload = {
      context: GlobalExceptionFilter.name,
      method: request.method,
      path: request.url,
      statusCode,
      ...(isHttpException ? {} : { err: exception }),
    };

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      request.log.error(logPayload, 'Request failed');
    } else {
      request.log.warn(logPayload, 'Request rejected');
    }

    void reply.status(statusCode).send(body);
  }
}
