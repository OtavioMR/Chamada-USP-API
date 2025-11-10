import { Module } from '@nestjs/common';
import { TurmaController } from './turma.controller';
import { TurmaService } from './turma.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Turma } from './entity/turma.entity';
import { Professor } from 'src/professor/entity/professor.entity';
import { Aluno } from 'src/aluno/entity/aluno.entity';
import { Presenca } from 'src/presenca/entity/presenca.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Turma, Aluno, Professor, Presenca])],
  controllers: [TurmaController],
  providers: [TurmaService],
  exports: [TurmaService],
})
export class TurmaModule {}
