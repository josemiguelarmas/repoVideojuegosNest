import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * login: autentica credenciales y devuelve un JWT firmado.
   *
   * Por qué mismo mensaje en ambos errores:
   * Si se diferencian ("email no existe" vs "contraseña incorrecta"),
   * un atacante puede enumerar usuarios válidos. Mismo mensaje = más seguro.
   *
   * El payload del JWT contiene sub (subject = id del usuario) y email.
   * sub es convención estándar JWT (RFC 7519) para identificar al sujeto.
   * JwtStrategy.validate() recibirá este mismo objeto como argumento.
   */
  async login(loginDto: LoginDto): Promise<{ token: string }> {
    const { email, password } = loginDto;

    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // bcrypt.compare() compara texto plano con hash almacenado
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: user.id, email: user.email };
    return { token: this.jwtService.sign(payload) };
  }
}
