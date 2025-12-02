import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chamada } from './entity/chamada.entity';
import { Repository } from 'typeorm';
import { Turma } from 'src/turma/entity/turma.entity';
import { Professor } from 'src/professor/entity/professor.entity';
import { CreateChamadaDto } from './dto/create-chamada.dto';
import { v4 as uuid } from 'uuid';
import { VerListaDePresencasDto } from './dto/verChamada.dto';
import { Presenca } from 'src/presenca/entity/presenca.entity';
import { Materia } from 'src/materia/entity/materia.entity';

@Injectable()
export class ChamadaService {
    constructor(
        @InjectRepository(Chamada) private chamadaRepository: Repository<Chamada>,
        @InjectRepository(Turma) private turmaRepository: Repository<Turma>,
        @InjectRepository(Professor) private professorRepository: Repository<Professor>,
        @InjectRepository(Presenca) private presencaRepository: Repository<Presenca>,
        @InjectRepository(Materia) private materiaRepository: Repository<Materia>,
    ) { }

    async criarChamada(dto: CreateChamadaDto, professorId: number, role: string) {
        if (role.toLowerCase() !== 'professor') throw new UnauthorizedException('Somente professores podem criar chamadas');

        const professor = await this.professorRepository.findOne({
            where: { id: professorId },
            relations: ['materias'],
        });
        if (!professor) throw new NotFoundException('Professor não encontrado');


        const turma = await this.turmaRepository.findOne({
            where: { codigo: dto.codigoTurma },
        });
        if (!turma) throw new NotFoundException('Turma não encontrada');

        const materia = await this.materiaRepository.findOne({
            where: { id: dto.materiaId },
        });
        if (!materia) throw new NotFoundException('Matéria não encontrada');

        // verifica se a matéria pertence ao professor
        if (!professor.materias || !professor.materias.some(m => m.id === materia.id)) {
            throw new ForbiddenException('Essa matéria não é sua');
        }

        const chamada = this.chamadaRepository.create({
            codigoChamada: `CHAM-${uuid().slice(0, 8)}`,
            professor,
            turma,
            materia,
            data: new Date(),       // <- ESSA LINHA SALVA SUA VIDA
            criadaEm: new Date(),
            aberta: true,
        });


        return await this.chamadaRepository.save(chamada);
    }

    async verListaDePresencas(dto: VerListaDePresencasDto, idProfessor: number) {
        const { codigoChamada } = dto;

        const chamada = await this.chamadaRepository.findOne({
            where: {
                codigoChamada,
                professor: { id: idProfessor },
            },
            relations: ['professor', 'turma', 'materia'],
        });

        if (!chamada) {
            throw new NotFoundException('Chamada não encontrada ou não pertence a este professor.');
        }

        const presencas = await this.presencaRepository.find({
            where: { codigoChamada },
            order: { dataHora: 'ASC' },
        });

        return {
            codigoChamada,
            turmaCodigo: chamada.turma?.codigo,
            materia: chamada.materia?.nomeMateria,
            totalPresentes: presencas.length,
            alunos: presencas.map((p) => ({
                nome: p.nomeAluno,
                email: p.emailAluno,
                numeroUSP: p.numeroUSP,
                dataHora: p.dataHora,
            })),
        };
    }

    // opcional: fechar chamada
    async fecharChamada(codigoChamada: string, professorId: number) {
        const chamada = await this.chamadaRepository.findOne({
            where: { codigoChamada, professor: { id: professorId } },
        });
        if (!chamada) throw new NotFoundException('Chamada não encontrada ou não pertence a este professor.');
        chamada.aberta = false;
        return await this.chamadaRepository.save(chamada);
    }
}
