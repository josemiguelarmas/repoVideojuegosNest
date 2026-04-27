import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/login — endpoint público (sin guard).
   * Devuelve { token: string } que el cliente debe guardar
   * y enviar en requests posteriores como:
   *   Authorization: Bearer eyJhbGci...
   */
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
