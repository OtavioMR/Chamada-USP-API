import { Aluno } from "src/aluno/entity/aluno.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('Presenca')
export class Presenca {

    @PrimaryGeneratedColumn()
    id: number;


    // Cada presença pertence a um aluno
    @ManyToOne(() => Aluno, (aluno) => aluno.presencas, { onDelete: 'CASCADE' })
    aluno: Aluno;

    // Define se o aluno marcou presença (caso queira marcar faltas também)
    @Column({ default: true })
    presenca: boolean;

    // Momento em que o aluno marcou presença
    @CreateDateColumn()
    dataHora: Date;

}