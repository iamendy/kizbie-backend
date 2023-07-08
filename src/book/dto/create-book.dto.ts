import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBookDto {
  @IsNotEmpty()
  @IsString()
  author: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @IsNotEmpty()
  @IsString()
  intro: string;

  @IsNotEmpty()
  @IsString()
  tagline: string;

  @IsNotEmpty()
  @IsString()
  price: string;
}
