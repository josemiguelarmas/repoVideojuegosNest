import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { Game } from './entities/game.entity';
import { User } from '../user/entities/user.entity';

/**
 * GameModule registra DOS entidades en forFeature: [Game, User].
 * Esto es necesario porque GameService inyecta tanto Repository<Game>
 * como Repository<User> (para verificar el comprador en purchaseGame).
 *
 * Si solo se pusiera [Game], el @InjectRepository(User) en GameService
 * lanzaría un error de provider no encontrado al arrancar la app.
 *
 * Nota: no es necesario importar UserModule aquí porque accedemos
 * directamente al repositorio, no al UserService.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Game, User])],
  controllers: [GameController],
  providers: [GameService],
  exports: [GameService],
})
export class GameModule {}
