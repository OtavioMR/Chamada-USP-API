import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Turma } from './entity/turma.entity';
import { Repository } from 'typeorm';
import { Aluno } from 'src/aluno/entity/aluno.entity';
import { CreateTurmaDto } from './dto/create-turma.dto';
import { Professor } from 'src/professor/entity/professor.entity';

@Injectable()
export class TurmaService {
    constructor(
        @InjectRepository(Turma)
        private turmaRepository: Repository<Turma>,
        @InjectRepository(Aluno)
        private alunoRepository: Repository<Aluno>,
        @InjectRepository(Professor)
        private professorRepository: Repository<Professor>,
    ) {}

    async create(dto: CreateTurmaDto, idProfessor: number) {
        const professor = await this.professorRepository.findOne({
            where: {id: idProfessor},
        });

        if (!professor){
            throw new NotFoundException('Professor não encontrado');
        }

        const novaTurma = this.turmaRepository.create({
            nomeCurso: dto.nomeCurso,
            codigo: dto.codigo,
            ano: dto.ano,
            semestre: dto.semestre,
            professor: professor,
        });

        return await this.turmaRepository.save(novaTurma);
    }
}