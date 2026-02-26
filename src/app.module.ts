import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { BrandModule } from './modules/brand/brand.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { LibraryModule } from './modules/library/library.module';
import { GenerateModule } from './modules/generate/generate.module';
import { EditModule } from './modules/edit/edit.module';
import { ExportModule } from './modules/export/export.module';
import { ExtractModule } from './modules/extract/extract.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('mongodb.uri'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    BrandModule,
    TemplatesModule,
    LibraryModule,
    GenerateModule,
    EditModule,
    ExportModule,
    ExtractModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
