import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chamada } from './entity/chamada.entity';
import { Repository } from 'typeorm';
import { Turma } from 'src/turma/entity/turma.entity';
import { Professor } from 'src/professor/entity/professor.entity';
import { CreateChamadaDto } from './dto/create-chamada.dto';
import { NotFoundError } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { VerListaDePresencasDto } from './dto/verChamada.dto';
import { Presenca } from 'src/presenca/entity/presenca.entity';

@Injectable()
export class ChamadaService {
    constructor(
        @InjectRepository(Chamada)
        private chamadaRepository: Repository<Chamada>,
        @InjectRepository(Turma)
        private turmaRepository: Repository<Turma>,
        @InjectRepository(Professor)
        private professorRepository: Repository<Professor>,
        @InjectRepository(Presenca)
        private presencaRepository: Repository<Presenca>,
    ) { }


    async criarChamada(dto: CreateChamadaDto, professorId: number, role: string) {

        if (role !== 'professor') throw new UnauthorizedException('Somente professores podem criar chamadas');

        const professor = await this.professorRepository.findOne({ where: { id: professorId } });
        if (!professor) throw new NotFoundException('Professor não encontrado');

        const turma = await this.turmaRepository.findOne({
            where: { codigo: dto.codigoTurma },
        });
        if (!turma) throw new NotFoundException('Turma não encontrada');

        const chamada = this.chamadaRepository.create({
            codigoTurma: dto.codigoTurma,
            codigoChamada: `CHAM-${uuid().slice(0, 8)}`,
            professor,
        });

        return await this.chamadaRepository.save(chamada);
    }


    async verListaDePresencas(dto: VerListaDePresencasDto, idProfessor: number) {
        const { codigoChamada } = dto;

        // Verifica se a chamada pertence ao professor
        const chamada = await this.chamadaRepository.findOne({
            where: {
                codigoChamada,
                professor: { id: idProfessor },
            },
            relations: ['professor'],
        });

        if (!chamada) {
            throw new NotFoundException('Chamada não encontrada ou não pertence a este professor.');
        }

        // Busca todas as presenças dessa chamada
        const presencas = await this.presencaRepository.find({
            where: { codigoChamada },
            order: { dataHora: 'ASC' },
        });

        return {
            codigoChamada,
            codigoTurma: chamada.codigoTurma,
            totalPresentes: presencas.length,
            alunos: presencas.map((p) => ({
                nome: p.nomeAluno,
                email: p.emailAluno,
                numeroUSP: p.numeroUSP,
                dataHora: p.dataHora,
            })),
        };
    }


}
