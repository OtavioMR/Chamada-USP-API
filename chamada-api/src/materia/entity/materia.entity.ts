import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Professor } from "src/professor/entity/professor.entity";
import { Turma } from "src/turma/entity/turma.entity";
import { Chamada } from "src/chamada/entity/chamada.entity";

@Entity('Materias')
export class Materia {

  @PrimaryGeneratedColumn()
  id: number

  @Column()
  nomeMateria: string

  @ManyToOne(() => Professor, professor => professor.materias)
  professor: Professor

  @ManyToMany(() => Turma, turma => turma.materias)
  turmas: Turma[]

  @OneToMany(() => Chamada, chamada => chamada.materia)
  chamadas: Chamada[]
}
