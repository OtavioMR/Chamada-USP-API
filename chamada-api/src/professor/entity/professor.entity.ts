import { Turma } from "src/turma/entity/turma.entity";
import { Collection, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('Professores')
export class Professor {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nomeCompleto: string;

    @Column({ unique: true })
    emailUSP: string;

    @Column()
    senha: string;

    @OneToMany(() => Turma, (turma) => turma.professor)
    turmas: Turma[];

}