import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Turma } from './entity/turma.entity';
import { Aluno } from 'src/aluno/entity/aluno.entity';
import { CreateTurmaDto } from './dto/create-turma.dto';
import { Professor } from 'src/professor/entity/professor.entity';
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
    private materiaRepository: Repository<Materia>,
  ) {}

  async create(dto: CreateTurmaDto, idProfessor: number, role: string) {
    if (!dto.nomeCurso || !dto.ano || !dto.semestre || !dto.materiaId) {
      throw new ConflictException('Todos os campos são obrigatórios!');
    }

    if (role !== 'Professor') {
      throw new UnauthorizedException('Somente professores podem criar turmas!');
    }

    // Pega o professor com suas matérias
    const professor = await this.professorRepository.findOne({
      where: { id: idProfessor },
      relations: ['materias'],
    });

    if (!professor) throw new NotFoundException('Professor não encontrado');

    // Pega a matéria específica
    const materia = professor.materias.find(m => m.id === dto.materiaId);
    if (!materia) throw new ConflictException('Você não leciona essa matéria');

    const novaTurma = this.turmaRepository.create({
      nomeCurso: dto.nomeCurso.trim(),
      codigo: await this.gerarCodigoUnico(),
      ano: dto.ano,
      semestre: dto.semestre,
      data: new Date(),
      professor: professor,
      materia: materia, // apenas 1 matéria
    });

    return await this.turmaRepository.save(novaTurma);
  }

  private async gerarCodigoUnico(): Promise<string> {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let tentativa = 0;

    while (tentativa < 20) {
      let codigo = '';
      for (let i = 0; i < 6; i++) {
        codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
      }

      const existe = await this.turmaRepository.findOne({ where: { codigo } });
      if (!existe) return codigo;
      tentativa++;
    }

    throw new Error('Não foi possível gerar um código único');
  }

  async entrarNaTurma(codigoTurma: string, idAluno: number, roleAluno: string) {
    if (roleAluno !== 'Aluno') throw new UnauthorizedException('Apenas alunos podem entrar em turmas');

    const aluno = await this.alunoRepository.findOne({ where: { id: idAluno } });
    if (!aluno) throw new NotFoundException('Aluno não encontrado');

    const turma = await this.turmaRepository.findOne({
      where: { codigo: codigoTurma },
      relations: ['alunos'],
    });

    if (!turma) throw new NotFoundException('Turma não encontrada');

    if (turma.alunos.some(a => a.id === aluno.id)) {
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

    if (!turma) throw new NotFoundException('Turma não encontrada');

    return turma.alunos.map(a => ({
      nomeCompleto: a.nomeCompleto,
      emailUSP: a.emailUSP,
      numeroUSP: a.numeroUSP,
    }));
  }

  async findAll(professorId: number) {
    return await this.professorRepository.findOne({
      where: { id: professorId },
      relations: ['turmas', 'turmas.materia'],
    });
  }

  async verChamadaTurma(professorId: number, codigoTurma: string, data: string) {
    const professor = await this.professorRepository.findOne({
      where: { id: professorId },
      relations: ['turmas'],
    });
    if (!professor) throw new NotFoundException('Professor não encontrado');

    const turma = professor.turmas.find(t => t.codigo === codigoTurma);
    if (!turma) throw new ConflictException('Turma não pertence a este professor');

    const dataConvertida = new Date(data);
    dataConvertida.setHours(0, 0, 0, 0);

    const presencas = await this.presencaRepository.find({
      where: { codigoTurma, data: dataConvertida },
      order: { nomeAluno: 'ASC' },
    });

    return presencas.map(p => ({
      nome: p.nomeAluno,
      email: p.emailAluno,
      numeroUSP: p.numeroUSP,
      data: p.data,
      horaMarcada: p.dataHora,
    }));
  }
}
