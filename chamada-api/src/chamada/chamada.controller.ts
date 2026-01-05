import { Body, Controller, Post, UseGuards, Request, Get, Patch, Query, Param } from '@nestjs/common';
import { ChamadaService } from './chamada.service';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { CreateChamadaDto } from './dto/create-chamada.dto';
import { get } from 'axios';
import { VerListaDePresencasDto } from './dto/verChamada.dto';
import { drive } from 'googleapis/build/src/apis/drive';
import { QrCodeService } from 'src/qr-code/qr-code.service';
import { CreateQRCodeDto } from 'src/qr-code/dto/create-qrCode.dto';

@Controller('chamada')
export class ChamadaController {
    constructor(
        private readonly chamadaService: ChamadaService,
        private readonly qrCodeSerivce: QrCodeService,
    ) { }


    @UseGuards(JwtAuthGuard)
    @Post('criar-chamada')
    criarChamada(@Body() dto: CreateChamadaDto, @Request() req) {
        return this.chamadaService.criarChamada(dto, req.user.id, req.user.role);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('atualizar-chamada')
    fecharChamada(@Body() dto: VerListaDePresencasDto, @Request() req) {
        return this.chamadaService.fecharChamada(dto, req.user.id, req.user.role);
    }

    @UseGuards(JwtAuthGuard)
    @Get('lista-presencas/:codigo')
    verListaDePresencas(@Request() req, @Param("codigo") codigo: string) {
        return this.chamadaService.verListaDePresencas(req.user.id, codigo);
    }

    @UseGuards(JwtAuthGuard)
    @Get('chamada-aberta')
    verChamadaAberta(@Query('codigoTurma') codigoTurma: string, @Request() req) {
        return this.chamadaService.verChamadaAberta(codigoTurma, req.user.id)
    }

    @Get('codigo-turma')
    verCodigoTurma(@Query('codigoChamada') codigoChamada) {
        return this.chamadaService.verCodigoTurma(codigoChamada);
    }

    @UseGuards(JwtAuthGuard)
    @Get('buscar-chamadas')
    findAllRollCall(@Request() req) {
        return this.chamadaService.findAllRollCall(req.user.id, req.user.role)
    }
}
