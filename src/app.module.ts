import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebirdService } from './firebird/firebird.service';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://jmpz94:residentEvil4Remake@cluster0.azbvkbq.mongodb.net/ecommerce',
    ),
  ],
  controllers: [AppController],
  providers: [AppService, FirebirdService],
})
export class AppModule {}
