import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      clientID: configService.get<string>('google.clientId') ?? '',
      clientSecret: configService.get<string>('google.clientSecret') ?? '',
      callbackURL: configService.get<string>('google.callbackUrl') ?? '',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: {
      id: string;
      displayName: string;
      emails: Array<{ value: string }>;
    },
    done: VerifyCallback,
  ): Promise<void> {
    const { id, displayName, emails } = profile;
    const email = emails[0]?.value;

    const user = await this.usersService.findOrCreateGoogleUser({
      googleId: id,
      email,
      name: displayName,
    });

    done(null, user);
  }
}
