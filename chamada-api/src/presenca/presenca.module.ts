import { Module } from '@nestjs/common';
import { PresencaController } from './presenca.controller';
import { PresencaService } from './presenca.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Presenca } from './entity/presenca.entity';
import { Turma } from 'src/turma/entity/turma.entity';
import { Aluno } from 'src/aluno/entity/aluno.entity';
import { Chamada } from 'src/chamada/entity/chamada.entity';
import { ChamadaJanela } from 'src/chamada-janela/entity/chamada-janela.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Presenca, Turma, Aluno, Chamada, ChamadaJanela])],
  controllers: [PresencaController],
  providers: [PresencaService],
  exports: [PresencaService],
})
export class PresencaModule {}
