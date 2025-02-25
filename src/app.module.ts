import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TreatmentModule } from './modules';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from './data-source';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env}`,
    }),
    TypeOrmModule.forRoot(AppDataSource.options),
    TreatmentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
