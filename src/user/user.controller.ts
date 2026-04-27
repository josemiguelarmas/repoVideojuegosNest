import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * @Controller('users') define el prefijo de ruta: todas las rutas empiezan con /users.
 *
 * @UseInterceptors(ClassSerializerInterceptor) aplica class-transformer a las respuestas.
 * Cualquier campo con @Exclude() en la entidad (como password) se omitirá del JSON.
 * Aplicado a nivel de clase afecta a todos los métodos del controller.
 */
@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * POST /users — endpoint público, cualquiera puede registrarse.
   * @Body() extrae el body de la request y lo convierte a CreateUserDto.
   * ValidationPipe valida automáticamente antes de llegar aquí.
   */
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  /**
   * GET /users — protegido con JWT.
   * @UseGuards(JwtAuthGuard) intercepta la request y verifica el token.
   * Si no viene el header Authorization: Bearer <token> → 401 Unauthorized.
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.userService.findAll();
  }

  /**
   * GET /users/:id
   * @Param('id') extrae el segmento dinámico de la URL.
   * Ejemplo: GET /users/abc-123 → id = 'abc-123'
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  /**
   * PATCH /users/:id — actualización parcial.
   * PATCH solo actualiza los campos enviados.
   * PUT reemplazaría el objeto completo.
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
