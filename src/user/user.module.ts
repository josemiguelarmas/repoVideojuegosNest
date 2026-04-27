import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';

/**
 * @Module() agrupa todo lo relacionado con la feature de usuarios.
 *
 * imports: TypeOrmModule.forFeature([User]) registra el repositorio de User
 *   en el scope de este módulo. Sin esto, @InjectRepository(User) fallaría.
 *
 * exports: [UserService] → expone UserService para que otros módulos que
 *   importen UserModule puedan inyectarlo (AuthModule lo necesita para login).
 */
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
