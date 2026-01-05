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
import { all } from 'axios';

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
            relations: ['materia'],
        });
        if (!turma) throw new NotFoundException('Turma não encontrada');

        const materia = turma.materia;
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
            criadaEm: new Date(),
            aberta: true,
        });

        return await this.chamadaRepository.save(chamada);
    }

    async verListaDePresencas(idProfessor: number, codigo: string) {
        const codigoChamada = codigo;

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
            nomeCurso: chamada.turma.nomeCurso,
            alunos: presencas.map((p) => ({
                nome: p.nomeAluno,
                email: p.emailAluno,
                numeroUSP: p.numeroUSP,
                dataHora: p.dataHora,
            })),
        };
    }

    // opcional: fechar chamada
    async fecharChamada(dto: VerListaDePresencasDto, professorId: number, role: string) {

        if (role != "Professor") throw new UnauthorizedException("Somente professores!");

        const codigoChamada = dto.codigoChamada;

        const chamada = await this.chamadaRepository.findOne({
            where: { codigoChamada, professor: { id: professorId } },
        });

        if (!chamada) throw new NotFoundException('Chamada não encontrada ou não pertence a este professor.');
        chamada.aberta = false;
        return await this.chamadaRepository.save(chamada);
    }

    async verChamadaAberta(codigoTurma: string, idProfessor: number) {
        const chamadaAberta = await this.chamadaRepository.findOne({
            where: {
                turma: { codigo: codigoTurma },
                aberta: true,
            },
            relations: ['turma'],
        });

        if (!chamadaAberta) throw new NotFoundException("Não há chamadas em aberto para está turma!");

        const dataAtual = new Date();
        const dataCriacao = new Date(chamadaAberta.criadaEm);
        //Calcula a diferença em milisegundos desde 1970
        const difMs = dataAtual.getTime() - dataCriacao.getTime();

        //24 horas em milisegundos = 24 * 60 * 60  * 1000
        if (difMs >= 24 * 60 * 60 * 1000) {
            //Chama o serviço para fechar a chamada
            chamadaAberta.aberta = false;
            await this.chamadaRepository.save(chamadaAberta);
        }

        return {
            codigoChamada: chamadaAberta.codigoChamada,
            turma: chamadaAberta.turma.nomeCurso,
            data: chamadaAberta.criadaEm
        }

    }

    async verCodigoTurma(codigoChamada: string) {
        const chamada = await this.chamadaRepository.findOne({
            where: { codigoChamada }, // ← filtra pela coluna exata
            relations: ['turma', 'turma.materia'], // ← carrega a turma e matéria se quiser
            select: {
                turma: {
                    codigo: true,
                    nomeCurso: true,
                    // outros campos da turma que quiser
                },
            },
        });

        if (!chamada) {
            throw new NotFoundException('Chamada não encontrada');
        }

        if (!chamada.aberta) {
            throw new BadRequestException('Esta chamada já foi encerrada');
        }

        return {
            codigoTurma: chamada.turma.codigo,
            nomeTurma: chamada.turma.nomeCurso || chamada.turma.codigo,
            materia: chamada.turma.materia?.nomeMateria || 'Não informada',
            codigoChamada: chamada.codigoChamada,
        };
    }

    async findAllRollCall(idProfessor: number, role: string) {
        if (role !== 'Professor') throw new UnauthorizedException("Somente professores!");

        const professor = await this.professorRepository.findOne({
            where: { id: idProfessor }
        })

        if (!professor) throw new NotFoundException("Professor não encontrado!");

        const chamadas = await this.chamadaRepository
            .createQueryBuilder('chamada')
            .leftJoin('chamada.professor', 'professor')
            .leftJoin('chamada.presencas', 'presenca')
            .leftJoin('chamada.turma', 'turma')
            .select([
                'chamada.id',
                'chamada.criadaEm',
                'chamada.codigoChamada',
                'turma.nomeCurso',
                // 'presenca.nomeAluno',
                // 'presenca.emailAluno',
                // 'presenca.dataHora'
            ])
            .where('professor.id = :idProfessor', { idProfessor })
            .getMany();

        return chamadas;

    }
}
