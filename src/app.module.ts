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
import { RedisModule } from './shared/redis/redis.module';
import { JobModule } from './shared/job/job.module';
import { BullBoardModule } from './shared/bull-board/bull-board.module';

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
    BillingModule,
    RedisModule,
    JobModule,
    BullBoardModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
