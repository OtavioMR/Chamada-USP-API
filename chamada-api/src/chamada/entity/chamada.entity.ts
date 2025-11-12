import { Professor } from "src/professor/entity/professor.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('Chamada')
export class Chamada {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    codigoTurma: string;

    @Column({unique: true})
    codigoChamada: string;

    @ManyToOne(() => Professor, (professor) => professor.chamadas)
    professor: Professor;
}