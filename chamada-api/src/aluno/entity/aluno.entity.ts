import { Turma } from "src/turma/entity/turma.entity";
import { Presenca } from "src/presenca/entity/presenca.entity";
import { Column, Entity, PrimaryGeneratedColumn, ManyToMany, OneToMany, JoinTable } from "typeorm";

@Entity('Alunos')
export class Aluno {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nomeCompleto: string;

  @Column({ unique: true })
  numeroUSP: string;

  @Column({ unique: true })
  emailUSP: string;

  @Column()
  senha: string;

  // 👇 Um aluno pode estar em várias turmas, e uma turma pode ter vários alunos
  @ManyToMany(() => Turma, (turma) => turma.alunos) //{ eager: true }) //O { eager: true } é opcional e serve pra carregar automaticamente as turmas sempre que buscar um aluno (útil se quiser ver as turmas direto no JSON retornado).
  @JoinTable() // Cria a tabela intermediária aluno_turma
  turmas: Turma[];

  // 👇 Um aluno pode ter várias presenças
  @OneToMany(() => Presenca, (presenca) => presenca.id)
  presencas: Presenca[];
}
