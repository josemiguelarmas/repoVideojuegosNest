import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

/**
 * JwtStrategy define CÓMO Passport valida un token JWT entrante.
 * Extiende PassportStrategy(Strategy) donde Strategy es 'passport-jwt'.
 * El nombre implícito de esta estrategia es 'jwt', que es lo que usa
 * JwtAuthGuard extends AuthGuard('jwt').
 *
 * Flujo cuando llega una request protegida:
 * 1. JwtAuthGuard le pide a Passport que use la estrategia 'jwt'.
 * 2. Passport extrae el token con jwtFromRequest.
 * 3. Verifica la firma usando secretOrKey.
 * 4. Si el token es válido, llama a validate() con el payload decodificado.
 * 5. Lo que devuelve validate() queda en request.user.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      // Extrae el token del header: Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // false → rechaza tokens expirados (recomendado en producción)
      ignoreExpiration: false,
      // Debe coincidir con el secreto usado en JwtModule.registerAsync
      secretOrKey: configService.get<string>('JWT_SECRET') ?? 'secret_dev',
    });
  }

  /**
   * validate() recibe el payload ya decodificado y verificado.
   * Lo que retorne este método se asigna a request.user en el controller.
   * Si lanza una excepción, Passport devuelve 401.
   *
   * Se puede ampliar para consultar la BD y verificar que el user aún exista.
   */
  async validate(payload: { sub: string; email: string }) {
    return { id: payload.sub, email: payload.email };
  }
}
