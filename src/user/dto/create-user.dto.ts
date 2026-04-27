import { IsEmail, IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

/**
 * DTO (Data Transfer Object): define la forma y reglas de los datos de entrada.
 *
 * class-validator ejecuta las validaciones mediante decoradores.
 * Si alguna falla, ValidationPipe (configurado en main.ts) devuelve
 * automáticamente un 400 Bad Request con el mensaje de error descriptivo.
 *
 * No es necesario hacer try/catch manual en los controllers para validaciones.
 */
export class CreateUserDto {
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  username: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}
