import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aluno } from 'src/aluno/entity/aluno.entity';
import { Turma } from 'src/turma/entity/turma.entity';
import { Presenca } from './entity/presenca.entity';
import { MarcarPresencaDto } from './dto/create-presenca.dto';
import { Chamada } from 'src/chamada/entity/chamada.entity';
import { VerListaDePresencasDto } from 'src/chamada/dto/verChamada.dto';
import { ChamadaJanela } from 'src/chamada-janela/entity/chamada-janela.entity';

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

        @InjectRepository(ChamadaJanela)
        private janelaRepository: Repository<ChamadaJanela>,

    ) { }

    async create(dto: MarcarPresencaDto, alunoId: number, role: string) {

        if (role !== 'Aluno')
            throw new UnauthorizedException('Somente alunos podem marcar presença');

        const aluno = await this.alunoRepository.findOne({ where: { id: alunoId } });
        if (!aluno) throw new NotFoundException('Aluno não encontrado');

        /**
         * 1️⃣ Verifica se a janela do QR existe e está ativa
         */
        const janela = await this.janelaRepository.findOne({
            where: {
                codigoJanela: dto.codigoJanela,
                ativa: true,
            },
            relations: ['chamada', 'chamada.turma'],
        });


        if (!janela)
            throw new UnauthorizedException('QR inválido ou já expirado');

        /**
         * 2️⃣ Verifica se a janela ainda está dentro do tempo
         */
        if (new Date() > janela.dataExpiracao)
            throw new UnauthorizedException('QR expirado');

        /**
         * 3️⃣ Verifica se a chamada bate com a janela
         */
        if (janela.chamada.codigoChamada !== dto.codigoChamada)
            throw new UnauthorizedException('QR não pertence a esta chamada');

        /**
         * 4️⃣ Verifica se a chamada está aberta
         */
        if (!janela.chamada.aberta)
            throw new UnauthorizedException('Chamada está encerrada');

        const chamada = janela.chamada;

        /**
         * 5️⃣ Verifica se o aluno pertence à turma
         */
        const turma = await this.turmaRepository.findOne({
            where: { codigo: chamada.turma.codigo },
            relations: ['alunos'],
        });

        if (!turma)
            throw new NotFoundException('Turma não encontrada');

        const alunoTurma = turma.alunos.some((a) => a.id === aluno.id);

        if (!alunoTurma)
            throw new UnauthorizedException('Aluno não está matriculado nessa turma');

        /**
         * 6️⃣ Verifica se já registrou presença
         */
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const presencaExistente = await this.presencaRepository.findOne({
            where: {
                aluno: { id: aluno.id },
                chamada: { id: chamada.id },
                data: hoje,
            },
        });

        if (presencaExistente)
            throw new ConflictException('Presença já registrada.');

        /**
         * 7️⃣ Registra presença
         */
        const presenca = this.presencaRepository.create({
            aluno,
            chamada,
            turma,
            nomeAluno: aluno.nomeCompleto,
            numeroUSP: aluno.numeroUSP,
            codigoTurma: turma.codigo,
            codigoChamada: chamada.codigoChamada,
            emailAluno: aluno.emailUSP,
            data: hoje,
            dataHora: new Date(),
        });

        return await this.presencaRepository.save(presenca);
    }



}
