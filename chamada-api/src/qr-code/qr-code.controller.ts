import { Body, Controller, Post, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { QrCodeService } from './qr-code.service';
import { CreateQRCodeDto } from './dto/create-qrCode.dto';


@Controller('qr-code')
export class QrCodeController {
  constructor(private readonly qrService: QrCodeService) {}

  @Post('gerar')
  async create(@Body() dto: CreateQRCodeDto) {
    return this.qrService.create(dto);
  }

  @Get('visualizar')
  async verQRCode(@Res() res: Response) {
    const dto = { materia: 'Matemática', turma: 'A1' };
    const { qrCodeBase64 } = await this.qrService.create(dto);

    // Retorna a imagem direto pro navegador
    const img = qrCodeBase64.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(img, 'base64');
    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
  }
}
