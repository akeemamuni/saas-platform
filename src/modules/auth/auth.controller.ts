import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';

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
}
