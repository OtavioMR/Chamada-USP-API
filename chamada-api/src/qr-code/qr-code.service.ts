import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import * as QRCode from 'qrcode';
import { randomUUID } from 'crypto';

import { CreateQRCodeDto } from './dto/create-qrCode.dto';
import { ChamadaService } from 'src/chamada/chamada.service';
import { Chamada } from 'src/chamada/entity/chamada.entity';
import { ChamadaJanela } from 'src/chamada-janela/entity/chamada-janela.entity';

@Injectable()
export class QrCodeService {
  constructor(
    @InjectRepository(Chamada)
    private readonly chamadaRepository: Repository<Chamada>,

    @InjectRepository(ChamadaJanela)
    private readonly janelaRepository: Repository<ChamadaJanela>,

    private readonly chamadaService: ChamadaService,
  ) { }

  /**
   * Gera um QR Code com janela temporária.
   *
   * Regras:
   * - A chamada dura até 24h.
   * - O QR dura apenas alguns minutos (janela).
   * - Se existir chamada aberta válida, reutiliza.
   * - Se estiver expirada, fecha e cria nova.
   */
  async create(
    dto: CreateQRCodeDto,
    professorId: number,
    role: string,
  ) {
    if (!dto.codigoTurma) {
      throw new BadRequestException('Código da turma é obrigatório.');
    }

    const agora = new Date();
    const limite24h = 24 * 60 * 60 * 1000;

    /**
     * 1️⃣ Buscar chamada aberta da turma
     */
    const chamadaAberta = await this.chamadaRepository.findOne({
      where: {
        turma: { codigo: dto.codigoTurma },
        aberta: true,
      },
      relations: ['turma'],
    });

    let chamadaParaUsar: Chamada;
    let reutilizada = false;

    /**
     * 2️⃣ Verificar se precisa criar nova chamada
     */
    if (chamadaAberta) {
      const criadaEm = new Date(chamadaAberta.criadaEm);
      const tempoDecorrido = agora.getTime() - criadaEm.getTime();

      if (tempoDecorrido >= limite24h) {
        chamadaAberta.aberta = false;
        await this.chamadaRepository.save(chamadaAberta);

        chamadaParaUsar = await this.chamadaService.criarChamada(
          { codigoTurma: dto.codigoTurma },
          professorId,
          role,
        );
      } else {
        chamadaParaUsar = chamadaAberta;
        reutilizada = true;
      }
    } else {
      chamadaParaUsar = await this.chamadaService.criarChamada(
        { codigoTurma: dto.codigoTurma },
        professorId,
        role,
      );
    }

    /**
     * 3️⃣ Criar janela temporária (QR válido por X minutos)
     */

    const duracaoMinutos = 2; // você pode deixar isso configurável

    // Desativa janelas anteriores da mesma chamada
    await this.janelaRepository.update(
      { chamada: { id: chamadaParaUsar.id }, ativa: true },
      { ativa: false },
    );

    const dataExpiracao = new Date(
      agora.getTime() + duracaoMinutos * 60 * 1000,
    );

    const novaJanela = this.janelaRepository.create({
      codigoJanela: randomUUID(),
      dataExpiracao,
      chamada: chamadaParaUsar,
      ativa: true,
    });

    await this.janelaRepository.save(novaJanela);

    /**
     * 4️⃣ Montar URL com código da janela
     */
    const urlQr = `http://localhost:5173/aluno/presenca/registrar/${chamadaParaUsar.codigoChamada}/${novaJanela.codigoJanela}?expira=${dataExpiracao.getTime()}`;


    const qrCodeBase64 = await QRCode.toDataURL(urlQr, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 500,
    });

    /**
     * 5️⃣ Retorno final
     */
    return {
      mensagem: reutilizada
        ? 'Chamada reutilizada e nova janela de QR criada.'
        : 'Nova chamada criada com QR temporário.',
      descricao: `Este QR expira em ${duracaoMinutos} minutos.`,
      link: urlQr,
      codigoChamada: chamadaParaUsar.codigoChamada,
      codigoJanela: novaJanela.codigoJanela,
      turma: chamadaParaUsar.turma.codigo,
      expiraEm: dataExpiracao,
      qrCodeBase64,
      reutilizada,
      duracaoMinutos,
    };
  }

  /**
   * Scheduler:
   * Fecha automaticamente chamadas abertas há mais de 24h.
   */
  @Cron('0 * * * *')
  async fecharChamadasExpiradas(): Promise<void> {
    const agora = new Date();

    const dataLimite = new Date(
      agora.getTime() - 24 * 60 * 60 * 1000,
    );

    const chamadasExpiradas = await this.chamadaRepository.find({
      where: {
        aberta: true,
        criadaEm: LessThan(dataLimite),
      },
    });

    for (const chamada of chamadasExpiradas) {
      chamada.aberta = false;
      await this.chamadaRepository.save(chamada);
    }

    console.log(
      `[Scheduler] ${chamadasExpiradas.length} chamadas expiradas foram fechadas automaticamente.`,
    );
  }
}
