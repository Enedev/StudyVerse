import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useBodyParser('json', { limit: '8mb' });
  app.useBodyParser('urlencoded', { extended: true, limit: '8mb' });
  const config = app.get(ConfigService);
  const port = config.getOrThrow<number>('PORT');
  const webOrigin = config.getOrThrow<string>('WEB_ORIGIN');
  const allowedOrigins = new Set([webOrigin]);
  const originUrl = new URL(webOrigin);
  if (originUrl.hostname === 'localhost') {
    originUrl.hostname = '127.0.0.1';
    allowedOrigins.add(originUrl.origin);
  }

  app.use(helmet());
  app.enableCors({
    origin: [...allowedOrigins],
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.setGlobalPrefix('api/v1');
  app.enableShutdownHooks();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('StudyVerse API')
    .setDescription('REST API for the StudyVerse academic workspace.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const server = app.getHttpAdapter().getInstance();
  server.get('/', (request: { originalUrl?: string }, response: { redirect: (code: number, url: string) => void }) => {
    const destination = new URL('/auth/confirmed', webOrigin);
    const queryIndex = request.originalUrl?.indexOf('?') ?? -1;
    if (queryIndex >= 0 && request.originalUrl) {
      destination.search = request.originalUrl.slice(queryIndex);
    }
    response.redirect(302, destination.toString());
  });

  await app.listen(port, '0.0.0.0');
}
await bootstrap();
