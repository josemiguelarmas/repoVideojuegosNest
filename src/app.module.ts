import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { GameModule } from './game/game.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

/**
 * AppModule es el módulo raíz (root module).
 * NestJS parte de aquí para construir el grafo completo de dependencias.
 * Cada módulo de feature (Game, User, Auth) debe registrarse aquí.
 */
@Module({
  imports: [
    // ConfigModule.forRoot({ isGlobal: true }) hace que ConfigService esté disponible
    // en TODA la app sin necesidad de importarlo en cada módulo individual.
    // Lee automáticamente el archivo .env en la raíz del proyecto.
    ConfigModule.forRoot({ isGlobal: true }),

    // TypeOrmModule.forRoot() configura la conexión a la base de datos a nivel global.
    // type: 'sqlite' usa SQLite, ideal para desarrollo y tests (no requiere servidor externo).
    // synchronize: true → TypeORM ajusta el esquema de la BD al arrancar.
    // NUNCA usar synchronize: true en producción, puede destruir datos.
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'videogames.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),

    PassportModule.register({ defaultStrategy: 'jwt' }),
    GameModule,
    UserModule,
    AuthModule,
  ],
})
export class AppModule {}
