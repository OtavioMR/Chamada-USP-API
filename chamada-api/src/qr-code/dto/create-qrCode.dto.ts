import { IsNotEmpty, IsString } from 'class-validator';

export class CreateQRCodeDto {
  @IsString()
  @IsNotEmpty()
  materia: string;

  @IsString()
  @IsNotEmpty()
  turma: string;
}
