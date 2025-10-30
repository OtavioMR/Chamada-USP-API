import { BadRequestException, Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { CreateQRCodeDto } from './dto/create-qrCode.dto';

@Injectable()
export class QrCodeService {
  async create(dto: CreateQRCodeDto) {
    if (!dto.materia || !dto.turma) {
      throw new BadRequestException('Matéria e turma são obrigatórias!');
    }

    // Link temporário só para teste
    const urlTeste = `https://github.com/OtavioMR?teste=${Date.now()}`;

    // Gera o QR Code em Base64
    const qrCodeBase64 = await QRCode.toDataURL(urlTeste);

    return {
      mensagem: 'QR Code gerado com sucesso (teste)',
      link: urlTeste,
      qrCodeBase64,
    };
  }
}
