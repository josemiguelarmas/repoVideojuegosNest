import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  genre: string;

  @Column()
  platform: string;

  @Column('float')
  price: number;

  /**
   * @Column({ default: true }) → la columna en BD tiene DEFAULT true.
   * Un juego recién creado está disponible para compra.
   */
  @Column({ default: true })
  isAvailable: boolean;

  /**
   * @ManyToOne: muchos juegos pueden pertenecer al mismo usuario.
   * nullable: true → la FK puede ser NULL (juego aún no comprado).
   * eager: false → TypeORM NO carga automáticamente el owner en cada query.
   *   Con eager: true, cada find() traería el objeto User anidado aunque no se pida.
   *
   * @JoinColumn() declara explícitamente dónde vive la foreign key.
   * En una relación ManyToOne, la FK siempre está en la tabla del lado "many" (Game).
   */
  @ManyToOne(() => User, (user) => user.games, { nullable: true, eager: false })
  @JoinColumn()
  owner: User;
}
