import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Professor } from './entity/professor.entity';
import { MongoInvalidArgumentError, Repository } from 'typeorm';
import { CreateProfessorDto } from './dto/create-professor.dto';
import { randomInt } from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ProfessorService {
    constructor(
        @InjectRepository(Professor)
        private professorRepository: Repository<Professor>,
    ) { }

    async create(dto: CreateProfessorDto) {

        if (dto.nomeCompleto == "" || dto.emailUSP == "" || dto.senha == "") {
            throw new ConflictException("Dados incompletos para cadastro!");
        }

        const regexUSP = /^[\w.-]+@usp\.br$/i; // verifica se termina com @usp.br
        if (!regexUSP.test(dto.emailUSP)) {
            throw new ConflictException("Somente emails @usp.br são permitidos");
        }


        const emailExistente = await this.professorRepository.findOne({ where: { emailUSP: dto.emailUSP } });
        if (emailExistente) {
            throw new ConflictException("Email já cadastrado!");
        }

        const randomSalt = await randomInt(10, 13);
        const senhaCriptografada = await bcrypt.hash(dto.senha, randomSalt);
        dto.senha = senhaCriptografada;

        const professor = this.professorRepository.create(dto);
        return this.professorRepository.save(professor);
    }

    async findAll() {
        return this.professorRepository.find();
    }

    async findOne(professorId: number, role: string) {

        if(role !== "Professor"){
            throw new UnauthorizedException("Somente professores!");
        }

        const professor = await this.professorRepository.findOne({
            where: { id: professorId }
        });

        if (!professor) {
            throw new NotFoundException("Professor não encontrado");
        }

        return professor;
    }


    async findByEmail(emailUSP: string) {
        return this.professorRepository.findOne({ where: { emailUSP } });
    }
}