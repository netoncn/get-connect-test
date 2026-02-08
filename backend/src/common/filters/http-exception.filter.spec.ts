import {
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { AllExceptionsFilter } from './http-exception.filter';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new AllExceptionsFilter();

    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });

    mockHost = {
      switchToHttp: () => ({
        getResponse: () => ({
          status: mockStatus,
        }),
      }),
    } as unknown as ArgumentsHost;

    jest.clearAllMocks();
  });

  it('should format HttpException with correct status and message', () => {
    const exception = new HttpException(
      'Forbidden resource',
      HttpStatus.FORBIDDEN,
    );

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Forbidden resource',
      }),
    );
  });

  it("should handle validation errors (array message) as 'Validation failed'", () => {
    const exception = new BadRequestException([
      'name must not be empty',
      'email must be valid',
    ]);

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation failed',
        errors: ['name must not be empty', 'email must be valid'],
      }),
    );
  });

  it('should handle non-HttpException as 500 Internal Server Error', () => {
    const exception = new Error('Something broke');

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something broke',
      }),
    );
  });

  it('should include timestamp in response', () => {
    const now = new Date('2026-01-15T10:00:00.000Z');
    jest.spyOn(global, 'Date').mockImplementation(() => now as unknown as Date);

    const exception = new HttpException('Test', HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockHost);

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        timestamp: now.toISOString(),
      }),
    );

    jest.restoreAllMocks();
  });
});
