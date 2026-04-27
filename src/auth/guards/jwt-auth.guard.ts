import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard es un guard que activa la estrategia 'jwt' de Passport.
 * Se usa con @UseGuards(JwtAuthGuard) en controllers o métodos.
 *
 * La clase está vacía porque toda la lógica de validación vive en JwtStrategy.
 * Su propósito es ser un nombre semántico reutilizable en el codebase.
 *
 * Guards: interceptan la request ANTES de que llegue al handler del controller.
 * Devuelven true (continuar) o false/excepción (rechazar con 401/403).
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
