import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebirdService } from './firebird/firebird.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PaljetSyncController } from './paljet-sync/paljet-sync.controller';
import { Article, ArticleSchema } from './paljet-sync/models/article.model';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://jmpz94:residentEvil4Remake@cluster0.azbvkbq.mongodb.net/rigelec-store',
    ),
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
  ],
  controllers: [AppController, PaljetSyncController],
  providers: [AppService, FirebirdService],
})
export class AppModule {}