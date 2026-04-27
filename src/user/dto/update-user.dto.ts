import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

/**
 * PartialType(CreateUserDto) genera un nuevo DTO donde TODOS los campos
 * de CreateUserDto son opcionales. Mantiene los decoradores de validación
 * originales pero solo los aplica si el campo viene en el body.
 *
 * Evita duplicar los decoradores @IsEmail, @MinLength, etc.
 * Este patrón es estándar en NestJS para operaciones PATCH.
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {}
