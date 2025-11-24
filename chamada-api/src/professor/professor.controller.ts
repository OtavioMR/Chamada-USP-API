import { Body, Controller, Post, Get, Param, UseGuards, Request} from '@nestjs/common';
import { ProfessorService } from './professor.service';
import { CreateProfessorDto } from './dto/create-professor.dto';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('professor')
export class ProfessorController {
    constructor(private readonly professorService: ProfessorService) {}

    @Post('Cadastro-Professor')
    create(@Body() dto: CreateProfessorDto) {
        return this.professorService.create(dto);
    }

    @Get('Professores-Cadastrados')
    findAll(){
        return this.professorService.findAll();
    }


    @UseGuards(JwtAuthGuard)
    @Get('me')
    findOne(@Request() req) {
        return this.professorService.findOne(req.user.id, req.user.role);
    }
}
