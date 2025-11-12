import { Body, Controller, Post, UseGuards, Request, Get } from '@nestjs/common';
import { ChamadaService } from './chamada.service';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { CreateChamadaDto } from './dto/create-chamada.dto';
import { get } from 'axios';
import { VerListaDePresencasDto } from './dto/verChamada.dto';

@Controller('chamada')
export class ChamadaController {
    constructor(private readonly chamadaService: ChamadaService){}

    @UseGuards(JwtAuthGuard)
    @Post('criar-chamada')
    criarChamada(@Body() dto: CreateChamadaDto, @Request() req){
        return this.chamadaService.criarChamada(dto, req.user.id, req.user.role);
    }

    @UseGuards(JwtAuthGuard)
    @Get('lista-presencas')
    verListaDePresencas(@Body() dto: VerListaDePresencasDto, @Request() req){
        return this.chamadaService.verListaDePresencas(dto, req.user.id)
    }
}
