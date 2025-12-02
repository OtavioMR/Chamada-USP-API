import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Turma } from './entity/turma.entity';
import { Repository } from 'typeorm';
import { Aluno } from 'src/aluno/entity/aluno.entity';
import { CreateTurmaDto } from './dto/create-turma.dto';
import { Professor } from 'src/professor/entity/professor.entity';
import { CreateAlunoDto } from 'src/aluno/dto/create-aluno.dto';
import { Presenca } from 'src/presenca/entity/presenca.entity';
import { Materia } from 'src/materia/entity/materia.entity';

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
        @InjectRepository(Materia)
        private materiasRepository: Repository<Materia>,
    ) { }

    async create(dto: CreateTurmaDto, idProfessor: number, role: string) {
        // Validação básica
        if (!dto.nomeCurso || !dto.ano || !dto.semestre) {
            throw new ConflictException("Todos os campos são obrigatórios!");
        }

        if (role !== 'Professor') {
            throw new UnauthorizedException('Somente professores podem criar turmas!');
        }

        const professor = await this.professorRepository.findOne({
            where: { id: idProfessor },
            relations: ['materias'],
        });

        if (!professor) {
            throw new NotFoundException('Professor não encontrado');
        }

        // FORÇA SER ARRAY SEMPRE
        const materiasIdsSelecionadas = Array.isArray(dto.materiasIds)
            ? dto.materiasIds
            : [];   // ← se não for array, vira vazio

        // Agora .includes nunca vai quebrar
        const materiasValidas = professor.materias.filter(materia =>
            materiasIdsSelecionadas.includes(materia.id)
        );


        // Se mandou IDs que não existem nas matérias do professor → avisa
        const idsInvalidos = materiasIdsSelecionadas.filter(
            id => !professor.materias.some(m => m.id === id)
        );
        if (idsInvalidos.length > 0) {
            throw new ConflictException(`Você não leciona as matérias: ${idsInvalidos.join(', ')}`);
        }

        const codigoGerado = await this.gerarCodigoUnico();

        const novaTurma = this.turmaRepository.create({
            nomeCurso: dto.nomeCurso.trim(),
            codigo: codigoGerado,
            ano: dto.ano,
            semestre: dto.semestre,
            data: new Date(),
            professor: professor,
            materias: materiasValidas,
        } as Turma);   // ← ESSA LINHA RESOLVE TUDO

        return await this.turmaRepository.save(novaTurma);
    }
    private async gerarCodigoUnico(): Promise<string> {
        const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let tentativa = 0;

        while (tentativa < 20) { // aumentei pra 20 por segurança
            let codigo = "";
            for (let i = 0; i < 6; i++) { // 6 caracteres fica melhor
                codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
            }

            const existe = await this.turmaRepository.findOne({ where: { codigo } });
            if (!existe) {
                return codigo;
            }
            tentativa++;
        }

        throw new Error("Não foi possível gerar um código único");
    }

    async entrarNaTurma(codigoTurma: string, idAluno: number, roleAluno: string) {

        if (roleAluno !== 'Aluno') {
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
        const dataConvertida = new Date(data);
        dataConvertida.setHours(0, 0, 0, 0);

        const presencas = await this.presencaRepository.find({
            where: { codigoTurma, data: dataConvertida },
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