import { Module } from '@nestjs/common';
import { MateriaController } from './materia.controller';
import { MateriaService } from './materia.service';

@Module({
  controllers: [MateriaController],
  providers: [MateriaService]
})
export class MateriaModule {}
