import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Professor } from "src/professor/entity/professor.entity";
import { profile } from "console";

@Entity('Materia')
export class Materia{
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nomeMateria: string;

    @ManyToOne(() => Professor, (professor) => professor.materias)
    professor: Professor[];
    
}