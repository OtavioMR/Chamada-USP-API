import { Body, Controller, Post, Get, UseGuards, Request, Param } from '@nestjs/common';
import { TurmaService } from './turma.service';
import { CreateTurmaDto } from './dto/create-turma.dto';
import { throws } from 'assert';
import { BADFAMILY } from 'dns';
import { EntrarTurmaDto } from './dto/EntrarTurma.dto';
import { retail } from 'googleapis/build/src/apis/retail';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';

@Controller('turma')
export class TurmaController {
    constructor(private readonly turmaService: TurmaService) { }

    @UseGuards(JwtAuthGuard)
    @Post('criar-turma')
    create(@Body() dto: CreateTurmaDto, @Request() req) {
        return this.turmaService.create(dto, req.user.id, req.user.role);
    }

    @UseGuards(JwtAuthGuard)
    @Post('entrar')
    entrarNaTurma(@Body() dto: EntrarTurmaDto, @Request() req) {
        return this.turmaService.entrarNaTurma(dto.codigoTurma, req.user.id, req.user.role);
    }

    @Get(':codigo/alunos')
    async verAlunosDaTurma(@Param('codigo') codigo: string) {
        return this.turmaService.verAlunosDaTurma(codigo);
    }

    @UseGuards(JwtAuthGuard)
    @Get('ver-turmas')
    findAll(@Request() req) {
        return this.turmaService.findAll(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':codigo/chamada/:data')
    verChamadaDaTurma(
        @Request() req,
        @Param('codigo') codigo: string,
        @Param('data') data: string,
    ) {
        return this.turmaService.verChamadaTurma(req.user.id, codigo, data);
    }

}
