import { Module } from '@nestjs/common';
import { ChamadaController } from './chamada.controller';
import { ChamadaService } from './chamada.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chamada } from './entity/chamada.entity';
import { Professor } from 'src/professor/entity/professor.entity';
import { Turma } from 'src/turma/entity/turma.entity';
import { Presenca } from 'src/presenca/entity/presenca.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Chamada, Professor, Turma, Presenca])],
  controllers: [ChamadaController],
  providers: [ChamadaService],
  exports:[ChamadaService],
})
export class ChamadaModule {}
