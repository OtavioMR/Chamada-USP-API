import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Turma } from "src/turma/entity/turma.entity";
import { Chamada } from "src/chamada/entity/chamada.entity";
import { Materia } from "src/materia/entity/materia.entity";

@Entity('Professores')
export class Professor {

  @PrimaryGeneratedColumn()
  id: number

  @Column()
  nomeCompleto: string

  @Column({ unique: true })
  emailUSP: string

  @Column()
  senha: string

  @OneToMany(() => Turma, turma => turma.professor)
  turmas: Turma[]

  @OneToMany(() => Chamada, chamada => chamada.professor)
  chamadas: Chamada[]

  @OneToMany(() => Materia, materia => materia.professor)
  materias: Materia[]
}
