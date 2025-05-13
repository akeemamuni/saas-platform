import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from '../../shared/strategies/jwt.strategy';
import { JobModule } from 'src/shared/job/job.module';
// import { JwtModule } from 'src/shared/jwt/jwt.module';

@Module({
    // imports: [JwtModule] -- Already made global
    imports: [JobModule],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
