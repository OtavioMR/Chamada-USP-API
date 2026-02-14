import { Body, Controller, Post, Get, Res, UseGuards, Request, Put } from '@nestjs/common';
import type { Response } from 'express';
import { QrCodeService } from './qr-code.service';
import { CreateQRCodeDto } from './dto/create-qrCode.dto';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { fecharChamadaDto } from './dto/update-qrCode.dto';

@Controller('qr-code')
export class QrCodeController {
  constructor(private readonly qrService: QrCodeService) { }

  @UseGuards(JwtAuthGuard)
  @Post('gerar')
  async create(@Body() dto: CreateQRCodeDto, @Request() req) {
    // Passa o professor logado pro serviço
    return this.qrService.create(dto, req.user.id, req.user.role);
  }

  // @Get('visualizar')
  // async verQRCode(@Res() res: Response) {
  //   const dto = { materia: 'Matemática', turma: 'A1' };
  //   const { qrCodeBase64 } = await this.qrService.create(dto);

  //   // Retorna a imagem direto pro navegador
  //   const img = qrCodeBase64.replace(/^data:image\/png;base64,/, '');
  //   const buffer = Buffer.from(img, 'base64');
  //   res.setHeader('Content-Type', 'image/png');
  //   res.send(buffer);
  // }
}
