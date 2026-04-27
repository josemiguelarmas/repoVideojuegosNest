import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createGameDto: CreateGameDto) {
    return this.gameService.create(createGameDto);
  }

  /**
   * GET /games — devuelve todos los juegos. Público.
   *
   * GET /games?order=DESC — usa @Query() para leer query params.
   * @Query('order') extrae el parámetro 'order' de la URL.
   * Ejemplo: GET /games?order=ASC → orden ascendente por precio.
   */
  @Get()
  findAll(@Query('order') order?: 'ASC' | 'DESC') {
    if (order) {
      return this.gameService.getGamesSortedByPrice(order);
    }
    return this.gameService.findAll();
  }

  /**
   * IMPORTANTE: las rutas con segmentos fijos ('available', 'sold', 'genre', etc.)
   * deben declararse ANTES de la ruta dinámica ':id'.
   * Si ':id' va primero, NestJS interpreta "available" como el valor de :id
   * y nunca llega a la ruta específica.
   */

  @Get('available')
  getAvailableGames() {
    return this.gameService.getAvailableGames();
  }

  @Get('sold')
  getSoldGames() {
    return this.gameService.getSoldGames();
  }

  /**
   * GET /games/genre/:genre
   * Prefijo 'genre' evita colisión con ':id'.
   */
  @Get('genre/:genre')
  findByGenre(@Param('genre') genre: string) {
    return this.gameService.findByGenre(genre);
  }

  @Get('platform/:platform')
  findByPlatform(@Param('platform') platform: string) {
    return this.gameService.findByPlatform(platform);
  }

  /**
   * GET /games/owner/:ownerId — juegos de un usuario específico.
   */
  @Get('owner/:ownerId')
  @UseGuards(JwtAuthGuard)
  getGamesByOwner(@Param('ownerId') ownerId: string) {
    return this.gameService.getGamesByOwner(ownerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gameService.findOne(id);
  }

  /**
   * POST /games/:gameId/purchase/:userId
   * Ruta con dos parámetros dinámicos. Cada uno se extrae con @Param('nombre').
   */
  @Post(':gameId/purchase/:userId')
  @UseGuards(JwtAuthGuard)
  purchaseGame(
    @Param('gameId') gameId: string,
    @Param('userId') userId: string,
  ) {
    return this.gameService.purchaseGame(userId, gameId);
  }

  /**
   * PATCH /games/:id/unavailable — marcar un juego como no disponible sin comprarlo.
   */
  @Patch(':id/unavailable')
  @UseGuards(JwtAuthGuard)
  markAsUnavailable(@Param('id') id: string) {
    return this.gameService.markAsUnavailable(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateGameDto: UpdateGameDto) {
    return this.gameService.update(id, updateGameDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.gameService.remove(id);
  }
}
