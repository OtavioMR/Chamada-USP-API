import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ProfessorService } from 'src/professor/professor.service';
import * as bcrypt from 'bcrypt';
import { AlunoService } from 'src/aluno/aluno.service';
import { access } from 'fs';

@Injectable()
export class AuthService {
    constructor(
        private professorService: ProfessorService,
        private alunoService: AlunoService,
        private jwtService: JwtService,
    ) { }

    async loginProfessor(emailUSP: string, senha: string) {
        const professor = await this.professorService.findByEmail(emailUSP);
        if (!professor) {
            throw new UnauthorizedException('Credenciais inválidas');
        }

        const senhaInvalida = await bcrypt.compare(senha, professor.senha);
        if (!senhaInvalida) {
            throw new UnauthorizedException('Credenciais inválidas');
        } 

        const payload = { sub: professor.id, emailUSP: professor.emailUSP, role: 'professor'};
        const token = this.jwtService.sign(payload);

        return {
            access_token: token,
        }
    }



    async loginAluno(emailUSP: string, senha: string) {

        const aluno = await this.alunoService.findByEmail(emailUSP);
        if (!aluno) {
            throw new UnauthorizedException('Credencias inválidas');
        }

        const senhaInvalida = await bcrypt.compare(senha, aluno.senha);
        if (!senhaInvalida) {
            throw new UnauthorizedException('Credenciais inválidas');
        }

        const payload = { sub: aluno.id, role: 'aluno'};
        const token = this.jwtService.sign(payload);

        return {
            access_token: token, aluno
        };

    }
}
