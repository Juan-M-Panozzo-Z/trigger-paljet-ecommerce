import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaljetSyncController } from './paljet-sync.controller';
import { PaljetSyncService } from './paljet-sync.service';
import { Article, ArticleSchema } from './models/article.model';
import { ListPrice, ListPriceSchema } from './models/listPrice.model';
import { Stock, StockSchema } from './models/stock.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Article.name, schema: ArticleSchema },
      { name: ListPrice.name, schema: ListPriceSchema },
      { name: Stock.name, schema: StockSchema },
    ]),
  ],
  controllers: [PaljetSyncController],
  providers: [PaljetSyncService],
})
export class PaljetSyncModule {}
