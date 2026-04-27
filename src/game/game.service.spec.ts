import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from './entities/game.entity';
import { User } from '../user/entities/user.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

/**
 * ANATOMÍA DE UN TEST UNITARIO EN NESTJS
 * ─────────────────────────────────────────────────────────────────────────────
 * Un test unitario prueba UNA unidad de código en AISLAMIENTO.
 * No se conecta a la BD real: se usan "mocks" (objetos falsos controlados).
 *
 * Por qué mocks y no la BD:
 *   - Los tests unitarios deben ser rápidos (milisegundos, no segundos).
 *   - La BD puede no estar disponible en CI/CD.
 *   - Se quiere probar la LÓGICA del servicio, no TypeORM.
 *
 * Herramientas:
 *   - describe()    → agrupa tests relacionados (suite / grupo)
 *   - beforeEach()  → código que corre antes de CADA test individual
 *   - it()          → un test individual con una aserción
 *   - expect()      → la aserción que verifica el resultado
 *   - jest.fn()     → crea una función espía (spy) que no hace nada por defecto
 *   - .mockResolvedValue() → configura qué devuelve la función async cuando se llama
 *   - .mockReturnValue()   → igual pero para funciones síncronas
 */

describe('GameService', () => {
  let service: GameService;
  let gameRepository: Repository<Game>;
  let userRepository: Repository<User>;

  // ── Datos de prueba reutilizables ──────────────────────────────────────────

  const mockGame: Game = {
    id: 'game-1',
    title: 'The Legend of Zelda',
    genre: 'Adventure',
    platform: 'Switch',
    price: 59.99,
    isAvailable: true,
    owner: null,
  } as Game;

  const mockUser: User = {
    id: 'user-1',
    email: 'jose@icesi.edu.co',
    username: 'josemiguel',
    password: 'hashed',
  } as User;

  /**
   * mockGameRepository: simula los métodos de Repository<Game>.
   * jest.fn() crea funciones que no hacen nada hasta configurarlas con mock*().
   * En beforeEach se limpia el estado con jest.clearAllMocks() para que
   * las configuraciones de un test no afecten al siguiente.
   */
  const mockGameRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    preload: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockUserRepository = {
    findOneBy: jest.fn(),
  };

  // ── Setup del módulo de testing ────────────────────────────────────────────

  beforeEach(async () => {
    /**
     * Test.createTestingModule() crea un módulo NestJS SOLO para testing.
     * En lugar de importar TypeOrmModule real, se proveen los repositorios
     * mockeados usando getRepositoryToken(Entidad) como token de inyección.
     *
     * Esto hace que cuando GameService pide @InjectRepository(Game),
     * reciba mockGameRepository en vez del repositorio real de TypeORM.
     */
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        {
          provide: getRepositoryToken(Game),
          useValue: mockGameRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<GameService>(GameService);
    gameRepository = module.get<Repository<Game>>(getRepositoryToken(Game));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    // Limpia llamadas y configuraciones de mocks entre tests
    jest.clearAllMocks();
  });

  // ── Tests básicos ──────────────────────────────────────────────────────────

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create and save a game', async () => {
      const dto = { title: 'Elden Ring', genre: 'RPG', platform: 'PS5', price: 69.99 };

      // mockReturnValue → la función devuelve este valor cuando se llama (síncrono)
      mockGameRepository.create.mockReturnValue(dto);
      // mockResolvedValue → la función devuelve una Promesa resuelta con este valor
      mockGameRepository.save.mockResolvedValue({ id: 'game-2', ...dto });

      const result = await service.create(dto as any);

      // expect(spy).toHaveBeenCalledWith(args) → verifica que se llamó con esos argumentos
      expect(gameRepository.create).toHaveBeenCalledWith(dto);
      expect(gameRepository.save).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: 'game-2', ...dto });
    });
  });

  // ── findAll ────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return an array of games', async () => {
      mockGameRepository.find.mockResolvedValue([mockGame]);

      const result = await service.findAll();

      expect(result).toEqual([mockGame]);
      expect(gameRepository.find).toHaveBeenCalled();
    });
  });

  // ── findOne ────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return a game if found', async () => {
      mockGameRepository.findOneBy.mockResolvedValue(mockGame);

      const result = await service.findOne('game-1');

      expect(result).toEqual(mockGame);
      expect(gameRepository.findOneBy).toHaveBeenCalledWith({ id: 'game-1' });
    });

    it('should throw NotFoundException if not found', async () => {
      mockGameRepository.findOneBy.mockResolvedValue(null);

      // rejects.toThrow() verifica que la promesa fue rechazada con esa excepción
      await expect(service.findOne('no-existe')).rejects.toThrow(NotFoundException);
    });
  });

  // ── findByGenre ────────────────────────────────────────────────────────────

  describe('findByGenre', () => {
    it('should return games filtered by genre', async () => {
      mockGameRepository.find.mockResolvedValue([mockGame]);

      const result = await service.findByGenre('Adventure');

      expect(gameRepository.find).toHaveBeenCalledWith({ where: { genre: 'Adventure' } });
      expect(result).toEqual([mockGame]);
    });
  });

  // ── findByPlatform ─────────────────────────────────────────────────────────

  describe('findByPlatform', () => {
    it('should return games filtered by platform', async () => {
      mockGameRepository.find.mockResolvedValue([mockGame]);

      const result = await service.findByPlatform('Switch');

      expect(gameRepository.find).toHaveBeenCalledWith({ where: { platform: 'Switch' } });
      expect(result).toEqual([mockGame]);
    });
  });

  // ── getAvailableGames ──────────────────────────────────────────────────────

  describe('getAvailableGames', () => {
    it('should return only available games', async () => {
      mockGameRepository.find.mockResolvedValue([mockGame]);

      const result = await service.getAvailableGames();

      expect(gameRepository.find).toHaveBeenCalledWith({ where: { isAvailable: true } });
      expect(result).toEqual([mockGame]);
    });
  });

  // ── getSoldGames ───────────────────────────────────────────────────────────

  describe('getSoldGames', () => {
    it('should return only sold games', async () => {
      const soldGame = { ...mockGame, isAvailable: false };
      mockGameRepository.find.mockResolvedValue([soldGame]);

      const result = await service.getSoldGames();

      expect(gameRepository.find).toHaveBeenCalledWith({ where: { isAvailable: false } });
      expect(result).toEqual([soldGame]);
    });
  });

  // ── markAsUnavailable ──────────────────────────────────────────────────────

  describe('markAsUnavailable', () => {
    it('should mark a game as unavailable', async () => {
      mockGameRepository.findOneBy.mockResolvedValue({ ...mockGame });
      mockGameRepository.save.mockResolvedValue({ ...mockGame, isAvailable: false });

      const result = await service.markAsUnavailable('game-1');

      expect(result.isAvailable).toBe(false);
    });

    it('should throw NotFoundException if game not found', async () => {
      mockGameRepository.findOneBy.mockResolvedValue(null);

      await expect(service.markAsUnavailable('no-existe')).rejects.toThrow(NotFoundException);
    });
  });

  // ── purchaseGame ───────────────────────────────────────────────────────────

  describe('purchaseGame', () => {
    it('should assign owner and mark as unavailable', async () => {
      const availableGame = { ...mockGame, isAvailable: true };
      mockGameRepository.findOneBy.mockResolvedValue(availableGame);
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockGameRepository.save.mockResolvedValue({
        ...availableGame,
        isAvailable: false,
        owner: mockUser,
      });

      const result = await service.purchaseGame('user-1', 'game-1');

      expect(gameRepository.findOneBy).toHaveBeenCalledWith({ id: 'game-1' });
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 'user-1' });
      expect(result.isAvailable).toBe(false);
      expect(result.owner).toEqual(mockUser);
    });

    it('should throw NotFoundException if game not found', async () => {
      mockGameRepository.findOneBy.mockResolvedValue(null);

      await expect(service.purchaseGame('user-1', 'no-existe')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if game is already sold', async () => {
      const soldGame = { ...mockGame, isAvailable: false };
      mockGameRepository.findOneBy.mockResolvedValue(soldGame);

      await expect(service.purchaseGame('user-1', 'game-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      mockGameRepository.findOneBy.mockResolvedValue({ ...mockGame, isAvailable: true });
      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(service.purchaseGame('no-existe', 'game-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── update ─────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should update and return the game', async () => {
      const dto = { price: 49.99 };
      const updated = { ...mockGame, ...dto };
      mockGameRepository.preload.mockResolvedValue(updated);
      mockGameRepository.save.mockResolvedValue(updated);

      const result = await service.update('game-1', dto as any);

      expect(gameRepository.preload).toHaveBeenCalledWith({ id: 'game-1', ...dto });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException if game not found', async () => {
      mockGameRepository.preload.mockResolvedValue(null);

      await expect(service.update('no-existe', {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── remove ─────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should remove a game if found', async () => {
      mockGameRepository.findOneBy.mockResolvedValue(mockGame);
      mockGameRepository.remove.mockResolvedValue(mockGame);

      const result = await service.remove('game-1');

      expect(gameRepository.remove).toHaveBeenCalledWith(mockGame);
      expect(result).toEqual(mockGame);
    });

    it('should throw NotFoundException if game not found', async () => {
      mockGameRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove('no-existe')).rejects.toThrow(NotFoundException);
    });
  });

  // ── getGamesSortedByPrice ──────────────────────────────────────────────────

  describe('getGamesSortedByPrice', () => {
    it('should return games sorted ASC by default', async () => {
      mockGameRepository.find.mockResolvedValue([mockGame]);

      const result = await service.getGamesSortedByPrice();

      expect(gameRepository.find).toHaveBeenCalledWith({ order: { price: 'ASC' } });
      expect(result).toEqual([mockGame]);
    });

    it('should return games sorted DESC when specified', async () => {
      mockGameRepository.find.mockResolvedValue([mockGame]);

      await service.getGamesSortedByPrice('DESC');

      expect(gameRepository.find).toHaveBeenCalledWith({ order: { price: 'DESC' } });
    });
  });
});
