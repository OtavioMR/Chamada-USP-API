import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity('Presenca')
@Index(['emailAluno', 'codigoTurma', 'codigoChamada'], { unique: true })
export class Presenca {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nomeAluno: string;

    @Column()
    emailAluno: string;

    @Column()
    numeroUSP: string;

    @Column()
    codigoChamada: string;

    @Column()
    codigoTurma: string;

    // Data da aula (dia específico da chamada)
    @Column({ type: 'date' })
    data: string;

    // Momento em que o aluno marcou presença
    @CreateDateColumn()
    dataHora: Date;

    


}