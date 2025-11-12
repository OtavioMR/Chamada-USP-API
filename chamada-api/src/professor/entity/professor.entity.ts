import { channel } from "diagnostics_channel";
import { Chamada } from "src/chamada/entity/chamada.entity";
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

    @OneToMany(()=> Chamada, (chamadas) => chamadas.professor)
    chamadas: Chamada[];

}