import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChamadaModule } from './chamada/chamada.module';
import { QrCodeController } from './qr-code/qr-code.controller';
import { QrCodeService } from './qr-code/qr-code.service';
import { QrCodeModule } from './qr-code/qr-code.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // só para dev
    }),
    QrCodeModule,
    ChamadaModule,
  ],
  controllers: [AppController, QrCodeController],
  providers: [AppService, QrCodeService],
})
export class AppModule { }
