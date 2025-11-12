import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { loggerMiddleware } from './middlewares/logger/logger.middleware';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const prismaService = app.get(PrismaService);
  // await prismaService.enableShutdownHooks(app);

  //Swagger Api settings
  const swaggerConfig = new DocumentBuilder()
    .setTitle('budget-lens')
    .setDescription('description')
    .setVersion('0.0.1')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  app.enableCors();

  app.use(loggerMiddleware);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
