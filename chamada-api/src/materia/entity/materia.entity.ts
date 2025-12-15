import { Column, Entity, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
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

  // Materia entity
  @OneToMany(() => Turma, turma => turma.materia)
  turmas: Turma[]


  @OneToMany(() => Chamada, chamada => chamada.materia)
  chamadas: Chamada[]
}
