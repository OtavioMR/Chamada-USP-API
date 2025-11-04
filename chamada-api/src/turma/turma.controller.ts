import { Body, Controller, Post, Get, UseGuards, Request } from '@nestjs/common';
import { TurmaService } from './turma.service';
import { CreateTurmaDto } from './dto/create-turma.dto';
import { throws } from 'assert';
import { BADFAMILY } from 'dns';
import { EntrarTurmaDto } from './dto/EntrarTurma.dto';
import { retail } from 'googleapis/build/src/apis/retail';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';

@Controller('turma')
export class TurmaController {
    constructor(private readonly turmaService: TurmaService) {}

    @UseGuards(JwtAuthGuard)
    @Post('criar-turma')
    create(@Body() dto: CreateTurmaDto, @Request() req) {
        const professorId = req.user.id;
        return this.turmaService.create(dto, professorId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('entrar')
    entrarNaTurma(@Body() dto: EntrarTurmaDto, @Request()  req){
        return this.turmaService.entrarNaTurma(dto.codigoTurma, req.user.id);
    }
}
