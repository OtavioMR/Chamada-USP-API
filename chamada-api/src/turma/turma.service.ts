import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Turma } from './entity/turma.entity';
import { Repository } from 'typeorm';
import { Aluno } from 'src/aluno/entity/aluno.entity';
import { CreateTurmaDto } from './dto/create-turma.dto';
import { Professor } from 'src/professor/entity/professor.entity';
import { CreateAlunoDto } from 'src/aluno/dto/create-aluno.dto';
import { Presenca } from 'src/presenca/entity/presenca.entity';

@Injectable()
export class TurmaService {
    constructor(
        @InjectRepository(Turma)
        private turmaRepository: Repository<Turma>,
        @InjectRepository(Aluno)
        private alunoRepository: Repository<Aluno>,
        @InjectRepository(Professor)
        private professorRepository: Repository<Professor>,
        @InjectRepository(Presenca)
        private presencaRepository: Repository<Presenca>,
    ) { }

    async create(dto: CreateTurmaDto, idProfessor: number, role: string) {

        if(dto.nomeCurso === "" || dto.semestre === "" || dto.semestre === ""){
            throw new ConflictException("Todos os dados devem ser preenchidos!");
        }

        if (role !== 'Professor') {
            throw new UnauthorizedException('Somente professores podem criar turmas!');
        }

        const professor = await this.professorRepository.findOne({
            where: { id: idProfessor },
        });

        if (!professor) {
            throw new NotFoundException('Professor não encontrado');
        }


        const codigoGerado = await this.gerarCodigoUnico();

        const novaTurma = this.turmaRepository.create({
            nomeCurso: dto.nomeCurso,
            codigo: codigoGerado,
            ano: dto.ano,
            semestre: dto.semestre,
            professor: professor,
        });

        return await this.turmaRepository.save(novaTurma);

    }

    private async gerarCodigoUnico(): Promise<string> {
        const caracteresPermitidos = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        let codigo: string;
        let existe: boolean;
        let tentativa = 0;

        while (tentativa < 10) {
            tentativa++;
            codigo = "";
            for (let i = 0; i < 4; i++) {
                const indiceAleatorio = Math.floor(Math.random() * caracteresPermitidos.length);
                codigo += caracteresPermitidos.charAt(indiceAleatorio);
            }

            const existe = await this.turmaRepository.findOne({ where: { codigo } });
            if (!existe) {
                return codigo;
            }
        }

        throw new Error("Falha ao gerar código único após 10 tentativas");
    }

    async entrarNaTurma(codigoTurma: string, idAluno: number, roleAluno: string) {

        if (roleAluno !== 'aluno') {
            throw new UnauthorizedException('Apenas alunos podem entrar em turmas');
        }


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

    async findAll(professorId: number) {
        const professor = await this.professorRepository.findOne({ where: { id: professorId }, relations: ['turmas'] });
        return professor;
    }

    async verChamadaTurma(professorId: number, codigoTurma: string, data: string) {
        // Busca o professor com suas turmas
        const professor = await this.professorRepository.findOne({
            where: { id: professorId },
            relations: ['turmas'],
        });

        if (!professor) {
            throw new NotFoundException('Professor não encontrado');
        }

        // Verifica se o código da turma realmente pertence ao professor
        const turma = professor.turmas.find(t => t.codigo === codigoTurma);
        if (!turma) {
            throw new Error('Turma não pertence a este professor');
        }

        // Busca todas as presenças registradas para essa turma e data
        const presencas = await this.presencaRepository.find({
            where: { codigoTurma, data },
            order: { nomeAluno: 'ASC' },
        });

        // Mapeia o resultado em um formato amigável
        return presencas.map(p => ({
            nome: p.nomeAluno,
            email: p.emailAluno,
            numeroUSP: p.numeroUSP,
            data: p.data,
            horaMarcada: p.dataHora,
        }));
    }

}