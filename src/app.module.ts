import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebirdService } from './firebird/firebird.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PaljetSyncController } from './paljet-sync/paljet-sync.controller';
import { Article, ArticleSchema } from './paljet-sync/models/article.model';
import {
  ListPrice,
  ListPriceSchema,
} from './paljet-sync/models/listPrice.model';
import { Stock, StockSchema } from './paljet-sync/models/stock.model';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://jmpz94:residentEvil4Remake@cluster0.azbvkbq.mongodb.net/rigelec-store',
    ),
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
    MongooseModule.forFeature([
      { name: ListPrice.name, schema: ListPriceSchema },
    ]),
    MongooseModule.forFeature([{ name: Stock.name, schema: StockSchema }]),
  ],
  controllers: [AppController, PaljetSyncController],
  providers: [AppService, FirebirdService],
})
export class AppModule {}
