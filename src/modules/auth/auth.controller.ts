import { Body, Controller, Post, ValidationPipe, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { AuthService } from './auth.service';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';
import { AuthUser } from 'src/shared/decorators/auth-user.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    register(@Body(ValidationPipe) registerDto: RegisterDTO) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    login(@Body(ValidationPipe) loginDto: LoginDTO) {
        return this.authService.login(loginDto);
    }

    @Post('refresh')
    refresh(@Body(ValidationPipe) body: { refreshToken: string }) {
        return this.authService.refresh(body.refreshToken);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getProfile(@AuthUser() user: {}) {
        return this.authService.getProfile(user);
    }
    // getProfile(@Req() req) {
    //   return req.user;
    // }
}
