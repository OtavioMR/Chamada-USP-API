import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aluno } from 'src/aluno/entity/aluno.entity';
import { Turma } from 'src/turma/entity/turma.entity';
import { Presenca } from './entity/presenca.entity';
import { MarcarPresencaDto } from './dto/create-presenca.dto';

@Injectable()
export class PresencaService {
    constructor(
        @InjectRepository(Aluno)
        private alunoRepository: Repository<Aluno>,

        @InjectRepository(Turma)
        private turmaRepository: Repository<Turma>,

        @InjectRepository(Presenca)
        private presencaRepository: Repository<Presenca>,
    ) {}

    async create(dto: MarcarPresencaDto, alunoId: number) {
        const aluno = await this.alunoRepository.findOne({ where: { id: alunoId } });
        if (!aluno) {
            throw new NotFoundException('Aluno não encontrado');
        }

        // Data de hoje (sem horário, formato AAAA-MM-DD)
        const dataHoje = new Date().toISOString().split('T')[0];

        // Verifica se já existe presença desse aluno hoje nessa turma
        const presencaExistente = await this.presencaRepository.findOne({
            where: {
                emailAluno: aluno.emailUSP,
                codigoTurma: dto.codigoTurma,
                data: dataHoje,
            },
        });

        if (presencaExistente) {
            throw new ConflictException('Presença já registrada para hoje nessa turma.');
        }

        // Cria a presença
        const presenca = this.presencaRepository.create({
            nomeAluno: aluno.nomeCompleto,
            numeroUSP: aluno.numeroUSP,
            codigoTurma: dto.codigoTurma,
            emailAluno: aluno.emailUSP,
            data: dataHoje, // adiciona a data do dia
            dataHora: new Date(),
        });

        return await this.presencaRepository.save(presenca);
    }
}
