import {
  Controller,
  Get,
  Param,
  NotFoundException
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChamadaJanela } from './entity/chamada-janela.entity';

@Controller('chamada-janela')
export class ChamadaJanelaController {

  constructor(
    @InjectRepository(ChamadaJanela)
    private readonly janelaRepository: Repository<ChamadaJanela>,
  ) {}

  @Get('/janela/:codigoJanela')
  async obterJanela(
    @Param('codigoJanela') codigoJanela: string,
  ) {
    const janela = await this.janelaRepository.findOne({
      where: { codigoJanela },
    });

    if (!janela) {
      throw new NotFoundException('Janela não encontrada');
    }

    return {
      dataExpiracao: janela.dataExpiracao,
    };
  }
}
