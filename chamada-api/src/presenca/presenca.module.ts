import { Module } from '@nestjs/common';
import { PresencaController } from './presenca.controller';
import { PresencaService } from './presenca.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Presenca } from './entity/presenca.entity';
import { Turma } from 'src/turma/entity/turma.entity';
import { Aluno } from 'src/aluno/entity/aluno.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Presenca, Turma, Aluno])],
  controllers: [PresencaController],
  providers: [PresencaService],
  exports: [PresencaService],
})
export class PresencaModule {}
