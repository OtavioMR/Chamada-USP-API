import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Aluno } from "src/aluno/entity/aluno.entity";
import { Chamada } from "src/chamada/entity/chamada.entity";
import { Turma } from "src/turma/entity/turma.entity";

@Entity('Presencas')
export class Presenca {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nomeAluno: string;

    @Column()
    numeroUSP: string;

    @Column()
    codigoTurma: string;

    @Column()
    codigoChamada: string;

    @Column()
    emailAluno: string;

    @Column({ type: 'date' })
    data: Date;

    @Column({ type: 'timestamp' })
    dataHora: Date;

    @ManyToOne(() => Aluno, aluno => aluno.presencas)
    aluno: Aluno;

    @ManyToOne(() => Turma, turma => turma.chamadas)
    turma: Turma;

    @ManyToOne(() => Chamada, chamada => chamada.presencas)
    chamada: Chamada;
}
