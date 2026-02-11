// QrCodeModule
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Turma } from 'src/turma/entity/turma.entity';
import { QrCodeService } from './qr-code.service';
import { QrCodeController } from './qr-code.controller';
import { ChamadaModule } from 'src/chamada/chamada.module';
import { Chamada } from 'src/chamada/entity/chamada.entity'; 
import { forwardRef } from '@nestjs/common';
import { ChamadaJanela } from 'src/chamada-janela/entity/chamada-janela.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Turma, Chamada, ChamadaJanela]), // só entidades
    forwardRef(() => ChamadaModule),  // ← Também aqui!                 // importa módulo que fornece ChamadaService
  ],
  controllers: [QrCodeController],
  providers: [QrCodeService],
  exports: [QrCodeService],
})
export class QrCodeModule { }
