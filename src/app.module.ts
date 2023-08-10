import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaljetSyncModule } from './paljet-sync/paljet-sync.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebirdService } from './firebird/firebird.service';
import { ArticleSchema } from './paljet-sync/models/article.model';
import { ListPriceSchema } from './paljet-sync/models/listPrice.model';
import { StockSchema } from './paljet-sync/models/stock.model';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://jmpz94:residentEvil4Remake@cluster0.azbvkbq.mongodb.net/rigelec-store',
    ),
    MongooseModule.forFeature([
      { name: 'Article', schema: ArticleSchema },
      { name: 'ListPrice', schema: ListPriceSchema },
      { name: 'Stock', schema: StockSchema },
    ]),
    PaljetSyncModule,
  ],
  controllers: [AppController],
  providers: [AppService, FirebirdService],
})
export class AppModule {}
