import { ApiProperty } from '@nestjs/swagger';

export class UserResponse {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ example: 'jane@example.com' })
  email: string;

  @ApiProperty({ example: 'Jane Doe' })
  name: string;

  @ApiProperty({ example: 'free', enum: ['free', 'pro', 'enterprise'] })
  plan: string;

  @ApiProperty({ example: 'SaaS', nullable: true })
  industry: string | null;

  @ApiProperty({ example: false })
  onboarded: boolean;

  @ApiProperty({ example: '2026-02-26T12:00:00.000Z' })
  createdAt: Date;
}

export class AuthResponse {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 'bearer' })
  tokenType: 'bearer';

  @ApiProperty({ type: () => UserResponse })
  user: UserResponse;
}
