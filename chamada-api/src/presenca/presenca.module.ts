import { Module } from '@nestjs/common';
import { PresencaController } from './presenca.controller';
import { PresencaService } from './presenca.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Presenca } from './entity/presenca.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Presenca])],
  controllers: [PresencaController],
  providers: [PresencaService],
  exports: [PresencaService],
})
export class PresencaModule {}
