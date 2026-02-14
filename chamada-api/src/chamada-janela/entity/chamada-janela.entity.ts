import { Chamada } from "src/chamada/entity/chamada.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('chamada_janela')
export class ChamadaJanela{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    codigoJanela: string;

    @CreateDateColumn()
    dataCriacao: Date;

    @Column()
    dataExpiracao: Date;

    @Column({default: true})
    ativa: boolean;

    @ManyToOne(() => Chamada, chamada => chamada.janelas, {onDelete:"CASCADE"})
    chamada: Chamada;
}