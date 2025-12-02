import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Turma } from "src/turma/entity/turma.entity";
import { Presenca } from "src/presenca/entity/presenca.entity";

@Entity('Alunos')
export class Aluno {

  @PrimaryGeneratedColumn()
  id: number

  @Column()
  nomeCompleto: string

  @Column({ unique: true })
  numeroUSP: string

  @Column({ unique: true })
  emailUSP: string

  @Column()
  senha: string

  @ManyToMany(() => Turma, turma => turma.alunos)
  turmas: Turma[]

  @OneToMany(() => Presenca, presenca => presenca.aluno)
  presencas: Presenca[]
}
