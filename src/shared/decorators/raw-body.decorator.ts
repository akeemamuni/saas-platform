import { createParamDecorator as cpdeco, ExecutionContext as ecxt } from '@nestjs/common';

export const RequestRawBody = cpdeco(
    (_data: unknown, ctx: ecxt): Buffer => {
        const request = ctx.switchToHttp().getRequest();
        return request.rawBody;
    },
);
