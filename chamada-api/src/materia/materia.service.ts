import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Materia } from './entity/materia.entity';
import { CreateMateriaDto } from './dto/create-materia.dto';
import { Professor } from 'src/professor/entity/professor.entity';

@Injectable()
export class MateriaService {
    constructor(
        @InjectRepository(Materia)
        private materiaRepository: Repository<Materia>,
        @InjectRepository(Professor)
        private professorRepository: Repository<Professor>,
    ) { }

    async cadastrarMateria(dto: CreateMateriaDto, idProfessor: number, role: string) {
        if (role !== "Professor") throw new UnauthorizedException("Somente professores podem cadastrar uma matéria!");

        const professor = await this.professorRepository.findOne({ where: { id: idProfessor } });
        if (!professor) throw new NotFoundException("Professor não encontrado!");

        const novaMateria = this.materiaRepository.create({
            nomeMateria: dto.nomeMateria,
            professor: professor,
        });

        return await this.materiaRepository.save(novaMateria);

    }

    async findAll(idProfessor: number, role: string){
        const professor = await this.professorRepository.findOne({
            where: {id: idProfessor},
            relations: ['materias'],
        });

        if(!professor || role !== "Professor") throw new UnauthorizedException("Somente professores!");

       return professor.materias;
    }

}

