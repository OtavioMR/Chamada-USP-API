import { BadRequestException, Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { CreateQRCodeDto } from './dto/create-qrCode.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChamadaService } from 'src/chamada/chamada.service';
import { Chamada } from 'src/chamada/entity/chamada.entity';

@Injectable()
export class QrCodeService {
  constructor(
    @InjectRepository(Chamada)
    private readonly chamadaRepository: Repository<Chamada>,
    private readonly chamadaService: ChamadaService,
  ) {}

  async create(dto: CreateQRCodeDto, professorId: number, role: string) {
    if (!dto.codigoTurma) {
      throw new BadRequestException('Código da turma é obrigatório!');
    }

    // Busca chamada aberta para a turma específica
    let chamadaAberta = await this.chamadaRepository.findOne({
      where: {
        turma: { codigo: dto.codigoTurma },
        aberta: true,
      },
      relations: ['turma'],
    });

    let chamadaParaUsar: Chamada;
    let isReutilizada = false;

    if (chamadaAberta) {
      const dataAtual = new Date();
      const dataCriacao = new Date(chamadaAberta.criadaEm);
      const difMs = dataAtual.getTime() - dataCriacao.getTime();
      const vinteQuatroHorasMs = 24 * 60 * 60 * 1000;

      if (difMs >= vinteQuatroHorasMs) {
        // Expira a chamada antiga
        chamadaAberta.aberta = false;
        await this.chamadaRepository.save(chamadaAberta);
        // Cria nova
        chamadaParaUsar = await this.chamadaService.criarChamada(
          { codigoTurma: dto.codigoTurma },
          professorId,
          role,
        );
      } else {
        // Reutiliza a existente (sem throw!)
        chamadaParaUsar = chamadaAberta;
        isReutilizada = true;
      }
    } else {
      // Nenhuma aberta → cria nova
      chamadaParaUsar = await this.chamadaService.criarChamada(
        { codigoTurma: dto.codigoTurma },
        professorId,
        role,
      );
    }

    // Gera o QR Code
    const urlQr = `http://localhost:5173/aluno/presenca/registrar/${chamadaParaUsar.codigoChamada}`;
    const qrCodeBase64 = await QRCode.toDataURL(urlQr, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 500,
    });

    return {
      mensagem: isReutilizada
        ? 'Chamada existente reutilizada com sucesso!'
        : 'QR Code gerado e nova chamada criada com sucesso!',
      descricao: 'Esta chamada permanecerá ativa até ser fechada manualmente ou expirar em 24 horas.',
      link: urlQr,
      codigoChamada: chamadaParaUsar.codigoChamada,
      turma: chamadaParaUsar.turma.codigo,
      qrCodeBase64,
      reutilizada: isReutilizada, // opcional: frontend pode usar para mostrar mensagem diferente
    };
  }
}