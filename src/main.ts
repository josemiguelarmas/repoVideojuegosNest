import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /**
   * ValidationPipe global: activa class-validator en TODOS los endpoints.
   *
   * whitelist: true      → elimina del body cualquier propiedad que no esté
   *                        declarada en el DTO, evitando inyección de campos.
   * forbidNonWhitelisted → en vez de ignorarlos, devuelve 400 si vienen campos extra.
   * transform: true      → convierte tipos automáticamente (ej: string → number en params)
   *                        e instancia los DTOs como clases (necesario para @Transform).
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(3000);
}
bootstrap();
