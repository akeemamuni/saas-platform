import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { RoleType } from '@prisma/client';
import { AuthUser } from 'src/shared/decorators/auth-user.decorator';
import { JwtPayload } from 'src/shared/types/payload.type';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('checkout/:planId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  create(@AuthUser() authUser: JwtPayload, @Param('planId') planId: string) {
    return this.billingService.createCheckoutSession(authUser, planId);
  }
}
