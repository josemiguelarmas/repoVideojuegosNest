import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    // UserModule se importa para que AuthService pueda usar UserService.
    // Funciona porque UserModule exporta UserService en sus exports.
    UserModule,

    PassportModule.register({ defaultStrategy: 'jwt' }),

    /**
     * JwtModule.registerAsync() configura el módulo de JWT de forma asíncrona,
     * permitiendo leer variables de entorno a través de ConfigService.
     *
     * useFactory es una función que devuelve la configuración del módulo.
     * inject: [ConfigService] hace que NestJS inyecte ConfigService en la factory.
     *
     * Alternativa simple (no recomendada para producción):
     *   JwtModule.register({ secret: 'mi_secreto', signOptions: { expiresIn: '1h' } })
     */
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') ?? 'secret_dev',
        signOptions: { expiresIn: '2h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  /**
   * JwtStrategy se registra como provider para que Passport la descubra.
   * Sin esto, AuthGuard('jwt') no encontraría la estrategia y fallaría.
   * JwtAuthGuard se exporta para que otros módulos puedan usarlo directamente.
   */
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  exports: [JwtAuthGuard, PassportModule],
})
export class AuthModule {}
