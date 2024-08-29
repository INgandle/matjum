import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

const config = new DocumentBuilder()
  .setTitle('Matjum API')
  .setDescription('맛점: 위치기반 맛집 추천 서비스의 API 문서입니다.')
  .setVersion('1.0')
  .addTag('Matjum')
  .build();

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api');

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
};

bootstrap();
