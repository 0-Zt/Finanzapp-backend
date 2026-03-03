import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const corsOrigin = process.env.CORS_ORIGIN;
  if (!corsOrigin) {
    app.enableCors({ origin: true, credentials: true });
  } else {
    const configuredOrigins = corsOrigin
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0);

    app.enableCors({
      origin: configuredOrigins.includes('*') ? true : configuredOrigins,
      credentials: true,
    });
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Finanzapp API')
    .setDescription('Documentacion interactiva de la API (Swagger/OpenAPI).')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
