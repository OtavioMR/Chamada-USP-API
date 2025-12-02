import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Turma } from "src/turma/entity/turma.entity";
import { Professor } from "src/professor/entity/professor.entity";
import { Presenca } from "src/presenca/entity/presenca.entity";
import { Materia } from "src/materia/entity/materia.entity";

@Entity('Chamadas')
export class Chamada {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    codigoChamada: string;

    @Column({ type: 'date' })
    data: Date;

    @ManyToOne(() => Turma, turma => turma.chamadas)
    turma: Turma;

    @ManyToOne(() => Professor, professor => professor.chamadas)
    professor: Professor;

    @ManyToOne(() => Materia, materia => materia.chamadas)
    materia: Materia;

    @OneToMany(() => Presenca, presenca => presenca.chamada)
    presencas: Presenca[];

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    criadaEm: Date;

    @Column({ default: true })
    aberta: boolean;

}
