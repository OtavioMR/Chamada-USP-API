import { Module } from '@nestjs/common';
import { AlunoController } from './aluno.controller';
import { AlunoService } from './aluno.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Aluno } from './entity/aluno.entity';
import { Turma } from 'src/turma/entity/turma.entity';
import { TurmaService } from 'src/turma/turma.service';
import { TurmaModule } from 'src/turma/turma.module';

@Module({
  imports: [TypeOrmModule.forFeature([Aluno, Turma]),
    TurmaModule,
  ],
  controllers: [AlunoController],
  providers: [AlunoService],
  exports: [AlunoService],
})
export class AlunoModule { }
