import { Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('Materia')
export class Materia{
    
    @PrimaryGeneratedColumn()
    id: number;

    
}