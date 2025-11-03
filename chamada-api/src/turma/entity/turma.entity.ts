import { Aluno } from "src/aluno/entity/aluno.entity";
import { Professor } from "src/professor/entity/professor.entity";
import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity('Turmas')
export class Turma {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nomeCurso: string;

    @Column({unique: true})
    codigo: string;

    @Column()
    ano: string;

    @Column()
    semestre: string;

    @ManyToOne(() => Professor, (professor) => professor.turmas)
    professor: Professor;

    @ManyToMany(() => Aluno, (aluno) => aluno.turmas)
    alunos: Aluno[];
}