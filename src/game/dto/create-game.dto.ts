import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateGameDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  genre: string;

  @IsString()
  @IsNotEmpty()
  platform: string;

  /**
   * @IsNumber() valida que sea un número.
   * @IsPositive() valida que sea mayor a 0, evitando precios negativos o cero.
   */
  @IsNumber()
  @IsPositive()
  price: number;

  /**
   * @IsOptional() permite que el campo no venga en el body.
   * Si no viene, TypeORM usa el valor default de la entidad (true).
   */
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
