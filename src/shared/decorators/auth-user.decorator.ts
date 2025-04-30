import { createParamDecorator as cpdeco, ExecutionContext as ecxt } from '@nestjs/common';
import { JwtPayload } from 'src/shared/types/payload.type';

// Retunr user populated by JwtStrategy
export const AuthUser = cpdeco(
    (data: unknown, ctx: ecxt): JwtPayload => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    }
);
