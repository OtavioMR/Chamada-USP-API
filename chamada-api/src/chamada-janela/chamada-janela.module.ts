import { forwardRef, Module } from '@nestjs/common';
import { ChamadaJanelaController } from './chamada-janela.controller';
import { ChamadaJanelaService } from './chamada-janela.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChamadaJanela } from './entity/chamada-janela.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChamadaJanela])
],
  controllers: [ChamadaJanelaController],
  providers: [ChamadaJanelaService],
  exports: [ChamadaJanelaService],
})
export class ChamadaJanelaModule {}
