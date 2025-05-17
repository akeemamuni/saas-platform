import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';

// Header-based utility middleware
@Injectable()
export class TenantMiddleware implements NestMiddleware {
    constructor(private readonly prisma: PrismaService) {}

    async use(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.headers['x-tenant-id'] as string;

        if (!tenantId) {
            throw new UnauthorizedException('Tenant ID is required in headers');
        }

        // Verify tenantId is valid
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant) {
            throw new UnauthorizedException('Invalid Tenant ID');
        }

        (req as any).tenant = tenant;

        next();
    }
}
