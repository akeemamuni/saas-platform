import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { JwtModule } from './shared/jwt/jwt.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { PlanModule } from './modules/plan/plan.module';
import { RoleModule } from './modules/role/role.module';
import { UserModule } from './modules/user/user.module';
import { BillingModule } from './modules/billing/billing.module';

@Module({
  imports: [
    ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env'
    }),
    AuthModule,
    PrismaModule,
    JwtModule,
    TenantModule,
    PlanModule,
    RoleModule,
    UserModule,
    BillingModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
