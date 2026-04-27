import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { Game } from '../../game/entities/game.entity';

/**
 * @Entity() le dice a TypeORM que esta clase es una tabla.
 * Por defecto el nombre de la tabla es el nombre de la clase en minúsculas: 'user'.
 * Se puede personalizar: @Entity('players') → tabla llamada 'players'.
 */
@Entity()
export class User {
  /**
   * @PrimaryGeneratedColumn('uuid') genera un UUID v4 automáticamente.
   * Alternativa más simple: @PrimaryGeneratedColumn() → autoincrement integer.
   * UUID es preferible en sistemas distribuidos porque no depende de la BD para generarlo.
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  username: string;

  /**
   * @Exclude() es de class-transformer.
   * Cuando el controller usa @UseInterceptors(ClassSerializerInterceptor),
   * cualquier campo marcado con @Exclude() se omite de la respuesta JSON.
   * Así el hash de la contraseña nunca llega al cliente.
   */
  @Exclude()
  @Column()
  password: string;

  /**
   * @OneToMany(() => Game, game => game.owner) define relación 1:N.
   * Un usuario puede ser dueño de muchos juegos comprados.
   * El segundo argumento apunta al campo inverso en la entidad Game.
   */
  @OneToMany(() => Game, (game) => game.owner)
  games: Game[];

  /**
   * @BeforeInsert() es un hook de ciclo de vida de TypeORM.
   * Se ejecuta automáticamente antes de persistir el registro por primera vez.
   * Hashear la contraseña aquí garantiza que nunca se guarde en texto plano,
   * sin importar desde dónde se llame userRepository.save().
   */
  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
}
