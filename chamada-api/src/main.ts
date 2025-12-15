import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization'],
    credentials: true,
  });

  // CONFIGURAÇÃO OFICIAL DO SWAGGER
  const config = new DocumentBuilder()
    .setTitle('Minha API Swaggerzada')
    .setDescription('Documentação da API feita no maior carinho que eu consegui sem reclamar demais')
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const porta = process.env.PORT ?? 3000;
  await app.listen(porta);

  console.log('Servidor rodando na porta: ' + porta);
  console.log('Swagger vivo em: http://localhost:' + porta + '/api-docs');
}

bootstrap();
