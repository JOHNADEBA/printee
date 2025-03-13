import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files from the uploads folder
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Enable CORS
  app.enableCors({
    origin: [process.env.FRONTEND_DOMAIN as string],
    methods: 'GET,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });
  app.getHttpAdapter().get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
  });

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
