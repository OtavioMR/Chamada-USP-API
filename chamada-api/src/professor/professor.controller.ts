import { Body, Controller, Post, Get, Param, UseGuards } from '@nestjs/common';
import { ProfessorService } from './professor.service';
import { CreateProfessorDto } from './dto/create-professor.dto';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';

@Controller('professor')
export class ProfessorController {
    constructor(private readonly professorService: ProfessorService) {}

    @Post('Cadastro-Professor')
    create(@Body() dto: CreateProfessorDto) {
        return this.professorService.create(dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('Professores-Cadastrados')
    findAll(){
        return this.professorService.findAll();
    }

    @Get('id/:id')
    findOne(@Param('id') id: number) {
        return this.professorService.findOne(id);
    }
}
