import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QrCodeModule } from './qr-code/qr-code.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfessorModule } from './professor/professor.module';
import { TurmaModule } from './turma/turma.module';
import { MateriaModule } from './materia/materia.module';
import { AlunoModule } from './aluno/aluno.module';
import { PresencaModule } from './presenca/presenca.module';
import { AuthModule } from './auth/auth.module';
import { ChamadaModule } from './chamada/chamada.module';

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
    ProfessorModule,
    TurmaModule,
    MateriaModule,
    AlunoModule,
    PresencaModule,
    AuthModule,
    ChamadaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
