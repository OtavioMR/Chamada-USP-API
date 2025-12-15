import { Aluno } from "src/aluno/entity/aluno.entity";
import { Chamada } from "src/chamada/entity/chamada.entity";
import { Materia } from "src/materia/entity/materia.entity";
import { Professor } from "src/professor/entity/professor.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('Turmas')
export class Turma {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nomeCurso: string;

    @Column({ unique: true })
    codigo: string;

    @Column()
    ano: string;

    @Column()
    semestre: string;

    @ManyToOne(() => Professor, professor => professor.turmas, { eager: true })
    professor: Professor;

    @ManyToMany(() => Aluno, aluno => aluno.turmas)
    @JoinTable()
    alunos: Aluno[];

    @OneToMany(() => Chamada, chamada => chamada.turma)
    chamadas: Chamada[];

    // Turma entity
    @ManyToOne(() => Materia, materia => materia.turmas, { eager: true })
    materia: Materia;


    @Column({ type: 'date' })
    data: Date;

}
