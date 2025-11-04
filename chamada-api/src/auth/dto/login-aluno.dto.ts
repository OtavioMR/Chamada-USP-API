import { IsEmail, IsString } from "class-validator";

export class LoginAlunoDto {
    @IsEmail()
    emailUSP: string;

    @IsString()
    senha: string;
}