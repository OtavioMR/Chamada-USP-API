import { IsNotEmpty, IsString } from 'class-validator';

export class CreateQRCodeDto {
  @IsString()
  @IsNotEmpty()
  codigoTurma: string;
}
