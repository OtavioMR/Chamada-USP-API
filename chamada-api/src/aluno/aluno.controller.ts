import { Body, Controller, Post, Get, Param, Request, UseGuards } from '@nestjs/common';
import { AlunoService } from './aluno.service';
import { CreateAlunoDto } from './dto/create-aluno.dto';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';


@Controller('aluno')
export class AlunoController {
    constructor(private readonly alunoService: AlunoService) {}
    
    @Post('cadastro-aluno')
    create(@Body() dto: CreateAlunoDto) {
        return this.alunoService.create(dto);
    }

    @Get('alunos-cadastrados')
    findAll(){
        return this.alunoService.findAll();
    }

    @Get(':id/turmas')
    findOne(@Param('id') id: number){
        return this.alunoService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    meusDados(@Request() req){
        return this.alunoService.meusDados(req.user.id, req.user.role);
    }
}
