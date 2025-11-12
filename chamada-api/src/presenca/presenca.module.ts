import { Module } from '@nestjs/common';
import { PresencaController } from './presenca.controller';
import { PresencaService } from './presenca.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Presenca } from './entity/presenca.entity';
import { Turma } from 'src/turma/entity/turma.entity';
import { Aluno } from 'src/aluno/entity/aluno.entity';
import { Chamada } from 'src/chamada/entity/chamada.entity';
import { Professor } from 'src/professor/entity/professor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Presenca, Turma, Aluno, Chamada])],
  controllers: [PresencaController],
  providers: [PresencaService],
  exports: [PresencaService],
})
export class PresencaModule {}
