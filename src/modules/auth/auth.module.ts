import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from '../../shared/strategies/jwt.strategy';
// import { JwtModule } from 'src/shared/jwt/jwt.module';

@Module({
    // imports: [JwtModule],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
