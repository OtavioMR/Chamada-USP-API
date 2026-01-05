import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Aluno } from './entity/aluno.entity';
import { Repository } from 'typeorm';
import { CreateAlunoDto } from './dto/create-aluno.dto';
import { randomInt } from 'node:crypto';
import * as bcrypt from 'bcrypt';
import { throwError } from 'rxjs';

@Injectable()
export class AlunoService {
    constructor(
        @InjectRepository(Aluno)
        private alunoRepository: Repository<Aluno>,
    ) { }

    async create(dto: CreateAlunoDto) {

        if (dto.nomeCompleto == "" || dto.emailUSP == "" || dto.senha == "" || dto.numeroUSP == "") {
            throw new ConflictException("Dados incompletos para cadastro!");
        }

        const regexUSP = /^[\w.-]+@usp\.br$/i; // verifica se termina com @usp.br
        if (!regexUSP.test(dto.emailUSP)) {
            throw new ConflictException("Somente emails @usp.br são permitidos");
        }

        const emailExistente = await this.alunoRepository.findOne({ where: { emailUSP: dto.emailUSP } });
        if (emailExistente) {
            throw new ConflictException('Email já cadastrado');
        }

        const numeroUSPExistente = await this.alunoRepository.findOne({
            where: {numeroUSP: dto.numeroUSP}
        })

        if(numeroUSPExistente) throw new ConflictException("Número USP já cadastrado!")

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

    async meusDados(idAluno: number, role : string) {
        // if (role != "Aluno") throw new UnauthorizedException("Somente o aluno pode ver seus dados");

        const alunoExistente = await this.alunoRepository.findOne({
            where: { id: idAluno}
        });

        if (!alunoExistente) throw new NotFoundException("Aluno não encontrado!");

        return alunoExistente;
    }
}
