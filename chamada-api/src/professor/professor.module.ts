import { Module } from '@nestjs/common';
import { ProfessorController } from './professor.controller';
import { ProfessorService } from './professor.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Professor } from './entity/professor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Professor])],
  controllers: [ProfessorController],
  providers: [ProfessorService],
  exports: [ProfessorService],
})
export class ProfessorModule {}
