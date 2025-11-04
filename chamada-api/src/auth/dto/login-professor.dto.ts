import { IsEmail, IsNotEmpty } from "class-validator";

export class LoginProfessorDto{
    @IsEmail()
    emailUSP: string;

    @IsNotEmpty()
    senha: string;
}