import { Body, Controller, HttpCode, HttpStatus, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAlunoDto } from './dto/login-aluno.dto';
import { LoginProfessorDto } from './dto/login-professor.dto';

@Controller('auth')
export class AuthController {
    constructor (private authService: AuthService) {}


    // LOGIN DO PROFESSOR
    @Post('professor/login')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ whitelist: true}))
    async loginProfessor(@Body() dto: LoginProfessorDto) {
        return this.authService.loginProfessor(dto.emailUSP, dto.senha);
    }


    //LOGIN DO ALUNO        
    @Post('aluno/login')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({whitelist: true}))
    async loginAluno(@Body() dto: LoginAlunoDto) {
        return this.authService.loginAluno(dto.emailUSP, dto.senha);
    }

    
}
