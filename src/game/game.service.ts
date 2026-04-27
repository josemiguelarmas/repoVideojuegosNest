import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from './entities/game.entity';
import { User } from '../user/entities/user.entity';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,

    /**
     * Se inyecta el repositorio de User dentro de GameService
     * porque purchaseGame necesita verificar que el comprador exista.
     * Para que esto funcione, GameModule debe incluir User en forFeature([Game, User]).
     */
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ── CRUD básico ─────────────────────────────────────────────────────────────

  async create(createGameDto: CreateGameDto): Promise<Game> {
    const game = this.gameRepository.create(createGameDto);
    return this.gameRepository.save(game);
  }

  findAll(): Promise<Game[]> {
    return this.gameRepository.find();
  }

  async findOne(id: string): Promise<Game> {
    const game = await this.gameRepository.findOneBy({ id });
    if (!game) {
      throw new NotFoundException(`Juego con id ${id} no encontrado`);
    }
    return game;
  }

  async update(id: string, updateGameDto: UpdateGameDto): Promise<Game> {
    const game = await this.gameRepository.preload({ id, ...updateGameDto });
    if (!game) {
      throw new NotFoundException(`Juego con id ${id} no encontrado`);
    }
    return this.gameRepository.save(game);
  }

  async remove(id: string): Promise<Game> {
    const game = await this.findOne(id);
    return this.gameRepository.remove(game);
  }

  // ── Funcionalidades específicas del dominio ──────────────────────────────────

  /**
   * findByGenre: busca todos los juegos de un género específico.
   * repository.find({ where: { campo: valor } }) genera:
   *   SELECT * FROM game WHERE genre = ?
   */
  async findByGenre(genre: string): Promise<Game[]> {
    return this.gameRepository.find({ where: { genre } });
  }

  /**
   * findByPlatform: filtra juegos por plataforma (PC, PS5, Xbox, etc.).
   */
  async findByPlatform(platform: string): Promise<Game[]> {
    return this.gameRepository.find({ where: { platform } });
  }

  /**
   * getAvailableGames: devuelve solo los juegos disponibles para compra.
   * isAvailable: true es el filtro de disponibilidad.
   */
  async getAvailableGames(): Promise<Game[]> {
    return this.gameRepository.find({ where: { isAvailable: true } });
  }

  /**
   * getSoldGames: devuelve los juegos que ya fueron comprados.
   */
  async getSoldGames(): Promise<Game[]> {
    return this.gameRepository.find({ where: { isAvailable: false } });
  }

  /**
   * markAsUnavailable: marca un juego como no disponible.
   * Flujo: buscar → lanzar 404 si no existe → actualizar flag → persistir.
   */
  async markAsUnavailable(id: string): Promise<Game> {
    const game = await this.gameRepository.findOneBy({ id });
    if (!game) {
      throw new NotFoundException(`Juego con id ${id} no encontrado`);
    }
    game.isAvailable = false;
    return this.gameRepository.save(game);
  }

  /**
   * purchaseGame: operación de compra que relaciona un User con un Game.
   *
   * Validaciones en cadena:
   * 1. El juego debe existir            → 404 si no
   * 2. El juego debe estar disponible   → 400 si ya fue comprado
   * 3. El comprador debe existir        → 404 si no
   * 4. Se asigna el owner y se marca como no disponible
   *
   * Parámetros: (userId, gameId) — el usuario compra el juego.
   */
  async purchaseGame(userId: string, gameId: string): Promise<Game> {
    const game = await this.gameRepository.findOneBy({ id: gameId });
    if (!game) {
      throw new NotFoundException(`Juego con id ${gameId} no encontrado`);
    }

    // BadRequestException devuelve HTTP 400, apropiado para lógica de negocio inválida
    if (!game.isAvailable) {
      throw new BadRequestException(`El juego con id ${gameId} ya fue comprado`);
    }

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`Usuario con id ${userId} no encontrado`);
    }

    // Asignar dueño y marcar como no disponible en una sola persistencia
    game.owner = user;
    game.isAvailable = false;
    return this.gameRepository.save(game);
  }

  /**
   * getGamesByOwner: devuelve todos los juegos que pertenecen a un usuario.
   *
   * Para filtrar por una relación (owner.id) se usa QueryBuilder,
   * que permite joins y condiciones más complejas que find({ where }).
   *
   * Alternativa con find():
   *   find({ where: { owner: { id: ownerId } }, relations: ['owner'] })
   * QueryBuilder es más explícito y más legible en consultas complejas.
   */
  async getGamesByOwner(ownerId: string): Promise<Game[]> {
    return this.gameRepository
      .createQueryBuilder('game')          // 'game' es el alias de la tabla
      .leftJoinAndSelect('game.owner', 'owner') // hace LEFT JOIN con user
      .where('owner.id = :ownerId', { ownerId }) // :ownerId evita SQL injection
      .getMany();
  }

  /**
   * getGamesSortedByPrice: devuelve juegos ordenados por precio.
   * order: { price: 'ASC' } → más baratos primero.
   * order: { price: 'DESC' } → más caros primero.
   */
  async getGamesSortedByPrice(order: 'ASC' | 'DESC' = 'ASC'): Promise<Game[]> {
    return this.gameRepository.find({ order: { price: order } });
  }
}
