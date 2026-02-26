import { ApiProperty } from '@nestjs/swagger';

// ─── Standard response ────────────────────────────────────────────────────────

export class ApiResponse<T> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'OK' })
  message: string;

  @ApiProperty()
  data: T;

  @ApiProperty({ example: '2026-02-26T12:00:00.000Z' })
  timestamp: string;

  static success<T>(data: T, message = 'Successful'): ApiResponse<T> {
    const res = new ApiResponse<T>();
    res.success = true;
    res.message = message;
    res.data = data;
    res.timestamp = new Date().toISOString();
    return res;
  }
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export class PaginationMeta {
  @ApiProperty({ example: 100, description: 'Total number of items' })
  total: number;

  @ApiProperty({ example: 1, description: 'Current page (1-indexed)' })
  page: number;

  @ApiProperty({ example: 20, description: 'Items per page' })
  size: number;

  @ApiProperty({ example: 5, description: 'Total number of pages' })
  totalPages: number;

  static of(total: number, page: number, size: number): PaginationMeta {
    const meta = new PaginationMeta();
    meta.total = total;
    meta.page = page;
    meta.size = size;
    meta.totalPages = Math.ceil(total / size);
    return meta;
  }
}

export class PaginatedApiResponse<T> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'OK' })
  message: string;

  @ApiProperty({ isArray: true })
  data: T[];

  @ApiProperty({ type: () => PaginationMeta })
  meta: PaginationMeta;

  @ApiProperty({ example: '2026-02-26T12:00:00.000Z' })
  timestamp: string;

  static success<T>(
    data: T[],
    meta: PaginationMeta,
    message = 'Successful',
  ): PaginatedApiResponse<T> {
    const res = new PaginatedApiResponse<T>();
    res.success = true;
    res.message = message;
    res.data = data;
    res.meta = meta;
    res.timestamp = new Date().toISOString();
    return res;
  }
}
