import { Module } from '@nestjs/common';
import { MateriaController } from './materia.controller';
import { MateriaService } from './materia.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Materia } from './entity/materia.entity';
import { Professor } from 'src/professor/entity/professor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Materia, Professor])],
  controllers: [MateriaController],
  providers: [MateriaService],
  exports: [MateriaService],
})
export class MateriaModule {}
