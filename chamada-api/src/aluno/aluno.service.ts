import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Aluno } from './entity/aluno.entity';
import { Repository } from 'typeorm';
import { CreateAlunoDto } from './dto/create-aluno.dto';
import { randomInt } from 'node:crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AlunoService {
    constructor(
        @InjectRepository(Aluno)
        private alunoRepository: Repository<Aluno>,
    ) { }

    async create(dto: CreateAlunoDto) {
        const emailExistente = await this.alunoRepository.findOne({ where: { emailUSP: dto.emailUSP } });
        if (emailExistente) {
            throw new ConflictException('Email já cadastrado');
        }

        const randomSalt = await randomInt(10, 13);
        const senhaCriptografada = await bcrypt.hash(dto.senha, randomSalt);
        dto.senha = senhaCriptografada;

        const aluno = this.alunoRepository.create(dto);
        return this.alunoRepository.save(aluno);
    }

    async findAll() {
        const alunos = await this.alunoRepository.find();

        return alunos.map(aluno => ({
            idAluno: aluno.id,
            nomeCompleto: aluno.nomeCompleto,
            emailUSP: aluno.emailUSP,
            numeroUSP: aluno.numeroUSP,
        }));
    }

    async findOne(alunoId: number) {
        const aluno = await this.alunoRepository.findOne({
            where: { id: alunoId },
            relations: ['turmas'],
        });

        if (!aluno) {
            throw new NotFoundException('Aluno não encontrado');
        }
        return aluno;
    }

    async findByEmail(emailUSP: string) {
        return this.alunoRepository.findOne({ where: { emailUSP } });
    }
}
