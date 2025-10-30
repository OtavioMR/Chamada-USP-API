import { Module } from '@nestjs/common';
import { ChamadaController } from './chamada.controller';
import { ChamadaService } from './chamada.service';

@Module({
  controllers: [ChamadaController],
  providers: [ChamadaService]
})
export class ChamadaModule {}
