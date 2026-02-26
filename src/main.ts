import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') ?? 3000;
  const allowedOrigins = configService.get<string[]>('cors.allowedOrigins') ?? [];

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('sender-api')
    .setDescription('AI-powered email template platform')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
  console.log(`🚀 sender-api running on port ${port}`);
  console.log(`📖 Swagger docs: http://localhost:${port}/docs`);
  console.log(`🤖 AI provider: ${configService.get('ai.defaultProvider')}`);
}
bootstrap();
