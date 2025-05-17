import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtService {
    constructor(
        private readonly jwt: NestJwtService,
        private readonly config: ConfigService
    ) {}

    genAccessToken(payload: {}) {
        return this.jwt.signAsync(payload, { expiresIn: '1m' });
    }

    genRefreshToken(payload: {}) {
        return this.jwt.signAsync(
            payload, 
            {
                expiresIn: '15m',
                secret: this.config.get<string>('REFRESH_SECRET')
            }
        );
    }

    verifyToken(token: string, refresh?: boolean) {
        if (refresh) {
            return this.jwt.verifyAsync(
                token, 
                {secret: this.config.get<string>('REFRESH_SECRET')}
            );
        }
        return this.jwt.verifyAsync(token);
    }
}
