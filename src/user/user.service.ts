import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * @Injectable() registra la clase en el IoC container de NestJS.
 * Esto permite que otros providers la reciban via inyección de dependencias
 * sin instanciarla manualmente con `new UserService()`.
 */
@Injectable()
export class UserService {
  constructor(
    /**
     * @InjectRepository(User) inyecta el repositorio TypeORM para la entidad User.
     * Repository<User> expone métodos como find(), findOneBy(), save(), remove(), etc.
     * Funciona porque UserModule declara TypeOrmModule.forFeature([User]) en sus imports.
     */
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verificar email único antes de intentar insertar (manejo de error legible)
    const existing = await this.userRepository.findOneBy({
      email: createUserDto.email,
    });
    if (existing) {
      // ConflictException devuelve HTTP 409
      throw new ConflictException(`El email ${createUserDto.email} ya está registrado`);
    }

    /**
     * repository.create() construye una instancia de User en memoria (NO persiste).
     * Aquí se dispara @BeforeInsert() que hashea la contraseña.
     * repository.save() persiste el registro y devuelve la entidad con el id asignado.
     */
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      // NotFoundException devuelve HTTP 404 con el mensaje dado
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    /**
     * repository.preload({ id, ...changes }) busca el registro con ese id
     * y le aplica los cambios del DTO sobre la entidad existente, devolviéndola
     * en memoria sin persistir. Devuelve undefined si el id no existe.
     *
     * Es más limpio que findOneBy() + Object.assign() porque TypeORM
     * ya maneja la mezcla de propiedades correctamente.
     */
    const user = await this.userRepository.preload({ id, ...updateUserDto });
    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<User> {
    const user = await this.findOne(id); // findOne ya lanza 404 si no existe
    return this.userRepository.remove(user);
  }
}
