import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { JwtService } from './jwt.service';

@Global()
@Module({
    imports: [
        NestJwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('SECRET'),
                signOptions: { expiresIn: '5m' }
            })
        })
    ],
    providers: [JwtService],
    exports: [JwtService]
})
export class JwtModule {}
