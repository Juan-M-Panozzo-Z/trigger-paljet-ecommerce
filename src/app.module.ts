import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaljetSyncModule } from './paljet-sync/paljet-sync.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebirdService } from './firebird/firebird.service';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://jmpz94:residentEvil4Remake@cluster0.azbvkbq.mongodb.net/rigelec-store',
    ),
    PaljetSyncModule,
  ],
  controllers: [AppController],
  providers: [AppService, FirebirdService],
})
export class AppModule {}
