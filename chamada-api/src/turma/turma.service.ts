import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Turma } from './entity/turma.entity';
import { Repository } from 'typeorm';
import { Aluno } from 'src/aluno/entity/aluno.entity';
import { CreateTurmaDto } from './dto/create-turma.dto';
import { Professor } from 'src/professor/entity/professor.entity';
import { CreateAlunoDto } from 'src/aluno/dto/create-aluno.dto';

@Injectable()
export class TurmaService {
    constructor(
        @InjectRepository(Turma)
        private turmaRepository: Repository<Turma>,
        @InjectRepository(Aluno)
        private alunoRepository: Repository<Aluno>,
        @InjectRepository(Professor)
        private professorRepository: Repository<Professor>,
    ) { }

    async create(dto: CreateTurmaDto, idProfessor: number) {
        const professor = await this.professorRepository.findOne({
            where: { id: idProfessor },
        });

        if (!professor) {
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

    async entrarNaTurma(codigoTurma: string, idAluno: number) {
        const aluno = await this.alunoRepository.findOne({ where: { id: idAluno } });
        if (!aluno) {
            throw new NotFoundException('Aluno não encontrado');
        }

        // Aqui adiciona as relações
        const turma = await this.turmaRepository.findOne({
            where: { codigo: codigoTurma },
            relations: ['alunos'],
        });

        if (!turma) {
            throw new NotFoundException('Turma não encontrada');
        }

        // Evita duplicar aluno
        const jaCadastrado = turma.alunos.some(a => a.id === aluno.id);
        if (jaCadastrado) {
            return { message: 'Aluno já está cadastrado na turma' };
        }

        turma.alunos.push(aluno);
        await this.turmaRepository.save(turma);

        return { message: 'Aluno entrou na turma com sucesso' };
    }


    async verAlunosDaTurma(codigoTurma: string) {
        const turma = await this.turmaRepository.findOne({
            where: { codigo: codigoTurma },
            relations: ['alunos'],
        });

        if (!turma) {
            throw new NotFoundException('Turma não encontrada');
        }

        return turma.alunos.map(aluno => ({
            nomeCompleto: aluno.nomeCompleto,
            emailUSP: aluno.emailUSP,
            numeroUSP: aluno.numeroUSP,
        }));

    }
}