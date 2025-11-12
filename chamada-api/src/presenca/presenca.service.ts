import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aluno } from 'src/aluno/entity/aluno.entity';
import { Turma } from 'src/turma/entity/turma.entity';
import { Presenca } from './entity/presenca.entity';
import { MarcarPresencaDto } from './dto/create-presenca.dto';
import { Chamada } from 'src/chamada/entity/chamada.entity';
import { VerListaDePresencasDto } from 'src/chamada/dto/verChamada.dto';

@Injectable()
export class PresencaService {
    constructor(
        @InjectRepository(Aluno)
        private alunoRepository: Repository<Aluno>,

        @InjectRepository(Turma)
        private turmaRepository: Repository<Turma>,

        @InjectRepository(Presenca)
        private presencaRepository: Repository<Presenca>,

        @InjectRepository(Chamada)
        private chamadaRepository: Repository<Chamada>,
    ) { }

    async create(dto: MarcarPresencaDto, alunoId: number, role: string) {
        if (role !== 'aluno')
            throw new UnauthorizedException('Somente alunos podem marcar presença');

        const aluno = await this.alunoRepository.findOne({ where: { id: alunoId } });
        if (!aluno) throw new NotFoundException('Aluno não encontrado');

        // 1️⃣ Verifica se a chamada existe
        const chamada = await this.chamadaRepository.findOne({
            where: { codigoChamada: dto.codigoChamada },
        });
        if (!chamada) throw new NotFoundException('Chamada não encontrada');

        // 2️⃣ Busca a turma da chamada
        const turma = await this.turmaRepository.findOne({
            where: { codigo: chamada.codigoTurma },
            relations: ['alunos'],
        });
        if (!turma) throw new NotFoundException('Turma não encontrada');

        // 3️⃣ Verifica se o aluno faz parte da turma
        const alunoTurma = turma.alunos.some((a) => a.id === aluno.id);
        if (!alunoTurma)
            throw new UnauthorizedException('Aluno não está matriculado nessa turma');

        // 4️⃣ Data de hoje (sem horário)
        const dataHoje = new Date().toISOString().split('T')[0];

        // 5️⃣ Verifica se já marcou presença nessa chamada
        const presencaExistente = await this.presencaRepository.findOne({
            where: {
                emailAluno: aluno.emailUSP,
                codigoChamada: dto.codigoChamada,
                data: dataHoje,
            },
        });

        if (presencaExistente)
            throw new ConflictException('Presença já registrada para essa chamada.');

        // 6️⃣ Cria a presença
        const presenca = this.presencaRepository.create({
            nomeAluno: aluno.nomeCompleto,
            numeroUSP: aluno.numeroUSP,
            codigoTurma: turma.codigo,
            codigoChamada: dto.codigoChamada,
            emailAluno: aluno.emailUSP,
            data: dataHoje,
            dataHora: new Date(),
        });

        return await this.presencaRepository.save(presenca);
    }

    

}
